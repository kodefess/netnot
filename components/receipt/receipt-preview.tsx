import { CalendarDays, Check, Package, ReceiptText, WalletCards } from "lucide-react";

import { PaidSeal, type SealTone, sealCode, sealHash } from "@/components/receipt/paid-seal";
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

function Seal({
  draft,
  seed,
  code,
  className,
  tone,
}: Ctx & { className?: string; tone?: SealTone }) {
  return (
    <div className={cn("receipt-stamp", className)}>
      <PaidSeal
        seed={seed}
        tone={tone}
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

/** Ukuran font nominal: mengecil sesuai panjang teks supaya tetap satu baris. */
const fitAmount = (amount: string, maxRem: number, widthRem: number) => ({
  fontSize: `min(${maxRem}rem, ${(widthRem / (amount.length * 0.56)).toFixed(2)}rem)`,
});

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
          <strong style={fitAmount(money(total, draft.currency), 2, 13.5)}>
            {money(total, draft.currency)}
          </strong>
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
          <strong style={fitAmount(money(total, draft.currency), 2, 13.5)}>
            {money(total, draft.currency)}
          </strong>
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
        <header className="hub-head">
          <span>{draft.title || "Payment receipt"}</span>
          <span className="hub-paid">Paid</span>
        </header>

        <h2 className="hub-title">{draft.store || "Your store"}</h2>

        <dl className="hub-meta">
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

        {draft.items.length ? (
          <div className="hub-list">
            {draft.items.map((item, i) => (
              <div className="hub-row" key={item.id}>
                <span className="hub-index">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.name || "Untitled item"}</strong>
                  <small>
                    {item.qty} × {money(item.price, draft.currency)}
                    {item.detail && ` · ${item.detail}`}
                  </small>
                </div>
                <span>{money(item.qty * item.price, draft.currency)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="receipt-empty">No items yet</p>
        )}

        <div className="hub-total">
          <i className="hub-corner is-tl" />
          <i className="hub-corner is-tr" />
          <i className="hub-corner is-bl" />
          <i className="hub-corner is-br" />
          <div>
            <small>
              Total paid · {count} {count === 1 ? "item" : "items"}
            </small>
            <strong style={fitAmount(money(total, draft.currency), 1.65, 10.5)}>
              {money(total, draft.currency)}
            </strong>
          </div>
          <Seal {...ctx} className="is-inline" />
        </div>

        {(first || second) && (
          <p className="hub-note">
            {first}
            {first && second && <br />}
            {second}
          </p>
        )}
        <p className="hub-code">Seal {code}</p>
      </div>
    </div>
  );
}

/** Tangga wireframe: titik-titik profil anak tangga + salinannya sebagai kedalaman. */
const STAIRS = (() => {
  const front: [number, number][] = [[0, 100]];
  for (let i = 0; i < 8; i++) {
    const [x, y] = front[front.length - 1];
    front.push([x, y - 11], [x + 19, y - 11]);
  }
  const back = front.map(([x, y]): [number, number] => [x - 30, y - 18]);
  const path = (points: [number, number][]) =>
    points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
  const rungs = front.map(([x, y], i) => `M${x},${y}L${back[i][0]},${back[i][1]}`).join("");
  return path(front) + path(back) + rungs;
})();

/** Basement — komponen ala basement.studio: nav wordmark, nominal raksasa,
 *  grid sel bergaris, kutipan di atas garis, dan toggle pill. */
function Basement(ctx: Ctx) {
  const { draft, total, count } = ctx;
  const amount = money(total, draft.currency);
  const note = draft.thanks.filter(Boolean).join(" ");

  return (
    <>
      <nav className="bs-nav">
        {draft.logo && <Mark {...ctx} />}
        <span className="bs-word">{(draft.store || "your store").toLowerCase()}.</span>
        <span className="bs-status">
          <i />
          Paid<sup>({count})</sup>
        </span>
      </nav>

      <section className="bs-hero">
        <svg className="bs-stairs" viewBox="-32 -8 190 110" aria-hidden>
          <path d={STAIRS} />
        </svg>
        <p className="bs-heading">{draft.title || "Payment receipt"}</p>
        <p className="bs-amount" style={fitAmount(amount, 3.2, 19)}>
          {amount}
        </p>
      </section>

      {draft.items.length ? (
        <div className="bs-wall">
          {draft.items.map((item) => (
            <div className="bs-cell" key={item.id}>
              <strong>
                {item.name || "Untitled item"}
                <sup>({item.qty})</sup>
              </strong>
              {item.detail && <small>{item.detail}</small>}
              <span>{money(item.qty * item.price, draft.currency)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="receipt-empty">No items yet</p>
      )}

      <div className="bs-info">
        <dl>
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
        <Seal {...ctx} className="is-inline" tone="orange" />
      </div>

      {note && <p className="bs-quote">“{note}”</p>}

      <div className="bs-toggle" aria-hidden>
        <span className="is-on">Paid</span>
        <span>Lunas</span>
      </div>
      <Code {...ctx} />
    </>
  );
}

/** Basement v2 — sel bertitik sudut, label piksel, arsir diagonal, ditutup
 *  pita garis polisi lurus yang teksnya memuat nomor nota. */
function BasementV2(ctx: Ctx) {
  const { draft, total, count, code } = ctx;
  const amount = money(total, draft.currency);
  const note = draft.thanks.filter(Boolean).join(" ");
  const tape = Array(8)
    .fill(`PAID /// LUNAS /// #${draft.order || "0000"}`)
    .join(" /// ");

  return (
    <>
      <nav className="b2-nav">
        {draft.logo && <Mark {...ctx} />}
        <span className="bs-word">{(draft.store || "your store").toLowerCase()}.</span>
        <span className="b2-dots" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="b2-tag">Paid</span>
      </nav>

      <section className="b2-cell b2-hero">
        <p className="b2-label">{draft.title || "Payment receipt"}</p>
        <p className="b2-amount" style={fitAmount(amount, 3, 17.5)}>
          {amount}
        </p>
        <p className="b2-sub">
          {count} {count === 1 ? "item" : "items"} / {draft.currency}
        </p>
      </section>

      {draft.items.length ? (
        <div className="b2-list">
          {draft.items.map((item, i) => (
            <div className="b2-cell b2-item" key={item.id}>
              <span className="b2-index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.name || "Untitled item"}</strong>
                <small>
                  {item.qty} × {money(item.price, draft.currency)}
                  {item.detail && ` · ${item.detail}`}
                </small>
              </div>
              <span className="b2-price">{money(item.qty * item.price, draft.currency)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="receipt-empty">No items yet</p>
      )}

      <div className="b2-grid">
        <dl className="b2-cell b2-info">
          <div>
            <dt>No.</dt>
            <dd>#{draft.order || "0000"}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{draft.date || "—"}</dd>
          </div>
          <div>
            <dt>Via</dt>
            <dd>{draft.payment || "—"}</dd>
          </div>
        </dl>
        <div className="b2-cell b2-seal">
          <Seal {...ctx} className="is-inline" tone="orange" />
        </div>
      </div>

      {note && <p className="bs-quote">“{note}”</p>}

      <p className="b2-code">Seal {code}</p>
      <div className="b2-tape" aria-hidden>
        <span>{tape}</span>
      </div>
    </>
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
  basement: Basement,
  basement2: BasementV2,
  classic: Classic,
  poster: Poster,
  ticket: Ticket,
  table: Table,
  wallet: Wallet,
  margin: MarginLayout,
};
