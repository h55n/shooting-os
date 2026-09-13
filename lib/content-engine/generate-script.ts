import { getAIProvider } from '@/lib/ai/provider';
import { ScriptDocumentSchema, parseStructuredJson, type ScriptDocument } from '@/lib/ai/schemas';
import { runQualityGate } from './quality-gate';
import { getHookPatternsForCategory } from './hooks';

export interface GeneratedScriptResult {
  script: ScriptDocument;
  model: string;
  quality: ReturnType<typeof runQualityGate>;
}

function demoScript(topic: string, categoryId: string, hookSeed?: string): ScriptDocument {
  const pattern = getHookPatternsForCategory(categoryId)[0];
  const hook = hookSeed?.trim() || pattern?.template.replaceAll('___', topic) || `${topic} mein ek simple cheez sabse pehle samjho.`;
  return ScriptDocumentSchema.parse({
    hook,
    setup: `${topic} ko complicated banane ki zaroorat nahi hai. Pehle basic samajhte hain.`,
    mainPoint: `Sabse important cheez hai ki aap ek time par ek clear point par focus karo. Practice mein us point ko consciously repeat karo aur result observe karo.`,
    storyOrExample: '',
    takeaway: `Simple rule: pehle consistency, phir speed.`,
    cta: '',
    production: {
      visuals: ['Talking head; zaroorat ho toh simple demonstration cut-in.'],
      broll: [],
      onScreenText: [topic],
      delivery: ['Short sentences. Natural pauses. Camera ko ek person samajh kar bolo.'],
    },
    targetDurationSeconds: 45,
    personalClaims: [],
  });
}

export async function generateStructuredScript(params: {
  topic: string;
  categoryId: string;
  audience: string;
  hookSeed?: string;
  verifiedKnowledge?: string[];
  demo?: boolean;
}): Promise<GeneratedScriptResult> {
  if (params.demo) {
    const script = demoScript(params.topic, params.categoryId, params.hookSeed);
    return { script, model: 'deterministic-demo-v1', quality: runQualityGate(script) };
  }

  const hooks = getHookPatternsForCategory(params.categoryId).slice(0, 4);
  const provider = getAIProvider();
  const response = await provider.generate({
    json: true,
    temperature: 0.65,
    maxTokens: 1800,
    system: `You create short-form shooting education scripts for M N Rehman. Write natural spoken Hinglish, not polished generic AI copy. Never invent a personal memory, achievement, competition result, credential, duration of experience, or factual claim. Only use personal facts explicitly present in VERIFIED KNOWLEDGE. One dominant idea. No "hello guys", "welcome back", "game changer", or filler intro. Return JSON only.`,
    prompt: `TOPIC: ${params.topic}\nCATEGORY: ${params.categoryId}\nAUDIENCE: ${params.audience}\nTARGET: 30-60 seconds unless the idea needs less.\nHOOK SEED: ${params.hookSeed || 'none'}\nHOOK PATTERNS TO ADAPT (not copy mechanically): ${JSON.stringify(hooks)}\nVERIFIED KNOWLEDGE:\n${(params.verifiedKnowledge ?? []).join('\n---\n') || 'No verified personal facts supplied. Do not make personal claims.'}\n\nReturn exactly this shape:\n{\n  "hook":"", "setup":"", "mainPoint":"", "storyOrExample":"", "takeaway":"", "cta":"",\n  "production":{"visuals":[],"broll":[],"onScreenText":[],"delivery":[]},\n  "targetDurationSeconds":45, "personalClaims":[]\n}`,
  });

  const script = parseStructuredJson(response.text, ScriptDocumentSchema);
  return { script, model: response.model, quality: runQualityGate(script) };
}

export function scriptToSpokenText(script: ScriptDocument): string {
  return [script.hook, script.setup, script.mainPoint, script.storyOrExample, script.takeaway, script.cta]
    .filter(Boolean)
    .join(' ');
}
