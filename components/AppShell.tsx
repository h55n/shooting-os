"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, CalendarDays, Lightbulb, FileText, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstallBanner } from "@/components/InstallBanner";

const tabs = [
  { href: "/", label: "Ghar", Icon: Home },
  { href: "/plan", label: "Plan", Icon: CalendarDays },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/content", label: "Content", Icon: FileText },
  { href: "/assistant", label: "Help", Icon: Bot },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();

  const isAuthPage = path === '/login' || path === '/signup';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background">
      {/* Safe-area top spacer for notched phones */}
      <div className="h-[env(safe-area-inset-top)] shrink-0 bg-background" />

      {/* PWA install banner */}
      <InstallBanner />

      <main
        className={cn(
          "flex-1 overflow-y-auto px-4 pt-6",
          !isAuthPage && "pb-[calc(80px+env(safe-area-inset-bottom))]"
        )}
      >
        {children}
      </main>

      {!isAuthPage && (
        <nav
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-[520px] -translate-x-1/2 bg-card"
        style={{ boxShadow: "0 -1px 0 rgba(0,0,0,0.08)" }}
      >
        <div
          className="flex items-start justify-around pt-2"
          style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
        >
          {tabs.map(({ href, label, Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-[52px] min-w-[60px] flex-col items-center justify-start gap-1 pt-1 rounded-xl transition-colors active:bg-black/[0.05]",
                  active ? "text-[#0F7FFF]" : "text-muted-foreground",
                )}
              >
                <Icon size={26} strokeWidth={active ? 2.5 : 2} />
                <span className={cn("text-[11px] font-semibold", active && "font-bold")}>{label}</span>
              </Link>
            );
          })}
        </div>
        </nav>
      )}
    </div>
  );
}
