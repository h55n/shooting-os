import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIProvider } from '@/lib/ai/provider';
import { buildIdeaSystemPrompt, buildIdeaPrompt } from '@/lib/ai/prompts';
import { validateClaims } from '@/lib/domain/claims';
import { createClient as createServerSupabase } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';

// ─── Validation schema ───────────────────────────────────────────────────────

const IdeaInputSchema = z.object({
  rawInput: z.string().min(3, 'Idea bahut chhota hai').max(2000, 'Idea bahut lamba hai'),
  inputType: z.enum(['text', 'voice']).default('text'),
  transcript: z.string().optional(),
});

const IdeaProposalSchema = z.object({
  title: z.string(),
  coreLesson: z.string(),
  audience: z.string(),
  pillar: z.string(),
  format: z.string(),
  hook: z.string(),
  keyPoints: z.array(z.string()),
  researchNeeded: z.boolean().default(false),
  confidence: z.enum(['high', 'medium', 'low']),
  relatedContent: z.array(z.string()).default([]),
  isDuplicate: z.boolean().optional().default(false),
  duplicateNote: z.string().optional().default(''),
  personalClaims: z.array(z.string()).default([]),
});

// ─── POST /api/ideas ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json().catch(() => ({}));
    const parsed = IdeaInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parsed.error.issues.map((i) => i.message),
          hindiError: 'Input sahi nahi hai. Dobara check karein.',
        },
        { status: 400 }
      );
    }

    const { rawInput, inputType } = parsed.data;

    // Get current user (optional in demo mode)
    let userId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // Demo mode — no auth
      }
    }

    // Build AI context
    // TODO: In production, retrieve voice examples from DB
    const voiceExamples: string[] = [];
    const knowledgeContext: string | undefined = undefined;
    const relatedContentTitles: string[] = [];

    // Generate idea proposal via AI
    const aiProvider = getAIProvider();
    const systemPrompt = buildIdeaSystemPrompt(voiceExamples);
    const userPrompt = buildIdeaPrompt({
      rawInput,
      knowledgeContext,
      relatedContent: relatedContentTitles,
    });

    const aiResponse = await aiProvider.generate({
      system: systemPrompt,
      prompt: userPrompt,
      json: true,
      maxTokens: 1024,
      temperature: 0.7,
    });

    // Parse AI response
    let proposalData: z.infer<typeof IdeaProposalSchema>;
    try {
      const cleanJsonStr = aiResponse.text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
      const rawJson = JSON.parse(cleanJsonStr);
      const proposalParsed = IdeaProposalSchema.safeParse(rawJson);
      if (!proposalParsed.success) {
        throw new Error('AI returned invalid structure');
      }
      proposalData = proposalParsed.data;
    } catch {
      return NextResponse.json(
        {
          error: 'AI response parsing failed',
          hindiError: 'System ne response sahi nahi diya. Dobara try karein.',
          rawResponse: aiResponse.text
        },
        { status: 500 }
      );
    }

    // Validate personal claims
    const claimValidation = validateClaims({
      scriptText: JSON.stringify(proposalData),
      personalClaimsFromGeneration: proposalData.personalClaims,
      verifiedFacts: [], // TODO: load from knowledge base
    });

    // Persist idea to Supabase (if configured)
    let savedIdeaId: string | null = null;
    if (isSupabaseConfigured() && userId) {
      try {
        const supabase = await createServerSupabase();
        const { data: ideaRow } = await supabase
          .from('ideas')
          .insert({
            raw_input: rawInput,
            input_type: inputType,
            normalized_idea: proposalData.title,
            status: 'proposal',
            created_by: userId,
          })
          .select('id')
          .single();
        savedIdeaId = ideaRow?.id ?? null;

        // Record agent run
        await supabase.from('agent_runs').insert({
          agent_name: 'idea-engine',
          input: { rawInput, inputType },
          output: { proposalTitle: proposalData.title },
          model: aiResponse.model,
          tokens: aiResponse.tokens ?? 0,
          cost: aiResponse.cost ?? 0,
          status: 'success',
        });
      } catch (dbError) {
        // Log but don't fail the request — return the proposal even if persistence fails
        console.error('[ideas API] DB persistence failed:', dbError);
      }
    }

    return NextResponse.json({
      ok: true,
      ideaId: savedIdeaId,
      proposal: proposalData,
      claimValidation: {
        passed: claimValidation.passed,
        blockedCount: claimValidation.blockedClaims.length,
        warningCount: claimValidation.warningClaims.length,
        fatherFacingMessage: claimValidation.fatherFacingMessage,
      },
      meta: {
        model: aiResponse.model,
        latencyMs: aiResponse.latencyMs,
        demoMode: !isSupabaseConfigured(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ideas API] Error:', message);

    return NextResponse.json(
      {
        error: 'Internal server error',
        hindiError: 'Server mein kuch gadbad ho gayi. Thodi der baad try karein.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}

// ─── GET /api/ideas — list ideas ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      // Return demo data
      return NextResponse.json({
        ok: true,
        ideas: [],
        demoMode: true,
        message: 'Demo mode: Supabase configure karein real data ke liye.',
      });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, ideas: ideas ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch ideas', details: message },
      { status: 500 }
    );
  }
}
