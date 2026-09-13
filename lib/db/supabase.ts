/**
 * Server-side Supabase client — use in Server Components and API routes.
 * @see lib/auth/server.ts for auth-aware version with cookie handling.
 * 
 * This module provides both the anon client and the service-role client.
 * NEVER export the service-role client to client components.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Public anon client — respects RLS policies.
 * Safe to use for authenticated user queries.
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

/**
 * Service role client — BYPASSES RLS. 
 * ONLY use in server-side code for admin/system operations.
 * NEVER import this in client components.
 */
export function getServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Server-side only.');
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if Supabase is configured (production mode).
 */
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}

export type { SupabaseClient } from '@supabase/supabase-js';
