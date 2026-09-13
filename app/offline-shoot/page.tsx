'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ScriptDocument } from '@/lib/ai/schemas';

type Snapshot = { title: string; script: ScriptDocument; savedAt: string };

export default function OfflineShootPage() {
  const params = useSearchParams();
  const contentId = params.get('id') || '';
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState(30);

  useEffect(() => {
    if (!contentId) return;
    try {
      const raw = localStorage.getItem(`shooting-script:${contentId}`);
      if (raw) setSnapshot(JSON.parse(raw) as Snapshot);
    } catch { setSnapshot(null); }
  }, [contentId]);

  const sections = useMemo(() => snapshot ? [
    ['Hook', snapshot.script.hook], ['Setup', snapshot.script.setup], ['Main point', snapshot.script.mainPoint],
    ['Story / Example', snapshot.script.storyOrExample], ['Takeaway', snapshot.script.takeaway], ['CTA', snapshot.script.cta],
  ].filter(([, text]) => Boolean(text?.trim())) as Array<[string, string]> : [], [snapshot]);

  if (!snapshot) return <div className="min-h-dvh bg-black px-6 py-10 text-white"><h1 className="text-[24px] font-bold">Offline script available nahi hai</h1><p className="mt-3 text-white/65">Is script ko pehle ek baar Shooting View mein online kholna hoga.</p><Link href="/content" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-white px-5 font-bold text-black">Back to Content</Link></div>;

  const current = sections[index] || ['Script', snapshot.script.mainPoint];
  return <div className="flex min-h-dvh flex-col bg-black px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(16px+env(safe-area-inset-top))] text-white">
    <header className="flex items-center justify-between gap-3"><Link href="/content" className="min-h-11 rounded-full bg-white/10 px-4 py-3 text-[14px] font-semibold">Done</Link><div className="min-w-0 text-center"><p className="truncate text-[13px] text-white/60">{snapshot.title}</p><p className="text-[12px] font-semibold text-emerald-300">Offline copy · saved {new Date(snapshot.savedAt).toLocaleDateString()}</p></div><div className="flex gap-1"><button onClick={() => setSize((value) => Math.max(22, value - 2))} className="size-11 rounded-full bg-white/10">A−</button><button onClick={() => setSize((value) => Math.min(44, value + 2))} className="size-11 rounded-full bg-white/10">A+</button></div></header>
    <main className="flex flex-1 flex-col justify-center py-8"><p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/45">{current[0]}</p><p className="whitespace-pre-wrap font-semibold leading-[1.45]" style={{ fontSize: size }}>{current[1]}</p></main>
    <footer className="grid grid-cols-2 gap-3"><button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="min-h-[58px] rounded-2xl bg-white/10 text-[16px] font-bold disabled:opacity-25">Previous</button><button onClick={() => setIndex((value) => Math.min(sections.length - 1, value + 1))} disabled={index >= sections.length - 1} className="min-h-[58px] rounded-2xl bg-white text-[16px] font-bold text-black disabled:opacity-25">Next</button></footer>
  </div>;
}
