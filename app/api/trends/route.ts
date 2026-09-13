import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { fail, ok } from '@/lib/api/response';

const CreateSchema = z.object({
  topic: z.string().trim().min(3).max(300),
  source: z.string().trim().min(3).max(1000),
  signalType: z.string().trim().max(80).default('manual'),
});
const UpdateSchema = z.object({ id: z.string().uuid(), status: z.enum(['approved', 'dismissed', 'converted', 'new']) });
const ScoreSchema = z.object({ relevance: z.number().min(0).max(100), urgency: z.enum(['low', 'medium', 'high']), reason: z.string().min(5).max(700), suggestedAngle: z.string().min(5).max(700) });

function clean(text: string) { return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim(); }

export async function GET() {
  if (!isSupabaseConfigured()) return ok([], undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('trend_items').select('id,topic,source,signal_type,relevance_score,urgency,status,detected_at,metadata').order('relevance_score', { ascending: false }).order('detected_at', { ascending: false }).limit(30);
    if (error) throw error;
    return ok(data ?? []);
  } catch (error) { return fail('Trends load failed', 'Trend candidates load nahi ho sake.', 500, error instanceof Error ? error.message : error); }
}

export async function POST(request: Request) {
  const parsed = CreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid trend', 'Trend topic aur source check karein.', 400, parsed.error.flatten());
  if (!isSupabaseConfigured()) return fail('Database required', 'Trend candidate save karne ke liye database connection chahiye.', 503);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const knowledge = await retrieveKnowledge({ query: parsed.data.topic, count: 6, verifiedOnly: true });
    const response = await getAIProvider().generate({
      json: true,
      maxTokens: 700,
      temperature: 0.2,
      system: 'Score a manually supplied trend candidate for a shooting coach/content creator. This is NOT trend discovery. Judge usefulness for short-form shooting education. Personal expertise matches may only use supplied verified knowledge. Return JSON only.',
      prompt: `TREND: ${parsed.data.topic}\nSOURCE/SIGNAL: ${parsed.data.source}\nVERIFIED EXPERTISE:\n${knowledge.map((row) => row.text).join('\n---\n') || 'No matching verified personal expertise.'}\nReturn {"relevance":0-100,"urgency":"low|medium|high","reason":"","suggestedAngle":""}.`,
    });
    const score = ScoreSchema.parse(JSON.parse(clean(response.text)));
    const { data, error } = await supabase.from('trend_items').insert({
      topic: parsed.data.topic,
      source: parsed.data.source,
      signal_type: parsed.data.signalType,
      relevance_score: score.relevance,
      urgency: score.urgency,
      status: 'new',
      metadata: { reason: score.reason, suggestedAngle: score.suggestedAngle, verifiedExpertiseMatches: knowledge.length, scoringModel: response.model },
    }).select('id,topic,source,signal_type,relevance_score,urgency,status,detected_at,metadata').single();
    if (error || !data) throw new Error(error?.message || 'Trend insert failed');
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'trend_item', entity_id: data.id, action: 'TREND_CANDIDATE_SCORED', metadata: { relevance: score.relevance, model: response.model } });
    return ok(data, { status: 201 });
  } catch (error) {
    return fail('Trend scoring failed', 'Trend candidate score/save nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}

export async function PATCH(request: Request) {
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid trend action', 'Trend action check karein.', 400);
  if (!isSupabaseConfigured()) return fail('Database required', 'Trend action save karne ke liye database connection chahiye.', 503);
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('trend_items').update({ status: parsed.data.status }).eq('id', parsed.data.id).select('id,status').single();
    if (error) throw error;
    return ok(data);
  } catch (error) { return fail('Trend action failed', 'Trend action save nahi ho saka.', 500, error instanceof Error ? error.message : error); }
}
