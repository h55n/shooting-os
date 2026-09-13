import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const ApproveSchema = z.object({ notes: z.string().max(1000).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = ApproveSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail('Invalid input', 'Approval note valid nahi hai.', 400);
  if (!isSupabaseConfigured()) return ok({ id, newStatus: 'APPROVED', approvedAt: new Date().toISOString(), persisted: false }, undefined, { demoMode: true });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.rpc('approve_content', {
      p_content_id: id,
      p_user_id: user.id,
      p_notes: parsed.data.notes ?? null,
    });
    if (error) {
      if (error.message.includes('CONTENT_NOT_FOUND')) return fail('Content not found', 'Content nahi mila.', 404);
      if (error.message.includes('INVALID_APPROVAL_STATE')) return fail('Invalid state', 'Ye script abhi approve nahi ho sakta.', 422);
      throw error;
    }
    return ok({ ...data, persisted: true });
  } catch (error) {
    console.error('[approve]', error);
    return fail('Approval failed', 'Approve save nahi ho saka. Dobara try karein.', 500, error instanceof Error ? error.message : error);
  }
}
