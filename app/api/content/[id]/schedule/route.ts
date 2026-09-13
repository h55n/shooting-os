import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const ScheduleSchema = z.object({ shootDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = ScheduleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid date', 'Shoot date sahi format mein select karein.', 400);
  if (!isSupabaseConfigured()) return ok({ id, shootDate: parsed.data.shootDate, status: 'RECORDING', persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: item, error: fetchError } = await supabase.from('content_items').select('status').eq('id', id).single();
    if (fetchError || !item) return fail('Content not found', 'Content nahi mila.', 404);
    if (!['APPROVED', 'RECORDING'].includes(item.status)) return fail('Invalid state', 'Pehle script approve karein.', 422);

    const { error } = await supabase.from('content_items').update({ scheduled_date: parsed.data.shootDate, status: 'RECORDING', updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;

    const { data: existingTask } = await supabase.from('content_tasks').select('id').eq('content_item_id', id).ilike('task_type', 'shoot').maybeSingle();
    if (existingTask?.id) {
      const { error: taskError } = await supabase.from('content_tasks').update({ due_date: parsed.data.shootDate, status: 'todo' }).eq('id', existingTask.id);
      if (taskError) throw taskError;
    } else {
      const { error: taskError } = await supabase.from('content_tasks').insert({ content_item_id: id, task_type: 'shoot', due_date: parsed.data.shootDate, status: 'todo', assigned_to: user.id });
      if (taskError) throw taskError;
    }

    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'content_item', entity_id: id, action: 'SHOOT_SCHEDULED', metadata: { shootDate: parsed.data.shootDate } });
    return ok({ id, shootDate: parsed.data.shootDate, status: 'RECORDING', persisted: true });
  } catch (error) {
    console.error('[schedule]', error);
    return fail('Schedule failed', 'Shoot date save nahi ho saki.', 500, error instanceof Error ? error.message : error);
  }
}
