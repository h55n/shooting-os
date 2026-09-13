import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { fail, ok } from '@/lib/api/response';

const ItemSchema = z.object({ title: z.string().min(3).max(180), purpose: z.string().min(3).max(500), audience: z.string().min(2).max(200), categoryId: z.string().min(2).max(100) });
const JourneySchema = z.object({ items: z.array(ItemSchema).length(10) });

const fallback = JourneySchema.parse({ items: [
  ['Who I Am — without the boring bio', 'Introduce the value viewers can expect without listing credentials.', 'New viewers', 'personal-story'],
  ['My shooting journey: the lesson that matters', 'Use one grounded turning point to make the journey useful.', 'Beginners', 'personal-story'],
  ['What shooting actually teaches you', 'Connect one shooting lesson to practical performance.', 'General sports viewers', 'expert-take'],
  ['3 beginner mistakes that quietly ruin consistency', 'Give specific mistakes a beginner can notice today.', 'Beginners', 'common-mistake'],
  ['Stance: what matters before tiny adjustments', 'Teach the foundational stance check simply.', 'Beginners', 'demonstration'],
  ['Aim better by fixing one repeatable thing', 'Show one controllable aiming habit instead of vague advice.', 'Beginners', 'quick-tip'],
  ['Mental strength is not “just focus”', 'Turn a generic mindset topic into one concrete mental behavior.', 'Competitive shooters', 'mental-performance'],
  ['What pressure changes in competition', 'Explain a competition-pressure lesson without invented personal facts.', 'Competitive shooters', 'competition-story'],
  ['A competition lesson worth remembering', 'Use a verified story later if available; otherwise teach the lesson generally.', 'Shooters', 'competition-story'],
  ['If you are starting shooting, do this first', 'End the First 10 with a clear beginner pathway.', 'Aspiring shooters', 'pathway'],
  ].map(([title,purpose,audience,categoryId]) => ({ title,purpose,audience,categoryId })) });

function clean(text: string) { return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim(); }

export async function GET() {
  if (!isSupabaseConfigured()) return ok({ journey: null, items: [] }, undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data: journey, error } = await supabase.from('first_ten_journeys').select('id,status,created_at,completed_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!journey) return ok({ journey: null, items: [] });
    const { data: items, error: itemsError } = await supabase.from('first_ten_items').select('id,position,title,purpose,audience,category_id,content_item_id,status').eq('journey_id', journey.id).order('position');
    if (itemsError) throw itemsError;
    return ok({ journey, items: items ?? [] });
  } catch (error) { return fail('First 10 failed', 'First 10 load nahi ho saka.', 500, error instanceof Error ? error.message : error); }
}

export async function POST() {
  try {
    let plan = fallback;
    if (isSupabaseConfigured() && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      const knowledge = await retrieveKnowledge({ query: 'identity shooting journey coaching philosophy achievements beginner teaching competition stories', count: 10, verifiedOnly: true });
      try {
        const response = await getAIProvider().generate({ json: true, maxTokens: 1800, temperature: 0.55, system: 'Design exactly 10 ordered short-form video BRIEFS for M N Rehman’s first content journey. Ground personal-story topics only in verified knowledge supplied. If personal evidence is missing, use educational/general angles. Do not write full scripts. JSON only.', prompt: `VERIFIED KNOWLEDGE:\n${knowledge.map((k) => k.text).join('\n---\n') || 'No verified personal facts supplied.'}\nReturn {"items":[exactly 10 objects with "title","purpose","audience","categoryId"]}. Use categoryId from beginner-education, common-mistake, myth, personal-story, competition-story, demonstration, quick-tip, comparison, expert-take, problem-solution, faq, pathway, mental-performance, equipment-setup.` });
        plan = JourneySchema.parse(JSON.parse(clean(response.text)));
      } catch (error) {
        console.warn('[first-ten] AI planning unavailable; using safe deterministic journey', error);
      }
    }

    if (!isSupabaseConfigured()) return ok({ journey: { id: 'demo-first-ten', status: 'active' }, items: plan.items.map((item, index) => ({ id: `demo-${index + 1}`, position: index + 1, ...item, category_id: item.categoryId, status: 'planned' })), persisted: false }, { status: 201 }, { demoMode: true });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data: existing } = await supabase.from('first_ten_journeys').select('id').eq('user_id', user.id).maybeSingle();
    if (existing?.id) return GET();

    const { data: journey, error } = await supabase.from('first_ten_journeys').insert({ user_id: user.id, status: 'active' }).select('id,status').single();
    if (error || !journey) throw new Error(error?.message || 'Journey insert failed');
    const rows = plan.items.map((item, index) => ({ journey_id: journey.id, position: index + 1, title: item.title, purpose: item.purpose, audience: item.audience, category_id: item.categoryId, status: 'planned' }));
    const { data: items, error: itemsError } = await supabase.from('first_ten_items').insert(rows).select('id,position,title,purpose,audience,category_id,content_item_id,status');
    if (itemsError) throw itemsError;
    return ok({ journey, items: items ?? [], persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[first-ten]', error);
    return fail('First 10 generation failed', 'First 10 abhi create nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
