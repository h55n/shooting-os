"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, OpenLink, PageHeader, Pill, SectionHeading, StatusBadge, TabSwitcher } from "@/components/kit";
import { analytics, contents, series, getWeekDays, getTodayString, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";

const HINDI_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHORT_DAYS_MON_START = ["Som", "Mangal", "Budh", "Guru", "Shukra", "Shani", "Ravi"];
const SHORT_DAYS_WEEK = ["Ravi", "Som", "Mangal", "Budh", "Guru", "Shukra", "Shani"];

// ─── Month calendar helpers ────────────────────────────────────────────────

function getMonthGrid(year: number, month: number): { date: string | null; n: number }[][] {
  // First day of month (0=Sun..6=Sat)
  const first = new Date(year, month, 1).getDay();
  // Shift so Monday is col 0
  const startOffset = (first + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: ({ date: string | null; n: number })[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, n: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push({ date: `${year}-${mm}-${dd}`, n: d });
  }
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push({ date: null, n: 0 });

  // Split into weeks
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const weekDays = getWeekDays();
const todayStr = getTodayString();
const todayDate = new Date();

export default function Plan() {
  const [tab, setTab] = useState<"calendar" | "analytics">("calendar");
  const [range, setRange] = useState<"week" | "month">("week");
  const [selected, setSelected] = useState(todayStr);
  const [openSeries, setOpenSeries] = useState<string | null>(null);
  const [stats, setStats] = useState(analytics);

  // Month navigation state
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const viewYear = new Date(todayDate.getFullYear(), todayDate.getMonth() + monthOffset).getFullYear();
  const viewMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + monthOffset).getMonth();
  const monthGrid = getMonthGrid(viewYear, viewMonth);
  const monthLabel = `${HINDI_MONTHS[viewMonth]} ${viewYear}`;

  const dayItems = contents.filter((c) => c.date === selected);
  const contentDates = new Set(contents.map((c) => c.date));
  const totals = stats.reduce(
    (a, s) => ({ views: a.views + s.views, likes: a.likes + s.likes, comments: a.comments + s.comments }),
    { views: 0, likes: 0, comments: 0 },
  );

  return (
    <>
      <PageHeader title="Plan" subtitle="Aapka poora content schedule" />
      <div className="mb-5">
        <TabSwitcher
          value={tab}
          onChange={setTab}
          options={[
            { value: "calendar", label: "Calendar" },
            { value: "analytics", label: "Analytics" },
          ]}
        />
      </div>

      {tab === "calendar" ? (
        <>
          {/* Hafta / Mahina toggle */}
          <div className="mb-4 w-[190px]">
            <TabSwitcher
              value={range}
              onChange={setRange}
              options={[
                { value: "week", label: "Hafta" },
                { value: "month", label: "Mahina" },
              ]}
            />
          </div>

          {range === "week" ? (
            /* ── WEEK VIEW ─────────────────────────────────────── */
            <>
              <div className="no-scrollbar mb-6 -mx-4 flex gap-2 overflow-x-auto px-4">
                {weekDays.map((day) => {
                  const has = contentDates.has(day.date);
                  const active = selected === day.date;
                  const isToday = day.date === todayStr;
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelected(day.date)}
                      className={cn(
                        "flex min-h-[76px] w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl transition-colors active:scale-95",
                        active ? "bg-primary text-primary-foreground" : "card-surface",
                      )}
                    >
                      <span className={cn("text-[11px] font-semibold", active ? "opacity-80" : "text-muted-foreground")}>
                        {day.d}
                      </span>
                      <span className={cn("text-[19px] font-bold", isToday && !active && "text-[#0F7FFF]")}>{day.n}</span>
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: has ? (active ? "#FEEA3D" : "#0F7FFF") : "transparent" }}
                      />
                    </button>
                  );
                })}
              </div>

              <DaySection date={selected} items={dayItems} />
              <SeriesSection openSeries={openSeries} setOpenSeries={setOpenSeries} />
            </>
          ) : (
            /* ── MONTH VIEW ────────────────────────────────────── */
            <>
              {/* Month navigation */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => setMonthOffset((o) => o - 1)}
                  className="grid size-10 place-items-center rounded-full card-surface active:scale-95 transition-transform"
                >
                  <ChevronLeft size={20} />
                </button>
                <p className="text-[17px] font-bold">{monthLabel}</p>
                <button
                  onClick={() => setMonthOffset((o) => o + 1)}
                  className="grid size-10 place-items-center rounded-full card-surface active:scale-95 transition-transform"
                  disabled={monthOffset >= 2}
                >
                  <ChevronRight size={20} className={monthOffset >= 2 ? "opacity-30" : ""} />
                </button>
              </div>

              {/* Day headers */}
              <div className="mb-1 grid grid-cols-7 text-center">
                {SHORT_DAYS_MON_START.map((d) => (
                  <p key={d} className="text-[11px] font-semibold text-muted-foreground py-1">
                    {d}
                  </p>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="mb-5 overflow-hidden rounded-xl card-surface">
                {monthGrid.map((week, wi) => (
                  <div key={wi} className={cn("grid grid-cols-7", wi > 0 && "border-t border-black/[0.06]")}>
                    {week.map((cell, ci) => {
                      if (!cell.date) {
                        return <div key={ci} className="aspect-square" />;
                      }
                      const isToday = cell.date === todayStr;
                      const isSelected = cell.date === selected;
                      const hasContent = contentDates.has(cell.date);
                      const isPast = cell.date < todayStr;
                      return (
                        <button
                          key={cell.date}
                          onClick={() => setSelected(cell.date!)}
                          className={cn(
                            "flex aspect-square flex-col items-center justify-center gap-0.5 transition-colors active:bg-black/[0.06]",
                            ci > 0 && "border-l border-black/[0.06]",
                            isSelected && "bg-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[14px] font-semibold",
                              isSelected
                                ? "text-primary-foreground"
                                : isToday
                                ? "text-[#0F7FFF]"
                                : isPast
                                ? "text-muted-foreground"
                                : "text-foreground",
                            )}
                          >
                            {cell.n}
                          </span>
                          <span
                            className="size-1 rounded-full"
                            style={{
                              background: hasContent
                                ? isSelected
                                  ? "#FEEA3D"
                                  : "#0F7FFF"
                                : "transparent",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <DaySection date={selected} items={dayItems} />
              <SeriesSection openSeries={openSeries} setOpenSeries={setOpenSeries} />
            </>
          )}

          {/* FAB */}
          <button
            className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-[max(16px,calc(50%-244px))] z-40 inline-flex min-h-[52px] items-center rounded-full bg-primary px-5 text-[16px] font-medium text-primary-foreground active:scale-95 transition-transform"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.16)" }}
          >
            + Planning
          </button>
        </>
      ) : (
        /* ── ANALYTICS TAB ─────────────────────────────────── */
        <>
          {stats.length === 0 ? (
            <Card>
              <p className="text-center text-[15px] text-muted-foreground py-4">
                Abhi koi analytics data nahi hai. Jab content publish hoga, yahan dikhega.
              </p>
            </Card>
          ) : (
            <>
              <Card className="mb-4">
                <p className="text-[14px] text-muted-foreground">Is hafte ka total</p>
                <div className="mt-2 flex justify-between">
                  {[
                    ["Views", totals.views.toLocaleString("en-IN")],
                    ["Likes", totals.likes.toLocaleString("en-IN")],
                    ["Comments", totals.comments.toLocaleString("en-IN")],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[20px] font-bold">{v}</p>
                      <p className="text-[14px] text-muted-foreground">{k}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-col gap-2.5 pb-4">
                {stats.map((s, i) => (
                  <Card key={s.id}>
                    <p className="text-[17px] font-bold">{s.title}</p>
                    <p className="mt-0.5 text-[14px] text-muted-foreground">{s.platform}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(
                        [
                          ["Views", "views"],
                          ["Likes", "likes"],
                          ["Watch Time", "watch"],
                          ["Comments", "comments"],
                        ] as const
                      ).map(([label, key]) => (
                        <label key={key} className="block">
                          <span className="text-[14px] text-muted-foreground">{label}</span>
                          <input
                            inputMode={key === "watch" ? "text" : "numeric"}
                            className="mt-1 min-h-[48px] w-full rounded-lg bg-background px-3 text-[16px] outline-none focus:ring-2 focus:ring-[#0F7FFF]"
                            value={String(s[key])}
                            onChange={(e) => {
                              const v = e.target.value;
                              setStats((prev) =>
                                prev.map((row, idx) =>
                                  idx === i
                                    ? { ...row, [key]: key === "watch" ? v : Number(v.replace(/\D/g, "")) || 0 }
                                    : row,
                                ),
                              );
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </Card>
                ))}
                <Pill variant="secondary" className="w-full">Save karo</Pill>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DaySection({ date, items }: { date: string; items: ReturnType<typeof contents.filter> }) {
  const label = date === todayStr ? "Aaj" : formatDateLabel(date);
  return (
    <section className="mb-7">
      <SectionHeading title={`${label} ka content`} />
      <div className="flex flex-col gap-2.5">
        {items.length === 0 ? (
          <Card>
            <p className="text-center text-[15px] text-muted-foreground py-2">
              Is din koi content planned nahi hai.
            </p>
          </Card>
        ) : (
          items.map((c) => (
            <Card key={c.id}>
              <StatusBadge status={c.status} />
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[17px] font-bold leading-snug">{c.title}</p>
                  <p className="mt-1 text-[14px] text-muted-foreground">
                    {c.platform} · {c.series}
                  </p>
                </div>
                <OpenLink to="/content/$id" params={{ id: c.id }} />
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

function SeriesSection({
  openSeries,
  setOpenSeries,
}: {
  openSeries: string | null;
  setOpenSeries: (id: string | null) => void;
}) {
  return (
    <section className="mb-4">
      <SectionHeading title="Series" />
      {series.length === 0 ? (
        <Card>
          <p className="text-center text-[15px] text-muted-foreground py-2">
            Koi series abhi shuru nahi ki hai.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5 pb-24">
          {series.map((s) => (
            <Card key={s.id}>
              <button
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setOpenSeries(openSeries === s.id ? null : s.id)}
              >
                <div>
                  <p className="text-[17px] font-bold">{s.name}</p>
                  <p className="mt-0.5 text-[14px] text-muted-foreground">
                    Day {s.done} of {s.total}
                  </p>
                </div>
                <span className="text-[18px] text-muted-foreground">
                  {openSeries === s.id ? "−" : "+"}
                </span>
              </button>
              <div className="mt-3 h-2 w-full rounded-full bg-black/[0.07]">
                <div
                  className="h-2 rounded-full bg-[#0F7FFF]"
                  style={{ width: `${(s.done / s.total) * 100}%` }}
                />
              </div>
              {openSeries === s.id && (
                <p className="mt-3 text-[14px] text-muted-foreground">
                  Agla episode: Day {s.done + 1}. Script AI taiyaar kar raha hai.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const HINDI_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${HINDI_MONTHS_SHORT[d.getMonth()]}`;
}
