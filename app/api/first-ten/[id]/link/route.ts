import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const LinkSchema = z.object({ contentId: z.string().uuid() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = LinkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid content', 'First 10 item link nahi ho saka.', 400);
  if (!isSupabaseConfigured()) return ok({ id, contentId: parsed.data.contentId, persisted: false }, undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('first_ten_items').update({ content_item_id: parsed.data.contentId, status: 'in_progress' }).eq('id', id).select('id,content_item_id,status').single();
    if (error || !data) throw new Error(error?.message || 'First 10 update failed');
    return ok(data);
  } catch (error) { return fail('First 10 update failed', 'First 10 progress save nahi hua.', 500, error instanceof Error ? error.message : error); }
}
