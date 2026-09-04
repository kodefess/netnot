"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Kelas dasar untuk Input & Select agar warna, radius, dan ring fokusnya
// mengikuti tema studio (lewat CSS var --ink/--paper/--accent/
// --control-radius di-set pada elemen <main>), bukan gaya shadcn default.
export const controlClass =
  "h-11 w-full rounded-[var(--control-radius)] border border-[color:var(--ink)]/14 bg-[color:var(--panel)] px-3.5 text-[15px] text-[color:var(--ink)] shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--ink)]/35 focus-visible:ring-4 focus-visible:ring-[color:var(--accent)]/15 focus-visible:ring-offset-0";

export function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={controlClass}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function FieldGroup({
  title,
  span,
  children,
}: {
  title: string;
  span?: "full";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("field-group", span === "full" && "field-group-full")}>
      <h4>{title}</h4>
      <div className="field-group-grid">{children}</div>
    </div>
  );
}

export function StepHeading({
  index,
  title,
  description,
  meta,
}: {
  index: number;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="step-heading">
      <span className="step-index">{index}</span>
      <div className="step-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {meta && (
        <span className="step-meta">
          <span className="step-meta-dot" />
          {meta}
        </span>
      )}
    </div>
  );
}
