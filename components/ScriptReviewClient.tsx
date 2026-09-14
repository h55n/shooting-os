'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ScriptDocument } from '@/lib/ai/schemas';
import { DownloadScriptButton } from '@/components/DownloadScriptButton';

type EditableSection = 'hook' | 'setup' | 'mainPoint' | 'storyOrExample' | 'takeaway' | 'cta';

const labels: Record<EditableSection, string> = {
  hook: 'HOOK', setup: 'SETUP / CONTEXT', mainPoint: 'MAIN POINT', storyOrExample: 'EXAMPLE / STORY', takeaway: 'TAKEAWAY', cta: 'CTA',
};

export function ScriptReviewClient({
  contentId, title, initialStatus, initialScript, scheduledDate, guidanceEnabled = false,
}: {
  contentId: string;
  title: string;
  initialStatus: string;
  initialScript: ScriptDocument;
  scheduledDate?: string;
  guidanceEnabled?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [script, setScript] = useState(initialScript);
  const [editing, setEditing] = useState<EditableSection | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [shootDate, setShootDate] = useState(scheduledDate ?? '');
  const [guidance, setGuidance] = useState(guidanceEnabled);

  async function api(path: string, init: RequestInit) {
    setMessage(null);
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error(body.userMessage || 'Save nahi ho saka.');
    return body.data;
  }

  async function saveSection(section: EditableSection) {
    setBusy(`edit-${section}`);
    try {
      const data = await api(`/api/content/${contentId}/script`, { method: 'PATCH', body: JSON.stringify({ section, value: draft, reason: 'Direct mobile edit' }) });
      setScript(data.script ?? { ...script, [section]: draft });
      setStatus('REVIEW');
      setEditing(null);
      setMessage('Change save ho gaya.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Change save nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function approve() {
    setBusy('approve');
    try {
      const data = await api(`/api/content/${contentId}/approve`, { method: 'POST', body: '{}' });
      setStatus(data.newStatus ?? 'APPROVED');
      setMessage('Script approved.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Approve nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function schedule() {
    if (!shootDate) { setMessage('Shoot date select karein.'); return; }
    setBusy('schedule');
    try {
      const data = await api(`/api/content/${contentId}/schedule`, { method: 'PATCH', body: JSON.stringify({ shootDate }) });
      setStatus(data.status ?? 'RECORDING');
      setMessage('Shoot date save ho gayi.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Date save nahi ho saki.'); }
    finally { setBusy(null); }
  }

  async function markShot() {
    setBusy('shot');
    try {
      const data = await api(`/api/content/${contentId}/shot`, { method: 'POST' });
      setStatus(data.newStatus ?? 'EDITING');
      setMessage('Shot Ho Gaya ✓');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Shot status save nahi ho saka.'); }
    finally { setBusy(null); }
  }

  async function toggleGuidance() {
    const next = !guidance;
    setBusy('guidance');
    try {
      await api(`/api/content/${contentId}/guidance`, { method: 'PATCH', body: JSON.stringify({ enabled: next }) });
      setGuidance(next);
      setMessage(next ? 'Shooting guidance on.' : 'Shooting guidance off.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Guidance setting save nahi ho saki.'); }
    finally { setBusy(null); }
  }

  const sections = (Object.keys(labels) as EditableSection[]).filter((key) => script[key]?.trim());

  return (
    <div className="pb-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold">{status}</span>
        <div className="flex items-center gap-2"><DownloadScriptButton title={title} script={script} /><Link href={`/content/${contentId}/shoot`} className="rounded-full bg-foreground px-4 py-2 text-[14px] font-semibold text-background">Shooting View</Link></div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <section key={section} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-[12px] font-extrabold tracking-[0.12em] text-muted-foreground">{labels[section]}</h2>
              <button onClick={() => { setEditing(section); setDraft(script[section] ?? ''); }} className="min-h-10 px-2 text-[13px] font-semibold text-primary">Edit</button>
            </div>
            {editing === section ? (
              <div className="space-y-2">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} className="w-full rounded-xl bg-background p-3 text-[17px] leading-7 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
                <div className="flex gap-2">
                  <button onClick={() => saveSection(section)} disabled={busy !== null} className="min-h-11 flex-1 rounded-xl bg-primary px-4 text-[14px] font-bold text-primary-foreground">Save</button>
                  <button onClick={() => setEditing(null)} className="min-h-11 rounded-xl bg-secondary px-4 text-[14px] font-semibold">Cancel</button>
                </div>
              </div>
            ) : (
              <p className={section === 'hook' ? 'text-[22px] font-bold leading-8' : 'whitespace-pre-wrap text-[18px] leading-8'}>{script[section]}</p>
            )}
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
        <button onClick={toggleGuidance} disabled={busy !== null} className="flex min-h-12 w-full items-center justify-between text-left disabled:opacity-50">
          <span><strong className="block text-[16px]">Shooting Guidance</strong><span className="text-[13px] text-muted-foreground">Optional beginner-friendly camera & delivery help</span></span>
          <span className={`h-7 w-12 rounded-full p-1 transition ${guidance ? 'bg-primary' : 'bg-black/10'}`}><span className={`block size-5 rounded-full bg-white transition-transform ${guidance ? 'translate-x-5' : ''}`} /></span>
        </button>
        {guidance && <div className="mt-3 border-t border-black/5 pt-3 text-[15px] leading-6 text-muted-foreground">Phone eye-level par rakhein. Frame chest-up rakhein. Hook seedha camera mein bolein, phir natural pause. Demonstration ho toh alag close-up take lein.</div>}
      </section>

      <section className="mt-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-[16px] font-bold">Plan the shoot</h2>
        <div className="mt-3 flex gap-2">
          <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl bg-background px-3 text-[15px] ring-1 ring-black/10" />
          <button onClick={schedule} disabled={busy !== null || status === 'REVIEW'} className="min-h-12 rounded-xl bg-secondary px-4 text-[14px] font-bold disabled:opacity-40">Save date</button>
        </div>
      </section>

      {message && <p role="status" className="mt-4 rounded-xl bg-secondary p-3 text-center text-[14px] font-medium">{message}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={approve} disabled={busy !== null || !['REVIEW', 'SCRIPT_DRAFT'].includes(status)} className="min-h-[54px] rounded-2xl bg-primary px-4 text-[16px] font-bold text-primary-foreground disabled:opacity-40">{busy === 'approve' ? 'Saving…' : 'Approve'}</button>
        <button onClick={markShot} disabled={busy !== null || !['APPROVED', 'RECORDING'].includes(status)} className="min-h-[54px] rounded-2xl bg-foreground px-4 text-[16px] font-bold text-background disabled:opacity-40">{busy === 'shot' ? 'Saving…' : 'Shot Ho Gaya'}</button>
      </div>
    </div>
  );
}
