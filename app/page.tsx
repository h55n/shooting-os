import Link from 'next/link';
import { getContentItems } from '@/lib/repositories/content';
import { nextActionForStatus, toUserStatus } from '@/lib/domain/status';

export const dynamic = 'force-dynamic';

const actionPriority: Record<string, number> = {
  RECORDING: 0, REVIEW: 1, SCRIPT_DRAFT: 1, APPROVED: 2, BLOCKED: 3, PLANNED: 4, IDEA: 5,
};

export default async function HomePage() {
  const items = await getContentItems(30);
  const next = [...items]
    .filter((item) => !['PUBLISHED', 'ANALYZING', 'LEARNED', 'ARCHIVED', 'REJECTED'].includes(item.status))
    .sort((a, b) => (actionPriority[a.status] ?? 8) - (actionPriority[b.status] ?? 8))
    .slice(0, 3);

  return (
    <div>
      <header className="mb-7 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground">Shooter Content OS</p>
          <h1 className="mt-1 text-[30px] font-bold tracking-tight">What should I do now?</h1>
        </div>
        <Link href="/account" aria-label="Settings" className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-[20px] shadow-[var(--shadow-card)]">⚙️</Link>
      </header>

      <section className="mb-7">
        {next.length === 0 ? (
          <div className="rounded-3xl bg-foreground p-6 text-background">
            <p className="text-[13px] font-semibold opacity-60">START HERE</p>
            <h2 className="mt-2 text-[24px] font-bold leading-8">Apna pehla strong shooting video banaiye.</h2>
            <p className="mt-2 text-[15px] leading-6 opacity-75">Ek rough idea likhiye ya suggestion se start karein.</p>
            <Link href="/ideas" className="mt-5 inline-flex min-h-[50px] items-center rounded-xl bg-background px-5 text-[15px] font-bold text-foreground">Create an idea →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {next.map((item, index) => (
              <Link key={item.id} href={`/content/${item.id}`} className={index === 0 ? 'block rounded-3xl bg-foreground p-6 text-background shadow-lg' : 'block rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]'}>
                <div className="flex items-center justify-between gap-2">
                  <span className={index === 0 ? 'text-[12px] font-bold uppercase tracking-[0.12em] opacity-60' : 'text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground'}>{toUserStatus(item.status)}</span>
                  <span className="text-[13px] font-bold">Open →</span>
                </div>
                <h2 className={index === 0 ? 'mt-2 text-[22px] font-bold leading-7' : 'mt-2 text-[18px] font-bold leading-6'}>{item.title}</h2>
                <p className={index === 0 ? 'mt-2 text-[15px] font-semibold opacity-80' : 'mt-2 text-[14px] font-semibold text-primary'}>{nextActionForStatus(item.status)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[18px] font-bold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Quick href="/ideas" icon="💡" label="New Idea" />
          <Quick href="/ideas?mode=suggest" icon="✨" label="Suggest Something" />
          <Quick href="/masterclass" icon="🎓" label="New Masterclass" />
          <Quick href="/assistant" icon="✦" label="Open Assist" />
        </div>
      </section>
    </div>
  );
}

function Quick({ href, icon, label }: { href: string; icon: string; label: string }) {
  return <Link href={href} className="flex min-h-[92px] flex-col justify-between rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] active:scale-[0.98]"><span className="text-[24px]">{icon}</span><span className="text-[15px] font-bold">{label}</span></Link>;
}
