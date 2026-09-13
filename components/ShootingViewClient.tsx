'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ScriptDocument } from '@/lib/ai/schemas';

export function ShootingViewClient({ contentId, title, script }: { contentId: string; title: string; script: ScriptDocument }) {
  const sections = useMemo(() => [
    ['Hook', script.hook], ['Setup', script.setup], ['Main point', script.mainPoint],
    ['Story / Example', script.storyOrExample], ['Takeaway', script.takeaway], ['CTA', script.cta],
  ].filter(([, text]) => Boolean(text?.trim())) as Array<[string, string]>, [script]);
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState(30);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(`shooting-script:${contentId}`, JSON.stringify({ title, script, savedAt: new Date().toISOString() }));
      setOffline(true);
    } catch { setOffline(false); }
    const wake = async () => {
      try { await navigator.wakeLock?.request('screen'); } catch { /* browser may deny */ }
    };
    void wake();
  }, [contentId, script, title]);

  const current = sections[index] ?? ['Script', script.mainPoint];

  return (
    <div className="flex min-h-dvh flex-col bg-black px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(16px+env(safe-area-inset-top))] text-white">
      <header className="flex items-center justify-between gap-3">
        <Link href={`/content/${contentId}`} className="min-h-11 rounded-full bg-white/10 px-4 py-3 text-[14px] font-semibold">Done</Link>
        <div className="min-w-0 text-center">
          <p className="truncate text-[13px] text-white/60">{title}</p>
          <p className="text-[12px] font-semibold text-white/50">{index + 1}/{sections.length} {offline ? '· Available Offline' : ''}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setSize((v) => Math.max(22, v - 2))} className="size-11 rounded-full bg-white/10 text-[18px]">A−</button>
          <button onClick={() => setSize((v) => Math.min(44, v + 2))} className="size-11 rounded-full bg-white/10 text-[18px]">A+</button>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-8">
        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/45">{current[0]}</p>
        <p className="whitespace-pre-wrap font-semibold leading-[1.45]" style={{ fontSize: size }}>{current[1]}</p>
      </main>

      <footer className="grid grid-cols-2 gap-3">
        <button onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0} className="min-h-[58px] rounded-2xl bg-white/10 text-[16px] font-bold disabled:opacity-25">Previous</button>
        <button onClick={() => setIndex((v) => Math.min(sections.length - 1, v + 1))} disabled={index >= sections.length - 1} className="min-h-[58px] rounded-2xl bg-white text-[16px] font-bold text-black disabled:opacity-25">Next</button>
      </footer>
    </div>
  );
}
