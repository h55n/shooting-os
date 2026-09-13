"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, Loading, Pill, SectionHeading, StatusBadge } from "@/components/kit";
import { ideas } from "@/lib/data";

export default function IdeaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idea = ideas.find((i) => i.id === resolvedParams.id);
  
  if (!idea) {
    notFound();
  }

  const [researchOpen, setResearchOpen] = useState(true);
  const [researching, setResearching] = useState(false);
  const [done, setDone] = useState(Boolean(idea.research));

  return (
    <>
      <Link href="/ideas" className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-[16px] text-[#0F7FFF]">
        <ChevronLeft size={20} /> Ideas
      </Link>

      <StatusBadge status={idea.status} />
      <h1 className="page-title mt-2">{idea.title}</h1>
      <p className="mt-1 text-[14px] text-muted-foreground">{idea.angle}</p>

      <section className="mt-7">
        <SectionHeading title="AI ka Expansion" />
        <Card>
          <Field label="Suggested title" value={idea.expansion.title} />
          <Field label="Hook" value={idea.expansion.hook} />
          <div className="mt-3">
            <p className="text-[14px] text-muted-foreground">3 key points</p>
            <ul className="mt-1 list-disc pl-5 text-[17px] leading-[26px]">
              {idea.expansion.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <Field label="Target audience" value={idea.expansion.audience} />
          <Field label="Suggested format" value={idea.expansion.format} />
          <Field label="Recommended CTA" value={idea.expansion.cta} />
        </Card>
      </section>

      <section className="mt-7">
        <SectionHeading
          title="Research"
          action={
            <button className="text-[14px] text-[#0F7FFF]" onClick={() => setResearchOpen((o) => !o)}>
              {researchOpen ? "Chhupao" : "Dikhao"}
            </button>
          }
        />
        {researchOpen && (
          <Card>
            {!done ? (
              researching ? (
                <Loading />
              ) : (
                <Pill
                  className="w-full"
                  onClick={() => {
                    setResearching(true);
                    setTimeout(() => {
                      setResearching(false);
                      setDone(true);
                    }, 1400);
                  }}
                >
                  Research Karo
                </Pill>
              )
            ) : idea.research ? (
              <>
                <span className="rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[12px] font-semibold text-[#027A48]">
                  Confidence: {idea.research.confidence}
                </span>
                <p className="mt-3 text-[17px] leading-[26px]">{idea.research.summary}</p>
                <p className="mt-4 text-[14px] text-muted-foreground">Sources</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {idea.research.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-[16px] text-[#0F7FFF]">
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[14px] text-muted-foreground">Ye keh sakte hain ✅</p>
                <ul className="mt-1 list-disc pl-5 text-[16px] leading-[26px]">
                  {idea.research.safe.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="mt-4 text-[14px] text-muted-foreground">Ye mat kehna ⚠️</p>
                <ul className="mt-1 list-disc pl-5 text-[16px] leading-[26px]">
                  {idea.research.unsafe.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-[16px] text-muted-foreground">
                Research poori hui — is idea ke liye koi bada claim verify karne ki zaroorat nahi hai.
              </p>
            )}
          </Card>
        )}
      </section>

      {idea.fatherStory && (
        <section className="mt-7">
          <SectionHeading title="Father ki Story" />
          <Card className="border-l-4">
            <p className="text-[17px] leading-[26px]">{idea.fatherStory}</p>
            <p className="mt-2 text-[14px] text-muted-foreground">Verified personal experience</p>
          </Card>
        </section>
      )}

      <section className="mt-7 pb-6">
        <SectionHeading title="Actions" />
        <div className="grid grid-cols-2 gap-2.5">
          <Pill>Reel Banao</Pill>
          <Pill variant="secondary">YouTube Topic</Pill>
          <Pill variant="secondary">Series Mein Daalo</Pill>
          <Pill variant="secondary">Script Banao</Pill>
        </div>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className="text-[17px] leading-[26px]">{value}</p>
    </div>
  );
}
