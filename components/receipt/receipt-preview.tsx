import { CalendarDays, Check, ChevronDown, Package, ReceiptText, WalletCards } from "lucide-react";

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
        Total{" "}
        <small>
          · {count} {count === 1 ? "item" : "items"}
        </small>
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
    <svg
      className="receipt-barcode"
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      aria-hidden
    >
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
            <span role="cell">
              {money(item.qty * item.price, draft.currency)}
            </span>
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
      <p className="receipt-kicker receipt-wallet-kicker">
        {draft.title || "Payment receipt"}
      </p>
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

/** Mono — grid Swiss: label mono kecil, hairline, item bernomor. */
function Swiss(ctx: Ctx) {
  const { draft, total, count } = ctx;
  const cells: [string, React.ReactNode][] = [
    ["Date", draft.date || "—"],
    ["Paid via", draft.payment || "—"],
    ["Items", count],
    ["Currency", draft.currency],
  ];
  return (
    <>
      <header className="swiss-top">
        <Mark {...ctx} />
        <span className="swiss-label">{draft.title || "Payment receipt"}</span>
        <span className="swiss-label is-strong">#{draft.order || "0000"}</span>
      </header>
      <h2 className="swiss-store">{draft.store || "Your store"}</h2>
      <dl className="swiss-grid">
        {cells.map(([label, value]) => (
          <div key={label}>
            <dt className="swiss-label">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {draft.items.length ? (
        <ol className="swiss-items">
          {draft.items.map((item, i) => (
            <li key={item.id}>
              <span className="swiss-index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.name || "Untitled item"}</strong>
                <small>
                  {item.qty} × {money(item.price, draft.currency)}
                  {item.detail && ` · ${item.detail}`}
                </small>
              </div>
              <span>{money(item.qty * item.price, draft.currency)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="receipt-empty">No items yet</p>
      )}
      <div className="swiss-total">
        <div>
          <span className="swiss-label">Amount paid</span>
          <strong>{money(total, draft.currency)}</strong>
        </div>
        <Seal {...ctx} className="is-inline" />
      </div>
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

/** Garis gelombang halus di kartu — fase & frekuensinya dari data nota. */
function cardWaves(seed: string) {
  let h = sealHash(`card|${seed}`);
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    return h / 4294967296;
  };
  const freq = 0.018 + next() * 0.014;
  const phase = next() * Math.PI * 2;
  const amp = 10 + next() * 8;
  return Array.from({ length: 16 }, (_, i) => {
    let d = "";
    for (let x = 0; x <= 320; x += 8) {
      const y = 40 + i * 9 + amp * Math.sin(x * freq + phase + i * 0.22);
      d += `${x ? "L" : "M"}${x},${y.toFixed(1)}`;
    }
    return d;
  });
}

/** Cobalt — kartu pembayaran biru premium di atas, ringkasan di bawah. */
function Card(ctx: Ctx) {
  const { draft, total, count, seed } = ctx;
  return (
    <>
      <div className="cc">
        <svg className="cc-waves" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden>
          {cardWaves(seed).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
        <div className="cc-top">
          <Mark {...ctx} />
          <span className="cc-store">{draft.store || "Your store"}</span>
          <span className="cc-paid">Paid</span>
        </div>
        <div className="cc-chip-row" aria-hidden>
          <svg className="cc-chip" viewBox="0 0 40 30">
            <rect x="0.5" y="0.5" width="39" height="29" rx="6" />
            <path d="M0 10h12M0 20h12M28 10h12M28 20h12M12 0v30M28 0v30M12 15h16" />
          </svg>
          <svg className="cc-nfc" viewBox="0 0 24 24">
            <path d="M8 7a7 7 0 0 1 0 10M12 4a11 11 0 0 1 0 16M4 10a3 3 0 0 1 0 4" />
          </svg>
        </div>
        <p className="cc-number">
          <span>••••</span> <span>••••</span> <span>••••</span> {draft.order || "0000"}
        </p>
        <div className="cc-bottom">
          <div>
            <span>Date</span>
            <strong>{draft.date || "—"}</strong>
          </div>
          <div>
            <span>Paid via</span>
            <strong>{draft.payment || "—"}</strong>
          </div>
        </div>
      </div>

      <div className="card-amount">
        <div>
          <p className="receipt-kicker">{draft.title || "Payment receipt"}</p>
          <strong>{money(total, draft.currency)}</strong>
          <small>
            {count} {count === 1 ? "item" : "items"} · {draft.currency}
          </small>
        </div>
        <Seal {...ctx} className="is-inline" />
      </div>

      {draft.items.length ? (
        <ul className="card-items">
          {draft.items.map((item) => (
            <li key={item.id}>
              <span className="card-qty">{item.qty}×</span>
              <div>
                <strong>{item.name || "Untitled item"}</strong>
                <small>
                  {money(item.price, draft.currency)}
                  {item.detail && ` · ${item.detail}`}
                </small>
              </div>
              <span>{money(item.qty * item.price, draft.currency)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="receipt-empty">No items yet</p>
      )}
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

/** JOYCO Studio — bahasa visual JOYCO Hub: sidebar rail, strip segmen kotak,
 *  label mono, badge, dan kartu ber-grid biru dengan bracket sudut. */
function Hub(ctx: Ctx) {
  const { draft, total, count, code } = ctx;
  const [first, second] = draft.thanks;
  return (
    <div className="hub-shell">
      <aside className="hub-rail" aria-hidden>
        <span className="hub-logo">
          <Mark {...ctx} />
        </span>
        <span className="hub-tab">
          <span>Receipt</span>
          <ReceiptText size={13} />
        </span>
        <span className="hub-box">
          <CalendarDays size={13} />
        </span>
        <span className="hub-box">
          <WalletCards size={13} />
        </span>
        <span className="hub-box">
          <Package size={13} />
        </span>
        <span className="hub-rail-fill" />
        <span className="hub-box hub-diamond">
          <svg viewBox="0 0 16 16">
            <rect x="4" y="4" width="4" height="4" />
            <rect x="8" y="8" width="4" height="4" className="is-blue" />
            <rect x="8" y="4" width="4" height="4" className="is-dim" />
            <rect x="4" y="8" width="4" height="4" className="is-dim" />
          </svg>
        </span>
      </aside>

      <div className="hub-main">
        <div className="hub-crumb">
          <span className="hub-crumb-icon" aria-hidden>
            <svg viewBox="0 0 16 16">
              <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" />
            </svg>
          </span>
          <span className="hub-crumb-text">
            <b>Receipt</b>
            <span>
              #{draft.order || "0000"} / Details
            </span>
          </span>
          <ChevronDown size={12} aria-hidden />
        </div>

        <div className="hub-chips">
          <span className="hub-chip">{draft.title || "Payment receipt"}</span>
          <span className="hub-chip is-blue">Paid</span>
        </div>
        <h2 className="hub-title">{draft.store || "Your store"}</h2>

        <div className="hub-toolbar">
          <span className="hub-btn">
            <CalendarDays size={12} aria-hidden />
            {draft.date || "—"}
          </span>
          <span className="hub-btn">
            <WalletCards size={12} aria-hidden />
            {draft.payment || "—"}
          </span>
        </div>

        <div className="hub-section">
          <h3>Items</h3>
          <span className="hub-count">{count}</span>
        </div>
        {draft.items.length ? (
          <div className="hub-list">
            {draft.items.map((item, i) => (
              <div className="hub-strip" key={item.id}>
                <span className="hub-box">{String(i + 1).padStart(2, "0")}</span>
                <span className="hub-seg hub-grow is-item">
                  <span className="hub-item">
                    <span className="hub-name">{item.name || "Untitled item"}</span>
                    <small>
                      {item.qty} × {money(item.price, draft.currency)}
                      {item.detail && ` · ${item.detail}`}
                    </small>
                  </span>
                  <span className="hub-badge">{money(item.qty * item.price, draft.currency)}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="receipt-empty">No items yet</p>
        )}

        <div className="hub-card">
          <div className="hub-strip">
            <span className="hub-box" aria-hidden>
              Σ
            </span>
            <span className="hub-seg hub-grow">
              Total paid
              <span className="hub-badge">{draft.currency}</span>
            </span>
          </div>
          <div className="hub-card-body">
            <i className="hub-corner is-tl" />
            <i className="hub-corner is-tr" />
            <i className="hub-corner is-bl" />
            <i className="hub-corner is-br" />
            <div>
              <small>
                {count} {count === 1 ? "item" : "items"}
              </small>
              <strong>{money(total, draft.currency)}</strong>
            </div>
            <Seal {...ctx} className="is-inline" />
          </div>
        </div>

        <div className="hub-foot">
          {(first || second) && (
            <p className="hub-note">
              {first}
              {first && second && " "}
              {second}
            </p>
          )}
          <div className="hub-strip hub-meta">
            <span className="hub-seg hub-grow">Seal</span>
            <span className="hub-seg">{code}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Atelier — folio butik: bingkai ganda, monogram, serif miring, simetris. */
function Folio(ctx: Ctx) {
  const { draft, total } = ctx;
  return (
    <>
      <div className="folio-frame" aria-hidden />
      <header className="folio-top">
        <span>N° {draft.order || "0000"}</span>
        <span>{draft.date || "—"}</span>
      </header>
      <div className="folio-monogram">
        <Mark {...ctx} />
      </div>
      <p className="folio-label">{draft.title || "Payment receipt"}</p>
      <h2 className="folio-store">{draft.store || "Your store"}</h2>
      <div className="folio-ornament" aria-hidden>
        <span />✦<span />
      </div>
      {draft.items.length ? (
        <div className="folio-items">
          {draft.items.map((item) => (
            <div className="folio-item" key={item.id}>
              <div>
                <strong>{item.name || "Untitled item"}</strong>
                <small>
                  {item.qty} × {money(item.price, draft.currency)}
                  {item.detail && ` — ${item.detail}`}
                </small>
              </div>
              <span>{money(item.qty * item.price, draft.currency)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="receipt-empty">No items yet</p>
      )}
      <div className="folio-total">
        <span>Total</span>
        <strong>{money(total, draft.currency)}</strong>
      </div>
      <p className="folio-label">Paid via {draft.payment || "—"}</p>
      <Seal {...ctx} className="is-center" />
      <Thanks {...ctx} />
      <Code {...ctx} />
    </>
  );
}

const layouts: Record<Theme["layout"], (ctx: Ctx) => React.ReactNode> = {
  swiss: Swiss,
  card: Card,
  folio: Folio,
  hub: Hub,
  classic: Classic,
  poster: Poster,
  ticket: Ticket,
  table: Table,
  wallet: Wallet,
  margin: MarginLayout,
};
