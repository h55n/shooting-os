import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { isSupabaseConfigured } from '@/lib/db/supabase';
import { fail, ok } from '@/lib/api/response';

const PreferencesSchema = z.object({
  guide_mode: z.boolean().optional(),
  sound_enabled: z.boolean().optional(),
  onboarding_completed: z.boolean().optional(),
  onboarding_skipped: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'No preferences supplied');

const demo = { guide_mode: true, sound_enabled: true, onboarding_completed: false, onboarding_skipped: false };

export async function GET() {
  if (!isSupabaseConfigured()) return ok(demo, undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('profiles').select('name,guide_mode,sound_enabled,onboarding_completed,onboarding_skipped').eq('id', user.id).single();
    if (error || !data) throw new Error(error?.message || 'Profile missing');
    return ok(data);
  } catch (error) { return fail('Preferences failed', 'Settings load nahi ho saki.', 500, error instanceof Error ? error.message : error); }
}

export async function PATCH(request: Request) {
  const parsed = PreferencesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail('Invalid preferences', 'Setting save nahi ho saki.', 400);
  if (!isSupabaseConfigured()) return ok({ ...demo, ...parsed.data, persisted: false }, undefined, { demoMode: true });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('Unauthorized', 'Pehle sign in karein.', 401);
    const { data, error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id).select('name,guide_mode,sound_enabled,onboarding_completed,onboarding_skipped').single();
    if (error || !data) throw new Error(error?.message || 'Preference update returned no row');
    return ok({ ...data, persisted: true });
  } catch (error) { return fail('Preferences failed', 'Setting save nahi ho saki.', 500, error instanceof Error ? error.message : error); }
}
