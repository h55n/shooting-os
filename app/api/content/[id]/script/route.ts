import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';
import { ScriptDocumentSchema } from '@/lib/ai/schemas';
import { runQualityGate } from '@/lib/content-engine/quality-gate';

const EditSchema = z.object({
  section: z.enum(['hook', 'setup', 'mainPoint', 'storyOrExample', 'takeaway', 'cta']),
  value: z.string().max(5000),
  reason: z.string().max(300).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = EditSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid edit', 'Change valid nahi hai.', 400, parsed.error.flatten());
  if (!isSupabaseConfigured()) return ok({ contentId: id, version: 2, persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: latest, error: fetchError } = await supabase
      .from('scripts')
      .select('version,content')
      .eq('content_item_id', id)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    if (fetchError || !latest) return fail('Script not found', 'Script nahi mila.', 404);

    const current = ScriptDocumentSchema.parse(latest.content);
    const next = ScriptDocumentSchema.parse({ ...current, [parsed.data.section]: parsed.data.value });
    const version = latest.version + 1;
    const quality = runQualityGate(next);

    const { error: insertError } = await supabase.from('scripts').insert({
      content_item_id: id,
      version,
      content: next,
      status: 'draft',
      model: 'manual-edit',
    });
    if (insertError) throw insertError;

    const { error: versionError } = await supabase.from('script_versions').insert({
      content_item_id: id,
      version,
      parent_version: latest.version,
      content: next,
      change_summary: `Changed ${parsed.data.section}`,
      source: 'manual',
      change_reason: parsed.data.reason || 'Direct edit',
      created_by: user.id,
    });
    if (versionError) throw versionError;

    const { error: statusError } = await supabase.from('content_items').update({ status: 'REVIEW', updated_at: new Date().toISOString() }).eq('id', id);
    if (statusError) throw statusError;

    return ok({ contentId: id, version, script: next, quality, persisted: true });
  } catch (error) {
    console.error('[script edit]', error);
    return fail('Script edit failed', 'Change save nahi ho saka. Dobara try karein.', 500, error instanceof Error ? error.message : error);
  }
}
