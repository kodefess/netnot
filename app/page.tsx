"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Check,
  Copy,
  Download,
  ImagePlus,
  LoaderCircle,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Theme, themes } from "@/lib/themes";

// Kelas dasar untuk Input & Select agar warna, radius, dan ring fokusnya
// mengikuti tema studio (lewat CSS var --ink/--paper/--accent/
// --control-radius di-set pada elemen <main>), bukan gaya shadcn default.
const controlClass =
  "h-11 w-full rounded-[var(--control-radius)] border border-[color:var(--ink)]/14 bg-[color:var(--panel)] px-3.5 text-[15px] text-[color:var(--ink)] shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--ink)]/35 focus-visible:border-[color:var(--accent)] focus-visible:ring-4 focus-visible:ring-[color:var(--accent)]/15 focus-visible:ring-offset-0";

type Item = {
  id: number;
  name: string;
  detail: string;
  qty: number;
  price: number;
};

const initialItems: Item[] = [
  {
    id: 1,
    name: "Daily tote bag",
    detail: "natural / one size",
    qty: 1,
    price: 38,
  },
  { id: 2, name: "Studio mug", detail: "matte black", qty: 2, price: 16 },
];

const currencies = [
  { code: "IDR", label: "Indonesian rupiah", flag: "ID", locale: "id-ID" },
  { code: "USD", label: "US dollar", flag: "US", locale: "en-US" },
  { code: "EUR", label: "Euro", flag: "EU", locale: "de-DE" },
  { code: "GBP", label: "British pound", flag: "GB", locale: "en-GB" },
  { code: "JPY", label: "Japanese yen", flag: "JP", locale: "ja-JP" },
  { code: "SGD", label: "Singapore dollar", flag: "SG", locale: "en-SG" },
  { code: "MYR", label: "Malaysian ringgit", flag: "MY", locale: "ms-MY" },
  { code: "AUD", label: "Australian dollar", flag: "AU", locale: "en-AU" },
];

// EU tidak punya representasi regional-indicator standar, jadi dipetakan
// manual ke bendera Uni Eropa; kode negara lain dikonversi otomatis.
const isoToFlag = (iso: string) =>
  iso === "EU"
    ? "🇪🇺"
    : iso
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint(127397 + char.charCodeAt(0)),
        );

const money = (value: number, currency: string) => {
  const option =
    currencies.find((item) => item.code === currency) ?? currencies[0];
  return new Intl.NumberFormat(option.locale, {
    style: "currency",
    currency: option.code,
    maximumFractionDigits: ["IDR", "JPY"].includes(option.code) ? 0 : 2,
  }).format(Math.max(0, value || 0));
};

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={controlClass}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function FieldGroup({
  title,
  span,
  children,
}: {
  title: string;
  span?: "full";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("field-group", span === "full" && "field-group-full")}>
      <h4>{title}</h4>
      <div className="field-group-grid">{children}</div>
    </div>
  );
}

function StepHeading({
  index,
  title,
  description,
  meta,
}: {
  index: number;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="step-heading">
      <span className="step-index">{index}</span>
      <div className="step-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {meta && (
        <span className="step-meta">
          <span className="step-meta-dot" />
          {meta}
        </span>
      )}
    </div>
  );
}

function Receipt({
  store,
  title,
  order,
  date,
  payment,
  note,
  items,
  theme,
  logo,
  currency,
  onCopy,
  receiptRef,
}: {
  store: string;
  title: string;
  order: string;
  date: string;
  payment: string;
  note: string;
  items: Item[];
  theme: Theme;
  logo: string;
  currency: string;
  onCopy: () => void;
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
        <p>Thanks for shopping with us.</p>
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
      {note && <p className="receipt-note">“{note}”</p>}
      <footer className="receipt-foot">
        <span>made with receipt studio</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="receipt-copy"
          onClick={onCopy}
          aria-label="Copy receipt"
        >
          <Copy size={15} />
        </Button>
      </footer>
      <div className="tear-line" />
    </article>
  );
}

export default function Page() {
  const [store, setStore] = useState("Morrow Goods"),
    [title, setTitle] = useState("Payment receipt"),
    [order, setOrder] = useState("4829"),
    [date, setDate] = useState("09.02.2026"),
    [payment, setPayment] = useState("Visa •••• 4242"),
    [note, setNote] = useState("A little something for your everyday."),
    [currency, setCurrency] = useState("IDR"),
    [theme, setTheme] = useState(themes[3]),
    [logo, setLogo] = useState(""),
    [copied, setCopied] = useState(false),
    [items, setItems] = useState<Item[]>(initialItems);

  const handleCurrencyChange = (value: string | null) => {
    setCurrency(value ?? "IDR");
  };
  const fileRef = useRef<HTMLInputElement>(null),
    receiptRef = useRef<HTMLElement>(null),
    total = useMemo(
      () => items.reduce((s, i) => s + i.qty * i.price, 0),
      [items],
    );
  const [downloading, setDownloading] = useState(false);

  // Pilih tema acak setiap kali halaman di-refresh, dilakukan di useEffect
  // (bukan langsung di useState) supaya render pertama server & client
  // tetap identik dan tidak memicu hydration mismatch.
  useEffect(() => {
    const random = themes[Math.floor(Math.random() * themes.length)];
    setTheme(random);
  }, []);

  const updateItem = (id: number, key: keyof Item, value: string | number) =>
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, [key]: value } : i)),
    );
  const handleLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2_000_000) {
      alert("Please choose an image under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };
  const reset = () => {
    setStore("Morrow Goods");
    setTitle("Payment receipt");
    setOrder("4829");
    setDate("09.02.2026");
    setPayment("Visa •••• 4242");
    setNote("A little something for your everyday.");
    setCurrency("IDR");
    setItems(initialItems);
    setTheme(themes[3]);
    setLogo("");
  };
  const copy = async () => {
    await navigator.clipboard?.writeText(
      `${store} — ${money(total, currency)} — ${payment}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Menunggu dua animation frame supaya browser benar-benar selesai
  // melayout & mengecat sebelum di-capture, mencegah hasil terpotong.
  const nextPaint = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

  const downloadImage = async () => {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await nextPaint();

      const node = receiptRef.current;
      const { width, height } = node.getBoundingClientRect();

      const dataUrl = await toPng(node, {
        width: Math.ceil(width),
        height: Math.ceil(height),
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: theme.paper,
        style: { margin: "0", boxShadow: "none", transform: "none" },
        filter: (element) => !element.classList?.contains("receipt-copy"),
      });

      const link = document.createElement("a");
      link.download = `${(store || "receipt").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-receipt.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate receipt image", error);
      alert("Gagal membuat gambar nota. Coba lagi sebentar lagi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main
      className="studio"
      style={
        {
          "--accent": theme.accent,
          "--ink": theme.ink,
          "--control-radius": theme.shape === "0px" ? "3px" : theme.shape,
        } as React.CSSProperties
      }
    >
      <nav className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">r</span> Receipt studio
        </a>
        <div className="top-actions">
          <Button
            type="button"
            variant="outline"
            className="quiet-button"
            onClick={reset}
          >
            <RotateCcw size={15} /> Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            className="quiet-button export-button"
            onClick={downloadImage}
            disabled={downloading}
          >
            {downloading ? (
              <LoaderCircle className="spin" size={15} />
            ) : (
              <Download size={15} />
            )}{" "}
            {downloading ? "Making image…" : "Download image"}
          </Button>
          <Button
            type="button"
            className="dark-button"
            onClick={() => window.print()}
          >
            <Printer size={15} /> Print / PDF
          </Button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy-block">
          <p className="hero-kicker">Free receipt generator</p>
          <h1>
            Receipts that actually <em>look</em> like your brand.
          </h1>
          <p className="hero-copy">
            Fill in the details, drop your logo in, and pick a mood — the
            preview updates as you type, so what you see is what gets printed.
          </p>
        </div>
        <div className="hero-total">
          <span>Current total</span>
          <strong>{money(total, currency)}</strong>
          <small>{items.length} line items</small>
        </div>
      </section>

      <div className="workspace">
        <section className="editor-panel">
          <StepHeading
            index={1}
            title="Make it yours"
            description="Set the identity, order info, and a short note."
            meta="Live preview"
          />

          <div className="fields-stack">
            <FieldGroup title="Identity">
              <Field
                id="store-name"
                label="Store name"
                value={store}
                onChange={setStore}
              />
              <Field
                id="receipt-title"
                label="Receipt title"
                value={title}
                onChange={setTitle}
              />

              <div className="field field-logo">
                <Label>Store logo</Label>
                <div className="logo-upload">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogo}
                    hidden
                  />
                  {logo ? (
                    <div className="logo-actions">
                      <img src={logo} alt="Uploaded logo preview" />
                      <span>Logo ready for print.</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setLogo("")}
                        aria-label="Remove logo"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="upload-button"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={15} /> Upload a square image
                    </Button>
                  )}
                </div>
              </div>
            </FieldGroup>

            <FieldGroup title="Order & payment">
              <Field
                id="order-number"
                label="Order number"
                value={order}
                onChange={setOrder}
              />
              <Field
                id="receipt-date"
                label="Date"
                value={date}
                onChange={setDate}
              />
              <Field
                id="payment-method"
                label="Payment method"
                value={payment}
                onChange={setPayment}
              />

              <div className="field">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger
                    id="currency"
                    aria-label="Currency"
                    className={cn(controlClass, "justify-between")}
                  >
                    <SelectValue placeholder="Choose a currency" />
                  </SelectTrigger>
                  <SelectContent className="border-[color:var(--ink)]/14 bg-[color:var(--panel)] text-[color:var(--ink)]">
                    {currencies.map((item) => (
                      <SelectItem
                        key={item.code}
                        value={item.code}
                        className="focus:bg-[color:var(--accent)]/15 focus:text-[color:var(--ink)]"
                      >
                        <span className="currency-option">
                          <span aria-hidden>{isoToFlag(item.flag)}</span>
                          {item.code}
                          <small>{item.label}</small>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FieldGroup>

            <FieldGroup title="Note" span="full">
              <Field
                id="personal-note"
                label="Personal note"
                value={note}
                onChange={setNote}
                hint="Shown in quotes near the bottom of the receipt."
              />
            </FieldGroup>
          </div>

          <StepHeading
            index={2}
            title="What was bought"
            description="Add, edit, or remove the line items."
            meta={`${items.length} ${items.length === 1 ? "row" : "rows"}`}
          />

          <div className="items-editor">
            {items.map((i) => (
              <div className="item-row" key={i.id}>
                <div className="item-main">
                  <Input
                    aria-label="Item name"
                    value={i.name}
                    onChange={(e) => updateItem(i.id, "name", e.target.value)}
                    className={controlClass}
                  />
                  <Input
                    aria-label="Item detail"
                    value={i.detail}
                    onChange={(e) => updateItem(i.id, "detail", e.target.value)}
                    className={cn(controlClass, "sub-input")}
                  />
                </div>
                <div className="qty">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateItem(i.id, "qty", Math.max(1, i.qty - 1))
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </Button>
                  <span>{i.qty}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => updateItem(i.id, "qty", i.qty + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </Button>
                </div>
                <label className="price-input">
                  <span>{currency}</span>
                  <Input
                    aria-label={`Item price in ${currency}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={i.price}
                    onChange={(e) =>
                      updateItem(i.id, "price", Number(e.target.value))
                    }
                    className={cn(controlClass, "text-right")}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="delete-button"
                  onClick={() => setItems(items.filter((x) => x.id !== i.id))}
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="add-item"
            onClick={() =>
              setItems([
                ...items,
                {
                  id: Date.now(),
                  name: "New item",
                  detail: "add a detail",
                  qty: 1,
                  price: 0,
                },
              ])
            }
          >
            <Plus size={16} /> Add another item
          </Button>

          <StepHeading
            index={3}
            title="Pick the mood"
            description="Each mood carries its own palette and typeface."
          />

          <div className="theme-list">
            {themes.map((o) => (
              <button
                key={o.name}
                type="button"
                className={cn(
                  "theme-option",
                  theme.name === o.name && "active",
                )}
                onClick={() => setTheme(o)}
              >
                <span
                  className="theme-swatch"
                  style={{
                    background: o.paper,
                    color: o.ink,
                    fontFamily: o.font,
                    fontWeight: o.weight,
                  }}
                >
                  <span
                    className="theme-swatch-accent"
                    style={{ background: o.accent }}
                  />
                  Aa
                </span>
                <span className="theme-copy">
                  <b>{o.name}</b>
                  <small>{o.vibe}</small>
                </span>
                {theme.name === o.name && <Check size={15} />}
              </button>
            ))}
          </div>
        </section>

        <section className="preview-panel">
          <div className="preview-label">
            <span>Live preview — {theme.name}</span>
            <Button type="button" variant="ghost" size="sm" onClick={copy}>
              {copied ? (
                <>
                  <Check size={14} /> Copied
                </>
              ) : (
                <>
                  <Share2 size={14} /> Copy summary
                </>
              )}
            </Button>
          </div>
          <div className="receipt-wrap">
            <Receipt
              store={store}
              title={title}
              order={order}
              date={date}
              payment={payment}
              note={note}
              items={items}
              theme={theme}
              logo={logo}
              currency={currency}
              onCopy={copy}
              receiptRef={receiptRef}
            />
          </div>
          <p className="preview-hint">
            Updates as you type. Print it or save a PDF when it feels right.
          </p>
        </section>
      </div>
    </main>
  );
}
