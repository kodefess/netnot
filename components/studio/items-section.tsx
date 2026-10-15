"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import { Section, controlClass } from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import { type Item, money } from "@/lib/receipt-utils";
import { cn } from "@/lib/utils";

export function ItemsSection({ receipt }: { receipt: ReceiptStore }) {
  const { draft, totals, addItem, insertItem, updateItem, removeItem } = receipt;
  const toast = useToast();

  const remove = (item: Item, index: number) => {
    removeItem(item.id);
    toast({
      message: `Removed “${item.name || "item"}”.`,
      action: { label: "Undo", onClick: () => insertItem(item, index) },
    });
  };

  const add = () => {
    addItem();
    // Fokus ke nama item baru setelah render, supaya bisa langsung mengetik.
    requestAnimationFrame(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>("[data-item-name]");
      inputs[inputs.length - 1]?.focus();
    });
  };

  return (
    <Section
      icon={ShoppingBag}
      title="Items"
      description={`${totals.count} ${totals.count === 1 ? "unit" : "units"} across ${draft.items.length} ${draft.items.length === 1 ? "line" : "lines"}`}
    >
      {draft.items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {draft.items.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              currency={draft.currency}
              onChange={(patch) => updateItem(item.id, patch)}
              onRemove={() => remove(item, index)}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          No items yet. Add the first one below.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="h-9 gap-1.5 rounded-lg border-dashed border-input bg-transparent px-3"
        >
          <Plus className="size-4" /> Add item
        </Button>
        <p className="text-right text-sm text-muted-foreground">
          Subtotal{" "}
          <span className="ml-1 font-mono text-base font-medium text-foreground tabular-nums">
            {money(totals.total, draft.currency)}
          </span>
        </p>
      </div>
    </Section>
  );
}

function ItemRow({
  item,
  currency,
  onChange,
  onRemove,
}: {
  item: Item;
  currency: string;
  onChange: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  return (
    <li className="group grid grid-cols-[auto_1fr_auto] gap-3 rounded-xl border bg-surface-2/60 p-3 sm:grid-cols-[minmax(0,1fr)_auto_9.5rem_auto] sm:items-start">
      <div className="col-span-3 flex min-w-0 flex-col gap-1.5 sm:col-span-1">
        <Input
          data-item-name
          aria-label="Item name"
          placeholder="Item name"
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={cn(controlClass, "font-medium")}
        />
        <Input
          aria-label="Item detail"
          placeholder="Detail (optional) — size, colour, note"
          value={item.detail}
          onChange={(e) => onChange({ detail: e.target.value })}
          className={cn(controlClass, "h-8 text-[13px] text-muted-foreground md:text-[13px]")}
        />
      </div>

      <div
        className="flex h-10 items-center rounded-lg border border-input bg-surface"
        role="group"
        aria-label="Quantity"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange({ qty: Math.max(1, item.qty - 1) })}
          disabled={item.qty <= 1}
          aria-label="Decrease quantity"
          className="h-full w-9 rounded-r-none"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="w-7 text-center font-mono text-sm tabular-nums" aria-live="polite">
          {item.qty}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange({ qty: item.qty + 1 })}
          aria-label="Increase quantity"
          className="h-full w-9 rounded-l-none"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <label className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-xs text-muted-foreground">
          {currency}
        </span>
        <Input
          aria-label={`Unit price in ${currency}`}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="0"
          value={item.price || ""}
          onChange={(e) => onChange({ price: Math.max(0, Number(e.target.value) || 0) })}
          className={cn(controlClass, "pl-12 text-right font-mono tabular-nums")}
        />
      </label>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Remove ${item.name || "item"}`}
        className="size-10 justify-self-end text-muted-foreground hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
