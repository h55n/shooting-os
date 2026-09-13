'use client';

import { useEffect, useState } from 'react';

type ResearchItem = { id: string; query?: string; topic: string; summary?: string; safe_claim?: string; warning?: string; confidence?: number; sources?: Array<{ id: string; url: string; title?: string; publisher?: string }> };

export function ResearchPanel({ contentId }: { contentId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/content/${contentId}/research`, { cache: 'no-store' });
    const body = await response.json();
    if (response.ok && body.ok) setItems(body.data);
  }
  useEffect(() => { void load(); }, [contentId]);

  async function run() {
    const sourceUrls = urls.split(/\n|,/).map((value) => value.trim()).filter(Boolean);
    setBusy(true); setMessage(null);
    try {
      const response = await fetch(`/api/content/${contentId}/research`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, sourceUrls }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Research nahi ho saka.');
      setQuery(''); setUrls(''); setMessage('Research evidence save ho gaya.'); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Research nahi ho saka.'); }
    finally { setBusy(false); }
  }

  return <section className="mt-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
    <button onClick={() => setOpen((value) => !value)} className="flex min-h-12 w-full items-center justify-between text-left"><span><strong className="block text-[16px]">Research</strong><span className="text-[13px] text-muted-foreground">Use explicit sources. See safe claim + warning.</span></span><span className="text-[18px]">{open ? '−' : '+'}</span></button>
    {open && <div className="mt-4 border-t border-black/5 pt-4">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you want to verify?" className="min-h-12 w-full rounded-xl bg-background px-4 text-[15px] ring-1 ring-black/10" />
      <textarea value={urls} onChange={(event) => setUrls(event.target.value)} rows={3} placeholder="Paste 1–5 source URLs, one per line" className="mt-3 w-full rounded-xl bg-background p-4 text-[14px] ring-1 ring-black/10" />
      <button onClick={run} disabled={busy || query.trim().length < 3 || urls.trim().length < 8} className="mt-3 min-h-12 w-full rounded-xl bg-primary px-4 text-[14px] font-bold text-primary-foreground disabled:opacity-40">{busy ? 'Reading sources…' : 'Research from Sources'}</button>
      {message && <p className="mt-3 rounded-xl bg-secondary p-3 text-[13px]">{message}</p>}
      <div className="mt-4 space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl bg-background p-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Confidence {Math.round((item.confidence ?? 0) * 100)}%</p>
        <p className="mt-2 text-[14px] leading-6">{item.summary || item.topic}</p>
        {item.safe_claim && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] leading-5 text-emerald-900"><strong>Safe claim:</strong> {item.safe_claim}</p>}
        {item.warning && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-[13px] leading-5 text-amber-900"><strong>Warning:</strong> {item.warning}</p>}
        {item.sources?.length ? <details className="mt-3"><summary className="cursor-pointer text-[13px] font-bold text-primary">View Sources ({item.sources.length})</summary><ul className="mt-2 space-y-2">{item.sources.map((source) => <li key={source.id} className="break-all text-[12px] text-muted-foreground"><a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.title || source.publisher || source.url}</a></li>)}</ul></details> : null}
      </article>)}</div>
    </div>}
  </section>;
}
