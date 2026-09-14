import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';
import { ownerErrorResponse, requireOwner } from '@/lib/auth/owner';

const TrashSchema = z.object({ restore: z.boolean().default(false) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let owner;
  try { owner = await requireOwner(); } catch (error) { return ownerErrorResponse(error); }
  const { id } = await params;
  const parsed = TrashSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail('Invalid request', 'Action valid nahi hai.', 400);
  if (!isSupabaseConfigured()) return ok({ id, trashed: !parsed.data.restore, persisted: false });
  try {
    const supabase = await createClient();
    const update = parsed.data.restore ? { trashed_at: null, trashed_by: null } : { trashed_at: new Date().toISOString(), trashed_by: owner.id };
    const { error } = await supabase.from('content_items').update(update).eq('id', id);
    if (error) throw error;
    return ok({ id, trashed: !parsed.data.restore, persisted: true });
  } catch {
    return fail('Content update failed', 'Video plan remove nahi ho saka.', 500);
  }
}
