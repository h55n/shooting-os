import 'server-only';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';

export interface InAppNotification {
  id: string;
  kind: string;
  title: string;
  body?: string;
  href?: string;
  createdAt: string;
}

export async function getUnreadNotifications(limit = 5): Promise<InAppNotification[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('in_app_notifications')
    .select('id,kind,title,body,href,created_at')
    .eq('user_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ id: row.id, kind: row.kind, title: row.title, body: row.body ?? undefined, href: row.href ?? undefined, createdAt: row.created_at }));
}
