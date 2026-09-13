import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { fail, ok } from '@/lib/api/response';

const InputSchema = z.object({
  topic: z.string().trim().min(3).max(500),
  audience: z.string().trim().max(250).default('Beginner and intermediate shooters'),
  targetDurationMinutes: z.number().int().min(30).max(480).default(120),
});

const OutlineSchema = z.object({
  title: z.string().min(3).max(180),
  learningOutcome: z.string().min(3).max(800),
  modules: z.array(z.object({
    title: z.string().min(2),
    learningObjective: z.string().min(2),
    estimatedMinutes: z.number().int().min(5).max(180),
    lessons: z.array(z.string().min(2)).min(1).max(12),
  })).min(1).max(12),
});

function demoOutline(topic: string, duration: number) {
  const each = Math.max(10, Math.round(duration / 4));
  return OutlineSchema.parse({ title: topic, learningOutcome: `${topic} ko fundamentals se practical application tak clearly samajhna.`, modules: [
    { title: 'Foundation', learningObjective: 'Core concepts aur safety context samajhna.', estimatedMinutes: each, lessons: ['What matters first', 'Common beginner confusion'] },
    { title: 'Technique', learningObjective: 'Technique ko step-by-step apply karna.', estimatedMinutes: each, lessons: ['Position and setup', 'Execution', 'Self-check'] },
    { title: 'Practice', learningObjective: 'Practice ko measurable aur repeatable banana.', estimatedMinutes: each, lessons: ['Practice drill', 'Common mistakes'] },
    { title: 'Performance', learningObjective: 'Learning ko pressure aur real situations mein carry karna.', estimatedMinutes: each, lessons: ['Mental approach', 'Next steps'] },
  ] });
}

function clean(text: string) { return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim(); }

export async function GET() {
  if (!isSupabaseConfigured()) return ok([], undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('masterclasses').select('id,title,status,audience,learning_outcome,target_duration_minutes,outline,approved_at,created_at').order('created_at', { ascending: false });
    if (error) throw error;
    return ok(data ?? []);
  } catch (error) { return fail('Masterclasses failed', 'Masterclasses load nahi ho sake.', 500, error instanceof Error ? error.message : error); }
}

export async function POST(request: Request) {
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid masterclass', 'Topic aur duration check karein.', 400, parsed.error.flatten());
  const { topic, audience, targetDurationMinutes } = parsed.data;
  try {
    let outline;
    let model = 'deterministic-demo-v1';
    if (!isSupabaseConfigured() || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      outline = demoOutline(topic, targetDurationMinutes);
    } else {
      const knowledge = await retrieveKnowledge({ query: topic, count: 8, verifiedOnly: true });
      const response = await getAIProvider().generate({ json: true, maxTokens: 1800, temperature: 0.55, system: 'Create a masterclass OUTLINE for M N Rehman. Use only supplied verified personal knowledge. Never invent achievements. Outline first; do not write full lessons. Return JSON only.', prompt: `TOPIC: ${topic}\nAUDIENCE: ${audience}\nTARGET TOTAL MINUTES: ${targetDurationMinutes}\nVERIFIED KNOWLEDGE:\n${knowledge.map((k) => k.text).join('\n---\n') || 'None; keep personal claims out.'}\nReturn {"title":"","learningOutcome":"","modules":[{"title":"","learningObjective":"","estimatedMinutes":30,"lessons":[""]}]}` });
      outline = OutlineSchema.parse(JSON.parse(clean(response.text)));
      model = response.model;
    }

    if (!isSupabaseConfigured()) return ok({ id: `demo-${Date.now()}`, status: 'draft', outline, model, persisted: false }, { status: 201 }, { demoMode: true });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data: masterclass, error } = await supabase.from('masterclasses').insert({ title: outline.title, status: 'outline_review', audience, learning_outcome: outline.learningOutcome, target_duration_minutes: targetDurationMinutes, outline }).select('id,title,status').single();
    if (error || !masterclass) throw new Error(error?.message || 'Masterclass insert failed');
    const moduleRows = outline.modules.map((module, index) => ({ masterclass_id: masterclass.id, title: module.title, order: index + 1, learning_objective: module.learningObjective, estimated_minutes: module.estimatedMinutes, status: 'draft' }));
    const { error: modulesError } = await supabase.from('masterclass_modules').insert(moduleRows);
    if (modulesError) throw modulesError;
    const { error: versionError } = await supabase.from('masterclass_versions').insert({ masterclass_id: masterclass.id, version: 1, outline, change_summary: 'Initial outline', created_by: user.id });
    if (versionError) throw versionError;
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'masterclass', entity_id: masterclass.id, action: 'OUTLINE_CREATED', metadata: { model, targetDurationMinutes, version: 1 } });
    return ok({ ...masterclass, outline, model, version: 1, persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[masterclass create]', error);
    return fail('Masterclass creation failed', 'Masterclass outline create/save nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
