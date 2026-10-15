"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import {
  type Item,
  type ThankYou,
  createItem,
  getJakartaDate,
  initialItems,
  isCurrency,
  newId,
  pickThankYou,
  sumItems,
  thankYouMessages,
} from "@/lib/receipt-utils";
import { DEFAULT_THEME, findTheme, randomTheme } from "@/lib/themes";

export type ReceiptDraft = {
  store: string;
  title: string;
  order: string;
  date: string;
  payment: string;
  currency: string;
  items: Item[];
  themeId: string;
  thanks: ThankYou;
  logo: string;
};

export type DraftField = Exclude<keyof ReceiptDraft, "items">;

type Action =
  | { type: "set"; key: DraftField; value: ReceiptDraft[DraftField] }
  | { type: "load"; draft: ReceiptDraft }
  | { type: "add-item" }
  | { type: "insert-item"; item: Item; index: number }
  | { type: "update-item"; id: string; patch: Partial<Item> }
  | { type: "remove-item"; id: string };

const STORAGE_KEY = "netnot:draft:v2";

// Nilai deterministik untuk render pertama (server & client harus identik
// supaya tidak hydration mismatch). Nilai acak/aktual disetel di effect.
const baseDraft = (): ReceiptDraft => ({
  store: "Mezo Store (JOYCO)",
  title: "Payment receipt",
  order: "4829",
  date: "",
  payment: "QRIS Mezo Store",
  currency: "IDR",
  items: initialItems(),
  themeId: DEFAULT_THEME.id,
  thanks: thankYouMessages[0],
  logo: "",
});

const freshDraft = (): ReceiptDraft => ({
  ...baseDraft(),
  date: getJakartaDate(),
  themeId: randomTheme().id,
  thanks: pickThankYou(),
});

function reducer(state: ReceiptDraft, action: Action): ReceiptDraft {
  switch (action.type) {
    case "set":
      return { ...state, [action.key]: action.value };
    case "load":
      return action.draft;
    case "add-item":
      return { ...state, items: [...state.items, createItem()] };
    case "insert-item": {
      const items = [...state.items];
      items.splice(action.index, 0, action.item);
      return { ...state, items };
    }
    case "update-item":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, ...action.patch } : i,
        ),
      };
    case "remove-item":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
  }
}

/** Validasi longgar untuk data dari localStorage (bisa basi / diubah manual). */
function parseDraft(raw: string | null): ReceiptDraft | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<ReceiptDraft>;
    const base = baseDraft();
    const str = (v: unknown, fallback: string) =>
      typeof v === "string" ? v : fallback;
    const items = Array.isArray(data.items)
      ? data.items
          .filter((i): i is Item => !!i && typeof i === "object")
          .map((i) => ({
            id: str(i.id, "") || newId(),
            name: str(i.name, ""),
            detail: str(i.detail, ""),
            qty: Math.max(1, Math.floor(Number(i.qty)) || 1),
            price: Math.max(0, Number(i.price) || 0),
          }))
      : base.items;
    const thanks =
      Array.isArray(data.thanks) && data.thanks.length === 2
        ? ([str(data.thanks[0], ""), str(data.thanks[1], "")] as ThankYou)
        : pickThankYou();
    return {
      store: str(data.store, base.store),
      title: str(data.title, base.title),
      order: str(data.order, base.order),
      date: str(data.date, "") || getJakartaDate(),
      payment: str(data.payment, base.payment),
      currency: isCurrency(data.currency) ? data.currency : base.currency,
      items,
      themeId: findTheme(data.themeId).id,
      thanks,
      logo: str(data.logo, ""),
    };
  } catch {
    return null;
  }
}

function saveDraft(draft: ReceiptDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Kemungkinan kuota penuh karena logo (data URL). Simpan tanpa logo.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, logo: "" }));
    } catch {
      // Storage tidak tersedia (private mode dsb.) — abaikan saja.
    }
  }
}

export function useReceipt() {
  const [draft, dispatch] = useReducer(reducer, undefined, baseDraft);
  const loaded = useRef(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    dispatch({ type: "load", draft: parseDraft(stored) ?? freshDraft() });
    loaded.current = true;
  }, []);

  // Autosave dengan debounce supaya mengetik tidak menulis storage tiap tombol.
  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => saveDraft(draft), 300);
    return () => clearTimeout(timer);
  }, [draft]);

  const set = useCallback(
    <K extends DraftField>(key: K, value: ReceiptDraft[K]) =>
      dispatch({ type: "set", key, value }),
    [],
  );

  const actions = useMemo(
    () => ({
      set,
      addItem: () => dispatch({ type: "add-item" }),
      insertItem: (item: Item, index: number) =>
        dispatch({ type: "insert-item", item, index }),
      updateItem: (id: string, patch: Partial<Item>) =>
        dispatch({ type: "update-item", id, patch }),
      removeItem: (id: string) => dispatch({ type: "remove-item", id }),
      reset: () => dispatch({ type: "load", draft: freshDraft() }),
      restore: (draft: ReceiptDraft) => dispatch({ type: "load", draft }),
    }),
    [set],
  );

  const theme = findTheme(draft.themeId);
  const totals = useMemo(() => sumItems(draft.items), [draft.items]);

  return { draft, theme, totals, ...actions };
}

export type ReceiptStore = ReturnType<typeof useReceipt>;
