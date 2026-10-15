"use client";

import { Copy, Download, LoaderCircle, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Receipt } from "@/components/receipt/receipt-preview";
import type { ReceiptStore } from "@/hooks/use-receipt";
import type { ReceiptExport } from "@/hooks/use-receipt-export";

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
    <section
      id="preview"
      aria-label="Receipt preview"
      className="flex scroll-mt-20 flex-col overflow-hidden rounded-2xl border bg-surface shadow-panel"
    >
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <div className="mr-auto flex min-w-0 items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          <p className="truncate text-[13px] text-muted-foreground">
            Live preview · <span className="font-medium text-foreground">{theme.name}</span>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={copySummary}
          aria-label="Copy text summary"
          title="Copy text summary"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <Copy className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={print}
          aria-label="Print or save as PDF"
          title="Print or save as PDF"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <Printer className="size-4" />
        </Button>
        <Button
          type="button"
          onClick={download}
          disabled={downloading}
          className="h-8 gap-1.5 rounded-lg bg-brand px-3 text-brand-foreground hover:bg-brand/90"
        >
          {downloading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {downloading ? "Saving…" : "Download PNG"}
        </Button>
      </header>

      <div className="canvas flex justify-center px-4 py-10 sm:px-8 sm:py-12">
        <div id="receipt-print" className="receipt-shadow w-full max-w-[23rem]">
          <Receipt ref={receiptRef} draft={draft} theme={theme} />
        </div>
      </div>
    </section>
  );
}
