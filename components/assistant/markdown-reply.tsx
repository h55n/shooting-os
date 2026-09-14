import { Fragment } from 'react';

type InlineToken = { value: string; strong?: boolean; emphasis?: boolean; code?: boolean; href?: string };

function safeHref(value: string) {
  try {
    const url = new URL(value, 'https://shooting-os.local');
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch { return null; }
}

function inlineTokens(value: string): InlineToken[] {
  return value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^\s)]+\))/g).filter(Boolean).map((part) => {
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) return { value: link[1], href: safeHref(link[2]) ?? undefined };
    if (part.startsWith('**') && part.endsWith('**')) return { value: part.slice(2, -2), strong: true };
    if (part.startsWith('*') && part.endsWith('*')) return { value: part.slice(1, -1), emphasis: true };
    if (part.startsWith('`') && part.endsWith('`')) return { value: part.slice(1, -1), code: true };
    return { value: part };
  });
}

function Inline({ value }: { value: string }) {
  return <>{inlineTokens(value).map((token, index) => {
    const key = `${token.value}-${index}`;
    if (token.href) return <a key={key} href={token.href} target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">{token.value}</a>;
    if (token.strong) return <strong key={key}>{token.value}</strong>;
    if (token.emphasis) return <em key={key}>{token.value}</em>;
    if (token.code) return <code key={key} className="rounded bg-secondary px-1 py-0.5 text-[0.9em]">{token.value}</code>;
    return <Fragment key={key}>{token.value}</Fragment>;
  })}</>;
}

export function MarkdownReply({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n'); const blocks: React.ReactNode[] = []; let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim(); if (!line) { index += 1; continue; }
    const ordered = line.match(/^\d+[.)]\s+(.+)$/); const unordered = line.match(/^[-*]\s+(.+)$/);
    if (ordered || unordered) {
      const isOrdered = Boolean(ordered); const items: string[] = [];
      while (index < lines.length) { const match = lines[index].trim().match(isOrdered ? /^\d+[.)]\s+(.+)$/ : /^[-*]\s+(.+)$/); if (!match) break; items.push(match[1]); index += 1; }
      const List = isOrdered ? 'ol' : 'ul';
      blocks.push(<List key={`list-${index}`} className={isOrdered ? 'my-2 list-decimal space-y-2 pl-6 marker:font-bold' : 'my-2 list-disc space-y-2 pl-6'}>{items.map((item, itemIndex) => <li key={itemIndex}><Inline value={item} /></li>)}</List>); continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { const Tag = `h${heading[1].length}` as 'h1' | 'h2' | 'h3'; blocks.push(<Tag key={`heading-${index}`} className="mt-4 text-[1.05em] font-bold first:mt-0"><Inline value={heading[2]} /></Tag>); }
    else blocks.push(<p key={`paragraph-${index}`} className="mt-2 first:mt-0"><Inline value={line} /></p>);
    index += 1;
  }
  return <div className="break-words text-[17px] leading-[28px]">{blocks}</div>;
}
