import Link from "next/link";
import { Card, OpenLink, Pill, SectionHeading } from "@/components/kit";
import { contents, getHindiDate } from "@/lib/data";

import { User } from "lucide-react";

export default function Ghar() {
  const tasks = contents.filter((c) => ["REVIEW", "RESEARCHING", "APPROVED"].includes(c.status)).slice(0, 4);
  const today = getHindiDate();

  return (
    <>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="page-title">Namaskar, Rehman Sahab 🎯</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">{today}</p>
        </div>
        <Link 
          href="/account" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:scale-95"
        >
          <User size={20} />
        </Link>
      </div>

      <div className="mb-7">
        <p className="text-[14px] text-muted-foreground">
          Aapko sirf zaroori kaam dikh raha hai. Baaki system sambhalega.
        </p>
      </div>

      <section className="mb-7">
        <SectionHeading
          title="Aaj ke Kaam"
          action={
            <Link href="/plan" className="text-[14px] font-medium text-[#0F7FFF]">
              Sab dekho →
            </Link>
          }
        />
        {tasks.length === 0 ? (
          <div className="rounded-xl bg-card p-5 text-center shadow-[var(--shadow-card)]">
            <p className="text-[32px]">✅</p>
            <p className="mt-2 text-[17px] font-bold">Abhi koi kaam nahi hai</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Naya idea dijiye ya AI se baat karein.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tasks.map((t) => (
              <Card key={t.id}>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[18px] font-bold leading-snug">{t.title}</p>
                    <p className="mt-1 text-[14px] text-muted-foreground">
                      {t.type} · {t.series}
                    </p>
                  </div>
                  <OpenLink to="/content/$id" params={{ id: t.id }} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-7">
        <SectionHeading title="Jaldi Karo" />
        <div className="flex gap-2.5">
          <Link href="/ideas" className="flex-1">
            <Pill className="w-full">💡 Naya Idea Dena</Pill>
          </Link>
          <Link href="/assistant" className="flex-1">
            <Pill variant="secondary" className="w-full">
              🤖 Help se Baat Karo
            </Pill>
          </Link>
        </div>
      </section>
    </>
  );
}
