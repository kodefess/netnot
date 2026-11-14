"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { boxClass, controlClass, monoLabel } from "@/components/studio/section";
import { cn } from "@/lib/utils";

/**
 * Input teks bebas + daftar pilihan siap pakai. Tombol panah membuka semua
 * pilihan; saat mengetik, daftar menyaring pilihan yang cocok. Nilai yang
 * tidak ada di daftar tetap boleh (custom).
 */
export function ComboInput({
  value,
  onChange,
  options,
  placeholder,
  className,
  inputProps,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  inputProps?: React.ComponentProps<"input"> & Record<`data-${string}`, unknown>;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState(-1);

  const query = value.trim().toLowerCase();
  const filtered =
    showAll || !query ? options : options.filter((o) => o.toLowerCase().includes(query));
  const visible = open && filtered.length > 0;

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && visible && active >= 0) {
      e.preventDefault();
      pick(filtered[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative flex gap-[2px]", className)}>
      <Input
        {...inputProps}
        ref={inputRef}
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setShowAll(false);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        className={cn(controlClass, "min-w-0 flex-1", inputProps?.className)}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Show presets"
        title="Show presets"
        // mousedown dicegah supaya input tidak kehilangan fokus (dropdown tetap terbuka).
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setShowAll(true);
          setOpen((o) => !o);
          setActive(-1);
          inputRef.current?.focus();
        }}
        className={cn(boxClass, "h-auto transition-colors hover:bg-surface-3 hover:text-foreground")}
      >
        <ChevronDown className={cn("size-4 transition-transform", visible && "rotate-180")} />
      </button>

      {visible && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-[2px] bg-surface-2 p-[2px] shadow-[0_12px_24px_-12px_rgb(0_0_0/0.5)] ring-1 ring-border"
        >
          <li className={cn(monoLabel, "px-2.5 pt-1.5 pb-1 text-[10px] text-muted-foreground")} aria-hidden>
            Presets
          </li>
          {filtered.map((option, i) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(option)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 px-2.5 py-2 text-sm",
                  i === active ? "bg-surface-3 text-foreground" : "text-foreground/85",
                )}
              >
                {option}
                {selected && <Check className="size-3.5 text-brand-text" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
