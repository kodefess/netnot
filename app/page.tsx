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
  WandSparkles,
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

// Kelas dasar untuk Input & Select agar warna, radius, dan ring fokusnya
// mengikuti tema nota yang sedang aktif (lewat CSS var --ink/--paper/--accent/
// --control-radius yang di-set di elemen <main>), bukan gaya default shadcn
// yang generic — supaya tidak terasa "nyeleneh" dari desain nota.
const controlClass =
  "w-full rounded-[var(--control-radius)] border border-[color:var(--ink)]/15 bg-[color:var(--paper)] px-3 py-2 text-[15px] text-[color:var(--ink)] shadow-none transition-colors placeholder:text-[color:var(--ink)]/40 focus-visible:border-[color:var(--accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30 focus-visible:ring-offset-0";

type Item = {
  id: number;
  name: string;
  detail: string;
  qty: number;
  price: number;
};
type Theme = {
  name: string;
  vibe: string;
  ink: string;
  accent: string;
  paper: string;
  surface: string;
  font: string;
  shape: string;
  pattern: string;
};

const themes: Theme[] = [
  {
    name: "Cute",
    vibe: "Soft & sunny",
    ink: "#542b45",
    accent: "#ff9fc5",
    paper: "#fff6fb",
    surface: "#542b45",
    font: "round",
    shape: "22px",
    pattern: "dots",
  },
  {
    name: "Cool",
    vibe: "Electric blue",
    ink: "#102a52",
    accent: "#73a7ff",
    paper: "#f3f7ff",
    surface: "#10213d",
    font: "mono",
    shape: "4px",
    pattern: "grid",
  },
  {
    name: "Classic",
    vibe: "Timeless paper",
    ink: "#29251f",
    accent: "#c9a46c",
    paper: "#fbf6e9",
    surface: "#3d372f",
    font: "serif",
    shape: "0px",
    pattern: "none",
  },
  {
    name: "Modern",
    vibe: "Clean contrast",
    ink: "#111111",
    accent: "#b9f34a",
    paper: "#ffffff",
    surface: "#111111",
    font: "sans",
    shape: "12px",
    pattern: "none",
  },
  {
    name: "Editorial",
    vibe: "Ink & margin",
    ink: "#302d55",
    accent: "#b8a9ff",
    paper: "#f7f5ff",
    surface: "#302d55",
    font: "serif",
    shape: "0px",
    pattern: "lines",
  },
  {
    name: "Retro",
    vibe: "Peachy nostalgia",
    ink: "#713f32",
    accent: "#ffb15c",
    paper: "#fff1dc",
    surface: "#713f32",
    font: "round",
    shape: "16px",
    pattern: "dots",
  },
  {
    name: "Minimal",
    vibe: "Quiet essentials",
    ink: "#454545",
    accent: "#d7d7d7",
    paper: "#fafafa",
    surface: "#454545",
    font: "mono",
    shape: "2px",
    pattern: "none",
  },
  {
    name: "Botanical",
    vibe: "Mossy greenhouse",
    ink: "#22392a",
    accent: "#8fbf6a",
    paper: "#f2f6ec",
    surface: "#22392a",
    font: "serif",
    shape: "10px",
    pattern: "lines",
  },
  {
    name: "Noir",
    vibe: "Midnight & gold",
    ink: "#f2ece0",
    accent: "#d8b25c",
    paper: "#171512",
    surface: "#000000",
    font: "serif",
    shape: "2px",
    pattern: "none",
  },
  {
    name: "Pastel",
    vibe: "Cotton-candy calm",
    ink: "#4a3b5c",
    accent: "#c9b6ff",
    paper: "#faf7ff",
    surface: "#4a3b5c",
    font: "round",
    shape: "18px",
    pattern: "dots",
  },
  {
    name: "Sunset",
    vibe: "Coral horizon",
    ink: "#5c2a1f",
    accent: "#ff7a59",
    paper: "#fff3ea",
    surface: "#5c2a1f",
    font: "sans",
    shape: "14px",
    pattern: "grid",
  },
  {
    name: "Thermal",
    vibe: "Register tape",
    ink: "#1a1a1a",
    accent: "#1a1a1a",
    paper: "#ffffff",
    surface: "#1a1a1a",
    font: "mono",
    shape: "0px",
    pattern: "lines",
  },
];
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
  { code: "IDR", label: "Indonesian Rupiah", flag: "ID", locale: "id-ID" },
  { code: "USD", label: "US Dollar", flag: "US", locale: "en-US" },
  { code: "EUR", label: "Euro", flag: "EU", locale: "de-DE" },
  { code: "GBP", label: "British Pound", flag: "GB", locale: "en-GB" },
  { code: "JPY", label: "Japanese Yen", flag: "JP", locale: "ja-JP" },
  { code: "SGD", label: "Singapore Dollar", flag: "SG", locale: "en-SG" },
  { code: "MYR", label: "Malaysian Ringgit", flag: "MY", locale: "ms-MY" },
  { code: "AUD", label: "Australian Dollar", flag: "AU", locale: "en-AU" },
];
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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
      className={`receipt receipt-${theme.font} pattern-${theme.pattern}`}
      style={
        {
          "--receipt-ink": theme.ink,
          "--receipt-accent": theme.accent,
          "--receipt-paper": theme.paper,
          "--receipt-radius": theme.shape,
        } as React.CSSProperties
      }
    >
      <div className="receipt-topline" />
      <header className="receipt-head">
        <div className="receipt-mark">
          {logo ? (
            <img src={logo} alt={`${store} logo`} crossOrigin="anonymous" />
          ) : (
            <>
              <span>r</span>
              <b>r</b>
            </>
          )}
        </div>
        <div className="receipt-date">
          {date || "—"}
          <br />
          <strong>#{order || "0000"}</strong>
        </div>
      </header>
      <div className="receipt-intro">
        <p className="eyebrow">{title || "Payment receipt"}</p>
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
          <span>PAID VIA</span>
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

  // Pilih tema acak setiap kali halaman di-refresh. Dilakukan di useEffect
  // (bukan langsung di useState) supaya render pertama di server & client
  // tetap sama persis dan tidak memicu hydration mismatch — tema acak baru
  // "muncul" sesaat setelah halaman ter-mount di browser.
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

  // Menunggu dua animation frame supaya browser benar-benar selesai melayout & mengecat
  // node sebelum di-capture — mencegah hasil gambar yang terpotong/kosong.
  const nextPaint = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

  const downloadImage = async () => {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);
    try {
      // Pastikan web font sudah termuat, kalau tidak teks bisa render dengan font
      // fallback saat di-capture meskipun terlihat benar di layar.
      if (document.fonts?.ready) await document.fonts.ready;
      await nextPaint();

      const node = receiptRef.current;
      // Ambil ukuran nyata dari elemen yang sedang tampil, alih-alih memaksa
      // lebar/tinggi lain. Sebelumnya lebar di-hardcode ke 660px tapi tinggi
      // dihitung dari scrollHeight pada lebar tampilan saat ini — begitu
      // html-to-image me-render ulang pada lebar 660px, teks reflow dan
      // tingginya jadi tidak cocok lagi, sehingga gambar unduhan terpotong
      // atau menyisakan area kosong di bawah.
      const { width, height } = node.getBoundingClientRect();

      const dataUrl = await toPng(node, {
        width: Math.ceil(width),
        height: Math.ceil(height),
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: theme.paper,
        style: {
          margin: "0",
          boxShadow: "none",
          transform: "none",
        },
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
          "--paper": theme.paper,
          "--control-radius": theme.shape,
        } as React.CSSProperties
      }
    >
      <nav className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">r</span> receipt studio
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
        <div>
          <p className="kicker">
            <WandSparkles size={14} /> receipt maker / 02
          </p>
          <h1>Receipts, with a point of view.</h1>
          <p className="hero-copy">
            Build a receipt that feels like your brand. Add your mark, choose
            your mood, and make every little detail count.
          </p>
        </div>
        <div className="hero-total">
          <span>current total</span>
          <strong>{money(total, currency)}</strong>
        </div>
      </section>
      <div className="workspace">
        <section className="editor-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">01 / details</span>
              <h3>Make it yours.</h3>
            </div>
            <span className="step-chip">live</span>
          </div>
          <div className="fields-grid">
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
                <SelectContent className="border-[color:var(--ink)]/15 bg-[color:var(--paper)] text-[color:var(--ink)]">
                  {currencies.map((item) => (
                    <SelectItem
                      key={item.code}
                      value={item.code}
                      className="focus:bg-[color:var(--accent)]/20 focus:text-[color:var(--ink)]"
                    >
                      {item.code} · {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field
              id="personal-note"
              label="Personal note"
              value={note}
              onChange={setNote}
            />
          </div>

          <div className="logo-upload">
            <div>
              <span className="section-label">Store logo</span>
              <p>
                {logo
                  ? "Your logo is ready for print."
                  : "A square image works best. PNG, JPG, or WEBP."}
              </p>
            </div>
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
                <Upload size={15} /> Upload logo
              </Button>
            )}
          </div>

          <div className="panel-heading items-heading">
            <div>
              <span className="section-label">02 / line items</span>
              <h3>What was bought?</h3>
            </div>
            <span className="item-count">{items.length} rows</span>
          </div>
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
                    className={cn(
                      controlClass,
                      "sub-input text-[13px] opacity-80",
                    )}
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

          <div className="customize">
            <div className="panel-heading">
              <div>
                <span className="section-label">03 / atmosphere</span>
                <h3>Pick your mood.</h3>
              </div>
              <ImagePlus size={17} />
            </div>
            <div className="theme-list">
              {themes.map((o) => (
                <button
                  key={o.name}
                  type="button"
                  className={`theme-option ${theme.name === o.name ? "active" : ""}`}
                  onClick={() => setTheme(o)}
                >
                  <span
                    className="theme-swatch"
                    style={{ background: o.accent, color: o.ink }}
                  >
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
          </div>
        </section>
        <section className="preview-panel">
          <div className="preview-label">
            <span>live preview / {theme.name}</span>
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
