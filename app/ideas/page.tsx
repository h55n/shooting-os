'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Trash2 } from 'lucide-react';

type IdeaRow = {
  id: string; raw_input: string; normalized_idea?: string; status: string; source?: string; suggested_reason?: string; created_at?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function proposalOf(row: IdeaRow) {
  try { return row.normalized_idea ? JSON.parse(row.normalized_idea) as Record<string, string> : {}; } catch { return {}; }
}

export default function IdeasPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'owner' | 'suggested'>('owner');
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionLike | null>(null);

  async function load() {
    const response = await fetch('/api/ideas', { cache: 'no-store' });
    const body = await response.json();
    if (response.ok && body.ok) setIdeas(body.data);
  }
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const browser = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const instance = new SpeechRecognition();
    instance.lang = 'hi-IN';
    instance.interimResults = true;
    instance.continuous = false;
    instance.onresult = (event) => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) transcript += event.results[index][0].transcript;
      if (transcript.trim()) setText(transcript.trim());
    };
    instance.onend = () => setListening(false);
    instance.onerror = () => { setListening(false); setMessage('Voice capture nahi chala. Idea type karke save kar sakte hain.'); };
    setRecognition(instance);
    return () => instance.stop();
  }, []);

  function toggleVoice() {
    if (!recognition) {
      setMessage('Voice capture is browser mein available nahi hai. Text box se idea likhiye.');
      return;
    }
    setMessage(null);
    if (listening) { recognition.stop(); setListening(false); }
    else { recognition.start(); setListening(true); }
  }

  async function create(mode: 'capture' | 'suggest') {
    setBusy(mode); setMessage(null);
    try {
      const response = await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, rawInput: mode === 'capture' ? text : undefined }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Idea save nahi ho saka.');
      if (body.data.persisted === false) setMessage('Demo mode: idea preview bana hai; real persistence ke liye Supabase chahiye.');
      else { setText(''); await load(); }
      setTab(mode === 'suggest' ? 'suggested' : 'owner');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Idea save nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function buildScript(id: string) {
    setBusy(id); setMessage(null);
    try {
      const response = await fetch(`/api/ideas/${id}/script`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Script create nahi ho saka.');
      if (!body.data.persisted) { setMessage('Demo script bana, but save nahi hua because database demo mode mein hai.'); return; }
      router.push(`/content/${body.data.contentId}`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Script create nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function trashIdea(id: string) {
    if (!window.confirm('Is idea ko Trash mein bhejna hai?')) return;
    setBusy(id); setMessage(null);
    try {
      const response = await fetch('/api/ideas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Idea remove nahi ho saka.');
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Idea remove nahi ho saka.'); }
    finally { setBusy(null); }
  }

  const visible = useMemo(() => ideas.filter((idea) => (idea.source === 'suggested') === (tab === 'suggested')), [ideas, tab]);

  return (
    <div>
      <header className="mb-5"><h1 className="text-[30px] font-bold tracking-tight">Ideas</h1><p className="mt-1 text-[15px] text-muted-foreground">Rough thought se strong video tak</p></header>
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-secondary p-1">
        <button onClick={() => setTab('owner')} className={`min-h-11 rounded-lg text-[14px] font-bold ${tab === 'owner' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>My Ideas</button>
        <button onClick={() => setTab('suggested')} className={`min-h-11 rounded-lg text-[14px] font-bold ${tab === 'suggested' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Suggested</button>
      </div>

      {tab === 'owner' ? (
        <section className="mb-6 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3"><label className="text-[14px] font-bold" htmlFor="idea">I have an idea</label><button type="button" onClick={toggleVoice} className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold ${listening ? 'bg-red-100 text-red-700' : 'bg-secondary'}`}>{listening ? <Square size={15} /> : <Mic size={16} />}{listening ? 'Stop' : 'Voice'}</button></div>
          <textarea id="idea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Bol sakte hain ya type karein: beginners trigger press karte waqt aim kyun bigaad dete hain..." rows={4} className="mt-2 w-full rounded-xl bg-background p-3 text-[16px] leading-6 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
          {listening && <p className="mt-2 text-[13px] font-semibold text-primary">Sun raha hoon… bolna complete hone par text yahan aa jayega.</p>}
          <button onClick={() => create('capture')} disabled={busy !== null || text.trim().length < 3} className="mt-3 min-h-12 w-full rounded-xl bg-primary px-4 text-[15px] font-bold text-primary-foreground disabled:opacity-40">{busy === 'capture' ? 'Saving…' : 'Save Idea'}</button>
        </section>
      ) : <button onClick={() => create('suggest')} disabled={busy !== null} className="mb-5 min-h-[54px] w-full rounded-2xl bg-foreground px-5 text-[16px] font-bold text-background disabled:opacity-50">{busy === 'suggest' ? 'Finding a strong topic…' : 'Suggest Something'}</button>}

      {message && <p className="mb-4 rounded-xl bg-secondary p-3 text-[14px]">{message}</p>}
      <div className="space-y-3 pb-4">
        {visible.length === 0 ? <div className="rounded-2xl bg-card p-6 text-center text-[14px] text-muted-foreground shadow-[var(--shadow-card)]">{tab === 'owner' ? 'No ideas yet. Add one above.' : 'No suggestions yet. Ask for one strong topic.'}</div> : visible.map((idea) => {
          const proposal = proposalOf(idea);
          return <article key={idea.id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{idea.source === 'suggested' ? 'Suggested' : 'My Idea'}</p><h2 className="mt-1 text-[18px] font-bold leading-6">{proposal.title || idea.raw_input}</h2></div><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold">{idea.status}</span></div>
            {(proposal.why || idea.suggested_reason) && <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{proposal.why || idea.suggested_reason}</p>}
            <div className="mt-4 flex gap-2"><button onClick={() => buildScript(idea.id)} disabled={busy !== null || idea.status === 'converted'} className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-[15px] font-bold text-primary-foreground disabled:opacity-40">{busy === idea.id ? 'Working…' : idea.status === 'converted' ? 'Script created' : 'Build Script →'}</button><button onClick={() => trashIdea(idea.id)} disabled={busy !== null} aria-label="Move idea to Trash" className="grid size-12 place-items-center rounded-xl bg-secondary text-muted-foreground disabled:opacity-40"><Trash2 size={18} /></button></div>
          </article>;
        })}
      </div>
    </div>
  );
}
