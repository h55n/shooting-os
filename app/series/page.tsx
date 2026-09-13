'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Topic = { id: string; position: number; title: string; angle?: string; category_id?: string; status: string; content_item_id?: string };
type Series = { id: string; name: string; description?: string; target_audience?: string; status: string; series_topics?: Topic[] };

export default function SeriesPage() {
  const [items, setItems] = useState<Series[]>([]);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('Beginner and intermediate shooters');
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/series', { cache: 'no-store' });
    const body = await response.json();
    if (response.ok && body.ok) {
      setItems(body.data);
      if (!selectedSeries && body.data[0]?.id) setSelectedSeries(body.data[0].id);
    }
  }
  useEffect(() => { void load(); }, []);

  const current = useMemo(() => items.find((item) => item.id === selectedSeries), [items, selectedSeries]);
  const topics = [...(current?.series_topics || [])].sort((a, b) => a.position - b.position);

  async function createSeries() {
    setBusy('create'); setMessage(null);
    try {
      const response = await fetch('/api/series', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, theme, audience }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Series create nahi ho saka.');
      if (!body.data.persisted) setMessage('Demo 30-topic plan ready; database connected hone par persist hoga.');
      else {
        setName(''); setTheme('');
        await load();
        setSelectedSeries(body.data.id);
        setMessage('30-topic plan ready. Ab sirf strong topics select karke scripts banaiye.');
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Series create nahi ho saka.'); }
    finally { setBusy(null); }
  }

  function toggleTopic(id: string) {
    setSelectedTopics((currentIds) => currentIds.includes(id) ? currentIds.filter((value) => value !== id) : currentIds.length >= 8 ? currentIds : [...currentIds, id]);
  }

  async function buildSelected() {
    if (!current || selectedTopics.length === 0) return;
    setBusy('scripts'); setMessage(null);
    try {
      const response = await fetch(`/api/series/${current.id}/scripts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicIds: selectedTopics }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Batch scripts nahi ban sake.');
      setMessage(`${body.data.succeeded} scripts ready${body.data.failed ? ` · ${body.data.failed} need attention` : ''}.`);
      setSelectedTopics([]);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Batch scripts nahi ban sake.'); }
    finally { setBusy(null); }
  }

  return <div>
    <header className="mb-5"><h1 className="text-[30px] font-bold tracking-tight">Series</h1><p className="mt-1 text-[15px] text-muted-foreground">30 topics first. Scripts only for the ones you select.</p></header>

    <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-[17px] font-bold">Create a 30-topic series</h2>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Series name" className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <textarea value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="What should this series teach?" rows={3} className="mt-3 w-full rounded-xl bg-background p-4 text-[15px] ring-1 ring-black/10" />
      <input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Audience" className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <button onClick={createSeries} disabled={busy !== null || name.trim().length < 3 || theme.trim().length < 3} className="mt-4 min-h-12 w-full rounded-xl bg-primary px-4 text-[15px] font-bold text-primary-foreground disabled:opacity-40">{busy === 'create' ? 'Planning 30 topics…' : 'Create 30-Topic Plan'}</button>
    </section>

    {message && <p className="mt-4 rounded-xl bg-secondary p-3 text-[14px]">{message}</p>}

    {items.length > 0 && <section className="mt-6 pb-6">
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">{items.map((item) => <button key={item.id} onClick={() => { setSelectedSeries(item.id); setSelectedTopics([]); }} className={`min-h-11 shrink-0 rounded-full px-4 text-[13px] font-bold ${selectedSeries === item.id ? 'bg-foreground text-background' : 'bg-card'}`}>{item.name}</button>)}</div>
      {current && <>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-[20px] font-bold">{current.name}</h2><p className="mt-1 text-[13px] text-muted-foreground">{topics.filter((topic) => topic.status === 'scripted').length}/30 scripted · select up to 8 at once</p></div>{selectedTopics.length > 0 && <button onClick={buildSelected} disabled={busy !== null} className="min-h-11 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground">{busy === 'scripts' ? 'Building…' : `Build ${selectedTopics.length} Scripts`}</button>}</div>
        <div className="space-y-2">{topics.map((topic) => {
          const selected = selectedTopics.includes(topic.id);
          return <article key={topic.id} className={`rounded-2xl p-4 shadow-[var(--shadow-card)] ${selected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'}`}>
            <button onClick={() => !topic.content_item_id && toggleTopic(topic.id)} className="w-full text-left" disabled={Boolean(topic.content_item_id)}>
              <div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-[12px] font-bold">{topic.position}</span><div className="min-w-0 flex-1"><p className="text-[15px] font-bold leading-5">{topic.title}</p>{topic.angle && <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{topic.angle}</p>}<p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{topic.category_id} · {topic.status}</p></div></div>
            </button>
            {topic.content_item_id && <Link href={`/content/${topic.content_item_id}`} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-secondary px-4 text-[13px] font-bold">Open Script</Link>}
          </article>;
        })}</div>
      </>}
    </section>}
  </div>;
}
