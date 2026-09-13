import { notFound } from 'next/navigation';
import { getContentItem } from '@/lib/repositories/content';
import { ScriptReviewClient } from '@/components/ScriptReviewClient';

export const dynamic = 'force-dynamic';

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getContentItem(id);
  if (!item) notFound();
  const guidanceEnabled = Boolean(item.shootingGuidance && item.shootingGuidance.enabled === true);

  return (
    <div>
      <div className="mb-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{item.categoryId || 'Content'}</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">{item.title}</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">Version {item.scriptVersion ?? 1} · {item.contentType}</p>
      </div>
      {item.script ? (
        <ScriptReviewClient contentId={item.id} initialStatus={item.status} initialScript={item.script} scheduledDate={item.scheduledDate} guidanceEnabled={guidanceEnabled} />
      ) : (
        <div className="rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-[17px] font-bold">Script abhi ready nahi hai</p>
          <p className="mt-1 text-[14px] text-muted-foreground">Idea se structured script create karein.</p>
        </div>
      )}
    </div>
  );
}
