'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { createClient, requestPasswordReset, updatePassword } from '@/lib/auth/client';

type Mode = 'request' | 'update' | 'sent' | 'success';

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<Mode>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get('code');

    async function establishRecoverySession() {
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) setError('Recovery link invalid ya expire ho gaya hai. Naya link maangein.');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) setMode('update');
    }

    void establishRecoverySession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setMode('update');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function requestRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Email daalna zaroori hai.'); return; }

    setLoading(true);
    const { error: resetError } = await requestPasswordReset(
      email.trim(),
      `${window.location.origin}/reset-password`,
    );
    setLoading(false);
    if (resetError) setError('Email bhejne mein problem aayi. Dobara try karein.');
    else setMode('sent');
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 12) { setError('Password kam se kam 12 characters ka rakhein.'); return; }
    if (password !== confirmation) { setError('Passwords match nahi kar rahe.'); return; }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);
    if (updateError) setError('Password update nahi ho saka. Naya recovery link maangein.');
    else setMode('success');
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5">
      <section className="w-full max-w-[380px] rounded-2xl bg-card p-7 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]">
        <p className="mb-3 text-3xl">🔐</p>
        <h1 className="text-[26px] font-bold tracking-tight">Password set karein</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">Private owner account ke liye secure password.</p>

        {mode === 'request' && <form onSubmit={requestRecovery} className="mt-6 flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold" htmlFor="email">
            Email
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required disabled={loading} className="min-h-[52px] rounded-xl bg-background px-4 text-[16px] font-normal ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <button type="submit" disabled={loading} className="min-h-[52px] rounded-xl bg-primary text-[16px] font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? 'Email bhej rahe hain...' : 'Recovery email bhejein'}
          </button>
        </form>}

        {mode === 'sent' && <p className="mt-6 rounded-xl bg-[#EEF4FF] px-4 py-3 text-[14px] text-[#0F7FFF]">Agar account exist karta hai, recovery email bhej di gayi hai. Inbox aur spam folder check karein.</p>}

        {mode === 'update' && <form onSubmit={savePassword} className="mt-6 flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold" htmlFor="password">Naya password
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required disabled={loading} className="min-h-[52px] rounded-xl bg-background px-4 text-[16px] font-normal ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold" htmlFor="confirmation">Password dobara daalein
            <input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required disabled={loading} className="min-h-[52px] rounded-xl bg-background px-4 text-[16px] font-normal ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <button type="submit" disabled={loading} className="min-h-[52px] rounded-xl bg-primary text-[16px] font-semibold text-primary-foreground disabled:opacity-60">{loading ? 'Save ho raha hai...' : 'Password save karein'}</button>
        </form>}

        {mode === 'success' && <p className="mt-6 rounded-xl bg-[#EAF8EF] px-4 py-3 text-[14px] text-[#157A3D]">Password update ho gaya. Ab aap sign in kar sakte hain.</p>}
        {error && <p className="mt-4 rounded-xl bg-[#FFF1F0] px-4 py-3 text-[14px] text-[#D92D20]" role="alert">{error}</p>}
        <Link href="/login" className="mt-6 block text-center text-[14px] font-semibold text-primary">← Login par wapas</Link>
      </section>
    </main>
  );
}
