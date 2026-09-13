import Link from 'next/link';
import { getScheduledContent } from '@/lib/repositories/content';
import { toUserStatus } from '@/lib/domain/status';

export const dynamic = 'force-dynamic';

function todayInLocalIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default async function PlanPage() {
  const items = await getScheduledContent();
  const today = todayInLocalIso();
  const todayItems = items.filter((item) => item.scheduledDate === today);
  const upcoming = items.filter((item) => item.scheduledDate && item.scheduledDate > today);
  const past = items.filter((item) => item.scheduledDate && item.scheduledDate < today && !item.shotAt);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[30px] font-bold tracking-tight">Plan</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Shoot dates — simple aur clear</p>
      </header>

      <PlanSection title="Today" items={todayItems} empty="Aaj koi shoot planned nahi hai." />
      {past.length > 0 && <PlanSection title="Needs rescheduling" items={past} empty="" />}
      <PlanSection title="Upcoming" items={upcoming} empty="Upcoming shoot add karne ke liye approved script open karein." />
    </div>
  );
}

function PlanSection({ title, items, empty }: { title: string; items: Awaited<ReturnType<typeof getScheduledContent>>; empty: string }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-[18px] font-bold">{title}</h2>
      {items.length === 0 ? (
        empty ? <div className="rounded-2xl bg-card p-5 text-[14px] text-muted-foreground shadow-[var(--shadow-card)]">{empty}</div> : null
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} href={`/content/${item.id}`} className="flex min-h-[84px] items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] active:scale-[0.99]">
              <div className="min-w-0">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-primary">{item.scheduledDate}</p>
                <p className="mt-1 text-[17px] font-bold leading-6">{item.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{toUserStatus(item.status)}</p>
              </div>
              <span className="shrink-0 text-[20px]">→</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
