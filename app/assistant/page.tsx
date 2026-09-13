"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, ArrowUp, RefreshCw } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const chips = [
  "Aaj kya karna chahiye?",
  "Ek naya content idea do",
  "Trigger control ke baare mein batao",
  "Masterclass plan kya hai?",
];

export default function Help() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const conversationHistory = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;

    setError(null);
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setThinking(true);

    // Add to history for context
    conversationHistory.current.push({ role: "user", content: q });

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          conversationHistory: conversationHistory.current.slice(-8),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Server error");
      }

      const reply = data.reply as string;
      conversationHistory.current.push({ role: "assistant", content: reply });
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    } catch (e) {
      const errMsg =
        e instanceof Error && e.message.includes("fetch")
          ? "Network error — internet check karein."
          : "Kuch gadbad ho gayi. Dobara try karein.";
      setError(errMsg);
      // Remove the user message that failed
      conversationHistory.current.pop();
      setMsgs((m) => m.slice(0, -1));
    } finally {
      setThinking(false);
    }
  };

  const clearChat = () => {
    setMsgs([]);
    setError(null);
    conversationHistory.current = [];
  };

  return (
    <>
      <div className="flex min-h-[calc(100dvh-140px)] flex-col -mx-4 -mt-6 px-4 pt-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="page-title">AI Help</h1>
            <p className="mt-0.5 text-[14px] text-muted-foreground">
              M N Rehman ke baare mein sab kuch jaanta hai
            </p>
          </div>
          {msgs.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-[13px] text-muted-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08)] active:scale-95 transition-transform"
            >
              <RefreshCw size={13} />
              Naya
            </button>
          )}
        </div>

        <div className="flex-1 space-y-4 pb-4">
          {msgs.length === 0 && !thinking && (
            <div className="rounded-2xl bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <p className="text-[24px]">🤖</p>
              <p className="mt-2 text-[17px] font-bold leading-snug">
                Namaskar, Rehman Sahab!
              </p>
              <p className="mt-1.5 text-[15px] leading-[24px] text-muted-foreground">
                Main aapka AI assistant hoon. Aapke shooting career, content ideas, scripts,
                masterclass planning — sab mein help kar sakta hoon.
              </p>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Hindi, Hinglish, ya English — jaise chahe poochhiye.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-[#FFF1F0] px-4 py-3 text-[15px] text-[#D92D20]">
              ⚠️ {error}
            </div>
          )}

          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[82%] rounded-2xl bg-foreground px-4 py-3 text-[17px] leading-[26px] text-background">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={i}>
                <p className="mb-1.5 text-[12px] font-semibold text-muted-foreground">
                  🤖 Shooter AI
                </p>
                <div className="max-w-[90%] rounded-2xl bg-card px-4 py-3 text-[17px] leading-[28px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                  {m.text.split("\n").map((line, li) => (
                    <p key={li} className={li > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ),
          )}

          {thinking && (
            <div>
              <p className="mb-1.5 text-[12px] font-semibold text-muted-foreground">
                🤖 Shooter AI
              </p>
              <p className="inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-[16px] text-muted-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <span className="size-2 animate-bounce rounded-full bg-[#0F7FFF]" style={{ animationDelay: "0ms" }} />
                <span className="size-2 animate-bounce rounded-full bg-[#0F7FFF]" style={{ animationDelay: "150ms" }} />
                <span className="size-2 animate-bounce rounded-full bg-[#0F7FFF]" style={{ animationDelay: "300ms" }} />
              </p>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 z-30 w-full max-w-[520px] -translate-x-1/2 bg-background px-4 pb-2 pt-2">
        {msgs.length === 0 && (
          <div className="no-scrollbar -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="card-surface min-h-[40px] shrink-0 rounded-full px-4 text-[14px] active:scale-95 transition-transform"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
        >
          <button
            type="button"
            className="grid size-[48px] shrink-0 place-items-center rounded-full text-muted-foreground"
          >
            <Mic size={22} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kuch bhi poochhiye..."
            className="min-h-[48px] flex-1 bg-transparent text-[17px] outline-none"
            disabled={thinking}
          />
          <button
            type="submit"
            className="grid size-[48px] shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-transform active:scale-95"
            disabled={!input.trim() || thinking}
          >
            <ArrowUp size={22} />
          </button>
        </form>
      </div>
    </>
  );
}
