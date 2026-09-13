import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIProvider } from '@/lib/ai/provider';
import { getServiceClient } from '@/lib/db/supabase';

const GenerateCourseSchema = z.object({
  topic: z.string().min(3).max(200),
});

const CourseOutputSchema = z.object({
  title: z.string(),
  modules: z.array(
    z.object({
      title: z.string(),
      learning_objective: z.string(),
      sections: z.array(
        z.object({
          title: z.string(),
        })
      ),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = GenerateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { topic } = parsed.data;

    // 1. Generate Course Outline with AI
    const aiProvider = getAIProvider();
    
    const systemPrompt = `
You are an expert sports coach and curriculum designer for Olympic shooting sports.
Design a highly structured masterclass outline based on the provided topic.
The course should have a catchy, professional title.
It should be broken down into 3-5 modules.
Each module should have a clear learning objective and 3-5 specific video sections.
Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "modules": [
    {
      "title": "string",
      "learning_objective": "string",
      "sections": [
        { "title": "string" }
      ]
    }
  ]
}
`.trim();

    const userPrompt = `Generate a masterclass outline for the topic: "${topic}"`;

    const aiResponse = await aiProvider.generate({
      system: systemPrompt,
      prompt: userPrompt,
      json: true,
      maxTokens: 2000,
      temperature: 0.5,
    });

    let courseData;
    try {
      courseData = JSON.parse(aiResponse.text);
    } catch (e) {
      // In case the AI returns markdown blocks
      const cleanJson = aiResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
      courseData = JSON.parse(cleanJson);
    }

    // Validate the AI output
    const parsedCourse = CourseOutputSchema.safeParse(courseData);
    if (!parsedCourse.success) {
      throw new Error('AI returned invalid course schema');
    }

    const course = parsedCourse.data;

    // 2. Save to Supabase
    const supabase = getServiceClient();

    // Insert Masterclass
    const { data: masterclass, error: mcError } = await supabase
      .from('masterclasses')
      .insert({ title: course.title, status: 'draft' })
      .select('id')
      .single();

    if (mcError || !masterclass) {
      throw new Error('Failed to create masterclass: ' + mcError?.message);
    }

    // Insert Modules and Sections
    for (let i = 0; i < course.modules.length; i++) {
      const mod = course.modules[i];
      
      const { data: insertedModule, error: modError } = await supabase
        .from('masterclass_modules')
        .insert({
          masterclass_id: masterclass.id,
          title: mod.title,
          order: i + 1,
          learning_objective: mod.learning_objective,
          status: 'draft'
        })
        .select('id')
        .single();

      if (modError || !insertedModule) {
        throw new Error('Failed to create module: ' + modError?.message);
      }

      // Prepare sections for this module
      const sectionsToInsert = mod.sections.map((sec) => ({
        module_id: insertedModule.id,
        title: sec.title,
        status: 'draft'
      }));

      if (sectionsToInsert.length > 0) {
        const { error: secError } = await supabase
          .from('masterclass_sections')
          .insert(sectionsToInsert);

        if (secError) {
          throw new Error('Failed to create sections: ' + secError?.message);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      course: course.title,
      masterclass_id: masterclass.id,
      meta: {
        model: aiResponse.model,
        latencyMs: aiResponse.latencyMs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-course API] Error:', message);

    return NextResponse.json({
      ok: false,
      error: process.env.NODE_ENV === 'development' ? message : 'Failed to generate course',
    }, { status: 500 });
  }
}
