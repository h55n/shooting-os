'use client';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase client for use in Client Components only.
 * Does NOT have access to service role. Only anon key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/** Send a one-time password recovery email. */
export async function requestPasswordReset(email: string, redirectTo: string) {
  const supabase = createClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

/** Update the password after Supabase verifies a recovery session. */
export async function updatePassword(password: string) {
  const supabase = createClient();
  return supabase.auth.updateUser({ password });
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Get current user (client-side).
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
