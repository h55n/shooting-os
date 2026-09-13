'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth/client';

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://mock.supabase.co' ||
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-background"><p className="text-[16px] text-muted-foreground">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Email daalna zaroori hai.'); return; }
    if (!password.trim()) { setError('Password daalna zaroori hai.'); return; }
    if (isDemoMode) { router.push(nextUrl); return; }

    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) setError(getHindiError(signInError.message));
      else { router.push(nextUrl); router.refresh(); }
    } catch {
      setError('Kuch gadbad ho gayi. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-[32px] shadow-lg">🎯</div>
        <h1 className="text-[28px] font-bold tracking-tight">Shooter OS</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">M N Rehman ka private Content System</p>
      </div>

      <div className="w-full max-w-[380px] rounded-2xl bg-card p-7 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]">
        {isDemoMode && <div className="mb-5 rounded-xl bg-[#EEF4FF] px-4 py-3 text-[14px] text-[#0F7FFF]"><span className="font-semibold">Demo Mode:</span> Koi bhi email/password chalega.</div>}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold" htmlFor="email">
            Email
            <input id="email" type="email" placeholder="aapka@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus disabled={loading} className="min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold" htmlFor="password">
            Password
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={loading} className="min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
          </label>
          {error && <div className="rounded-xl bg-[#FFF1F0] px-4 py-3 text-[14px] text-[#D92D20]" role="alert">{error}</div>}
          <button type="submit" disabled={loading} className="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[16px] font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60">
            {loading ? <><span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Sign in ho rahe hain...</> : isDemoMode ? 'Andar Jaayein →' : 'Sign In Karein →'}
          </button>
        </form>
        <p className="mt-5 text-center text-[13px] text-muted-foreground">Private owner account only. Public signup disabled.</p>
      </div>
      <p className="mt-6 text-[13px] text-muted-foreground">Shooter Content OS · Private system</p>
    </div>
  );
}

function getHindiError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email ya password galat hai. Dobara check karein.';
  if (message.includes('Email not confirmed')) return 'Email confirm nahi hui hai. Inbox check karein.';
  if (message.includes('Too many requests')) return 'Bahut zyada attempts ho gaye. Thodi der baad try karein.';
  return 'Sign in nahi ho saka. Dobara try karein.';
}
