"use client";

import { Download, Eye, LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { ToastProvider, useToast } from "@/components/toast";
import { DetailsSection } from "@/components/studio/details-section";
import { ItemsSection } from "@/components/studio/items-section";
import { PreviewPanel } from "@/components/studio/preview-panel";
import { StyleSection } from "@/components/studio/style-section";
import { type ReceiptStore, useReceipt } from "@/hooks/use-receipt";
import { useReceiptExport } from "@/hooks/use-receipt-export";
import { money } from "@/lib/receipt-utils";
import { SITE } from "@/lib/site";

export default function Page() {
  return (
    <ToastProvider>
      <Studio />
    </ToastProvider>
  );
}

function Studio() {
  const receipt = useReceipt();
  const exporter = useReceiptExport(receipt.draft);
  const { draft, totals } = receipt;

  return (
    <div className="min-h-dvh pb-24 lg:pb-0">
      <SiteHeader receipt={receipt} />

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-8 lg:px-8 lg:py-8 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="px-1">
            <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              Receipts that look like <em className="text-brand-text">your</em> brand.
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
              Fill in the details and pick a style — the preview updates as you type and your
              draft is saved in this browser automatically.
            </p>
          </div>
          <DetailsSection receipt={receipt} />
          <ItemsSection receipt={receipt} />
          <StyleSection receipt={receipt} />
          <footer className="px-1 pb-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.title}. Made for people who like their receipts
            pretty.
          </footer>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <PreviewPanel receipt={receipt} exporter={exporter} />
        </aside>
      </main>

      {/* Bar bawah khusus mobile: total selalu terlihat + aksi utama. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-surface/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <div className="mr-auto min-w-0">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="truncate font-mono text-base font-semibold tabular-nums">
              {money(totals.total, draft.currency)}
            </p>
          </div>
          <Button
            variant="outline"
            className="h-10 gap-1.5 rounded-lg border-input bg-surface px-3"
            onClick={() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Eye className="size-4" /> Preview
          </Button>
          <Button
            onClick={exporter.download}
            disabled={exporter.downloading}
            className="h-10 gap-1.5 rounded-lg bg-brand px-3 text-brand-foreground hover:bg-brand/90"
          >
            {exporter.downloading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function SiteHeader({ receipt }: { receipt: ReceiptStore }) {
  const toast = useToast();

  const reset = () => {
    const previous = receipt.draft;
    receipt.reset();
    toast({
      message: "Started a fresh receipt.",
      action: { label: "Undo", onClick: () => receipt.restore(previous) },
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <a href="/" className="mr-auto flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
            <ReceiptGlyph />
          </span>
          <span className="font-display text-xl italic">{SITE.title}</span>
        </a>
        <Button
          variant="ghost"
          onClick={reset}
          className="h-9 gap-1.5 rounded-full px-3 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">New receipt</span>
        </Button>
        <ColorSchemeToggle />
      </div>
    </header>
  );
}

function ReceiptGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
      <path
        d="M3.5 1.5h9v13l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M6 5.5h4M6 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
