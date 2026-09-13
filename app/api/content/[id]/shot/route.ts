import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return ok({ id, newStatus: 'EDITING', shotAt: new Date().toISOString(), persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data, error } = await supabase.rpc('mark_content_shot', { p_content_id: id, p_user_id: user.id });
    if (error) {
      if (error.message.includes('CONTENT_NOT_FOUND')) return fail('Content not found', 'Content nahi mila.', 404);
      if (error.message.includes('INVALID_SHOT_STATE')) return fail('Invalid state', 'Ye content abhi shoot complete mark nahi ho sakta.', 422);
      throw error;
    }
    return ok({ ...data, persisted: true });
  } catch (error) {
    console.error('[shot]', error);
    return fail('Shot completion failed', 'Shot Ho Gaya save nahi ho saka. Dobara try karein.', 500, error instanceof Error ? error.message : error);
  }
}
