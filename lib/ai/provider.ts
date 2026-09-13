/**
 * AI Provider Abstraction Layer
 *
 * Supports: Gemini, Groq, Mistral, Nvidia NIM, Mock
 * Implements fallback logic so if one provider fails, the next one is tried.
 */

export interface AIGenerateInput {
  system: string;
  prompt: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGenerateOutput {
  text: string;
  model: string;
  tokens?: number;
  cost?: number;
  latencyMs?: number;
}

export interface AIProvider {
  generate(input: AIGenerateInput): Promise<AIGenerateOutput>;
  readonly name: string;
  readonly model: string;
}

// ─── Mock Provider (development only) ────────────────────────────────────────

export class MockAIProvider implements AIProvider {
  readonly name = 'mock';
  readonly model = 'mock-v1';

  async generate({ prompt }: AIGenerateInput): Promise<AIGenerateOutput> {
    await new Promise(r => setTimeout(r, 400));
    return {
      model: this.model,
      tokens: 0,
      cost: 0,
      latencyMs: 400,
      text: JSON.stringify({
        title: 'Mock Title',
        coreLesson: 'Mock Lesson',
        audience: 'Beginners',
        pillar: 'Education',
        format: 'reel',
        hook: 'Mock hook',
        keyPoints: ['Point 1'],
        researchNeeded: false,
        confidence: 'low',
        relatedContent: [],
      }),
    };
  }
}

// ─── Gemini Provider ───────────────────────────────────────────────────────────

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  readonly model: string;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? '';
    this.model = process.env.AI_MODEL ?? 'gemini-1.5-flash';
  }

  async generate(input: AIGenerateInput): Promise<AIGenerateOutput> {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY is not configured.');
    const start = Date.now();
    const body = {
      system_instruction: input.system ? { parts: [{ text: input.system }] } : undefined,
      contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
      generationConfig: {
        maxOutputTokens: input.maxTokens ?? 2048,
        temperature: input.temperature ?? 0.7,
        ...(input.json ? { responseMimeType: 'application/json' } : {}),
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60_000),
      }
    );

    if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const tokens = data.usageMetadata?.totalTokenCount ?? 0;
    const cost = (tokens / 1_000_000) * 0.15;

    return { text, model: this.model, tokens, cost, latencyMs: Date.now() - start };
  }
}

// ─── OpenAI Compatible Provider Base ───────────────────────────────────────────

abstract class OpenAICompatibleProvider implements AIProvider {
  abstract readonly name: string;
  abstract readonly model: string;
  protected abstract readonly apiKey: string;
  protected abstract readonly baseUrl: string;

  async generate(input: AIGenerateInput): Promise<AIGenerateOutput> {
    if (!this.apiKey) throw new Error(`${this.name.toUpperCase()}_API_KEY is not configured.`);
    const start = Date.now();
    const messages = [];
    if (input.system) messages.push({ role: 'system', content: input.system });
    messages.push({ role: 'user', content: input.prompt });

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: input.maxTokens ?? 2048,
      temperature: input.temperature ?? 0.7,
    };

    if (input.json) body.response_format = { type: 'json_object' };

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`${this.name} API error ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const tokens = data.usage?.total_tokens ?? 0;

    return { text, model: this.model, tokens, cost: 0, latencyMs: Date.now() - start };
  }
}

// ─── Groq Provider ─────────────────────────────────────────────────────────────

export class GroqProvider extends OpenAICompatibleProvider {
  readonly name = 'groq';
  readonly model = 'llama3-8b-8192';
  protected readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  protected readonly apiKey = process.env.GROQ_API_KEY ?? '';
}

// ─── Mistral Provider ──────────────────────────────────────────────────────────

export class MistralProvider extends OpenAICompatibleProvider {
  readonly name = 'mistral';
  readonly model = 'open-mistral-7b';
  protected readonly baseUrl = 'https://api.mistral.ai/v1/chat/completions';
  protected readonly apiKey = process.env.MISTRAL_API_KEY ?? '';
}

// ─── Nvidia NIM Provider ───────────────────────────────────────────────────────

export class NvidiaNimProvider extends OpenAICompatibleProvider {
  readonly name = 'nvidia';
  readonly model = 'meta/llama3-70b-instruct'; // Default model for Nvidia NIM
  protected readonly baseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
  protected readonly apiKey = process.env.NVIDIA_NIM_API_KEY ?? '';
}

// ─── Fallback Provider ─────────────────────────────────────────────────────────

export class FallbackProvider implements AIProvider {
  readonly name = 'fallback';
  readonly model = 'multiple';
  private providers: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.providers = providers;
  }

  async generate(input: AIGenerateInput): Promise<AIGenerateOutput> {
    const errors: Error[] = [];
    for (const provider of this.providers) {
      try {
        console.log(`[AI] Attempting generation with ${provider.name}...`);
        return await provider.generate(input);
      } catch (err: any) {
        console.warn(`[AI] Provider ${provider.name} failed: ${err.message}`);
        errors.push(err);
      }
    }
    throw new Error(`All AI providers failed. Errors: ${errors.map(e => e.message).join(' | ')}`);
  }
}

// ─── Provider Factory ─────────────────────────────────────────────────────────

let _providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_providerInstance) return _providerInstance;

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    _providerInstance = new MockAIProvider();
    return _providerInstance;
  }

  // Configure Fallback Chain
  const activeProviders: AIProvider[] = [];

  // Add configured providers to the fallback chain
  if (process.env.GROQ_API_KEY) activeProviders.push(new GroqProvider());
  if (process.env.MISTRAL_API_KEY) activeProviders.push(new MistralProvider());
  if (process.env.NVIDIA_NIM_API_KEY) activeProviders.push(new NvidiaNimProvider());
  if (process.env.GEMINI_API_KEY) activeProviders.push(new GeminiProvider());

  if (activeProviders.length === 0) {
    throw new Error('No AI providers configured (keys are missing) and demo mode is off.');
  }

  _providerInstance = new FallbackProvider(activeProviders);
  return _providerInstance;
}

export function resetAIProvider() {
  _providerInstance = null;
}
