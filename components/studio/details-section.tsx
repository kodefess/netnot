"use client";

import { useRef, useState } from "react";
import { Dices, Hash, ImageUp, LoaderCircle, Store, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { FieldShell, Section, TextField, controlClass } from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import { currencies, isoToFlag, pickThankYou } from "@/lib/receipt-utils";
import { cn } from "@/lib/utils";

const MAX_LOGO_BYTES = 2_000_000;

export function DetailsSection({ receipt }: { receipt: ReceiptStore }) {
  const { draft, set, totals } = receipt;
  const toast = useToast();
  const [generating, setGenerating] = useState(false);

  const generateNumber = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: draft.store,
          title: draft.title,
          payment: draft.payment,
          currency: draft.currency,
          items: draft.items,
          total: totals.total,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { receiptNumber: string } = await res.json();
      set("order", data.receiptNumber);
      toast({ message: `Receipt number ${data.receiptNumber} saved.`, tone: "success" });
    } catch (error) {
      console.error("Failed to generate receipt number", error);
      toast({ message: "Couldn't generate a receipt number. Try again.", tone: "error" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Section icon={Store} title="Details" description="Who's selling, and how it was paid.">
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <TextField
          id="store-name"
          label="Store name"
          value={draft.store}
          onChange={(v) => set("store", v)}
          placeholder="Your store"
        />
        <TextField
          id="receipt-title"
          label="Receipt title"
          value={draft.title}
          onChange={(v) => set("title", v)}
          placeholder="Payment receipt"
        />

        <LogoField
          logo={draft.logo}
          onChange={(logo) => set("logo", logo)}
          onError={(message) => toast({ message, tone: "error" })}
        />

        <TextField
          id="order-number"
          label="Receipt no."
          value={draft.order}
          onChange={(v) => set("order", v)}
          placeholder="0001"
          suffix={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateNumber}
              disabled={generating}
              className="h-8 gap-1.5 px-2.5 text-[13px] text-muted-foreground hover:text-foreground"
            >
              {generating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Hash className="size-3.5" />
              )}
              Generate
            </Button>
          }
        />
        <TextField
          id="receipt-date"
          label="Date"
          value={draft.date}
          onChange={(v) => set("date", v)}
          placeholder="DD.MM.YYYY"
        />
        <TextField
          id="payment-method"
          label="Payment method"
          value={draft.payment}
          onChange={(v) => set("payment", v)}
          placeholder="Cash, QRIS, card…"
        />

        <FieldShell id="currency" label="Currency">
          <Select value={draft.currency} onValueChange={(v) => v && set("currency", v)}>
            <SelectTrigger id="currency" className={cn(controlClass, "w-full justify-between")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="p-1">
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code} className="py-1.5">
                  <span aria-hidden>{isoToFlag(c.flag)}</span>
                  <span className="font-medium">{c.code}</span>
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell id="thanks-1" label="Closing note" className="sm:col-span-2">
          <div className="flex gap-2">
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              <Input
                id="thanks-1"
                value={draft.thanks[0]}
                onChange={(e) => set("thanks", [e.target.value, draft.thanks[1]])}
                className={controlClass}
              />
              <Input
                aria-label="Closing note, second line"
                value={draft.thanks[1]}
                onChange={(e) => set("thanks", [draft.thanks[0], e.target.value])}
                className={controlClass}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => set("thanks", pickThankYou(draft.thanks))}
              aria-label="Suggest another closing note"
              title="Suggest another"
              className="size-10 shrink-0 rounded-lg border-input bg-surface"
            >
              <Dices className="size-4" />
            </Button>
          </div>
        </FieldShell>
      </div>
    </Section>
  );
}

function LogoField({
  logo,
  onChange,
  onError,
}: {
  logo: string;
  onChange: (logo: string) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError("That file isn't an image.");
    if (file.size > MAX_LOGO_BYTES) return onError("Please choose an image under 2 MB.");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <FieldShell id="logo" label="Logo" className="sm:col-span-2">
      <input
        ref={inputRef}
        id="logo"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {logo ? (
        <div className="flex items-center gap-3 rounded-lg border border-input p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="Logo preview" className="size-10 rounded-md object-cover" />
          <span className="flex-1 text-sm text-muted-foreground">Logo added</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove logo"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-danger"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-dashed border-input px-3 py-3 text-left transition-colors hover:border-foreground/30 hover:bg-surface-2",
            dragging && "border-brand bg-brand/5",
          )}
        >
          <span className="grid size-9 place-items-center rounded-md bg-surface-2 text-muted-foreground">
            <ImageUp className="size-4" />
          </span>
          <span className="text-sm">
            <span className="font-medium">Upload a square logo</span>
            <span className="block text-[13px] text-muted-foreground">
              Drop a file here or click to browse · PNG, JPG, WebP, SVG up to 2 MB
            </span>
          </span>
        </button>
      )}
    </FieldShell>
  );
}
