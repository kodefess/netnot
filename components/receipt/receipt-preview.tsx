import { Check } from "lucide-react";

import { PaidSeal, sealCode, sealHash } from "@/components/receipt/paid-seal";
import type { ReceiptDraft } from "@/hooks/use-receipt";
import { money, sumItems } from "@/lib/receipt-utils";
import type { Theme } from "@/lib/themes";
import { cn } from "@/lib/utils";

type Ctx = {
  draft: ReceiptDraft;
  total: number;
  count: number;
  seed: string;
  code: string;
};

/**
 * Nota dengan beberapa layout (lihat ReceiptLayout di lib/themes.ts).
 * Semua warna, font, dan bentuk dikendalikan CSS variable dari tema,
 * jadi tampilan layar, print, dan PNG (html-to-image) selalu identik.
 */
export function Receipt({
  draft,
  theme,
  ref,
  id,
}: {
  draft: ReceiptDraft;
  theme: Theme;
  ref?: React.Ref<HTMLElement>;
  id?: string;
}) {
  const { total, count } = sumItems(draft.items);
  // Segel & kodenya ikut berubah bila nomor, tanggal, toko, atau total diubah.
  const seed = `${draft.order}|${draft.date}|${draft.store}|${total}|${draft.currency}`;
  const ctx: Ctx = { draft, total, count, seed, code: sealCode(seed) };
  const Layout = layouts[theme.layout];

  return (
    <article
      ref={ref}
      id={id}
      className={cn("receipt", `pattern-${theme.pattern}`)}
      data-layout={theme.layout}
      data-caps={theme.caps || undefined}
      data-boxed={theme.boxed || undefined}
      data-solid-rules={theme.solidRules || undefined}
      style={
        {
          "--receipt-ink": theme.ink,
          "--receipt-accent": theme.accent,
          "--receipt-on-accent": theme.onAccent,
          "--receipt-paper": theme.paper,
          "--receipt-radius": theme.radius,
          "--receipt-font": theme.font,
          "--receipt-weight": theme.weight,
        } as React.CSSProperties
      }
    >
      <Layout {...ctx} />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Potongan yang dipakai ulang antar layout                             */
/* ------------------------------------------------------------------ */

function Mark({ draft }: Ctx) {
  return (
    <div className="receipt-mark">
      {draft.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={draft.logo} alt={`${draft.store} logo`} />
      ) : (
        <span>{(draft.store.trim() || "R").charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function Meta({ draft }: Ctx) {
  return (
    <div className="receipt-date">
      <span>{draft.date || "—"}</span>
      <br />
      <strong>#{draft.order || "0000"}</strong>
    </div>
  );
}

function Title({ draft }: Ctx) {
  return (
    <div className="receipt-intro">
      <p className="receipt-kicker">{draft.title || "Payment receipt"}</p>
      <h2>{draft.store || "Your store"}</h2>
    </div>
  );
}

function Seal({ draft, seed, code, className }: Ctx & { className?: string }) {
  return (
    <div className={cn("receipt-stamp", className)}>
      <PaidSeal
        seed={seed}
        microText={`PAID IN FULL • LUNAS • #${draft.order || "0000"} • ${draft.date} • ${code}`}
      />
    </div>
  );
}

function Items({ draft }: Ctx) {
  const { items, currency } = draft;
  if (!items.length) return <p className="receipt-empty">No items yet</p>;
  return (
    <div className="receipt-items">
      {items.map((item) => (
        <div className="receipt-item" key={item.id}>
          <div>
            <strong>{item.name || "Untitled item"}</strong>
            <small>
              {item.qty} × {money(item.price, currency)}
              {item.detail && ` · ${item.detail}`}
            </small>
          </div>
          <span>{money(item.qty * item.price, currency)}</span>
        </div>
      ))}
    </div>
  );
}

function Total({ draft, total, count }: Ctx) {
  return (
    <div className="receipt-total">
      <span>
        Total <small>· {count} {count === 1 ? "item" : "items"}</small>
      </span>
      <strong>{money(total, draft.currency)}</strong>
    </div>
  );
}

function Payment({ draft }: Ctx) {
  return (
    <div className="receipt-payment">
      <div>
        <span>Paid via</span>
        <strong>{draft.payment || "Not specified"}</strong>
      </div>
      <Check size={18} />
    </div>
  );
}

function Thanks({ draft }: Ctx) {
  const [first, second] = draft.thanks;
  if (!first && !second) return null;
  return (
    <p className="receipt-thanks">
      {first}
      {first && second && <br />}
      {second}
    </p>
  );
}

function Code({ code }: Ctx) {
  return <p className="receipt-seal-code">Seal {code}</p>;
}

const Rule = () => <div className="receipt-rule" />;

/** Barcode dekoratif yang lebar batangnya diturunkan dari data nota. */
function Barcode({ seed }: Ctx) {
  let h = sealHash(seed);
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 96) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    const w = 0.6 + (h % 4) * 0.55;
    const gap = 0.6 + ((h >>> 4) % 3) * 0.5;
    if (x + w > 100) break;
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg className="receipt-barcode" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden>
      {bars.map((b) => (
        <rect key={b.x} x={b.x} width={b.w} height="14" fill="currentColor" />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

function Classic(ctx: Ctx) {
  return (
    <>
      <div className="receipt-topline" />
      <Seal {...ctx} />
      <header className="receipt-head">
        <Mark {...ctx} />
        <Meta {...ctx} />
      </header>
      <Title {...ctx} />
      <Rule />
      <Items {...ctx} />
      <Rule />
      <Total {...ctx} />
      <Payment {...ctx} />
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

function Poster(ctx: Ctx) {
  return (
    <>
      <header className="receipt-band">
        <div className="receipt-head">
          <Mark {...ctx} />
          <Meta {...ctx} />
        </div>
        <Title {...ctx} />
      </header>
      <Items {...ctx} />
      <Rule />
      <Total {...ctx} />
      <Payment {...ctx} />
      <div className="receipt-signoff">
        <Thanks {...ctx} />
        <Seal {...ctx} className="is-inline" />
      </div>
      <Code {...ctx} />
    </>
  );
}

function Ticket(ctx: Ctx) {
  const { draft, total } = ctx;
  return (
    <>
      <header className="receipt-ticket-head">
        <Mark {...ctx} />
        <h2>{draft.store || "Your store"}</h2>
        <p className="receipt-kicker">{draft.title || "Payment receipt"}</p>
        <p className="receipt-ticket-meta">
          {draft.date || "—"} · #{draft.order || "0000"}
        </p>
      </header>
      <Rule />
      {draft.items.length ? (
        <div className="receipt-items">
          {draft.items.map((item) => (
            <div className="receipt-ticket-line" key={item.id}>
              <span>
                {item.qty}× {item.name || "Item"}
              </span>
              <i />
              <span>{money(item.qty * item.price, draft.currency)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="receipt-empty">No items yet</p>
      )}
      <Rule />
      <div className="receipt-ticket-line is-total">
        <span>TOTAL</span>
        <i />
        <span>{money(total, draft.currency)}</span>
      </div>
      <div className="receipt-ticket-line">
        <span>PAID VIA</span>
        <i />
        <span>{draft.payment || "—"}</span>
      </div>
      <Seal {...ctx} className="is-center" />
      <Thanks {...ctx} />
      <Barcode {...ctx} />
      <Code {...ctx} />
    </>
  );
}

function Table(ctx: Ctx) {
  const { draft, total, count } = ctx;
  return (
    <>
      <div className="receipt-topline" />
      <Seal {...ctx} />
      <header className="receipt-head is-left">
        <Mark {...ctx} />
      </header>
      <Title {...ctx} />
      <dl className="receipt-info">
        <div>
          <dt>Receipt no.</dt>
          <dd>#{draft.order || "0000"}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{draft.date || "—"}</dd>
        </div>
        <div>
          <dt>Paid via</dt>
          <dd>{draft.payment || "—"}</dd>
        </div>
      </dl>
      <div className="receipt-table" role="table">
        <div className="receipt-table-row is-head" role="row">
          <span role="columnheader">Item</span>
          <span role="columnheader">Qty</span>
          <span role="columnheader">Amount</span>
        </div>
        {draft.items.map((item) => (
          <div className="receipt-table-row" role="row" key={item.id}>
            <span role="cell">
              <strong>{item.name || "Untitled item"}</strong>
              {item.detail && <small>{item.detail}</small>}
            </span>
            <span role="cell">{item.qty}</span>
            <span role="cell">{money(item.qty * item.price, draft.currency)}</span>
          </div>
        ))}
        <div className="receipt-table-row is-foot" role="row">
          <span role="cell">Total</span>
          <span role="cell">{count}</span>
          <span role="cell">{money(total, draft.currency)}</span>
        </div>
      </div>
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

function Wallet(ctx: Ctx) {
  const { draft, total, count } = ctx;
  return (
    <>
      <Seal {...ctx} className="is-hero" />
      <p className="receipt-kicker receipt-wallet-kicker">{draft.title || "Payment receipt"}</p>
      <p className="receipt-wallet-amount">{money(total, draft.currency)}</p>
      <div className="receipt-wallet-to">
        <Mark {...ctx} />
        <span>
          to <strong>{draft.store || "Your store"}</strong>
        </span>
      </div>
      <dl className="receipt-wallet-details">
        <div>
          <dt>Date</dt>
          <dd>{draft.date || "—"}</dd>
        </div>
        <div>
          <dt>Receipt no.</dt>
          <dd>#{draft.order || "0000"}</dd>
        </div>
        <div>
          <dt>Paid via</dt>
          <dd>{draft.payment || "—"}</dd>
        </div>
        <div>
          <dt>Items</dt>
          <dd>{count}</dd>
        </div>
      </dl>
      <div className="receipt-wallet-items">
        <Items {...ctx} />
        {draft.items.length > 0 && (
          <div className="receipt-wallet-total">
            <span>Total</span>
            <strong>{money(total, draft.currency)}</strong>
          </div>
        )}
      </div>
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

function MarginLayout(ctx: Ctx) {
  const { draft } = ctx;
  return (
    <>
      <aside className="receipt-spine" aria-hidden>
        <span>{draft.store || "Your store"}</span>
      </aside>
      <Seal {...ctx} />
      <header className="receipt-head">
        <Mark {...ctx} />
        <Meta {...ctx} />
      </header>
      <Title {...ctx} />
      <Rule />
      <Items {...ctx} />
      <Rule />
      <Total {...ctx} />
      <Payment {...ctx} />
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

const layouts: Record<Theme["layout"], (ctx: Ctx) => React.ReactNode> = {
  classic: Classic,
  poster: Poster,
  ticket: Ticket,
  table: Table,
  wallet: Wallet,
  margin: MarginLayout,
};
