import Link from 'next/link';
import { getContentItems } from '@/lib/repositories/content';
import { toUserStatus, nextActionForStatus } from '@/lib/domain/status';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const items = await getContentItems();
  return (
    <div>
      <header className="mb-5">
        <h1 className="text-[30px] font-bold tracking-tight">Content</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Scripts, review aur shooting progress</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-card p-7 text-center shadow-[var(--shadow-card)]">
          <p className="text-[34px]">🎬</p>
          <h2 className="mt-3 text-[18px] font-bold">Abhi koi script nahi hai</h2>
          <p className="mt-1 text-[14px] leading-6 text-muted-foreground">Ideas mein ek thought add karke structured script banaiye.</p>
          <Link href="/ideas" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-[15px] font-bold text-primary-foreground">Open Ideas</Link>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {items.map((item) => (
            <Link key={item.id} href={`/content/${item.id}`} className="block rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] transition-transform active:scale-[0.99]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold">{toUserStatus(item.status)}</span>
                  <h2 className="mt-2 text-[18px] font-bold leading-6">{item.title}</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">{item.categoryId || item.contentType}</p>
                </div>
                <span className="shrink-0 text-[13px] font-bold text-primary">Open →</span>
              </div>
              <div className="mt-4 border-t border-black/5 pt-3 text-[14px] font-semibold">Next: {nextActionForStatus(item.status)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
