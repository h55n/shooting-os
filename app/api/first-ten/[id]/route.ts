import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { fail, ok } from '@/lib/api/response';
import { ownerErrorResponse, requireOwner } from '@/lib/auth/owner';

const ReplacementSchema = z.object({
  title: z.string().trim().min(3).max(180),
  purpose: z.string().trim().min(3).max(500),
  audience: z.string().trim().min(2).max(200),
  categoryId: z.string().trim().min(2).max(100),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireOwner(); } catch (error) { return ownerErrorResponse(error); }
  const parsed = ReplacementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid replacement', 'Video title aur brief check karein.', 400);
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('first_ten_items')
      .update({ title: parsed.data.title, purpose: parsed.data.purpose, audience: parsed.data.audience, category_id: parsed.data.categoryId, content_item_id: null, status: 'planned' })
      .eq('id', id)
      .select('id,position,title,purpose,audience,category_id,content_item_id,status')
      .single();
    if (error) throw error;
    return ok(data);
  } catch (error) {
    return fail('First 10 replacement failed', 'Video replace nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
