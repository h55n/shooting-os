/**
 * Server-side Supabase helpers. The service-role client is intentionally kept
 * server-only and must never be imported by client components.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = configuredUrl || 'https://mock.supabase.co';
const supabaseAnonKey = configuredAnonKey || 'mock-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function getServiceClient() {
  if (!supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Server-side only.');
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    configuredUrl &&
    configuredAnonKey &&
    configuredUrl !== 'https://mock.supabase.co' &&
    process.env.NEXT_PUBLIC_DEMO_MODE !== 'true'
  );
}

export type { SupabaseClient } from '@supabase/supabase-js';
