'use client';

import { useEffect, useState } from 'react';

type Outline = { title: string; learningOutcome: string; modules: Array<{ title: string; learningObjective: string; estimatedMinutes: number; lessons: string[] }> };
type Masterclass = { id: string; title: string; status: string; target_duration_minutes?: number; outline?: Outline };

export default function MasterclassPage() {
  const [items, setItems] = useState<Masterclass[]>([]);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(120);
  const [created, setCreated] = useState<{ id: string; outline: Outline; persisted: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/masterclasses', { cache: 'no-store' });
    const body = await response.json();
    if (response.ok && body.ok) setItems(body.data);
  }
  useEffect(() => { void load(); }, []);

  async function createOutline() {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch('/api/masterclasses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, targetDurationMinutes: duration }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Outline create nahi ho saka.');
      setCreated(body.data);
      if (body.data.persisted) { setTopic(''); await load(); }
      else setMessage('Demo outline ready. Database connected hone par ye persist hoga.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Outline create nahi ho saka.'); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-[30px] font-bold tracking-tight">Masterclass</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Outline pehle. Lessons approval ke baad.</p>
      </header>

      <section className="mb-6 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-[17px] font-bold">What do you want to teach?</p>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Shooting Fundamentals" className="mt-3 min-h-[52px] w-full rounded-xl bg-background px-4 text-[16px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
        <label className="mt-4 block text-[13px] font-bold text-muted-foreground">Target duration</label>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 min-h-[50px] w-full rounded-xl bg-background px-3 text-[15px] ring-1 ring-black/10">
          <option value={60}>1 hour</option><option value={120}>2 hours</option><option value={180}>3 hours</option><option value={240}>4 hours</option>
        </select>
        <button onClick={createOutline} disabled={busy || topic.trim().length < 3} className="mt-4 min-h-[52px] w-full rounded-xl bg-primary px-4 text-[15px] font-bold text-primary-foreground disabled:opacity-40">{busy ? 'Building outline…' : 'Create Outline'}</button>
      </section>

      {message && <p className="mb-4 rounded-xl bg-secondary p-3 text-[14px]">{message}</p>}
      {created && <OutlineCard outline={created.outline} />}

      <section className="mt-7 pb-4">
        <h2 className="mb-3 text-[18px] font-bold">Your masterclasses</h2>
        {items.length === 0 ? <div className="rounded-2xl bg-card p-6 text-center text-[14px] text-muted-foreground shadow-[var(--shadow-card)]">No masterclass yet. Start with a topic above.</div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]"><div className="flex items-center justify-between gap-3"><div><p className="text-[17px] font-bold">{item.title}</p><p className="mt-1 text-[13px] text-muted-foreground">{item.status} · {item.target_duration_minutes ? `${item.target_duration_minutes} min` : 'Duration flexible'}</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold">Outline</span></div>{item.outline && <details className="mt-3"><summary className="cursor-pointer text-[14px] font-bold text-primary">View structure</summary><div className="mt-3"><OutlineCard outline={item.outline} compact /></div></details>}</article>)}</div>}
      </section>
    </div>
  );
}

function OutlineCard({ outline, compact = false }: { outline: Outline; compact?: boolean }) {
  return <div className={compact ? '' : 'mb-6 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]'}><h2 className="text-[20px] font-bold">{outline.title}</h2><p className="mt-1 text-[14px] leading-6 text-muted-foreground">{outline.learningOutcome}</p><div className="mt-4 space-y-3">{outline.modules.map((module, index) => <div key={`${module.title}-${index}`} className="rounded-xl bg-background p-4"><div className="flex justify-between gap-3"><p className="text-[15px] font-bold">Module {index + 1} — {module.title}</p><span className="shrink-0 text-[12px] text-muted-foreground">~{module.estimatedMinutes}m</span></div><p className="mt-1 text-[13px] text-muted-foreground">{module.learningObjective}</p><ul className="mt-2 space-y-1 text-[14px]">{module.lessons.map((lesson) => <li key={lesson}>• {lesson}</li>)}</ul></div>)}</div></div>;
}
