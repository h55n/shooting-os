import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { getAIProvider } from '@/lib/ai/provider';
import { retrieveKnowledge } from '@/lib/knowledge/retrieval';
import { fail, ok } from '@/lib/api/response';

const LessonBundleSchema = z.object({
  lessons: z.array(z.object({
    moduleOrder: z.number().int().min(1),
    title: z.string().min(2).max(180),
    learningObjective: z.string().min(3).max(500),
    content: z.string().min(40).max(7000),
    demonstration: z.string().max(1500).optional().default(''),
    practice: z.string().max(1500).optional().default(''),
  })).min(1).max(60),
});

function clean(text: string) { return text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim(); }

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return fail('Database required', 'Lesson generation save karne ke liye database connection chahiye.', 503);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);

    const { data: masterclass, error: masterclassError } = await supabase
      .from('masterclasses')
      .select('id,title,status,audience,learning_outcome,target_duration_minutes,outline')
      .eq('id', id)
      .single();
    if (masterclassError || !masterclass) return fail('Not found', 'Masterclass nahi mila.', 404);
    if (masterclass.status !== 'outline_approved' && masterclass.status !== 'lessons_ready') {
      return fail('Outline not approved', 'Lessons banane se pehle outline approve karein.', 422);
    }

    const { data: modules, error: modulesError } = await supabase
      .from('masterclass_modules')
      .select('id,title,order,learning_objective,estimated_minutes')
      .eq('masterclass_id', id)
      .order('order');
    if (modulesError || !modules?.length) throw new Error(modulesError?.message || 'Masterclass modules missing');

    const moduleIds = modules.map((module) => module.id);
    const { data: existing, error: existingError } = await supabase
      .from('masterclass_sections')
      .select('id,module_id,title,content,version')
      .in('module_id', moduleIds)
      .order('version', { ascending: false });
    if (existingError) throw existingError;
    if (existing?.length) return ok({ masterclassId: id, lessons: existing, persisted: true, reusedExisting: true });

    const knowledge = await retrieveKnowledge({ query: `${masterclass.title} ${masterclass.learning_outcome || ''}`, count: 10, verifiedOnly: true });
    const response = await getAIProvider().generate({
      json: true,
      maxTokens: 7000,
      temperature: 0.5,
      system: 'Write masterclass lesson drafts for M N Rehman only after an approved outline. Use only supplied verified personal knowledge. Do not invent achievements. Keep teaching practical, natural Hinglish-friendly, and structured. Return JSON only.',
      prompt: `MASTERCLASS: ${masterclass.title}\nAUDIENCE: ${masterclass.audience || 'shooters'}\nLEARNING OUTCOME: ${masterclass.learning_outcome || ''}\nTARGET MINUTES: ${masterclass.target_duration_minutes || ''}\nAPPROVED OUTLINE: ${JSON.stringify(masterclass.outline)}\nMODULES: ${JSON.stringify(modules.map((module) => ({ order: module.order, title: module.title, learningObjective: module.learning_objective, estimatedMinutes: module.estimated_minutes })))}\nVERIFIED KNOWLEDGE:\n${knowledge.map((row) => row.text).join('\n---\n') || 'None. Avoid personal claims.'}\nReturn {"lessons":[{"moduleOrder":1,"title":"","learningObjective":"","content":"","demonstration":"","practice":""}]}. Include every lesson from the approved outline exactly once, grouped by moduleOrder.`,
    });

    const bundle = LessonBundleSchema.parse(JSON.parse(clean(response.text)));
    const moduleByOrder = new Map(modules.map((module) => [module.order, module]));
    const rows = bundle.lessons.map((lesson) => {
      const module = moduleByOrder.get(lesson.moduleOrder);
      if (!module) throw new Error(`Unknown module order ${lesson.moduleOrder}`);
      return {
        module_id: module.id,
        title: lesson.title,
        content: lesson.content,
        learning_objective: lesson.learningObjective,
        demonstration: lesson.demonstration,
        practice: lesson.practice,
        status: 'draft',
        version: 1,
      };
    });

    const { data: inserted, error: insertError } = await supabase.from('masterclass_sections').insert(rows).select('id,module_id,title,status,version');
    if (insertError || !inserted) throw new Error(insertError?.message || 'Lesson insert failed');

    const versionRows = inserted.map((section, index) => ({
      section_id: section.id,
      version: 1,
      content: {
        title: rows[index].title,
        content: rows[index].content,
        learningObjective: rows[index].learning_objective,
        demonstration: rows[index].demonstration,
        practice: rows[index].practice,
      },
      change_summary: 'Initial generated lesson draft',
      created_by: user.id,
    }));
    const { error: versionError } = await supabase.from('masterclass_section_versions').insert(versionRows);
    if (versionError) throw versionError;

    const now = new Date().toISOString();
    const { error: statusError } = await supabase.from('masterclasses').update({ status: 'lessons_ready', updated_at: now }).eq('id', id);
    if (statusError) throw statusError;
    await supabase.from('audit_logs').insert({ user_id: user.id, entity_type: 'masterclass', entity_id: id, action: 'LESSONS_GENERATED', metadata: { model: response.model, lessonCount: rows.length, verifiedSources: knowledge.length, version: 1 } });

    return ok({ masterclassId: id, lessons: inserted, lessonCount: rows.length, model: response.model, persisted: true }, { status: 201 });
  } catch (error) {
    console.error('[masterclass lessons]', error);
    return fail('Lesson generation failed', 'Lessons generate/save nahi ho sake.', 500, error instanceof Error ? error.message : error);
  }
}
