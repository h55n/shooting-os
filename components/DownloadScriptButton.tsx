'use client';

import type { ScriptDocument } from '@/lib/ai/schemas';

const sections: Array<[string, 'hook' | 'setup' | 'mainPoint' | 'storyOrExample' | 'takeaway' | 'cta']> = [
  ['HOOK', 'hook'],
  ['SETUP / CONTEXT', 'setup'],
  ['MAIN POINT', 'mainPoint'],
  ['EXAMPLE / STORY', 'storyOrExample'],
  ['TAKEAWAY', 'takeaway'],
  ['CTA', 'cta'],
];

function fileName(title: string) {
  const normalized = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${normalized || 'shooting-os-script'}.txt`;
}

export function DownloadScriptButton({ title, script }: { title: string; script: ScriptDocument }) {
  function download() {
    const body = sections
      .map(([label, key]) => [label, script[key]?.trim()].filter(Boolean).join('\n'))
      .filter(Boolean)
      .join('\n\n');
    const blob = new Blob([`${title}\n\n${body}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName(title);
    link.click();
    URL.revokeObjectURL(url);
  }

  return <button onClick={download} className="min-h-11 rounded-full bg-secondary px-4 text-[13px] font-bold">Download .txt</button>;
}
