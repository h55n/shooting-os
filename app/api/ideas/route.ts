import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { fail, ok } from '@/lib/api/response';
import { inferContentCategory } from '@/lib/content-engine/categories';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { ownerErrorResponse, requireOwner } from '@/lib/auth/owner';

const RequestSchema = z.object({
  mode: z.enum(['capture', 'suggest']).default('capture'),
  rawInput: z.string().trim().max(4000).optional(),
  inputType: z.enum(['text', 'voice']).default('text'),
}).superRefine((value, ctx) => {
  if (value.mode === 'capture' && (!value.rawInput || value.rawInput.length < 3)) ctx.addIssue({ code: 'custom', message: 'Idea is too short', path: ['rawInput'] });
});

const ProposalSchema = z.object({
  title: z.string().min(3).max(180),
  coreLesson: z.string().max(500),
  audience: z.string().max(200).default('Beginners discovering shooting'),
  pillar: z.string().default('Shooting Education'),
  hook: z.string().max(500).default(''),
  why: z.string().max(500).default(''),
});

function cleanJson(text: string) {
  return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
}

export async function GET() {
  try { await requireOwner(); } catch (error) { return ownerErrorResponse(error); }
  if (!isSupabaseConfigured()) return ok([] as unknown[], undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('ideas').select('id,raw_input,input_type,normalized_idea,status,source,suggested_reason,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return ok(data ?? []);
  } catch (error) {
    console.error('[ideas GET]', error);
    return fail('Ideas failed', 'Ideas load nahi ho sake.', 500, error instanceof Error ? error.message : error);
  }
}

export async function POST(request: NextRequest) {
  let owner;
  try { owner = await requireOwner(); } catch (error) { return ownerErrorResponse(error); }
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid idea', 'Idea thoda detail mein likhein.', 400, parsed.error.flatten());

  const { mode, rawInput = '', inputType } = parsed.data;
  try {
    let proposal: z.infer<typeof ProposalSchema>;
    if (mode === 'capture') {
      const category = inferContentCategory(rawInput);
      proposal = ProposalSchema.parse({
        title: rawInput.split(/[.!?\n]/)[0].trim().slice(0, 180) || rawInput.slice(0, 180),
        coreLesson: rawInput,
        audience: 'Beginners and active shooters',
        pillar: category === 'personal-story' || category === 'competition-story' ? "Father's Personal Story" : 'Shooting Education',
        hook: '',
        why: 'Aapke raw thought ko preserve karke script stage par strong angle banayenge.',
      });
    } else {
      if (!isSupabaseConfigured() && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        proposal = ProposalSchema.parse({ title: '3 trigger mistakes beginners notice hi nahi karte', coreLesson: 'Trigger control ko practical beginner mistakes ke through explain karna.', audience: 'Beginners', pillar: 'Shooting Education', hook: 'Agar shot break hote waqt pistol hil raha hai, trigger finger check karo.', why: 'Specific mistake format broad education se zyada immediately useful hai.' });
      } else {
        const knowledge = await retrieveKnowledge({ query: 'shooting coaching beginner competition teaching philosophy useful stories', count: 6, verifiedOnly: true });
        const response = await getAIProvider().generate({
          json: true,
          temperature: 0.7,
          maxTokens: 800,
          system: 'Suggest ONE strong short-form shooting content idea for M N Rehman. Natural, specific, useful, not clickbait. Never invent personal achievements. JSON only.',
          prompt: `Verified knowledge:\n${knowledge.map((item) => item.text).join('\n---\n') || 'No verified personal facts available; use general shooting education only.'}\nReturn {"title":"","coreLesson":"","audience":"","pillar":"Shooting Education","hook":"","why":""}`,
        });
        proposal = ProposalSchema.parse(JSON.parse(cleanJson(response.text)));
      }
    }

    if (!isSupabaseConfigured()) return ok({ id: `demo-${Date.now()}`, proposal, source: mode === 'suggest' ? 'suggested' : 'owner', persisted: false }, undefined, { demoMode: true });

    const supabase = await createClient();
    const source = mode === 'suggest' ? 'suggested' : 'owner';
    const input = mode === 'suggest' ? proposal.title : rawInput;
    const { data, error } = await supabase.from('ideas').insert({
      raw_input: input,
      input_type: inputType,
      normalized_idea: JSON.stringify(proposal),
      status: 'new',
      source,
      suggested_reason: mode === 'suggest' ? proposal.why : null,
      created_by: owner.id,
    }).select('id,raw_input,input_type,normalized_idea,status,source,suggested_reason,created_at').single();
    if (error || !data) throw new Error(error?.message || 'Idea insert returned no row');
    return ok({ ...data, proposal, persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[ideas POST]', error);
    return fail('Idea creation failed', mode === 'suggest' ? 'Suggestion abhi create nahi ho saki.' : 'Idea save nahi ho saka. Dobara try karein.', 500, error instanceof Error ? error.message : error);
  }
}
