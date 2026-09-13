import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding demo data into Supabase...');

  // 1. Create a dummy project & series
  const { data: project, error: pErr } = await supabase.from('projects').insert([{ name: 'Shooting OS Demo' }]).select().single();
  if (pErr) console.error(pErr);
  
  const { data: series, error: sErr } = await supabase.from('series').insert([{ project_id: project?.id, name: 'Beginner Shooting', target_audience: 'Beginners' }]).select().single();
  if (sErr) console.error(sErr);

  // 2. Insert Content Items
  const { data: items, error: iErr } = await supabase.from('content_items').insert([
    { title: 'Trigger Control — Beginner Mistake', content_type: 'reel', pillar: 'Shooting Education', status: 'IDEA', priority: 10, series_id: series?.id },
    { title: 'Breathing Technique', content_type: 'youtube_short', pillar: 'Shooting Education', status: 'RECORDING', priority: 9, series_id: series?.id },
    { title: 'Competition Pressure', content_type: 'youtube', pillar: 'Performance and Competition', status: 'RESEARCHING', priority: 8 }
  ]).select();
  if (iErr) console.error(iErr);

  // 3. Insert Masterclass
  const { data: mc, error: mErr } = await supabase.from('masterclasses').insert([
    { title: 'Advanced Rifle Marksmanship', status: 'draft' }
  ]).select().single();
  if (mErr) console.error(mErr);

  if (mc) {
    await supabase.from('masterclass_modules').insert([
      { masterclass_id: mc.id, title: 'Module 1: Fundamentals', order: 1, learning_objective: 'Master the basics' }
    ]);
  }

  // 4. Insert Research Items
  await supabase.from('research_items').insert([
    { topic: 'Mental preparation techniques of Olympic shooters', status: 'queued' },
    { topic: 'Comparing red dot vs iron sights for beginners', status: 'completed', findings: 'Red dots show faster acquisition but iron sights build foundational alignment skills.' }
  ]);

  // 5. Insert Trend Items
  await supabase.from('trend_items').insert([
    { topic: 'Dry fire training drills at home', source: 'youtube', signal_type: 'rising_search', relevance_score: 85, urgency: 'high', status: 'new' },
    { topic: 'New 2024 ISSF rules', source: 'twitter', signal_type: 'viral', relevance_score: 92, urgency: 'medium', status: 'approved' }
  ]);

  console.log('Seeding complete!');
}

seed().catch(console.error);
