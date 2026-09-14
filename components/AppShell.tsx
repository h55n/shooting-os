"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bot, CalendarDays, FileText, GraduationCap, Home, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstallBanner } from "@/components/InstallBanner";

const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/plan", label: "Plan", Icon: CalendarDays },
  { href: "/content", label: "Content", Icon: FileText },
  { href: "/masterclass", label: "Masterclass", Icon: GraduationCap },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isAuthPage = path === "/login" || path === "/signup" || path === "/reset-password";
  const isShootingView = path.includes("/shoot");

  if (isShootingView) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background">
      <div className="h-[env(safe-area-inset-top)] shrink-0 bg-background" />
      <InstallBanner />

      <main
        className={cn(
          "flex-1 overflow-y-auto px-4 pt-6",
          !isAuthPage && "pb-[calc(88px+env(safe-area-inset-bottom))]"
        )}
      >
        {children}
      </main>

      {!isAuthPage && (
        <>
          <Link
            href="/assistant"
            aria-label="Open Assist"
            className="fixed bottom-[calc(86px+env(safe-area-inset-bottom))] left-1/2 z-40 ml-[196px] flex size-12 -translate-x-full items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95 max-[440px]:ml-[calc(50%-16px)]"
          >
            <Bot size={22} />
          </Link>

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
                      "flex min-h-[52px] min-w-[60px] flex-col items-center justify-start gap-1 rounded-xl pt-1 transition-colors active:bg-black/[0.05]",
                      active ? "text-[#0F7FFF]" : "text-muted-foreground"
                    )}
                  >
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                    <span className={cn("text-[10px] font-semibold", active && "font-bold")}>{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
