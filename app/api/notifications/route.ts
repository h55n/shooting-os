import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const PatchSchema = z.object({ id: z.string().uuid().optional(), markAllRead: z.boolean().optional().default(false) });

export async function GET() {
  if (!isSupabaseConfigured()) return ok([], undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('in_app_notifications').select('id,kind,title,body,href,read_at,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    if (error) throw error;
    return ok(data ?? []);
  } catch (error) { return fail('Notifications failed', 'Notifications load nahi ho sake.', 500, error instanceof Error ? error.message : error); }
}

export async function PATCH(request: Request) {
  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.id && !parsed.data.markAllRead)) return fail('Invalid notification action', 'Notification action check karein.', 400);
  if (!isSupabaseConfigured()) return ok({ persisted: false }, undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const now = new Date().toISOString();
    let query = supabase.from('in_app_notifications').update({ read_at: now }).eq('user_id', user.id).is('read_at', null);
    if (!parsed.data.markAllRead && parsed.data.id) query = query.eq('id', parsed.data.id);
    const { error } = await query;
    if (error) throw error;
    return ok({ readAt: now, persisted: true });
  } catch (error) { return fail('Notification update failed', 'Notification update nahi ho saka.', 500, error instanceof Error ? error.message : error); }
}
