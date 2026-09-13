import 'server-only';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { ScriptDocumentSchema, type ScriptDocument } from '@/lib/ai/schemas';
import type { ContentStatus } from '@/lib/domain/types';

export interface ContentSummary {
  id: string;
  title: string;
  status: ContentStatus;
  contentType: string;
  categoryId?: string;
  scheduledDate?: string;
  shotAt?: string;
  updatedAt?: string;
}

export interface ContentDetail extends ContentSummary {
  brief: Record<string, unknown>;
  shootingGuidance?: Record<string, unknown>;
  offlineEnabled: boolean;
  script?: ScriptDocument;
  scriptVersion?: number;
}

export async function getContentItems(limit = 50): Promise<ContentSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_items')
    .select('id,title,status,content_type,category_id,scheduled_date,shot_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as ContentStatus,
    contentType: row.content_type,
    categoryId: row.category_id ?? undefined,
    scheduledDate: row.scheduled_date ?? undefined,
    shotAt: row.shot_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }));
}

export async function getContentItem(id: string): Promise<ContentDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from('content_items')
    .select('id,title,status,content_type,category_id,scheduled_date,shot_at,updated_at,brief,shooting_guidance,offline_enabled')
    .eq('id', id)
    .single();
  if (error || !row) return null;
  const { data: scriptRow } = await supabase
    .from('scripts')
    .select('version,content')
    .eq('content_item_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  let script: ScriptDocument | undefined;
  if (scriptRow?.content) {
    const parsed = ScriptDocumentSchema.safeParse(scriptRow.content);
    if (parsed.success) script = parsed.data;
  }
  return {
    id: row.id,
    title: row.title,
    status: row.status as ContentStatus,
    contentType: row.content_type,
    categoryId: row.category_id ?? undefined,
    scheduledDate: row.scheduled_date ?? undefined,
    shotAt: row.shot_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    brief: (row.brief ?? {}) as Record<string, unknown>,
    shootingGuidance: row.shooting_guidance ?? undefined,
    offlineEnabled: Boolean(row.offline_enabled),
    script,
    scriptVersion: scriptRow?.version ?? undefined,
  };
}

export async function getScheduledContent(): Promise<ContentSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_items')
    .select('id,title,status,content_type,category_id,scheduled_date,shot_at,updated_at')
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: true })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as ContentStatus,
    contentType: row.content_type,
    categoryId: row.category_id ?? undefined,
    scheduledDate: row.scheduled_date ?? undefined,
    shotAt: row.shot_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }));
}
