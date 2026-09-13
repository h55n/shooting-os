import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const InputSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  content: z.string().trim().min(20).max(9000).optional(),
  learningObjective: z.string().trim().max(800).optional(),
  demonstration: z.string().max(2000).optional(),
  practice: z.string().max(2000).optional(),
  approve: z.boolean().optional(),
  changeSummary: z.string().trim().max(500).optional(),
}).refine((value) => Object.keys(value).some((key) => key !== 'changeSummary'), { message: 'No lesson change supplied' });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = InputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid lesson update', 'Lesson changes check karein.', 400, parsed.error.flatten());
  if (!isSupabaseConfigured()) return fail('Database required', 'Lesson changes save karne ke liye database connection chahiye.', 503);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data: current, error: loadError } = await supabase.from('masterclass_sections').select('id,module_id,title,content,learning_objective,demonstration,practice,status,version').eq('id', id).single();
    if (loadError || !current) return fail('Lesson not found', 'Lesson nahi mila.', 404);

    const changed = parsed.data.title !== undefined || parsed.data.content !== undefined || parsed.data.learningObjective !== undefined || parsed.data.demonstration !== undefined || parsed.data.practice !== undefined;
    const nextVersion = changed ? (current.version ?? 1) + 1 : (current.version ?? 1);
    const next = {
      title: parsed.data.title ?? current.title,
      content: parsed.data.content ?? current.content,
      learning_objective: parsed.data.learningObjective ?? current.learning_objective,
      demonstration: parsed.data.demonstration ?? current.demonstration,
      practice: parsed.data.practice ?? current.practice,
      version: nextVersion,
      status: parsed.data.approve ? 'approved' : current.status,
      approved_by: parsed.data.approve ? user.id : undefined,
    };

    const updatePayload: Record<string, unknown> = { ...next };
    if (!parsed.data.approve) delete updatePayload.approved_by;
    const { data: updated, error: updateError } = await supabase.from('masterclass_sections').update(updatePayload).eq('id', id).select('id,module_id,title,content,learning_objective,demonstration,practice,status,version').single();
    if (updateError || !updated) throw new Error(updateError?.message || 'Lesson update failed');

    if (changed) {
      const { error: versionError } = await supabase.from('masterclass_section_versions').insert({
        section_id: id,
        version: nextVersion,
        content: { title: updated.title, content: updated.content, learningObjective: updated.learning_objective, demonstration: updated.demonstration, practice: updated.practice },
        change_summary: parsed.data.changeSummary || 'Owner lesson edit',
        created_by: user.id,
      });
      if (versionError) throw versionError;
    }

    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'masterclass_section', entity_id: id, action: parsed.data.approve ? 'LESSON_APPROVED' : 'LESSON_UPDATED', metadata: { version: nextVersion, changed } });
    return ok(updated);
  } catch (error) {
    return fail('Lesson update failed', 'Lesson update/approval save nahi ho saka.', 500, error instanceof Error ? error.message : error);
  }
}
