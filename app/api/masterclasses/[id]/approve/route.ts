import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return ok({ id, status: 'outline_approved', persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: current, error: loadError } = await supabase.from('masterclasses').select('id,status').eq('id', id).single();
    if (loadError || !current) return fail('Not found', 'Masterclass nahi mila.', 404);
    if (current.status !== 'outline_review') return fail('Invalid state', 'Outline review state mein nahi hai.', 422);

    const approvedAt = new Date().toISOString();
    const { error } = await supabase.from('masterclasses').update({ status: 'outline_approved', approved_at: approvedAt, updated_at: approvedAt }).eq('id', id);
    if (error) throw error;

    const { data: version, error: versionLoadError } = await supabase.from('masterclass_versions').select('id,version').eq('masterclass_id', id).order('version', { ascending: false }).limit(1).maybeSingle();
    if (versionLoadError) throw versionLoadError;
    if (version) {
      const { error: versionError } = await supabase.from('masterclass_versions').update({ approved_at: approvedAt }).eq('id', version.id);
      if (versionError) throw versionError;
    }

    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'masterclass', entity_id: id, action: 'OUTLINE_APPROVED', metadata: { approvedAt, version: version?.version ?? null } });
    return ok({ id, status: 'outline_approved', approvedAt, version: version?.version ?? null, persisted: true });
  } catch (error) {
    return fail('Approval failed', 'Outline approve nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
