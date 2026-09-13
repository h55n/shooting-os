import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const Schema = z.object({
  correctionText: z.string().trim().min(3).max(8000),
  reason: z.string().trim().max(1000).optional(),
  previousDocumentId: z.string().uuid().optional(),
  confirmed: z.boolean().default(false),
});

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid correction', 'Correction thoda clearly likhein.', 400, parsed.error.flatten());
  const { correctionText, reason, previousDocumentId, confirmed } = parsed.data;

  if (!confirmed) return ok({ preview: { correctionText, reason: reason ?? null, previousDocumentId: previousDocumentId ?? null }, requiresConfirmation: true, persisted: false });
  if (!isSupabaseConfigured()) return ok({ correctionId: `demo-${Date.now()}`, preview: { correctionText }, persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.rpc('confirm_knowledge_correction', {
      p_user_id: user.id,
      p_correction_text: correctionText,
      p_reason: reason ?? null,
      p_previous_document_id: previousDocumentId ?? null,
    });
    if (error) throw error;
    return ok({ ...data, persisted: true });
  } catch (error) {
    console.error('[knowledge correction]', error);
    return fail('Correction failed', 'Correction save nahi ho saki. Purani information change nahi ki gayi.', 500, error instanceof Error ? error.message : error);
  }
}
