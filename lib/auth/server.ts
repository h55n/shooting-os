import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/domain/types';

/**
 * Server-side Supabase client using cookie-based session.
 * Only use in Server Components, Route Handlers, and Server Actions.
 * NEVER import this in client components.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component — cookies can't be set here.
            // Middleware handles session refresh.
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated session. Returns null if not signed in.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

/**
 * Get the current user. Returns null if not signed in.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

/**
 * Get the authenticated user's role from their profile.
 * Returns 'father' as a safe default if no profile found.
 */
export async function getRole(): Promise<Role> {
  const user = await getUser();
  if (!user) return 'father';

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (data?.role as Role) ?? 'father';
}

/**
 * Require authentication. Throws if not authenticated.
 * Use in Server Actions and API routes.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }
  return user;
}

/**
 * Require a specific role. Throws if not authenticated or wrong role.
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  const role = await getRole();

  if (!allowedRoles.includes(role)) {
    throw new Error('FORBIDDEN');
  }

  return { user, role };
}

/**
 * Check if the user is in demo mode (no real Supabase configured).
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === '';
}
