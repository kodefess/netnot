"use client";

import { useRef, useState } from "react";

import { useToast } from "@/components/toast";
import type { ReceiptDraft } from "@/hooks/use-receipt";
import { money, slugify, sumItems } from "@/lib/receipt-utils";

// Tunggu dua frame supaya layout & paint benar-benar selesai sebelum capture.
const nextPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

export function receiptSummary(draft: ReceiptDraft) {
  const { total } = sumItems(draft.items);
  const lines = draft.items.map(
    (i) => `• ${i.qty}× ${i.name || "Item"} — ${money(i.qty * i.price, draft.currency)}`,
  );
  return [
    `${draft.store} · ${draft.title} #${draft.order}`,
    draft.date,
    "",
    ...lines,
    "",
    `Total: ${money(total, draft.currency)}`,
    `Paid via ${draft.payment}`,
  ].join("\n");
}

export function useReceiptExport(draft: ReceiptDraft) {
  const receiptRef = useRef<HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const download = async () => {
    const node = receiptRef.current;
    if (!node || downloading) return;
    setDownloading(true);
    try {
      // html-to-image cukup besar; dimuat hanya saat benar-benar dipakai.
      const { toPng } = await import("html-to-image");
      await document.fonts?.ready;
      await nextPaint();
      const { width, height } = node.getBoundingClientRect();
      const dataUrl = await toPng(node, {
        width: Math.ceil(width),
        height: Math.ceil(height),
        pixelRatio: 3,
        cacheBust: true,
        style: { margin: "0", transform: "none" },
      });
      const link = document.createElement("a");
      link.download = `${slugify(draft.store)}-${slugify(draft.order)}.png`;
      link.href = dataUrl;
      link.click();
      toast({ message: "Image downloaded.", tone: "success" });
    } catch (error) {
      console.error("Failed to generate receipt image", error);
      toast({ message: "Couldn't create the image. Try again in a moment.", tone: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(receiptSummary(draft));
      toast({ message: "Summary copied to clipboard.", tone: "success" });
    } catch {
      toast({ message: "Clipboard isn't available here.", tone: "error" });
    }
  };

  const print = () => window.print();

  return { receiptRef, download, downloading, copySummary, print };
}

export type ReceiptExport = ReturnType<typeof useReceiptExport>;
