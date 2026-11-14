"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import {
  Kbd,
  Section,
  boxClass,
  controlClass,
  monoLabel,
  segButton,
} from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import { ComboInput } from "@/components/studio/combo-input";
import { type Item, itemPresets, money } from "@/lib/receipt-utils";
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
      id="items"
      icon={ShoppingBag}
      title="Items"
      meta={draft.items.length}
      description={`${totals.count} ${totals.count === 1 ? "unit" : "units"} across ${draft.items.length} ${draft.items.length === 1 ? "line" : "lines"}.`}
    >
      {draft.items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {draft.items.map((item, index) => (
            <ItemRow
              key={item.id}
              index={index}
              item={item}
              currency={draft.currency}
              onChange={(patch) => updateItem(item.id, patch)}
              onRemove={() => remove(item, index)}
            />
          ))}
        </ul>
      ) : (
        <p className={cn(monoLabel, "bg-surface-2 py-8 text-center text-muted-foreground")}>
          No items yet — add the first one below
        </p>
      )}

      <div className="mt-4 flex gap-[2px]">
        <button type="button" onClick={add} className={cn(segButton, "text-foreground")}>
          <Plus className="size-3.5" /> Add item
        </button>
        <p className={cn(monoLabel, "flex min-w-0 flex-1 items-center justify-end gap-2 bg-surface-2 px-3 text-muted-foreground")}>
          Subtotal <Kbd>{money(totals.total, draft.currency)}</Kbd>
        </p>
      </div>
    </Section>
  );
}

function ItemRow({
  index,
  item,
  currency,
  onChange,
  onRemove,
}: {
  index: number;
  item: Item;
  currency: string;
  onChange: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  const stepper = cn(boxClass, "w-9 transition-colors hover:bg-surface-3 hover:text-foreground disabled:opacity-40 disabled:hover:bg-surface-2");

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-[2px]">
      <span className={cn(boxClass, monoLabel, "row-span-2 h-auto text-muted-foreground")}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex min-w-0 flex-col gap-[2px]">
        <ComboInput
          value={item.name}
          onChange={(name) => onChange({ name })}
          options={itemPresets}
          placeholder="Item name — pick a preset or type your own"
          inputProps={{ "data-item-name": true, "aria-label": "Item name", className: "font-medium" }}
        />
        <Input
          aria-label="Item detail"
          placeholder="Detail (optional) — size, colour, note"
          value={item.detail}
          onChange={(e) => onChange({ detail: e.target.value })}
          className={cn(controlClass, "h-8 text-[13px] text-muted-foreground md:text-[13px]")}
        />
      </div>

      <div className="flex min-w-0 gap-[2px]">
        <div className="flex gap-[2px]" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => onChange({ qty: Math.max(1, item.qty - 1) })}
            disabled={item.qty <= 1}
            aria-label="Decrease quantity"
            className={stepper}
          >
            <Minus className="size-3.5" />
          </button>
          <span className="grid w-9 place-items-center bg-surface-2 font-mono text-sm tabular-nums" aria-live="polite">
            {item.qty}
          </span>
          <button
            type="button"
            onClick={() => onChange({ qty: item.qty + 1 })}
            aria-label="Increase quantity"
            className={stepper}
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <label className="relative min-w-0 flex-1">
          <span className={cn(monoLabel, "pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground")}>
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

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name || "item"}`}
          className={cn(boxClass, "transition-colors hover:bg-danger hover:text-white")}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
