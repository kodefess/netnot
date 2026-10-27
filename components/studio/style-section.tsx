"use client";

import { Check, Palette, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import { type Theme, randomTheme, themes } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function StyleSection({ receipt }: { receipt: ReceiptStore }) {
  const { theme, set } = receipt;

  return (
    <Section
      icon={Palette}
      title="Style"
      description="All in brand blue — each style has its own layout and typeface."
      actions={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => set("themeId", randomTheme(theme.id).id)}
          className="h-8 gap-1.5 px-2.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <Shuffle className="size-3.5" /> Surprise me
        </Button>
      }
    >
      <div role="radiogroup" aria-label="Receipt style" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {themes.map((t) => (
          <ThemeTile
            key={t.id}
            theme={t}
            active={t.id === theme.id}
            onSelect={() => set("themeId", t.id)}
          />
        ))}
      </div>
    </Section>
  );
}

function ThemeTile({
  theme,
  active,
  onSelect,
}: {
  theme: Theme;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-surface text-left transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-panel",
        active && "border-brand ring-2 ring-brand/25 hover:border-brand",
      )}
    >
      {/* Mini nota: semua tema biru, jadi yang ditonjolkan adalah susunan
          (layout) dan typeface-nya. */}
      <span
        className={cn("relative block h-24 overflow-hidden", `pattern-${theme.pattern}`)}
        style={
          {
            "--receipt-ink": theme.ink,
            backgroundColor: theme.paper,
            color: theme.ink,
          } as React.CSSProperties
        }
      >
        <LayoutSketch theme={theme} />
        {active && (
          <span className="absolute top-2.5 right-2 grid size-5 place-items-center rounded-full bg-brand text-brand-foreground">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="block border-t px-3 py-2">
        <span className="block text-[13px] font-semibold">{theme.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{theme.vibe}</span>
      </span>
    </button>
  );
}

/** Sketsa kecil susunan nota per layout, memakai font asli tema. */
function LayoutSketch({ theme }: { theme: Theme }) {
  const { ink, accent, onAccent, font, weight, layout, caps } = theme;
  const type = (size: string, color = ink) => ({
    fontFamily: font,
    fontWeight: weight,
    fontSize: size,
    color,
    textTransform: caps ? ("uppercase" as const) : undefined,
    lineHeight: 1,
  });
  const line = (w: string, o = 0.3, color = ink) => (
    <span className="block h-1 rounded-full" style={{ width: w, background: color, opacity: o }} />
  );
  const lines = (
    <span className="flex flex-col gap-1.5">
      <span className="flex justify-between">{line("55%")}{line("20%")}</span>
      <span className="flex justify-between">{line("40%")}{line("25%", 0.6)}</span>
    </span>
  );

  switch (layout) {
    case "swiss":
      return (
        <span className="block px-3 pt-2.5">
          <span className="flex items-center gap-1">
            <span className="block size-2.5 rounded-[3px]" style={{ background: accent }} />
            <span className="ml-auto">{line("22%", 0.6, accent)}</span>
          </span>
          <span className="mt-1.5 block tracking-tighter" style={type("20px")}>Aa</span>
          <span className="mt-1.5 grid grid-cols-2 border-t" style={{ borderColor: ink }}>
            <span className="block h-2.5 border-r border-b" style={{ borderColor: `${ink}22` }} />
            <span className="block h-2.5 border-b" style={{ borderColor: `${ink}22` }} />
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <span className="font-mono text-[7px]" style={{ color: accent }}>01</span>
            {line("45%")}
          </span>
        </span>
      );
    case "card":
      return (
        <span className="block px-2.5 pt-2.5">
          <span
            className="relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden rounded-md p-1.5"
            style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 72%, #000))` }}
          >
            <span className="flex items-center gap-1">
              <span className="block size-1.5 rounded-[2px]" style={{ background: onAccent }} />
              <span style={type("8px", onAccent)}>Aa</span>
            </span>
            <span className="block h-1.5 w-2.5 rounded-[2px]" style={{ background: onAccent, opacity: 0.85 }} />
            <span className="block h-0.5 w-3/4 rounded-full" style={{ background: onAccent, opacity: 0.6 }} />
          </span>
        </span>
      );
    case "hub": {
      const seg = `color-mix(in srgb, ${ink} 14%, ${theme.paper})`;
      return (
        <span className="flex flex-col gap-[2px] p-2">
          <span className="flex h-3.5 gap-[2px]">
            <span className="w-3.5" style={{ background: accent }} />
            <span className="flex flex-1 items-center justify-end pr-1" style={{ background: seg }}>
              <span className="block h-1.5 w-3 border" style={{ borderColor: `${ink}55` }} />
            </span>
          </span>
          <span className="mt-1 block" style={type("15px")}>Aa</span>
          {[0, 1].map((i) => (
            <span key={i} className="flex h-2.5 gap-[2px]">
              <span className="w-2.5" style={{ background: seg }} />
              <span className="flex flex-1 items-center justify-end pr-0.5" style={{ background: seg }}>
                <span className="block h-1.5 w-4" style={{ background: theme.paper }} />
              </span>
            </span>
          ))}
        </span>
      );
    }
    case "folio":
      return (
        <span className="absolute inset-1.5 flex flex-col items-center border pt-1.5" style={{ borderColor: `${ink}99` }}>
          <span
            className="grid size-5 place-items-center rounded-full border italic"
            style={{ ...type("11px"), borderColor: accent }}
          >
            A
          </span>
          <span className="mt-1 italic" style={type("16px")}>Aa</span>
          <span className="mt-1 flex items-center gap-1 text-[6px]" style={{ color: ink }}>
            <span className="block w-4 border-t" style={{ borderColor: `${ink}66` }} />✦
            <span className="block w-4 border-t" style={{ borderColor: `${ink}66` }} />
          </span>
        </span>
      );
    case "poster":
      return (
        <>
          <span className="block px-3 pt-2.5 pb-2" style={{ background: accent }}>
            <span className="block text-[22px] tracking-tight" style={type("22px", onAccent)}>
              Aa
            </span>
          </span>
          <span className="block px-3 pt-2.5">{lines}</span>
        </>
      );
    case "ticket":
      return (
        <span className="flex flex-col items-center gap-1.5 px-3 pt-3">
          <span style={type("15px")}>Aa</span>
          <span className="flex w-full items-end gap-1">
            {line("30%")}
            <span className="mb-px flex-1 border-b border-dotted" style={{ borderColor: ink, opacity: 0.5 }} />
            {line("18%", 0.6)}
          </span>
          <span className="flex h-3.5 w-3/4 gap-[2px]" style={{ opacity: 0.8 }}>
            {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2].map((w, i) => (
              <span key={i} style={{ width: w, background: ink }} />
            ))}
          </span>
        </span>
      );
    case "table":
      return (
        <span className="block px-3 pt-3">
          <span className="block" style={type("18px")}>Aa</span>
          <span className="mt-2 grid grid-cols-3 border" style={{ borderColor: ink }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-3"
                style={{ borderLeft: i ? `1px solid ${ink}` : undefined }}
              />
            ))}
          </span>
          <span className="mt-1.5 block border-b pb-1" style={{ borderColor: ink }}>
            {line("60%")}
          </span>
        </span>
      );
    case "wallet":
      return (
        <span className="flex flex-col items-center gap-1 px-3 pt-2.5">
          <span
            className="block size-6 rounded-full"
            style={{ background: "conic-gradient(#1337ff, #b9c6ff, #1337ff, #dfe6ff, #1337ff)" }}
          />
          <span style={type("17px")}>50.000</span>
          {line("45%", 0.2)}
        </span>
      );
    case "margin":
      return (
        <span className="flex h-full">
          <span className="flex w-5 items-end justify-center pb-2" style={{ background: accent }}>
            <span
              className="block"
              style={{ ...type("10px", onAccent), writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Aa
            </span>
          </span>
          <span className="block flex-1 px-3 pt-3">
            <span className="block" style={type("18px")}>Aa</span>
            <span className="mt-2 block">{lines}</span>
          </span>
        </span>
      );
    default:
      return (
        <span className="block px-3 pt-3">
          <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
          <span className="block" style={type("22px")}>Aa</span>
          <span className="mt-2.5 block">{lines}</span>
        </span>
      );
  }
}
