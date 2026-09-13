import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getAIProvider } from '@/lib/ai/provider';
import { buildIntentPrompt } from '@/lib/ai/prompts';
import { isSupabaseConfigured, supabase } from '@/lib/db/supabase';

const AssistantSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

// ─── Load MN Rehman knowledge at module startup ────────────────────────────
// This runs once when the route is first hit (server module cache).
function loadKnowledge(): string {
  try {
    const root = process.cwd();
    const masterMemory = readFileSync(join(root, 'knowledge', 'MASTER_MEMORY.md'), 'utf-8');
    const teaching = readFileSync(join(root, 'knowledge', 'TEACHING_PHILOSOPHY.md'), 'utf-8');
    const storyTimeline = readFileSync(join(root, 'knowledge', 'STORY_TIMELINE.md'), 'utf-8');
    return `${masterMemory}\n\n---\n\n${teaching}\n\n---\n\n${storyTimeline}`;
  } catch {
    // Files not found — return minimal inline context
    return `
M N Rehman is an experienced Indian shooting coach and competitive shooter with ~20 years of experience.
He started via NCC, served in CRPF, competed nationally and internationally.
He coaches in Hindi/Hinglish. Never invent achievements or personal details.
    `.trim();
  }
}

const MN_REHMAN_KNOWLEDGE = loadKnowledge();

// ─── System prompt with full memory embedded ──────────────────────────────
function buildSystemPrompt(): string {
  return `
You are the personal AI assistant for M N Rehman — an experienced Indian shooting coach, competitive shooter, and educator.

You have complete knowledge about M N Rehman embedded below. Use it naturally when relevant. 
Do NOT caveat every response with "I don't know Papa personally" — you ALREADY know him from this document.
When answering questions about his career, his coaching, his story — answer with confidence based on the document below.

COMMUNICATION RULES:
- Always respond in natural Hindi / Hinglish (Roman Hindi mixed with English naturally).
- Be direct, practical, warm — like a knowledgeable colleague of his.
- Keep responses concise (2–6 sentences typically, longer only when explanation needs it).
- Use shooting terminology naturally in English (trigger, stance, sight picture, etc.).
- NEVER make up achievements, medals, or personal history that are not in the document below.
- If asked about something not in the document, say: "Iske baare mein mere paas abhi details nahi hain — Papa se confirm karein."
- End with a follow-up question or offer to help further, where natural.
- Use emojis sparingly and only when they add clarity.

═══════════════════════════════════════════════════════
M N REHMAN — COMPLETE KNOWLEDGE BASE
═══════════════════════════════════════════════════════
${MN_REHMAN_KNOWLEDGE}
═══════════════════════════════════════════════════════
  `.trim();
}

/**
 * POST /api/assistant
 *
 * AI assistant with full MN Rehman knowledge embedded.
 * Responds in natural Hindi/Hinglish.
 * Persists conversations to Supabase when configured.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = AssistantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { message, conversationHistory, conversationId } = parsed.data;

    const aiProvider = getAIProvider();

    // ─── Build conversation messages for multi-turn ───────────────────────
    const historyText = conversationHistory
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const userPrompt = `${historyText ? `CONVERSATION SO FAR:\n${historyText}\n\n` : ''}USER: ${message}

Respond naturally in Hindi/Hinglish. Be helpful and concise.`;

    // ─── Generate response ────────────────────────────────────────────────
    const aiResponse = await aiProvider.generate({
      system: buildSystemPrompt(),
      prompt: userPrompt,
      maxTokens: 600,
      temperature: 0.7,
    });

    const reply = aiResponse.text;

    // ─── Persist to Supabase if configured ───────────────────────────────
    if (isSupabaseConfigured()) {
      try {
        // We use service-less approach — upsert to conversations + messages
        // Using anon key here (works if RLS allows authenticated or public access)
        let convId = conversationId;

        if (!convId) {
          // Create a new conversation (no user_id required for demo sessions)
          const { data: conv } = await supabase
            .from('conversations')
            .insert({ title: message.slice(0, 80), context: {} })
            .select('id')
            .single();
          convId = conv?.id;
        }

        if (convId) {
          await supabase.from('messages').insert([
            { conversation_id: convId, role: 'user', content: message },
            {
              conversation_id: convId,
              role: 'assistant',
              content: reply,
              model: aiResponse.model,
              tokens: null,
            },
          ]);
        }
      } catch {
        // Persistence failure is non-fatal — don't break the response
      }
    }

    return NextResponse.json({
      ok: true,
      reply,
      meta: {
        model: aiResponse.model,
        latencyMs: aiResponse.latencyMs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[assistant API] Error:', message);

    return NextResponse.json({
      ok: false,
      reply: 'Mujhe ek problem aa gayi. Thodi der baad dobara try karein.',
      error: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
}
