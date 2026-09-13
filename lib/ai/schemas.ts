import { z } from 'zod';

export const ProductionGuidanceSchema = z.object({
  visuals: z.array(z.string()).default([]),
  broll: z.array(z.string()).default([]),
  onScreenText: z.array(z.string()).default([]),
  delivery: z.array(z.string()).default([]),
});

export const ScriptDocumentSchema = z.object({
  hook: z.string().min(1),
  setup: z.string().default(''),
  mainPoint: z.string().min(1),
  storyOrExample: z.string().optional().default(''),
  takeaway: z.string().min(1),
  cta: z.string().optional().default(''),
  production: ProductionGuidanceSchema.default({ visuals: [], broll: [], onScreenText: [], delivery: [] }),
  targetDurationSeconds: z.number().int().min(15).max(90).default(45),
  personalClaims: z.array(z.string()).default([]),
});

export type ScriptDocument = z.infer<typeof ScriptDocumentSchema>;

export const ScriptGenerationSchema = z.object({
  categoryId: z.string(),
  audience: z.string(),
  script: ScriptDocumentSchema,
});

export type ScriptGeneration = z.infer<typeof ScriptGenerationSchema>;

export function parseStructuredJson<T>(text: string, schema: z.ZodType<T>): T {
  const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  return schema.parse(JSON.parse(cleaned));
}
