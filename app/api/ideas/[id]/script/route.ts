import { NextRequest } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';
import { inferContentCategory } from '@/lib/content-engine/categories';
import { generateStructuredScript, scriptToSpokenText } from '@/lib/content-engine/generate-script';
import { getVerifiedFacts } from '@/lib/knowledge/retrieval';
import { validateClaims } from '@/lib/domain/claims';

function readProposal(value: unknown): Record<string, unknown> {
  if (typeof value !== 'string') return {};
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!isSupabaseConfigured()) {
      const topic = 'Trigger control ki ek common mistake';
      const categoryId = inferContentCategory(topic);
      const generated = await generateStructuredScript({ topic, categoryId, audience: 'Beginners', demo: true });
      return ok({ contentId: `demo-${id}`, ...generated, claimValidation: validateClaims({ scriptText: scriptToSpokenText(generated.script) }), persisted: false }, undefined, { demoMode: true });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id,raw_input,normalized_idea,status')
      .eq('id', id)
      .single();
    if (ideaError || !idea) return fail('Idea not found', 'Ye idea nahi mila.', 404);

    const proposal = readProposal(idea.normalized_idea);
    const title = String(proposal.title || idea.raw_input).slice(0, 160);
    const audience = String(proposal.audience || 'Beginners discovering shooting');
    const hookSeed = typeof proposal.hook === 'string' ? proposal.hook : undefined;
    const pillar = String(proposal.pillar || 'Shooting Education');
    const categoryId = inferContentCategory(`${title} ${String(proposal.coreLesson || '')}`);
    const verifiedFacts = await getVerifiedFacts(`${title} ${idea.raw_input}`);
    const generated = await generateStructuredScript({
      topic: title,
      categoryId,
      audience,
      hookSeed,
      verifiedKnowledge: verifiedFacts,
    });
    const claimValidation = validateClaims({
      scriptText: scriptToSpokenText(generated.script),
      personalClaimsFromGeneration: generated.script.personalClaims,
      verifiedFacts,
    });

    if (!claimValidation.passed) {
      return fail('Unverified personal claim', claimValidation.fatherFacingMessage || 'Ek personal fact confirm karna zaroori hai.', 422, claimValidation.blockedClaims);
    }

    const { data: contentId, error: persistError } = await supabase.rpc('create_content_from_idea', {
      p_idea_id: id,
      p_title: title,
      p_content_type: 'reel',
      p_pillar: pillar,
      p_category_id: categoryId,
      p_brief: { audience, sourceIdea: idea.raw_input },
      p_script: generated.script,
      p_model: generated.model,
      p_user_id: user.id,
    });
    if (persistError || !contentId) throw new Error(persistError?.message || 'Script persistence returned no content id');

    return ok({ contentId, ...generated, claimValidation, persisted: true });
  } catch (error) {
    console.error('[idea->script]', error);
    return fail('Script creation failed', 'Script create ya save nahi ho saka. Dobara try karein.', 500, error instanceof Error ? error.message : error);
  }
}
