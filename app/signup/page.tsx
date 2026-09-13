'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/auth/client';

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://mock.supabase.co' ||
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <p className="text-muted-foreground text-[16px]">Loading...</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate
    if (!name.trim()) { setError('Naam daalna zaroori hai.'); return; }
    if (!email.trim()) { setError('Email daalna zaroori hai.'); return; }
    if (password.length < 8) { setError('Password kam se kam 8 characters ka hona chahiye.'); return; }
    if (password !== confirm) { setError('Dono passwords match nahi kar rahe.'); return; }

    if (isDemoMode) {
      // Demo mode — skip real auth
      router.push('/');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) {
        setError(getHindiError(signUpError.message));
      } else {
        if (data.session) {
          // Email confirmation is off in Supabase, we are logged in!
          router.push('/');
          router.refresh();
        } else {
          // Email confirmation is still on in Supabase
          setDone(true);
        }
      }
    } catch {
      setError('Kuch gadbad ho gayi. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5">
        <div className="w-full max-w-[380px] rounded-2xl bg-card p-8 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]">
          <p className="text-[48px]">✅</p>
          <h2 className="mt-4 text-[22px] font-bold">Account ban gaya!</h2>
          <p className="mt-2 text-[15px] leading-[24px] text-muted-foreground">
            Aapka account successfully create ho gaya hai. Aap ab login kar sakte hain.
            (Agar login mein error aaye toh apna email check karein).
          </p>
          <Link
            href="/login"
            className="mt-6 flex min-h-[52px] items-center justify-center rounded-xl bg-primary text-[16px] font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
          >
            Login karein →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-8">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-[32px] shadow-lg">
          🎯
        </div>
        <h1 className="text-[28px] font-bold tracking-tight">Shooter OS</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          Account banaayein
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[380px] rounded-2xl bg-card p-7 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]">
        {isDemoMode && (
          <div className="mb-5 rounded-xl bg-[#EEF4FF] px-4 py-3 text-[14px] text-[#0F7FFF]">
            <span className="font-semibold">Demo Mode:</span> Koi bhi details chalenge.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[14px] font-semibold">
              Naam
            </label>
            <input
              id="name"
              type="text"
              placeholder="M N Rehman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[14px] font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="aapka@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[14px] font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Kam se kam 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-[14px] font-semibold">
              Password confirm karein
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Password dobara likhein"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-[#FFF1F0] px-4 py-3 text-[14px] text-[#D92D20]" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[16px] font-semibold text-primary-foreground disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Account ban raha hai...
              </>
            ) : (
              'Account Banaayein →'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[14px] text-muted-foreground">
          Pehle se account hai?{' '}
          <Link href="/login" className="font-semibold text-[#0F7FFF]">
            Sign in karein
          </Link>
        </p>
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground">
        Shooter Content OS · Private system
      </p>
    </div>
  );
}

function getHindiError(message: string): string {
  if (message.includes('already registered') || message.includes('User already registered')) {
    return 'Yeh email pehle se registered hai. Login karein ya dusri email use karein.';
  }
  if (message.includes('Password')) return 'Password zyada strong hona chahiye.';
  if (message.includes('invalid')) return 'Email format sahi nahi hai.';
  return 'Account nahi ban saka. Dobara try karein.';
}
