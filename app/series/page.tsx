'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CONTENT_CATEGORIES } from '@/lib/content-engine/categories';

type Topic = { id: string; position: number; title: string; angle?: string; category_id?: string; status: string; content_item_id?: string };
type Series = { id: string; name: string; description?: string; target_audience?: string; status: string; series_topics?: Topic[] };

export default function SeriesPage() {
  const [items, setItems] = useState<Series[]>([]);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('Beginner and intermediate shooters');
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAngle, setEditAngle] = useState('');
  const [editCategory, setEditCategory] = useState('quick-tip');
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
      else { setName(''); setTheme(''); await load(); setSelectedSeries(body.data.id); setMessage('30-topic plan ready. Ab strong topics select, edit ya reorder karein.'); }
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
      setMessage(`${body.data.succeeded} scripts ready${body.data.failed ? ` · ${body.data.failed} need attention` : ''}.`); setSelectedTopics([]); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Batch scripts nahi ban sake.'); }
    finally { setBusy(null); }
  }

  function beginReplace(topic: Topic) {
    setEditingTopic(topic); setEditTitle(topic.title); setEditAngle(topic.angle || ''); setEditCategory(topic.category_id || 'quick-tip');
  }

  async function saveReplacement() {
    if (!current || !editingTopic) return;
    setBusy(`replace:${editingTopic.id}`); setMessage(null);
    try {
      const response = await fetch(`/api/series/${current.id}/topics`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'replace', topicId: editingTopic.id, title: editTitle, angle: editAngle, categoryId: editCategory }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Topic replace nahi ho saka.');
      setEditingTopic(null); setMessage('Topic updated.'); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Topic replace nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function moveTopic(topicId: string, direction: -1 | 1) {
    if (!current) return;
    const index = topics.findIndex((topic) => topic.id === topicId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= topics.length) return;
    const next = [...topics];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    const order = next.map((topic, position) => ({ topicId: topic.id, position: position + 1 }));
    setBusy(`move:${topicId}`); setMessage(null);
    try {
      const response = await fetch(`/api/series/${current.id}/topics`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reorder', order }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Order save nahi hua.');
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Order save nahi hua.'); }
    finally { setBusy(null); }
  }

  return <div>
    <header className="mb-5"><h1 className="text-[30px] font-bold tracking-tight">Series</h1><p className="mt-1 text-[15px] text-muted-foreground">30 topics first. Owner review before scripts.</p></header>
    <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-[17px] font-bold">Create a 30-topic series</h2>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Series name" className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <textarea value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="What should this series teach?" rows={3} className="mt-3 w-full rounded-xl bg-background p-4 text-[15px] ring-1 ring-black/10" />
      <input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Audience" className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <button onClick={createSeries} disabled={busy !== null || name.trim().length < 3 || theme.trim().length < 3} className="mt-4 min-h-12 w-full rounded-xl bg-primary px-4 text-[15px] font-bold text-primary-foreground disabled:opacity-40">{busy === 'create' ? 'Planning 30 topics…' : 'Create 30-Topic Plan'}</button>
    </section>
    {message && <p className="mt-4 rounded-xl bg-secondary p-3 text-[14px]">{message}</p>}

    {editingTopic && <section className="mt-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-[16px] font-bold">Replace topic #{editingTopic.position}</h2><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" /><textarea value={editAngle} onChange={(event) => setEditAngle(event.target.value)} rows={3} className="mt-3 w-full rounded-xl bg-background p-4 text-[14px] ring-1 ring-black/10" /><select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl bg-background px-3 text-[14px] ring-1 ring-black/10">{CONTENT_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={saveReplacement} disabled={busy !== null || editTitle.trim().length < 3 || editAngle.trim().length < 3} className="min-h-11 rounded-xl bg-primary text-[13px] font-bold text-primary-foreground">Save Replacement</button><button onClick={() => setEditingTopic(null)} className="min-h-11 rounded-xl bg-secondary text-[13px] font-bold">Cancel</button></div></section>}

    {items.length > 0 && <section className="mt-6 pb-6">
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">{items.map((item) => <button key={item.id} onClick={() => { setSelectedSeries(item.id); setSelectedTopics([]); setEditingTopic(null); }} className={`min-h-11 shrink-0 rounded-full px-4 text-[13px] font-bold ${selectedSeries === item.id ? 'bg-foreground text-background' : 'bg-card'}`}>{item.name}</button>)}</div>
      {current && <>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-[20px] font-bold">{current.name}</h2><p className="mt-1 text-[13px] text-muted-foreground">{topics.filter((topic) => topic.status === 'scripted').length}/30 scripted · select up to 8</p></div>{selectedTopics.length > 0 && <button onClick={buildSelected} disabled={busy !== null} className="min-h-11 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground">{busy === 'scripts' ? 'Building…' : `Build ${selectedTopics.length} Scripts`}</button>}</div>
        <div className="space-y-2">{topics.map((topic, index) => {
          const selected = selectedTopics.includes(topic.id);
          return <article key={topic.id} className={`rounded-2xl p-4 shadow-[var(--shadow-card)] ${selected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'}`}>
            <button onClick={() => !topic.content_item_id && toggleTopic(topic.id)} className="w-full text-left" disabled={Boolean(topic.content_item_id)}><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-[12px] font-bold">{topic.position}</span><div className="min-w-0 flex-1"><p className="text-[15px] font-bold leading-5">{topic.title}</p>{topic.angle && <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{topic.angle}</p>}<p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{topic.category_id} · {topic.status}</p></div></div></button>
            <div className="mt-3 flex flex-wrap gap-2">{topic.content_item_id ? <Link href={`/content/${topic.content_item_id}`} className="inline-flex min-h-10 items-center rounded-full bg-secondary px-3 text-[12px] font-bold">Open Script</Link> : <><button onClick={() => beginReplace(topic)} className="min-h-10 rounded-full bg-secondary px-3 text-[12px] font-bold">Replace</button><button onClick={() => moveTopic(topic.id, -1)} disabled={busy !== null || index === 0} className="min-h-10 rounded-full bg-secondary px-3 text-[12px] font-bold disabled:opacity-30">↑ Move</button><button onClick={() => moveTopic(topic.id, 1)} disabled={busy !== null || index === topics.length - 1} className="min-h-10 rounded-full bg-secondary px-3 text-[12px] font-bold disabled:opacity-30">↓ Move</button></>}</div>
          </article>;
        })}</div>
      </>}
    </section>}
  </div>;
}
