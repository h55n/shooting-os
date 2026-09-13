import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';

export interface RetrievedKnowledge {
  id: string;
  title: string;
  text: string;
  verification: 'verified' | 'unverified' | 'disputed';
  sourceUrl?: string;
  score: number;
}

function tokens(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9\u0900-\u097f]+/i).filter((part) => part.length > 2));
}

function lexicalScore(query: string, text: string): number {
  const q = tokens(query);
  if (!q.size) return 0;
  const t = tokens(text);
  let overlap = 0;
  q.forEach((token) => { if (t.has(token)) overlap += 1; });
  return overlap / q.size;
}

/**
 * One shared retrieval entry point. It intentionally starts with verified-only
 * lexical retrieval so grounding works even before an embedding provider is
 * configured. pgvector remains available for a later embedding-backed adapter.
 */
export async function retrieveKnowledge(params: {
  query: string;
  count?: number;
  verifiedOnly?: boolean;
}): Promise<RetrievedKnowledge[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from('knowledge_documents')
    .select('id,title,content,verification_status,source_url')
    .limit(80);
  if (params.verifiedOnly !== false) query = query.eq('verification_status', 'verified');
  const { data, error } = await query;
  if (error) throw new Error(`Knowledge retrieval failed: ${error.message}`);

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      title: row.title,
      text: row.content,
      verification: row.verification_status as RetrievedKnowledge['verification'],
      sourceUrl: row.source_url ?? undefined,
      score: lexicalScore(params.query, `${row.title} ${row.content}`),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, params.count ?? 6);
}

export async function getVerifiedFacts(query: string): Promise<string[]> {
  const rows = await retrieveKnowledge({ query, count: 8, verifiedOnly: true });
  return rows.map((row) => row.text);
}
