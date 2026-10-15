import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-10 rounded-lg border-input bg-surface px-3 text-[15px] shadow-none transition-[border-color,box-shadow] hover:border-foreground/25 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15 md:text-sm";

export function Section({
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border bg-surface shadow-panel", className)}
      aria-label={title}
    >
      <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] leading-tight font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
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
      <Label htmlFor={id} className="text-[13px] font-medium text-muted-foreground">
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
      <div className="relative">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlClass, suffix && "pr-28")}
        />
        {suffix && <div className="absolute inset-y-0 right-1 flex items-center">{suffix}</div>}
      </div>
    </FieldShell>
  );
}
