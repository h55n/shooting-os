import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { CONTENT_CATEGORIES } from '@/lib/content-engine/categories';
import { fail, ok } from '@/lib/api/response';

const InputSchema = z.object({
  name: z.string().trim().min(3).max(120),
  theme: z.string().trim().min(3).max(500),
  audience: z.string().trim().min(2).max(240).default('Beginner and intermediate shooters'),
  durationDays: z.union([z.literal(7), z.literal(15), z.literal(30)]).default(30),
});

const TopicPlanSchema = z.object({
  topics: z.array(z.object({
    title: z.string().min(3).max(180),
    angle: z.string().min(3).max(500),
    categoryId: z.enum(CONTENT_CATEGORIES.map((category) => category.id) as [string, ...string[]]),
  })).min(7).max(30),
});

function clean(text: string) { return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim(); }

function demoTopics(theme: string, durationDays: number) {
  const categories = CONTENT_CATEGORIES.map((category) => category.id);
  return Array.from({ length: durationDays }, (_, index) => ({
    title: `${theme}: Episode ${index + 1}`,
    angle: `Episode ${index + 1} mein ${theme} ka ek focused practical point.`,
    categoryId: categories[index % categories.length],
  }));
}

export async function GET() {
  if (!isSupabaseConfigured()) return ok([], undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('series').select('id,name,description,target_audience,content_goal,duration_days,status,created_at,series_topics(id,position,title,angle,category_id,status,content_item_id)').order('created_at', { ascending: false });
    if (error) throw error;
    return ok(data ?? []);
  } catch (error) { return fail('Series load failed', 'Series load nahi ho sake.', 500, error instanceof Error ? error.message : error); }
}

export async function POST(request: Request) {
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid series', 'Series name, theme aur audience check karein.', 400, parsed.error.flatten());
  const { name, theme, audience, durationDays } = parsed.data;

  try {
    let topics;
    let model = 'deterministic-demo-v1';
    if (!isSupabaseConfigured() || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      topics = demoTopics(theme, durationDays);
    } else {
      const knowledge = await retrieveKnowledge({ query: theme, count: 8, verifiedOnly: true });
      const response = await getAIProvider().generate({
        json: true,
        maxTokens: 5000,
        temperature: 0.65,
        system: `Plan exactly ${durationDays} distinct short-form video topics for M N Rehman. Do not write scripts. Avoid invented personal achievements. Use supplied verified knowledge only for personal context. Return JSON only.`,
        prompt: `SERIES: ${name}\nTHEME: ${theme}\nAUDIENCE: ${audience}\nALLOWED CATEGORY IDS: ${CONTENT_CATEGORIES.map((category) => category.id).join(', ')}\nVERIFIED KNOWLEDGE:\n${knowledge.map((row) => row.text).join('\n---\n') || 'None; avoid personal claims.'}\nReturn exactly {"topics":[${durationDays} objects with "title","angle","categoryId"]}. Make the sequence progress naturally and avoid duplicate angles.`,
      });
      topics = TopicPlanSchema.parse(JSON.parse(clean(response.text))).topics;
      if (topics.length !== durationDays) throw new Error(`Expected ${durationDays} topics, received ${topics.length}`);
      model = response.model;
    }

    if (!isSupabaseConfigured()) return ok({ id: `demo-${Date.now()}`, name, topics, model, persisted: false }, { status: 201 }, { demoMode: true });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: series, error: seriesError } = await supabase.from('series').insert({ name, description: theme, target_audience: audience, content_goal: `${durationDays}-topic short-form series`, duration_days: durationDays, status: 'active' }).select('id,name,duration_days').single();
    if (seriesError || !series) throw new Error(seriesError?.message || 'Series insert failed');

    const rows = topics.map((topic, index) => ({ series_id: series.id, position: index + 1, title: topic.title, angle: topic.angle, category_id: topic.categoryId, status: 'proposed' }));
    const { data: inserted, error: topicsError } = await supabase.from('series_topics').insert(rows).select('id,position,title,angle,category_id,status');
    if (topicsError) throw topicsError;
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'series', entity_id: series.id, action: 'SERIES_TOPICS_CREATED', metadata: { model, theme, topicCount: durationDays, durationDays } });
    return ok({ ...series, topics: inserted ?? [], model, persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[series create]', error);
    return fail('Series creation failed', '30-topic series create/save nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
