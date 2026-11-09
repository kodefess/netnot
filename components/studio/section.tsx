import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Bahasa komponen JOYCO Hub: blok kotak bercelah 2px, label Roboto Mono
// kapital, input berlatar segmen dengan garis fokus biru di dalam.

export const controlClass =
  "h-10 rounded-none border-0 bg-surface-2 px-3 text-[15px] shadow-none transition-[background-color,box-shadow] placeholder:text-muted-foreground/70 hover:bg-surface-3 focus-visible:bg-surface-2 focus-visible:shadow-[inset_0_0_0_1.5px_var(--brand)] focus-visible:ring-0 aria-invalid:shadow-[inset_0_0_0_1.5px_var(--danger)] md:text-sm";

/** Label mono kecil kapital, dipakai di strip, field, dan badge. */
export const monoLabel = "font-mono text-[11px] uppercase tracking-[0.06em]";

/** Kotak ikon persegi dalam strip. */
export const boxClass = "grid size-10 shrink-0 place-items-center bg-surface-2 text-muted-foreground";

/** Tombol segmen di dalam strip (aksi sekunder). */
export const segButton = cn(
  monoLabel,
  "flex h-10 shrink-0 items-center gap-1.5 bg-surface-2 px-3 text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
);

/** Tombol utama biru. */
export const primaryButton = cn(
  monoLabel,
  "flex h-10 shrink-0 items-center justify-between gap-2 bg-brand px-3 font-semibold text-brand-foreground transition-[filter] hover:brightness-115 disabled:pointer-events-none disabled:opacity-60",
);

/** Badge gelap kecil, seperti angka di header kartu JOYCO Hub. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 bg-background px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-normal text-foreground normal-case tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Bracket sudut biru — detail khas panel JOYCO. */
export function Corners() {
  const base = "pointer-events-none absolute size-2.5 border-brand";
  return (
    <>
      <i aria-hidden className={cn(base, "top-1.5 left-1.5 border-t-[1.5px] border-l-[1.5px]")} />
      <i aria-hidden className={cn(base, "top-1.5 right-1.5 border-t-[1.5px] border-r-[1.5px]")} />
      <i aria-hidden className={cn(base, "bottom-1.5 left-1.5 border-b-[1.5px] border-l-[1.5px]")} />
      <i aria-hidden className={cn(base, "right-1.5 bottom-1.5 border-r-[1.5px] border-b-[1.5px]")} />
    </>
  );
}

/** Ikon wajik empat petak, seperti di pojok JOYCO Hub. */
export function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("size-4 rotate-45", className)}>
      <rect x="4" y="4" width="4" height="4" className="fill-foreground" />
      <rect x="8" y="8" width="4" height="4" className="fill-brand" />
      <rect x="8" y="4" width="4" height="4" className="fill-background" />
      <rect x="4" y="8" width="4" height="4" className="fill-background" />
    </svg>
  );
}

export function Section({
  id,
  icon: Icon,
  title,
  meta,
  description,
  actions,
  children,
  className,
}: {
  id?: string;
  icon: LucideIcon;
  title: string;
  meta?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 flex flex-col gap-[2px]", className)} aria-label={title}>
      <header className="flex gap-[2px]">
        <span className={boxClass}>
          <Icon className="size-4" />
        </span>
        <h2
          className={cn(
            monoLabel,
            "flex min-w-0 flex-1 items-center justify-between gap-3 bg-surface-2 px-3 text-muted-foreground",
          )}
        >
          <span className="truncate">{title}</span>
          {meta !== undefined && <Kbd>{meta}</Kbd>}
        </h2>
        {actions}
      </header>
      <div className="bg-surface p-4 sm:p-5">
        {description && <p className="mb-4 text-[13px] text-muted-foreground">{description}</p>}
        {children}
      </div>
    </section>
  );
}

export function FieldShell({
  id,
  label,
  children,
  className,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={id} className={cn(monoLabel, "text-muted-foreground")}>
        {label}
      </Label>
      {children}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <FieldShell id={id} label={label} className={className}>
      <div className="flex gap-[2px]">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlClass, "min-w-0 flex-1")}
        />
        {suffix}
      </div>
    </FieldShell>
  );
}
