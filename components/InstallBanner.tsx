"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("install-dismissed")) return;

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone === true) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    if (ios) {
      setIsIOS(true);
      setShowIOS(true);
      return;
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("install-dismissed", "1");
    setDismissed(true);
    setPrompt(null);
    setShowIOS(false);
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") dismiss();
    else setPrompt(null);
  };

  // Nothing to show
  if (dismissed) return null;
  if (!prompt && !showIOS) return null;

  return (
    <div className="fixed top-[env(safe-area-inset-top)] left-1/2 z-50 w-full max-w-[520px] -translate-x-1/2 px-3 pt-3">
      <div className="flex items-start gap-3 rounded-2xl bg-[#0F172A] px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[22px]">
          🎯
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-white">Shooter OS install karein</p>
          {isIOS ? (
            <p className="mt-0.5 text-[13px] leading-[20px] text-white/60">
              Safari mein{" "}
              <span className="font-semibold text-white/80">Share → Add to Home Screen</span>{" "}
              karein
            </p>
          ) : (
            <p className="mt-0.5 text-[13px] text-white/60">
              Phone pe app ki tarah install karein
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {!isIOS && prompt && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-[#0F172A] active:scale-95 transition-transform"
            >
              <Download size={14} />
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            className="grid size-8 place-items-center rounded-full text-white/40 hover:text-white/70"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
