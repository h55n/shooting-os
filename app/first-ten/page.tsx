'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CONTENT_CATEGORIES } from '@/lib/content-engine/categories';

type FirstItem = { id: string; position: number; title: string; purpose?: string; audience?: string; category_id?: string; content_item_id?: string; status: string };

export default function FirstTenPage() {
  const router = useRouter();
  const [items, setItems] = useState<FirstItem[]>([]);
  const [journey, setJourney] = useState<{ id: string; status: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<FirstItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editAudience, setEditAudience] = useState('');
  const [editCategory, setEditCategory] = useState('quick-tip');

  async function load() {
    const response = await fetch('/api/first-ten', { cache: 'no-store' });
    const body = await response.json();
    if (response.ok && body.ok) { setJourney(body.data.journey); setItems(body.data.items); }
  }
  useEffect(() => { void load(); }, []);

  async function generate() {
    setBusy('generate'); setMessage(null);
    try {
      const response = await fetch('/api/first-ten', { method: 'POST' });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'First 10 create nahi ho saka.');
      setJourney(body.data.journey); setItems(body.data.items);
      if (!body.data.persisted) setMessage('Demo journey ready. Database connected hone par progress persist hogi.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'First 10 create nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function start(item: FirstItem) {
    if (item.content_item_id) { router.push(`/content/${item.content_item_id}`); return; }
    setBusy(item.id); setMessage(null);
    try {
      const ideaResponse = await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'capture', rawInput: `${item.title}. ${item.purpose || ''}` }) });
      const ideaBody = await ideaResponse.json();
      if (!ideaResponse.ok || !ideaBody.ok || !ideaBody.data.id) throw new Error(ideaBody.userMessage || 'Idea save nahi hua.');
      const scriptResponse = await fetch(`/api/ideas/${ideaBody.data.id}/script`, { method: 'POST' });
      const scriptBody = await scriptResponse.json();
      if (!scriptResponse.ok || !scriptBody.ok || !scriptBody.data.contentId) throw new Error(scriptBody.userMessage || 'Script create nahi hua.');
      if (scriptBody.data.persisted) await fetch(`/api/first-ten/${item.id}/link`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentId: scriptBody.data.contentId }) });
      router.push(`/content/${scriptBody.data.contentId}`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Video start nahi ho saka.'); }
    finally { setBusy(null); }
  }

  function beginReplace(item: FirstItem) {
    setEditing(item); setEditTitle(item.title); setEditPurpose(item.purpose || ''); setEditAudience(item.audience || 'Beginners'); setEditCategory(item.category_id || 'quick-tip');
  }

  async function saveReplacement() {
    if (!editing) return;
    setBusy(`replace:${editing.id}`); setMessage(null);
    try {
      const response = await fetch(`/api/first-ten/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editTitle, purpose: editPurpose, audience: editAudience, categoryId: editCategory }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Video replace nahi ho saka.');
      setEditing(null); setMessage(`Video ${body.data.position} replaced.`); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Video replace nahi ho saka.'); }
    finally { setBusy(null); }
  }

  const completed = useMemo(() => items.filter((item) => item.status === 'completed').length, [items]);
  const active = useMemo(() => items.find((item) => !['completed'].includes(item.status)) ?? items[0], [items]);

  return <div>
    <header className="mb-5"><p className="text-[13px] font-bold uppercase tracking-[0.1em] text-primary">Guided start</p><h1 className="mt-1 text-[30px] font-bold tracking-tight">First 10 Videos</h1><p className="mt-1 text-[15px] text-muted-foreground">Ek clear journey. Next step hamesha visible.</p></header>
    {!journey ? <div className="rounded-3xl bg-foreground p-6 text-background"><p className="text-[22px] font-bold">Your first ten start with the right foundation.</p><p className="mt-2 text-[15px] leading-6 opacity-75">Introduction se sport basics, safety aur competition pathway tak ek fixed, practical sequence—ten full scripts ek saath nahi.</p><button onClick={generate} disabled={busy !== null} className="mt-5 min-h-[52px] w-full rounded-xl bg-background px-4 text-[15px] font-bold text-foreground">{busy === 'generate' ? 'Creating journey…' : 'Create My First 10 →'}</button></div> : <>
      <section className="mb-5 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]"><div className="flex items-end justify-between"><div><p className="text-[13px] font-semibold text-muted-foreground">Progress</p><p className="mt-1 text-[26px] font-bold">{completed}/10</p></div><div className="text-right text-[13px] text-muted-foreground">{active ? `Next: Video ${active.position}` : 'Journey complete'}</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${completed * 10}%` }} /></div></section>
      <div className="space-y-3 pb-5">{items.map((item) => <article key={item.id} className={`rounded-2xl p-5 shadow-[var(--shadow-card)] ${item.id === active?.id ? 'bg-foreground text-background' : 'bg-card'}`}><div className="flex items-start gap-4"><div className={`grid size-9 shrink-0 place-items-center rounded-full text-[14px] font-bold ${item.id === active?.id ? 'bg-background text-foreground' : 'bg-secondary'}`}>{item.position}</div><div className="min-w-0 flex-1"><h2 className="text-[17px] font-bold leading-6">{item.title}</h2>{item.purpose && <p className={`mt-1 text-[13px] leading-5 ${item.id === active?.id ? 'opacity-70' : 'text-muted-foreground'}`}>{item.purpose}</p>}<div className="mt-3 flex flex-wrap gap-2"><button onClick={() => start(item)} disabled={busy !== null} className={`min-h-11 rounded-xl px-4 text-[14px] font-bold ${item.id === active?.id ? 'bg-background text-foreground' : 'bg-primary text-primary-foreground'} disabled:opacity-40`}>{busy === item.id ? 'Creating…' : item.content_item_id ? 'Continue →' : 'Create script →'}</button><button onClick={() => beginReplace(item)} disabled={busy !== null} className={`min-h-11 rounded-xl px-4 text-[14px] font-bold ${item.id === active?.id ? 'bg-white/15 text-background' : 'bg-secondary'} disabled:opacity-40`}>Replace this video</button></div></div></div></article>)}</div>
    </>}
    {editing && <section className="mt-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-[17px] font-bold">Replace video {editing.position}</h2><p className="mt-1 text-[13px] text-muted-foreground">This changes only this slot; the rest of your sequence stays intact.</p><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" aria-label="Video title" /><textarea value={editPurpose} onChange={(event) => setEditPurpose(event.target.value)} rows={3} className="mt-3 w-full rounded-xl bg-background p-4 text-[14px] ring-1 ring-black/10" aria-label="Video purpose" /><input value={editAudience} onChange={(event) => setEditAudience(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" aria-label="Video audience" /><select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl bg-background px-3 text-[14px] ring-1 ring-black/10">{CONTENT_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={saveReplacement} disabled={busy !== null || editTitle.trim().length < 3 || editPurpose.trim().length < 3 || editAudience.trim().length < 2} className="min-h-11 rounded-xl bg-primary text-[13px] font-bold text-primary-foreground disabled:opacity-40">Save replacement</button><button onClick={() => setEditing(null)} className="min-h-11 rounded-xl bg-secondary text-[13px] font-bold">Cancel</button></div></section>}
    {message && <p className="mt-4 rounded-xl bg-secondary p-3 text-[14px]">{message}</p>}
  </div>;
}
