"use client";

import { Check } from "lucide-react";
import { Item, money } from "@/lib/receipt-utils";
import { Theme } from "@/lib/themes";

export function Receipt({
  store,
  title,
  order,
  date,
  payment,
  items,
  theme,
  logo,
  currency,
  thanks,
  receiptRef,
}: {
  store: string;
  title: string;
  order: string;
  date: string;
  payment: string;
  items: Item[];
  theme: Theme;
  logo: string;
  currency: string;
  thanks: [string, string];
  receiptRef: React.RefObject<HTMLElement | null>;
}) {
  const total = items.reduce((s, i) => s + i.qty * i.price, 0),
    count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <article
      ref={receiptRef}
      className={`receipt pattern-${theme.pattern}`}
      style={
        {
          "--receipt-ink": theme.ink,
          "--receipt-accent": theme.accent,
          "--receipt-paper": theme.paper,
          "--receipt-radius": theme.shape,
          "--receipt-font": theme.font,
          "--receipt-weight": theme.weight,
        } as React.CSSProperties
      }
    >
      <div className="receipt-topline" />

      {/* Cap "Paid" berupa teks + cincin CSS murni (tidak bergantung pada
          gambar logo atau mix-blend-mode), supaya aman saat di-capture
          oleh html-to-image dan selalu tampil terlepas dari status logo. */}
      <div className="receipt-stamp" aria-hidden="true">
        <span>Paid</span>
      </div>

      <header className="receipt-head">
        <div className="receipt-mark">
          {logo ? (
            <img src={logo} alt={`${store} logo`} crossOrigin="anonymous" />
          ) : (
            <span>{(store || "R").trim().charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="receipt-date">
          {date || "—"}
          <br />
          <strong>#{order || "0000"}</strong>
        </div>
      </header>
      <div className="receipt-intro">
        <p className="receipt-kicker">{title || "Payment receipt"}</p>
        <h2>{store || "Your store"}</h2>
      </div>
      <div className="receipt-rule" />
      <div className="receipt-items">
        {items.length ? (
          items.map((i) => (
            <div className="receipt-item" key={i.id}>
              <div>
                <strong>{i.name || "Item name"}</strong>
                <small>
                  {i.detail || `${i.qty} × ${money(i.price, currency)}`}
                </small>
              </div>
              <span>{money(i.qty * i.price, currency)}</span>
            </div>
          ))
        ) : (
          <p className="empty-receipt">No items yet</p>
        )}
      </div>
      <div className="receipt-rule" />
      <div className="receipt-total">
        <span>
          Subtotal <small>{count} items</small>
        </span>
        <strong>{money(total, currency)}</strong>
      </div>
      <div className="receipt-payment">
        <div>
          <span>Paid via</span>
          <strong>{payment || "Not specified"}</strong>
        </div>
        <Check size={18} />
      </div>

      <p className="py-4 receipt-thanks">
        {thanks[0]}
        <br />
        {thanks[1]}
      </p>
      <div className="tear-line" />
    </article>
  );
}
