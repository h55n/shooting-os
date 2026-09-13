"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, OpenLink, PageHeader, Pill, StatusBadge, TabSwitcher } from "@/components/kit";
import { contents, masterclass, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";

const filters = ["All", "REVIEW", "APPROVED", "RECORDING", "EDITING", "PUBLISHED"] as const;

export default function ContentScreen() {
  const [tab, setTab] = useState<"content" | "masterclass">("content");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [openModule, setOpenModule] = useState<string | null>(null);

  const list = contents.filter((c) => filter === "All" || c.status === (filter as Status));

  return (
    <>
      <PageHeader title="Content" subtitle="Script se publish tak" />
      <div className="mb-5">
        <TabSwitcher
          value={tab}
          onChange={setTab}
          options={[
            { value: "content", label: "Content" },
            { value: "masterclass", label: "Masterclass" },
          ]}
        />
      </div>

      {tab === "content" ? (
        <>
          {/* Filter pills */}
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "min-h-[44px] shrink-0 rounded-full px-4 text-[14px] font-medium transition-colors active:scale-95",
                  filter === f ? "bg-primary text-primary-foreground" : "card-surface text-muted-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pb-4">
            {list.length === 0 ? (
              <div className="rounded-xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
                <p className="text-[36px]">📄</p>
                <p className="mt-3 text-[17px] font-bold">
                  {filter === "All" ? "Abhi koi script nahi hai" : `${filter} mein kuch nahi hai`}
                </p>
                <p className="mt-1 text-[14px] text-muted-foreground">
                  {filter === "All"
                    ? "Ideas tab se idea dijiye, AI script bana dega."
                    : "Is status mein abhi koi content nahi hai."}
                </p>
              </div>
            ) : (
              list.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="rounded-full bg-background px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">
                      {c.platform}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[17px] font-bold leading-snug">{c.title}</p>
                      <p className="mt-1 text-[14px] text-muted-foreground">
                        {c.series} · {c.type}
                      </p>
                    </div>
                    <OpenLink to="/content/$id" params={{ id: c.id }} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2.5 pb-4">
          {masterclass.length === 0 ? (
            <div className="rounded-xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-[36px]">🎓</p>
              <p className="mt-3 text-[17px] font-bold">Masterclass abhi shuru nahi hua</p>
              <p className="mt-1 text-[14px] text-muted-foreground">
                Modules yahan dikhenge jab planning complete ho jaayegi.
              </p>
            </div>
          ) : (
            masterclass.map((m) => {
              const open = openModule === m.id;
              const doneCount = m.lessons.filter((l) => l.status === "PUBLISHED" || l.status === "APPROVED").length;
              return (
                <Card key={m.id}>
                  <button
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={() => setOpenModule(open ? null : m.id)}
                  >
                    <div>
                      <p className="text-[17px] font-bold leading-snug">{m.title}</p>
                      <p className="mt-1 text-[14px] text-muted-foreground">
                        {m.lessons.length} lessons planned · {doneCount} complete
                      </p>
                    </div>
                    <span className="text-[18px] text-muted-foreground">{open ? "−" : "+"}</span>
                  </button>
                  {open && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-black/[0.06] pt-3">
                      {m.lessons.map((l) => (
                        <Link
                          key={l.id}
                          href={`/content/${l.source}`}
                          className="flex min-h-[48px] items-center justify-between gap-3"
                        >
                          <span className="text-[16px]">{l.title}</span>
                          <StatusBadge status={l.status} />
                        </Link>
                      ))}
                      <Pill variant="secondary" className="mt-1 w-full min-h-[44px] text-[14px]">
                        + Nayi Lesson Daalo
                      </Pill>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
