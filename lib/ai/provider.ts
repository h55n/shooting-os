export interface AIGenerateInput { system: string; prompt: string; json?: boolean; maxTokens?: number; temperature?: number; }
export interface AIGenerateOutput { text: string; model: string; tokens?: number; cost?: number; latencyMs?: number; }
export interface AIProvider { generate(input: AIGenerateInput): Promise<AIGenerateOutput>; readonly name: string; readonly model: string; }

export type AIErrorKind = 'configuration' | 'authentication' | 'rate_limit' | 'unavailable' | 'invalid_response';
export class AIProviderError extends Error {
  constructor(readonly kind: AIErrorKind, readonly provider: string, readonly status?: number) { super(`${provider}:${kind}`); }
}

function providerNames() {
  const primary = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  const fallback = (process.env.AI_FALLBACK_PROVIDERS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const configured = primary === 'fallback' ? ['groq', 'mistral', 'nvidia'] : [primary];
  return [...new Set([...configured, ...fallback].filter(Boolean))];
}

function statusError(provider: string, status: number) {
  if (status === 401 || status === 403) return new AIProviderError('authentication', provider, status);
  if (status === 429) return new AIProviderError('rate_limit', provider, status);
  return new AIProviderError('unavailable', provider, status);
}

function safeError(error: unknown, provider: string) {
  if (error instanceof AIProviderError) return error;
  return new AIProviderError('unavailable', provider);
}

abstract class OpenAICompatibleProvider implements AIProvider {
  abstract readonly name: string; abstract readonly model: string; protected abstract readonly apiKey: string; protected abstract readonly baseUrl: string;
  async generate(input: AIGenerateInput): Promise<AIGenerateOutput> {
    if (!this.apiKey) throw new AIProviderError('configuration', this.name);
    const started = Date.now();
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        // Current provider fallbacks do not share a portable JSON-mode switch.
        // Callers already require JSON in the prompt and validate it with Zod.
        body: JSON.stringify({ model: this.model, messages: [{ role: 'system', content: input.system }, { role: 'user', content: input.prompt }], max_tokens: input.maxTokens ?? 2048, temperature: input.temperature ?? 0.7 }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw statusError(this.name, response.status);
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { total_tokens?: number } };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new AIProviderError('invalid_response', this.name);
      return { text, model: this.model, tokens: data.usage?.total_tokens, latencyMs: Date.now() - started };
    } catch (error) { throw safeError(error, this.name); }
  }
}

export class GroqProvider extends OpenAICompatibleProvider { readonly name = 'groq'; readonly model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b'; protected readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions'; protected readonly apiKey = process.env.GROQ_API_KEY || ''; }
export class MistralProvider extends OpenAICompatibleProvider { readonly name = 'mistral'; readonly model = process.env.MISTRAL_MODEL || 'mistral-small-latest'; protected readonly baseUrl = 'https://api.mistral.ai/v1/chat/completions'; protected readonly apiKey = process.env.MISTRAL_API_KEY || ''; }
export class NvidiaNimProvider extends OpenAICompatibleProvider { readonly name = 'nvidia'; readonly model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.3-70b-instruct'; protected readonly baseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions'; protected readonly apiKey = process.env.NVIDIA_NIM_API_KEY || ''; }

function providerFor(name: string): AIProvider | null { if (name === 'groq') return new GroqProvider(); if (name === 'mistral') return new MistralProvider(); if (name === 'nvidia') return new NvidiaNimProvider(); return null; }

export class FallbackProvider implements AIProvider {
  readonly name = 'fallback'; readonly model = 'multiple';
  constructor(private readonly providers: AIProvider[]) {}
  async generate(input: AIGenerateInput) {
    let last: AIProviderError | undefined;
    for (const provider of this.providers) {
      try { return await provider.generate(input); }
      catch (error) { last = safeError(error, provider.name); console.warn(`[AI] provider=${provider.name} kind=${last.kind} status=${last.status ?? 'none'}`); }
    }
    throw last ?? new AIProviderError('configuration', 'none');
  }
}

let instance: AIProvider | null = null;
export function getAIProvider(): AIProvider {
  if (instance) return instance;
  const names = providerNames();
  const providers = names.map(providerFor).filter((provider): provider is AIProvider => provider !== null);
  if (!providers.length) throw new AIProviderError('configuration', 'none');
  return (instance = providers.length === 1 ? providers[0] : new FallbackProvider(providers));
}
export function resetAIProvider() { instance = null; }
export function aiReadiness() { return { providers: providerNames().filter((name) => providerFor(name) !== null), demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' }; }
