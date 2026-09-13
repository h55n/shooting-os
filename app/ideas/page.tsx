"use client";

import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { Card, PageHeader, Pill, StatusBadge, TabSwitcher } from "@/components/kit";
import { trends } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Ideas() {
  const [tab, setTab] = useState<"mere" | "trends">("mere");
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        if (data.ideas) {
          setIdeas(data.ideas);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveIdea = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: text }),
      });
      const data = await res.json();
      if (data.ok && data.ideaId) {
        // Fetch fresh ideas
        const updated = await fetch("/api/ideas").then((r) => r.json());
        if (updated.ideas) setIdeas(updated.ideas);
        setComposing(false);
        setText("");
      } else {
        alert(data.error || "Failed to save idea");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Ideas" subtitle="Bas idea dijiye — baaki AI karega" />

      {composing ? (
        <Card className="mb-5">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            disabled={saving}
            placeholder="Idea likhein... jaise: 'trigger squeeze ki galti' ya koi bhi topic jo aap cover karna chahte hain"
            className="w-full resize-none bg-transparent text-[17px] leading-[28px] outline-none"
          />
          <div className="mt-4 flex gap-2">
            <Pill
              className="flex-1"
              onClick={saveIdea}
            >
              {saving ? "Saving..." : "Save karo"}
            </Pill>
            <Pill variant="secondary" onClick={() => setComposing(false)}>
              Cancel
            </Pill>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setComposing(true)}
          className="mb-5 flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 text-[16px] font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.16)" }}
        >
          <Mic size={20} />
          💡 Naya Idea Dijiye
        </button>
      )}

      <div className="mb-5">
        <TabSwitcher
          value={tab}
          onChange={setTab}
          options={[
            { value: "mere", label: "Mere Ideas" },
            { value: "trends", label: "Trends" },
          ]}
        />
      </div>

      {tab === "mere" ? (
        loading ? (
          <div className="text-center p-6 text-muted-foreground">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
            <p className="text-[36px]">💡</p>
            <p className="mt-3 text-[17px] font-bold">Abhi koi idea nahi hai</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Upar button se apna pehla idea dijiye — AI expand kar dega.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pb-4">
            {ideas.map((idea) => (
              <Card key={idea.id}>
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={idea.status.toUpperCase()} />
                  <span className="text-[14px] text-muted-foreground">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Link href={`/ideas/${idea.id}`} className="mt-2 block">
                  <p className="text-[17px] font-bold leading-snug">{idea.normalized_idea || idea.raw_input}</p>
                  <p className="mt-1 text-[14px] text-muted-foreground">AI Processed</p>
                </Link>
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {["Expand", "Research", "Plan mein daalo"].map((a) => (
                    <Pill
                      key={a}
                      variant="secondary"
                      className="min-h-[44px] shrink-0 px-4 text-[14px]"
                      onClick={() => router.push(`/ideas/${idea.id}`)}
                    >
                      {a}
                    </Pill>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        trends.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
            <p className="text-[36px]">📡</p>
            <p className="mt-3 text-[17px] font-bold">Abhi koi trend nahi hai</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              AI automatically trends dhundhta rahega. Thodi der mein check karein.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pb-4">
            {trends.map((t) => (
              <Card key={t.id}>
                <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[12px] font-semibold text-[#0F7FFF]">
                  {t.source}
                </span>
                <p className="mt-2 text-[17px] font-bold leading-snug">{t.title}</p>
                <Pill variant="secondary" className="mt-3 min-h-[44px] text-[14px]">
                  Idea banao
                </Pill>
              </Card>
            ))}
          </div>
        )
      )}
    </>
  );
}
