'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, RefreshCw } from 'lucide-react';
import { MarkdownReply } from '@/components/assistant/markdown-reply';

type AssistAction = { type: 'navigate'; label: string; href: string };
type Msg = { role: 'user' | 'ai'; text: string; actions?: AssistAction[] };

const chips = [
  'Aaj kya karna chahiye?',
  'Ek strong content idea do',
  'Trigger control ke baare mein batao',
  'Masterclass ka next step kya hai?',
];

export default function Help() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const history = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const conversationId = useRef<string | undefined>(undefined);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, thinking]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;
    setError(null); setInput(''); setThinking(true);
    setMsgs((current) => [...current, { role: 'user', text: q }]);
    history.current.push({ role: 'user', content: q });

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, conversationId: conversationId.current, conversationHistory: history.current.slice(-8) }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Assist response nahi de saka.');
      const data = body.data;
      conversationId.current = data.conversationId;
      history.current.push({ role: 'assistant', content: data.reply });
      setMsgs((current) => [...current, { role: 'ai', text: data.reply, actions: data.actions }]);
    } catch (cause) {
      history.current.pop();
      setMsgs((current) => current.slice(0, -1));
      setError(cause instanceof Error ? cause.message : 'Kuch gadbad ho gayi. Dobara try karein.');
    } finally { setThinking(false); }
  }

  function clearChat() {
    setMsgs([]); setError(null); setInput(''); history.current = []; conversationId.current = undefined;
  }

  return (
    <div className="flex min-h-[calc(100dvh-140px)] flex-col -mx-4 -mt-6 px-4 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="page-title">Assist</h1>
          <p className="mt-0.5 text-[14px] text-muted-foreground">Verified knowledge + useful next actions</p>
        </div>
        {msgs.length > 0 && <button onClick={clearChat} className="flex min-h-11 items-center gap-1.5 rounded-full bg-card px-3 text-[13px] text-muted-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"><RefreshCw size={13} />Naya</button>}
      </div>

      <div className="flex-1 space-y-4 pb-36">
        {msgs.length === 0 && !thinking && <div className="rounded-2xl bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"><p className="text-[17px] font-bold">Namaskar, Rehman Sahab.</p><p className="mt-2 text-[15px] leading-6 text-muted-foreground">Ideas, scripts, planning, masterclass aur verified shooting knowledge mein help kar sakta hoon. Personal facts sirf verified knowledge se use honge.</p></div>}
        {error && <div className="rounded-xl bg-[#FFF1F0] px-4 py-3 text-[15px] text-[#D92D20]">⚠️ {error}</div>}
        {msgs.map((msg, index) => msg.role === 'user' ? (
          <div key={index} className="flex justify-end"><p className="max-w-[82%] rounded-2xl bg-foreground px-4 py-3 text-[17px] leading-[26px] text-background">{msg.text}</p></div>
        ) : (
          <div key={index}>
            <p className="mb-1.5 text-[12px] font-semibold text-muted-foreground">Assist</p>
            <div className="max-w-[92%] rounded-2xl bg-card px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"><MarkdownReply text={msg.text} /></div>
            {msg.actions?.length ? <div className="mt-2 flex flex-wrap gap-2">{msg.actions.map((action) => <Link key={action.href} href={action.href} className="min-h-11 rounded-full bg-secondary px-4 py-3 text-[13px] font-bold">{action.label}</Link>)}</div> : null}
          </div>
        ))}
        {thinking && <div className="inline-flex gap-2 rounded-2xl bg-card px-4 py-3 text-muted-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"><span className="size-2 animate-bounce rounded-full bg-primary" /><span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" /><span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" /></div>}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 z-30 w-full max-w-[520px] -translate-x-1/2 bg-background px-4 pb-2 pt-2">
        {msgs.length === 0 && <div className="no-scrollbar -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">{chips.map((chip) => <button key={chip} onClick={() => send(chip)} className="card-surface min-h-10 shrink-0 rounded-full px-4 text-[14px]">{chip}</button>)}</div>}
        <form onSubmit={(event) => { event.preventDefault(); void send(input); }} className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Kuch poochhiye…" className="min-h-12 flex-1 bg-transparent px-2 text-[17px] outline-none" disabled={thinking} />
          <button type="submit" className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40" disabled={!input.trim() || thinking}><ArrowUp size={22} /></button>
        </form>
      </div>
    </div>
  );
}
