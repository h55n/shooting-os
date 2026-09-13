'use client';

import { useState } from 'react';
import type { ScriptDocument } from '@/lib/ai/schemas';

export function CopyScriptButton({ title, script }: { title: string; script: ScriptDocument }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const blocks = [
      ['HOOK', script.hook],
      ['SETUP / CONTEXT', script.setup],
      ['MAIN POINT', script.mainPoint],
      ['EXAMPLE / STORY', script.storyOrExample],
      ['TAKEAWAY', script.takeaway],
      ['CTA', script.cta],
    ].filter(([, value]) => Boolean(value?.trim()));
    const text = `${title}\n\n${blocks.map(([label, value]) => `${label}\n${value}`).join('\n\n')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <button onClick={copy} className="min-h-11 rounded-full bg-secondary px-4 text-[13px] font-bold">{copied ? 'Copied ✓' : 'Copy Script'}</button>;
}
