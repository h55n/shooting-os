'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/lib/auth/client';

type Preferences = { name?: string; guide_mode: boolean; sound_enabled: boolean; onboarding_completed: boolean; onboarding_skipped: boolean };

export default function AccountPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { fetch('/api/profile/preferences').then((r) => r.json()).then((body) => { if (body.ok) setPrefs(body.data); }).catch(() => setMessage('Settings load nahi ho saki.')); }, []);

  async function toggle(key: 'guide_mode' | 'sound_enabled') {
    if (!prefs) return;
    const next = !prefs[key];
    setPrefs({ ...prefs, [key]: next });
    const response = await fetch('/api/profile/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: next }) });
    const body = await response.json();
    if (!response.ok || !body.ok) { setPrefs({ ...prefs, [key]: !next }); setMessage(body.userMessage || 'Setting save nahi ho saki.'); }
    else setMessage('Setting saved.');
  }

  async function logout() { await signOut(); router.replace('/login'); router.refresh(); }

  return <div>
    <header className="mb-6"><p className="text-[13px] font-semibold text-muted-foreground">Private owner</p><h1 className="mt-1 text-[30px] font-bold tracking-tight">Settings</h1>{prefs?.name && <p className="mt-1 text-[15px] text-muted-foreground">{prefs.name}</p>}</header>
    <div className="space-y-3">
      <Setting title="Guide Mode" description="Buttons aur first-time actions par small helpful explanations" enabled={prefs?.guide_mode ?? true} onClick={() => toggle('guide_mode')} />
      <Setting title="Sounds" description="Meaningful completions par subtle confirmation sound" enabled={prefs?.sound_enabled ?? true} onClick={() => toggle('sound_enabled')} />
      <Link href="/onboarding" className="block rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]"><p className="text-[16px] font-bold">Replay Guide</p><p className="mt-1 text-[13px] text-muted-foreground">Home, Ideas, Content, Plan aur Masterclass ka short walkthrough</p></Link>
      <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]"><p className="text-[16px] font-bold">Offline scripts</p><p className="mt-1 text-[13px] leading-5 text-muted-foreground">Shooting View kholte hi current script ka local snapshot save hota hai. Explicit sync/edit support later ho sakta hai.</p></div>
    </div>
    {message && <p className="mt-4 rounded-xl bg-secondary p-3 text-[13px]">{message}</p>}
    <button onClick={logout} className="mt-7 min-h-[52px] w-full rounded-2xl bg-secondary text-[15px] font-bold">Sign out</button>
  </div>;
}

function Setting({ title, description, enabled, onClick }: { title: string; description: string; enabled: boolean; onClick: () => void }) {
  return <button onClick={onClick} className="flex min-h-[86px] w-full items-center justify-between gap-4 rounded-2xl bg-card p-5 text-left shadow-[var(--shadow-card)]"><span><strong className="block text-[16px]">{title}</strong><span className="mt-1 block text-[13px] leading-5 text-muted-foreground">{description}</span></span><span className={`h-7 w-12 shrink-0 rounded-full p-1 ${enabled ? 'bg-primary' : 'bg-black/10'}`}><span className={`block size-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} /></span></button>;
}
