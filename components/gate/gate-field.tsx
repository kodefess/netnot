"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Field khusus untuk gate/login page. Dipisah dari <Field> milik
 * receipt-builder karena konteksnya beda (satu input, tanpa grid),
 * dan supaya token warnanya eksplisit memakai var yang benar-benar
 * ada di globals.css (--app-ink / --app-panel / --app-accent / --app-line),
 * bukan --ink / --panel / --control-radius yang tidak pernah didefinisikan.
 */
export function FieldGate({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
  className,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label
          htmlFor={id}
          className="text-[13px] font-medium text-[var(--app-ink)]/75"
        >
          {label}
        </Label>
      )}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={cn(
          "h-10 w-full rounded-lg border border-[var(--app-line-strong)] bg-[var(--app-panel)] px-4",
          "text-[15px] text-[var(--app-ink)] shadow-none",
          "transition-[border-color,box-shadow] duration-150",
          "placeholder:text-[var(--app-ink)]/35",
          "outline-none",
          "focus-visible:border-[var(--app-accent)] focus-visible:ring-4 focus-visible:ring-[var(--app-accent)]/12",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      />
    </div>
  );
}
