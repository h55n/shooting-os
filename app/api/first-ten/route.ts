import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const ItemSchema = z.object({ title: z.string().min(3).max(180), purpose: z.string().min(3).max(500), audience: z.string().min(2).max(200), categoryId: z.string().min(2).max(100) });
const JourneySchema = z.object({ items: z.array(ItemSchema).length(10) });

const fixedPlan = JourneySchema.parse({ items: [
  ['Introduction: M N Rehman and this channel', 'Set expectations: practical Hinglish coaching for precision shooting, fundamentals, training and competition growth.', 'New viewers and aspiring shooters', 'personal-story'],
  ['Shooting sport explained: rifle, pistol and shotgun', 'Give beginners a clear map of the sport before technique starts.', 'New shooters and families', 'beginner-education'],
  ['Safety before skill: the non-negotiables', 'Teach safe handling, range discipline and why safety protects every training session.', 'Every beginner', 'beginner-education'],
  ['Build a stable shooting position', 'Explain the role of stance or position in repeatable balance and control.', 'Beginners', 'demonstration'],
  ['Breathing: find your calm shot moment', 'Show how a simple breathing routine helps steadiness without overcomplication.', 'Beginners', 'quick-tip'],
  ['Sight alignment and aiming: what your eyes must notice', 'Break down alignment and aiming into a practical visual check.', 'Beginners', 'beginner-education'],
  ['Trigger control: stop disturbing a good aim', 'Teach smooth trigger operation and the common habit that moves the shot.', 'Beginners', 'common-mistake'],
  ['Follow-through and dry practice: improve away from the range', 'Turn dry practice into a safe, repeatable improvement habit.', 'Beginners and intermediate shooters', 'problem-solution'],
  ['Practice score versus competition score', 'Explain how to train honestly, learn from pressure and review performance.', 'Developing competitors', 'mental-performance'],
  ['Your pathway into shooting: first range visit to competition', 'Give a realistic next step: learn safely, train regularly, seek coaching and progress through competition.', 'Aspiring shooters', 'pathway'],
  ].map(([title,purpose,audience,categoryId]) => ({ title,purpose,audience,categoryId })) });

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
    if (!isSupabaseConfigured()) return ok({ journey: { id: 'demo-first-ten', status: 'active' }, items: fixedPlan.items.map((item, index) => ({ id: `demo-${index + 1}`, position: index + 1, ...item, category_id: item.categoryId, status: 'planned' })), persisted: false }, { status: 201 }, { demoMode: true });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data: existing } = await supabase.from('first_ten_journeys').select('id').eq('user_id', user.id).maybeSingle();
    if (existing?.id) return GET();

    const { data: journey, error } = await supabase.from('first_ten_journeys').insert({ user_id: user.id, status: 'active' }).select('id,status').single();
    if (error || !journey) throw new Error(error?.message || 'Journey insert failed');
    const rows = fixedPlan.items.map((item, index) => ({ journey_id: journey.id, position: index + 1, title: item.title, purpose: item.purpose, audience: item.audience, category_id: item.categoryId, status: 'planned' }));
    const { data: items, error: itemsError } = await supabase.from('first_ten_items').insert(rows).select('id,position,title,purpose,audience,category_id,content_item_id,status');
    if (itemsError) throw itemsError;
    return ok({ journey, items: items ?? [], persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[first-ten]', error);
    return fail('First 10 generation failed', 'First 10 abhi create nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
