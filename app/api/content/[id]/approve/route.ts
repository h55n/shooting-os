import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { canTransitionTo } from '@/lib/domain/status';

const ApproveSchema = z.object({
  notes: z.string().max(1000).optional(),
});

/**
 * POST /api/content/[id]/approve
 *
 * Server-side approval enforcement. Not just a UI action.
 * Records who approved, when, and creates audit log.
 * NO AI agent can call this — only authenticated human user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = ApproveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Demo mode response
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        ok: true,
        demoMode: true,
        message: 'Demo mode: Approval simulated. Real data ke liye Supabase configure karein.',
        newStatus: 'APPROVED',
        approvedAt: new Date().toISOString(),
      });
    }

    // Real mode: require authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', hindiError: 'Pehle sign in karein.' },
        { status: 401 }
      );
    }

    // Get current content item
    const { data: contentItem, error: fetchError } = await supabase
      .from('content_items')
      .select('id, status, title')
      .eq('id', id)
      .single();

    if (fetchError || !contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    // Validate state transition
    const currentStatus = contentItem.status as string;
    const targetStatus = 'APPROVED';

    if (!canTransitionTo(currentStatus as never, targetStatus as never)) {
      return NextResponse.json(
        {
          error: 'Invalid state transition',
          hindiError: `Abhi "${currentStatus}" status mein hai. Approve nahi ho sakta.`,
          currentStatus,
          targetStatus,
        },
        { status: 422 }
      );
    }

    // Update status
    const { error: updateError } = await supabase
      .from('content_items')
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Update script record
    await supabase
      .from('scripts')
      .update({
        status: 'approved',
        approved_by: user.id,
      })
      .eq('content_item_id', id)
      .order('version', { ascending: false })
      .limit(1);

    // Write audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      entity_type: 'content_item',
      entity_id: id,
      action: 'APPROVED',
      metadata: {
        previousStatus: currentStatus,
        newStatus: targetStatus,
        notes: parsed.data.notes,
        approvedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      id,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[approve API] Error:', message);
    return NextResponse.json(
      {
        error: 'Approval failed',
        hindiError: 'Approve nahi ho saka. Dobara try karein.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
