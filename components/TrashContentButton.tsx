'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export function TrashContentButton({ contentId }: { contentId: string }) {
  const router = useRouter();
  async function trash() {
    if (!window.confirm('Is video plan ko Trash mein bhejna hai?')) return;
    const response = await fetch(`/api/content/${contentId}/trash`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) { window.alert(body?.userMessage || 'Video plan remove nahi ho saka.'); return; }
    router.push('/content'); router.refresh();
  }
  return <button type="button" onClick={() => void trash()} aria-label="Move video plan to Trash" className="grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground"><Trash2 size={17} /></button>;
}
