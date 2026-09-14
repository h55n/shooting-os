import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Exchanges Supabase's one-time PKCE code on the server so the recovery
 * session is written to cookies before the reset-password page renders.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const destination = new URL('/reset-password', request.url);

  if (!code) {
    destination.searchParams.set('error', 'invalid-link');
    return NextResponse.redirect(destination);
  }

  let response = NextResponse.redirect(destination);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.redirect(destination);
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) destination.searchParams.set('error', 'expired-link');
  if (error) return NextResponse.redirect(destination);

  return response;
}
