import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIProvider } from '@/lib/ai/provider';
import { getServiceClient } from '@/lib/db/supabase';

const AnalyzeTrendSchema = z.object({
  rawContent: z.string().min(5).max(5000),
});

const TrendOutputSchema = z.object({
  topic: z.string(),
  score: z.number().min(0).max(100),
  urgency: z.enum(['high', 'medium', 'low']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = AnalyzeTrendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { rawContent } = parsed.data;

    // 1. Analyze Trend with AI
    const aiProvider = getAIProvider();
    
    const systemPrompt = `
You are a sports science analyst for Olympic shooting.
Analyze the following raw text or notes and determine if it represents a valuable trend or insight for a shooting coach.
Extract a concise 'topic', assign an importance 'score' from 0-100, and classify its 'urgency' (high, medium, or low).
Return ONLY valid JSON matching this schema:
{
  "topic": "string",
  "score": number,
  "urgency": "high" | "medium" | "low"
}
`.trim();

    const userPrompt = `Raw Text to Analyze:\n\n"${rawContent}"`;

    const aiResponse = await aiProvider.generate({
      system: systemPrompt,
      prompt: userPrompt,
      json: true,
      maxTokens: 500,
      temperature: 0.2,
    });

    let trendData;
    try {
      trendData = JSON.parse(aiResponse.text);
    } catch (e) {
      // In case the AI returns markdown blocks
      const cleanJson = aiResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
      trendData = JSON.parse(cleanJson);
    }

    // Validate the AI output
    const parsedTrend = TrendOutputSchema.safeParse(trendData);
    if (!parsedTrend.success) {
      throw new Error('AI returned invalid trend schema');
    }

    const trend = parsedTrend.data;

    // 2. Save to Supabase
    const supabase = getServiceClient();

    const { data: insertedTrend, error } = await supabase
      .from('trend_items')
      .insert({
        topic: trend.topic,
        relevance_score: trend.score,
        urgency: trend.urgency,
        source: 'AI Analysis',
        status: 'new',
        signal_type: 'Manual Input'
      })
      .select('id')
      .single();

    if (error || !insertedTrend) {
      throw new Error('Failed to save trend: ' + error?.message);
    }

    return NextResponse.json({
      ok: true,
      trend: trend.topic,
      score: trend.score,
      urgency: trend.urgency,
      meta: {
        model: aiResponse.model,
        latencyMs: aiResponse.latencyMs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[analyze-trend API] Error:', message);

    return NextResponse.json({
      ok: false,
      error: process.env.NODE_ENV === 'development' ? message : 'Failed to analyze trend',
    }, { status: 500 });
  }
}
