"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, ConfirmDialog, Loading, Pill, SectionHeading, StatusBadge } from "@/components/kit";
import { contents, type Status } from "@/lib/data";

export default function ContentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const item = contents.find((c) => c.id === resolvedParams.id);
  
  if (!item) {
    notFound();
  }

  const [status, setStatus] = useState<Status>(item.status);
  const [feedback, setFeedback] = useState(false);
  const [note, setNote] = useState("");
  const [working, setWorking] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <div className="pb-[120px]">
        <Link href="/content" className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-[16px] text-[#0F7FFF]">
          <ChevronLeft size={20} /> Content
        </Link>

        <StatusBadge status={status} />
        <h1 className="page-title mt-2">{item.title}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {item.series} · {item.platform}
        </p>

        <section className="mt-7">
          <SectionHeading title="Script" />
          <Card>
            <p className="text-[14px] text-muted-foreground">Hook</p>
            <p className="mt-1 text-[17px] font-bold leading-[26px]">{item.script.hook}</p>

            <p className="mt-5 text-[14px] text-muted-foreground">Body</p>
            {item.script.body.map((p, i) => (
              <p key={i} className="mt-2 text-[17px] leading-[26px]">
                {p}
              </p>
            ))}

            <p className="mt-5 text-[14px] text-muted-foreground">CTA</p>
            <p className="mt-1 text-[17px] leading-[26px]">{item.script.cta}</p>
          </Card>
        </section>

        {feedback && (
          <section className="mt-6">
            <SectionHeading title="Kya badalna hai?" />
            <Card>
              {working ? (
                <Loading />
              ) : (
                <>
                  <textarea
                    autoFocus
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Hindi ya Hinglish mein likhein... jaise 'hook aur chhota karo'"
                    className="w-full resize-none bg-transparent text-[17px] leading-[26px] outline-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <Pill
                      className="flex-1"
                      onClick={() => {
                        setWorking(true);
                        setTimeout(() => {
                          setWorking(false);
                          setFeedback(false);
                          setNote("");
                          setStatus("SCRIPT_DRAFT");
                        }, 1500);
                      }}
                    >
                      AI ko bhejo
                    </Pill>
                    <Pill variant="secondary" onClick={() => setFeedback(false)}>
                      Cancel
                    </Pill>
                  </div>
                </>
              )}
            </Card>
          </section>
        )}

        <section className="mt-7">
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => setHistoryOpen((o) => !o)}
          >
            <h2 className="section-title">Purane Versions</h2>
            <span className="text-[18px] text-muted-foreground">{historyOpen ? "−" : "+"}</span>
          </button>
          {historyOpen && (
            <div className="mt-3 flex flex-col gap-2">
              {item.versions.map((v) => (
                <Card key={v.label} className="flex items-center justify-between">
                  <span className="text-[16px]">{v.label}</span>
                  <span className="text-[14px] text-muted-foreground">{v.time}</span>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <div
        className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 z-30 w-full max-w-[520px] -translate-x-1/2 bg-card px-4 py-3"
        style={{ boxShadow: "0 -1px 0 rgba(0,0,0,0.08)" }}
      >
        <div className="flex gap-2">
          <Pill className="flex-1 px-3 text-[15px]" onClick={() => setStatus("APPROVED")}>
            Approve ✅
          </Pill>
          <Pill variant="secondary" className="flex-1 px-3 text-[15px]" onClick={() => setFeedback(true)}>
            Badlao ✍️
          </Pill>
          <Pill variant="danger" className="px-4 text-[15px]" onClick={() => setConfirm(true)}>
            ❌
          </Pill>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Script reject karein?"
        body="Yeh script reject ho jaayegi aur AI naya draft banayega."
        confirmLabel="Haan, reject karo"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setStatus("REJECTED");
          setConfirm(false);
        }}
      />
    </>
  );
}
