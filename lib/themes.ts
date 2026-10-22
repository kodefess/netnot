export type ReceiptPattern = "none" | "dots" | "grid";

/**
 * Susunan nota. Warna semua tema sama-sama biru brand, jadi pembedanya
 * ada di layout, tipografi, dan detail desain.
 * - classic: logo & nomor di atas, judul, daftar item, total.
 * - poster:  header blok biru penuh dengan nama toko besar.
 * - ticket:  rata tengah ala struk kasir, titik-titik penghubung harga.
 * - table:   tabel berkolom (item / qty / jumlah) dan blok info berbingkai.
 * - wallet:  ala aplikasi pembayaran — segel & nominal besar di atas.
 * - margin:  pita biru vertikal di kiri dengan nama toko diputar.
 * - swiss:   grid presisi bergaris hairline, item bernomor, total besar.
 * - card:    kartu pembayaran biru (chip, nomor, pola gelombang) di atas, item di bawah.
 * - folio:   kartu butik — bingkai ganda, monogram, serif miring, simetris.
 */
export type ReceiptLayout =
  | "classic"
  | "poster"
  | "ticket"
  | "table"
  | "wallet"
  | "margin"
  | "swiss"
  | "card"
  | "folio";

export type Theme = {
  id: string;
  name: string;
  vibe: string;
  layout: ReceiptLayout;
  /** Teks utama nota. */
  ink: string;
  /** Warna aksen: garis atas, logo default, blok header. */
  accent: string;
  /** Warna teks di atas blok aksen. */
  onAccent: string;
  /** Warna kertas, juga background PNG hasil export. */
  paper: string;
  /** CSS variable font dari lib/fonts.ts. */
  font: string;
  /** Ketebalan judul untuk typeface ini. */
  weight: number;
  radius: string;
  pattern: ReceiptPattern;
  /** Judul & label kapital dengan tracking rapat — karakter "poster". */
  caps?: boolean;
  /** Total & pembayaran dibingkai garis tegas. */
  boxed?: boolean;
  /** Garis pemisah solid tipis, bukan putus-putus. */
  solidRules?: boolean;
};

/** Warna brand. Semua tema dibangun hanya dari palet ini. */
export const BRAND = {
  blue: "#1337ff",
  white: "#ffffff",
  ice: "#f2f4ff",
  navy: "#0a0f33",
  night: "#070b24",
} as const;

const { blue, white, ice, navy, night } = BRAND;

export const themes: Theme[] = [
  {
    id: "mono",
    name: "Mono",
    vibe: "Swiss grid, hairline precise",
    layout: "swiss",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-geist)",
    weight: 600,
    radius: "12px",
    pattern: "none",
    solidRules: true,
  },
  {
    id: "poster",
    name: "Poster",
    vibe: "Big, loud header",
    layout: "poster",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-archivo)",
    weight: 900,
    radius: "0px",
    pattern: "none",
    caps: true,
    solidRules: true,
  },
  {
    id: "wallet",
    name: "Wallet",
    vibe: "Amount-first, app-like",
    layout: "wallet",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-rubik)",
    weight: 700,
    radius: "24px",
    pattern: "none",
    solidRules: true,
  },
  {
    id: "ticket",
    name: "Ticket",
    vibe: "Register tape, blue ink",
    layout: "ticket",
    ink: blue,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-geist-mono)",
    weight: 600,
    radius: "0px",
    pattern: "none",
  },
  {
    id: "cobalt",
    name: "Cobalt",
    vibe: "Premium payment card",
    layout: "card",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-sora)",
    weight: 600,
    radius: "16px",
    pattern: "none",
  },
  {
    id: "margin",
    name: "Margin",
    vibe: "Blue spine, editorial",
    layout: "margin",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-bricolage)",
    weight: 800,
    radius: "6px",
    pattern: "none",
    solidRules: true,
  },
  {
    id: "atelier",
    name: "Atelier",
    vibe: "Framed boutique folio",
    layout: "folio",
    ink: blue,
    accent: blue,
    onAccent: white,
    paper: white,
    font: "var(--font-instrument-serif)",
    weight: 400,
    radius: "2px",
    pattern: "none",
    solidRules: true,
  },
  {
    id: "electric",
    name: "Electric",
    vibe: "Solid blue, all caps",
    layout: "classic",
    ink: white,
    accent: white,
    onAccent: blue,
    paper: blue,
    font: "var(--font-archivo)",
    weight: 900,
    radius: "0px",
    pattern: "none",
    caps: true,
    boxed: true,
  },
  {
    id: "blueprint",
    name: "Blueprint",
    vibe: "Spec sheet on a grid",
    layout: "table",
    ink: white,
    accent: white,
    onAccent: blue,
    paper: blue,
    font: "var(--font-space-grotesk)",
    weight: 700,
    radius: "4px",
    pattern: "grid",
    boxed: true,
  },
  {
    id: "midnight",
    name: "Midnight",
    vibe: "Dark app card",
    layout: "wallet",
    ink: "#e8ecff",
    accent: blue,
    onAccent: white,
    paper: night,
    font: "var(--font-geist)",
    weight: 600,
    radius: "24px",
    pattern: "dots",
    solidRules: true,
  },
];

export const DEFAULT_THEME = themes[0];

export const findTheme = (id: string | undefined) =>
  themes.find((theme) => theme.id === id) ?? DEFAULT_THEME;

export const randomTheme = (exceptId?: string) => {
  const pool = themes.filter((theme) => theme.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)];
};
