import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const InputSchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid guidance', 'Guidance setting check karein.', 400);
  if (!isSupabaseConfigured()) return ok({ id, shooting_guidance: { enabled: parsed.data.enabled }, persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const guidance = { enabled: parsed.data.enabled, updatedAt: new Date().toISOString() };
    const { error } = await supabase.from('content_items').update({ shooting_guidance: guidance, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'content_item', entity_id: id, action: 'SHOOTING_GUIDANCE_UPDATED', metadata: guidance });
    return ok({ id, shooting_guidance: guidance, persisted: true });
  } catch (error) {
    return fail('Guidance save failed', 'Shooting guidance setting save nahi ho saki.', 500, error instanceof Error ? error.message : error);
  }
}
