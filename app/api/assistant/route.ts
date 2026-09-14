import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAIProvider } from '@/lib/ai/provider';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { fail, ok } from '@/lib/api/response';
import { ownerErrorResponse, requireOwner } from '@/lib/auth/owner';

const AssistantSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(4000),
  })).max(12).default([]),
});

type AssistAction = { type: 'navigate'; label: string; href: string };

function actionsFor(message: string): AssistAction[] {
  const q = message.toLowerCase();
  const actions: AssistAction[] = [];
  const add = (label: string, href: string) => {
    if (!actions.some((action) => action.href === href)) actions.push({ type: 'navigate', label, href });
  };

  if (/idea|topic|reel|short|video/.test(q)) add('Open Ideas', '/ideas');
  if (/plan|today|aaj|schedule|calendar|shoot/.test(q)) add('Open Plan', '/plan');
  if (/script|content|hook|cta/.test(q)) add('Open Content', '/content');
  if (/masterclass|course|lesson|module/.test(q)) add('Open Masterclass', '/masterclass');
  if (/first\s*10|first ten|start/.test(q)) add('First 10 Videos', '/first-ten');
  if (actions.length === 0) {
    add('Capture an Idea', '/ideas');
    add('See Today’s Plan', '/plan');
  }
  return actions.slice(0, 3);
}

function knowledgeContext(rows: Awaited<ReturnType<typeof retrieveKnowledge>>) {
  if (!rows.length) return 'No verified personal knowledge matched this question. Do not invent personal facts.';
  return rows.map((row, index) => `[${index + 1}] ${row.title}\n${row.text}`).join('\n\n');
}

export async function POST(request: NextRequest) {
  let owner;
  try { owner = await requireOwner(); } catch (error) { return ownerErrorResponse(error); }
  const parsed = AssistantSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid input', 'Message check karein.', 400, parsed.error.flatten());

  const { message, conversationHistory } = parsed.data;
  const actions = actionsFor(message);

  try {
    const knowledge = await retrieveKnowledge({ query: message, count: 6, verifiedOnly: true });
    const history = conversationHistory.slice(-8)
      .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
      .join('\n');

    const response = await getAIProvider().generate({
      system: `You are M N Rehman's private content and shooting-work assistant for precision shooting.

RULES:
- Respond in natural, respectful Hinglish unless the user asks otherwise.
- Be concise and action-oriented.
- Interpret shooting terms such as trigger, sight, stance, grip, shot, and recoil in the precision shooting context unless the user explicitly asks about another domain.
- Personal biography, achievements, dates, records and career claims may ONLY come from VERIFIED KNOWLEDGE below.
- If verified knowledge does not support a personal claim, explicitly say it needs confirmation; provide general shooting guidance without attributing it to M N Rehman.
- Never describe M N Rehman as an actor, entertainer, or a professional in another domain unless VERIFIED KNOWLEDGE explicitly establishes it.
- Do not invent citations, achievements, medals or experience.
- Prefer deterministic product actions over suggesting that AI do everything.

VERIFIED KNOWLEDGE:
${knowledgeContext(knowledge)}`,
      prompt: `${history ? `RECENT CONVERSATION:\n${history}\n\n` : ''}USER MESSAGE:\n${message}`,
      maxTokens: 650,
      temperature: 0.55,
    });

    let conversationId = parsed.data.conversationId;
    let persisted = false;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      if (!conversationId) {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .insert({ user_id: owner.id, title: message.slice(0, 80), context: { surface: 'assist' } })
          .select('id')
          .single();
        if (error || !conversation) throw new Error(error?.message || 'Conversation create failed');
        conversationId = conversation.id;
      }

      const { error: messageError } = await supabase.from('messages').insert([
        { conversation_id: conversationId, role: 'user', content: message },
        { conversation_id: conversationId, role: 'assistant', content: response.text, model: response.model, tokens: response.tokens ?? null },
      ]);
      if (messageError) throw messageError;
      persisted = true;
    }

    return ok({
      reply: response.text,
      conversationId,
      persisted,
      actions,
      grounding: { matchedVerifiedSources: knowledge.length },
      meta: { model: response.model, latencyMs: response.latencyMs },
    });
  } catch (error) {
    console.error('[assistant API]', error);
    return fail('Assistant failed', 'Assist abhi response nahi de saka. Dobara try karein.', 500, error instanceof Error ? error.message : error);
  }
}
