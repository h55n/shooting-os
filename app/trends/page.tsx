'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Trend = { id: string; topic: string; source: string; relevance_score?: number; urgency?: string; status: string; metadata?: { reason?: string; suggestedAngle?: string } };

export default function TrendsPage() {
  const [items, setItems] = useState<Trend[]>([]);
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/trends', { cache: 'no-store' });
    const body = await response.json();
    if (response.ok && body.ok) setItems(body.data);
  }
  useEffect(() => { void load(); }, []);

  async function add() {
    setBusy('add'); setMessage(null);
    try {
      const response = await fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, source, signalType: 'manual' }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Trend save nahi ho saka.');
      setTopic(''); setSource(''); setMessage('Candidate scored. Discovery nahi—sirf supplied signal evaluate hua hai.'); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Trend save nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function update(id: string, status: 'approved' | 'dismissed') {
    setBusy(id);
    try {
      const response = await fetch('/api/trends', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Action save nahi hua.');
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Action save nahi hua.'); }
    finally { setBusy(null); }
  }

  const worthMaking = items.filter((item) => item.status === 'new' || item.status === 'approved');

  return <div>
    <header className="mb-5"><h1 className="text-[30px] font-bold tracking-tight">Worth Making This Week</h1><p className="mt-1 text-[15px] text-muted-foreground">Manual signal in, shooting relevance out. No fake trend discovery.</p></header>

    <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-[17px] font-bold">Add a trend candidate</h2>
      <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Topic or trend you noticed" className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Where you saw it — URL, event, conversation…" className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <button onClick={add} disabled={busy !== null || topic.trim().length < 3 || source.trim().length < 3} className="mt-4 min-h-12 w-full rounded-xl bg-primary px-4 text-[15px] font-bold text-primary-foreground disabled:opacity-40">{busy === 'add' ? 'Scoring…' : 'Check Relevance'}</button>
    </section>

    {message && <p className="mt-4 rounded-xl bg-secondary p-3 text-[14px]">{message}</p>}

    <section className="mt-6 space-y-3 pb-6">
      {worthMaking.length === 0 ? <div className="rounded-2xl bg-card p-6 text-center text-[14px] text-muted-foreground shadow-[var(--shadow-card)]">No candidates yet.</div> : worthMaking.map((item) => <article key={item.id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-[17px] font-bold leading-6">{item.topic}</h2><p className="mt-1 text-[12px] text-muted-foreground">{item.source}</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold">{Math.round(item.relevance_score ?? 0)}/100 · {item.urgency ?? 'low'}</span></div>
        {item.metadata?.reason && <p className="mt-3 text-[14px] leading-6 text-muted-foreground">{item.metadata.reason}</p>}
        {item.metadata?.suggestedAngle && <div className="mt-3 rounded-xl bg-background p-3 text-[14px]"><strong>Angle:</strong> {item.metadata.suggestedAngle}</div>}
        <div className="mt-4 grid grid-cols-3 gap-2"><Link href={`/ideas?seed=${encodeURIComponent(item.metadata?.suggestedAngle || item.topic)}`} className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-3 text-center text-[12px] font-bold text-primary-foreground">Make This</Link><button onClick={() => update(item.id, 'approved')} disabled={busy !== null} className="min-h-11 rounded-xl bg-secondary px-3 text-[12px] font-bold">Later</button><button onClick={() => update(item.id, 'dismissed')} disabled={busy !== null} className="min-h-11 rounded-xl bg-secondary px-3 text-[12px] font-bold">Not Interested</button></div>
      </article>)}
    </section>
  </div>;
}
