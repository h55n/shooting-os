import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { CONTENT_CATEGORIES } from '@/lib/content-engine/categories';
import { fail, ok } from '@/lib/api/response';

const CategorySchema = z.enum(CONTENT_CATEGORIES.map((category) => category.id) as [string, ...string[]]);
const InputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('replace'), topicId: z.string().uuid(), title: z.string().trim().min(3).max(180), angle: z.string().trim().min(3).max(500), categoryId: CategorySchema }),
  z.object({ action: z.literal('reorder'), order: z.array(z.object({ topicId: z.string().uuid(), position: z.number().int().min(1).max(30) })).min(2).max(30) }),
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: seriesId } = await params;
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid topic update', 'Topic update check karein.', 400, parsed.error.flatten());
  if (!isSupabaseConfigured()) return fail('Database required', 'Series edits save karne ke liye database connection chahiye.', 503);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    if (parsed.data.action === 'replace') {
      const { data: topic, error: loadError } = await supabase.from('series_topics').select('id,content_item_id').eq('series_id', seriesId).eq('id', parsed.data.topicId).single();
      if (loadError || !topic) return fail('Topic not found', 'Series topic nahi mila.', 404);
      if (topic.content_item_id) return fail('Already scripted', 'Script ban chuka hai. Replacement ke liye naya topic add karein.', 422);
      const { data, error } = await supabase.from('series_topics').update({ title: parsed.data.title, angle: parsed.data.angle, category_id: parsed.data.categoryId, status: 'proposed', updated_at: new Date().toISOString() }).eq('id', topic.id).select('id,position,title,angle,category_id,status').single();
      if (error) throw error;
      await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'series', entity_id: seriesId, action: 'SERIES_TOPIC_REPLACED', metadata: { topicId: topic.id } });
      return ok(data);
    }

    const positions = parsed.data.order.map((entry) => entry.position);
    if (new Set(positions).size !== positions.length) return fail('Duplicate positions', 'Har topic ka position unique hona chahiye.', 400);
    const ids = parsed.data.order.map((entry) => entry.topicId);
    const { data: existing, error: existingError } = await supabase.from('series_topics').select('id').eq('series_id', seriesId).in('id', ids);
    if (existingError) throw existingError;
    if ((existing ?? []).length !== ids.length) return fail('Invalid topics', 'Kuch topics is series mein nahi mile.', 404);

    for (const entry of parsed.data.order) {
      const { error } = await supabase.from('series_topics').update({ position: entry.position, updated_at: new Date().toISOString() }).eq('series_id', seriesId).eq('id', entry.topicId);
      if (error) throw error;
    }
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'series', entity_id: seriesId, action: 'SERIES_TOPICS_REORDERED', metadata: { count: parsed.data.order.length } });
    return ok({ seriesId, updated: parsed.data.order.length });
  } catch (error) {
    return fail('Topic update failed', 'Series topic update save nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
