import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { fail, ok } from '@/lib/api/response';

const InputSchema = z.object({
  query: z.string().trim().min(3).max(500),
  sourceUrls: z.array(z.string().url()).min(1).max(5),
});

const ResearchSchema = z.object({
  summary: z.string().min(20).max(2500),
  safeClaim: z.string().min(10).max(800),
  warning: z.string().max(800).default(''),
  confidence: z.number().min(0).max(1),
  sourceNotes: z.array(z.object({ source: z.number().int().min(1), note: z.string().min(3).max(800) })).max(5),
});

function isAllowedExternalUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
    if (host === '::1' || host.startsWith('[')) return false;
    return true;
  } catch { return false; }
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function pageTitle(html: string, fallback: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (match?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || fallback).slice(0, 300);
}

function cleanJson(text: string) { return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim(); }

async function fetchSource(urlString: string, index: number) {
  if (!isAllowedExternalUrl(urlString)) throw new Error(`Source ${index + 1} URL is not allowed`);
  const response = await fetch(urlString, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ShootingOS-Research/1.0' },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Source ${index + 1} returned ${response.status}`);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') && !type.includes('text/plain') && !type.includes('application/json')) {
    throw new Error(`Source ${index + 1} is not readable text`);
  }
  const raw = (await response.text()).slice(0, 120_000);
  const text = type.includes('text/html') ? htmlToText(raw) : raw.replace(/\s+/g, ' ').trim();
  if (text.length < 80) throw new Error(`Source ${index + 1} has too little readable text`);
  const finalUrl = response.url || urlString;
  if (!isAllowedExternalUrl(finalUrl)) throw new Error(`Source ${index + 1} redirected to a blocked host`);
  const host = new URL(finalUrl).hostname;
  return { url: finalUrl, title: type.includes('text/html') ? pageTitle(raw, host) : host, publisher: host, text: text.slice(0, 18_000) };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return ok([], undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('research_items').select('id,topic,query,summary,safe_claim,warning,confidence,status,created_at,sources(id,url,title,publisher,accessed_at)').eq('content_item_id', id).order('created_at', { ascending: false });
    if (error) throw error;
    return ok(data ?? []);
  } catch (error) { return fail('Research load failed', 'Research load nahi ho saka.', 500, error instanceof Error ? error.message : error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: contentId } = await params;
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid research request', 'Question aur source links check karein.', 400, parsed.error.flatten());
  if (!isSupabaseConfigured()) return fail('Database required', 'Research evidence save karne ke liye database connection chahiye.', 503);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data: content, error: contentError } = await supabase.from('content_items').select('id,title').eq('id', contentId).single();
    if (contentError || !content) return fail('Content not found', 'Content item nahi mila.', 404);

    const settled = await Promise.allSettled(parsed.data.sourceUrls.map(fetchSource));
    const sources = settled.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
    const failures = settled.flatMap((result, index) => result.status === 'rejected' ? [`${index + 1}: ${result.reason instanceof Error ? result.reason.message : 'failed'}`] : []);
    if (!sources.length) return fail('No readable sources', 'Koi source safely read nahi ho saka.', 422, failures);

    const evidence = sources.map((source, index) => `SOURCE ${index + 1}\nTITLE: ${source.title}\nURL: ${source.url}\nTEXT: ${source.text}`).join('\n\n---\n\n');
    const ai = await getAIProvider().generate({
      json: true,
      maxTokens: 1800,
      temperature: 0.2,
      system: 'You are a conservative research summarizer. Use ONLY the supplied source text. Never add facts from memory. Separate a safe-to-use claim from uncertainty. If sources conflict or evidence is thin, lower confidence and explain the warning. Return JSON only.',
      prompt: `CONTENT: ${content.title}\nRESEARCH QUESTION: ${parsed.data.query}\n\nEVIDENCE:\n${evidence}\n\nReturn {"summary":"","safeClaim":"","warning":"","confidence":0.0,"sourceNotes":[{"source":1,"note":""}]}.`,
    });
    const result = ResearchSchema.parse(JSON.parse(cleanJson(ai.text)));

    const { data: research, error: researchError } = await supabase.from('research_items').insert({
      content_item_id: contentId,
      topic: parsed.data.query,
      query: parsed.data.query,
      findings: JSON.stringify({ summary: result.summary, sourceNotes: result.sourceNotes }),
      summary: result.summary,
      safe_claim: result.safeClaim,
      warning: result.warning || (failures.length ? `${failures.length} source(s) unreadable.` : ''),
      confidence: result.confidence,
      status: 'done',
      updated_at: new Date().toISOString(),
    }).select('id').single();
    if (researchError || !research) throw new Error(researchError?.message || 'Research insert failed');

    const sourceRows = sources.map((source) => ({ research_item_id: research.id, url: source.url, title: source.title, publisher: source.publisher, credibility: null }));
    const { error: sourcesError } = await supabase.from('sources').insert(sourceRows);
    if (sourcesError) throw sourcesError;
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'content_item', entity_id: contentId, action: 'RESEARCH_COMPLETED', metadata: { researchId: research.id, sourceCount: sources.length, failedSourceCount: failures.length, model: ai.model } });

    return ok({ id: research.id, ...result, sources: sources.map(({ text: _text, ...source }) => source), failures, model: ai.model, persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[content research]', error);
    return fail('Research failed', 'Research complete/save nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
