'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const steps = [
  ['🏠', 'Home', 'Home sirf woh dikhata hai jo abhi attention maangta hai.'],
  ['💡', 'Ideas', 'Rough thought likhiye, suggestion maangiye, ya baad mein voice se boliye.'],
  ['📝', 'Content', 'Script ko clear blocks mein padhiye, change kijiye aur approve kijiye.'],
  ['📅', 'Plan', 'Shoot date dekhiye, move kijiye aur Shot Ho Gaya mark kijiye.'],
  ['🎓', 'Masterclass', 'Teaching topic se pehle outline, phir approved lessons banaiye.'],
  ['✦', 'Assist & Guide', 'Jahan change ya explanation chahiye, Assist contextual help deta hai.'],
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const step = steps[index];

  async function finish(skipped = false) {
    setBusy(true);
    await fetch('/api/profile/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ onboarding_completed: !skipped, onboarding_skipped: skipped }) }).catch(() => null);
    router.replace('/first-ten');
    router.refresh();
  }

  return <div className="flex min-h-[calc(100dvh-140px)] flex-col pb-4">
    <div className="flex items-center justify-between"><p className="text-[13px] font-bold text-muted-foreground">WELCOME · {index + 1}/{steps.length}</p><button onClick={() => finish(true)} disabled={busy} className="min-h-11 px-2 text-[14px] font-semibold text-muted-foreground">Skip</button></div>
    <div className="flex flex-1 flex-col justify-center py-10 text-center">
      <div className="text-[64px]">{step[0]}</div><h1 className="mt-5 text-[32px] font-bold tracking-tight">{step[1]}</h1><p className="mx-auto mt-3 max-w-[340px] text-[17px] leading-7 text-muted-foreground">{step[2]}</p>
    </div>
    <div className="mb-5 flex justify-center gap-2">{steps.map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === index ? 'w-7 bg-primary' : 'w-2 bg-black/10'}`} />)}</div>
    {index < steps.length - 1 ? <button onClick={() => setIndex((v) => v + 1)} className="min-h-[56px] w-full rounded-2xl bg-primary text-[16px] font-bold text-primary-foreground">Next</button> : <button onClick={() => finish(false)} disabled={busy} className="min-h-[56px] w-full rounded-2xl bg-foreground text-[16px] font-bold text-background">{busy ? 'Saving…' : "Let's create your first 10 videos →"}</button>}
  </div>;
}
