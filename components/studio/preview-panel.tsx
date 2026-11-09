"use client";

import { Copy, Download, LoaderCircle, Printer } from "lucide-react";

import { Receipt } from "@/components/receipt/receipt-preview";
import {
  Corners,
  Kbd,
  boxClass,
  monoLabel,
  primaryButton,
} from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import type { ReceiptExport } from "@/hooks/use-receipt-export";
import { cn } from "@/lib/utils";

const iconButton = cn(boxClass, "transition-colors hover:bg-surface-3 hover:text-foreground");

export function PreviewPanel({
  receipt,
  exporter,
}: {
  receipt: ReceiptStore;
  exporter: ReceiptExport;
}) {
  const { draft, theme } = receipt;
  const { receiptRef, download, downloading, copySummary, print } = exporter;

  return (
    <section id="preview" aria-label="Receipt preview" className="flex scroll-mt-16 flex-col gap-[2px]">
      <header className="flex gap-[2px]">
        <span className={boxClass} aria-hidden>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
        </span>
        <p
          className={cn(
            monoLabel,
            "flex min-w-0 flex-1 items-center justify-between gap-2 bg-surface-2 px-3 text-muted-foreground",
          )}
        >
          <span className="truncate">Live preview</span>
          <Kbd className="max-w-[9rem] truncate">{theme.name}</Kbd>
        </p>
        <button
          type="button"
          onClick={copySummary}
          aria-label="Copy text summary"
          title="Copy text summary"
          className={iconButton}
        >
          <Copy className="size-4" />
        </button>
        <button
          type="button"
          onClick={print}
          aria-label="Print or save as PDF"
          title="Print or save as PDF"
          className={iconButton}
        >
          <Printer className="size-4" />
        </button>
      </header>

      <div className="canvas relative flex justify-center bg-surface px-4 py-10 sm:px-8 sm:py-12">
        <Corners />
        <div id="receipt-print" className="receipt-shadow w-full max-w-[23rem]">
          <Receipt ref={receiptRef} draft={draft} theme={theme} />
        </div>
      </div>

      <button type="button" onClick={download} disabled={downloading} className={cn(primaryButton, "h-12 px-4")}>
        {downloading ? "Saving image…" : "Download PNG"}
        {downloading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
      </button>
    </section>
  );
}
