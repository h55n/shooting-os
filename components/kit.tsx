import Link from "next/link";
import type { ReactNode } from "react";
import { statusStyle, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Status }) {
  const s = statusStyle[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg, fontWeight: s.bold ? 700 : 600 }}
    >
      {s.dot && (
        <span
          className="size-1.5 animate-pulse rounded-full"
          style={{ background: s.fg }}
        />
      )}
      {status.replace("_", " ")}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card-surface p-3 px-4", className)}>{children}</div>;
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Pill({ children, onClick, variant = "primary", className, type = "button", disabled }: BtnProps) {
  const styles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-card text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.12)]",
    danger: "bg-card text-[#D92D20] shadow-[0_0_0_1px_#D92D20]",
    ghost: "text-[#0F7FFF]",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 text-[16px] font-medium transition-opacity active:opacity-70 disabled:opacity-40",
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  );
}

export function TabSwitcher<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-full bg-black/[0.06] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-[40px] flex-1 rounded-full px-4 text-[15px] font-medium transition-colors",
            value === o.value ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function OpenLink({ to, params }: { to: string; params?: Record<string, string> }) {
  return (
    <Link
      href={params?.id ? to.replace('$id', params.id) : to}
      className="inline-flex min-h-[40px] shrink-0 items-center rounded-full bg-primary px-4 text-[14px] font-medium text-primary-foreground"
    >
      Kholo →
    </Link>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Loading({ text = "Abhi ho raha hai..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
      <span className="size-2 animate-bounce rounded-full bg-[#0F7FFF]" />
      {text}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onCancel}>
      <div
        className="w-full rounded-t-2xl bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[18px] font-bold">{title}</h3>
        <p className="mt-2 text-[14px] text-muted-foreground">{body}</p>
        <div className="mt-5 flex gap-2">
          <Pill variant="secondary" className="flex-1" onClick={onCancel}>
            Nahi, rehne do
          </Pill>
          <Pill variant="danger" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Pill>
        </div>
      </div>
    </div>
  );
}
