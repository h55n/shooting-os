import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { generateStructuredScript, scriptToSpokenText } from '@/lib/content-engine/generate-script';
import { getVerifiedFacts } from '@/lib/knowledge/retrieval';
import { validateClaims } from '@/lib/domain/claims';
import { fail, ok } from '@/lib/api/response';

const InputSchema = z.object({
  topicIds: z.array(z.string().uuid()).min(1).max(8),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: seriesId } = await params;
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid selection', '1 se 8 topics select karein.', 400, parsed.error.flatten());
  if (!isSupabaseConfigured()) return fail('Database required', 'Batch scripts save karne ke liye database connection chahiye.', 503);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: topics, error } = await supabase
      .from('series_topics')
      .select('id,position,title,angle,category_id,status,content_item_id')
      .eq('series_id', seriesId)
      .in('id', parsed.data.topicIds)
      .order('position');
    if (error) throw error;
    if (!topics?.length) return fail('Topics missing', 'Selected topics nahi mile.', 404);

    const results: Array<{ topicId: string; contentId?: string; ok: boolean; message?: string }> = [];

    for (const topic of topics) {
      if (topic.content_item_id) {
        results.push({ topicId: topic.id, contentId: topic.content_item_id, ok: true, message: 'Already scripted' });
        continue;
      }

      try {
        const verifiedFacts = await getVerifiedFacts(`${topic.title} ${topic.angle || ''}`);
        const generated = await generateStructuredScript({
          topic: topic.title,
          categoryId: topic.category_id,
          audience: 'Shooters following this series',
          verifiedKnowledge: verifiedFacts,
        });
        const claimValidation = validateClaims({
          scriptText: scriptToSpokenText(generated.script),
          personalClaimsFromGeneration: generated.script.personalClaims,
          verifiedFacts,
        });
        if (!claimValidation.passed) {
          results.push({ topicId: topic.id, ok: false, message: claimValidation.fatherFacingMessage || 'Personal claim needs confirmation.' });
          continue;
        }

        const { data: content, error: contentError } = await supabase.from('content_items').insert({
          series_id: seriesId,
          title: topic.title,
          content_type: 'reel',
          pillar: 'Shooting Education',
          category_id: topic.category_id,
          brief: { seriesTopicId: topic.id, angle: topic.angle, sequence: topic.position },
          status: 'REVIEW',
          priority: 5,
        }).select('id').single();
        if (contentError || !content) throw new Error(contentError?.message || 'Content insert failed');

        const { error: scriptError } = await supabase.from('scripts').insert({ content_item_id: content.id, version: 1, content: generated.script, status: 'draft', model: generated.model });
        if (scriptError) throw scriptError;
        const { error: versionError } = await supabase.from('script_versions').insert({ content_item_id: content.id, version: 1, content: generated.script, change_summary: 'Initial series script', source: 'ai', change_reason: 'Selected from approved series plan', created_by: user.id });
        if (versionError) throw versionError;
        const { error: topicError } = await supabase.from('series_topics').update({ status: 'scripted', content_item_id: content.id }).eq('id', topic.id);
        if (topicError) throw topicError;
        results.push({ topicId: topic.id, contentId: content.id, ok: true });
      } catch (topicError) {
        results.push({ topicId: topic.id, ok: false, message: topicError instanceof Error ? topicError.message : 'Script failed' });
      }
    }

    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'series', entity_id: seriesId, action: 'SERIES_BATCH_SCRIPTED', metadata: { requested: parsed.data.topicIds.length, succeeded: results.filter((result) => result.ok).length } });
    return ok({ results, succeeded: results.filter((result) => result.ok).length, failed: results.filter((result) => !result.ok).length });
  } catch (error) {
    return fail('Batch scripting failed', 'Selected topics ke scripts create nahi ho sake.', 500, error instanceof Error ? error.message : error);
  }
}
