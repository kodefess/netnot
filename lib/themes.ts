export type ReceiptPattern = "none" | "dots" | "grid";

/**
 * Susunan nota. Warna semua tema sama-sama biru brand, jadi pembedanya
 * ada di layout, tipografi, dan detail desain.
 * - classic: logo & nomor di atas, judul, daftar item, total.
 * - poster:  header blok aksen penuh dengan nama toko besar (Electric).
 * - ticket:  rata tengah ala struk kasir, titik-titik penghubung harga.
 * - table:   tabel berkolom (item / qty / jumlah) dan blok info berbingkai.
 * - wallet:  ala aplikasi pembayaran — segel & nominal besar di atas.
 * - margin:  pita biru vertikal di kiri dengan nama toko diputar.
 * - swiss:   grid presisi bergaris hairline, item bernomor, total besar.
 * - card:    kartu pembayaran biru (chip, nomor, pola gelombang) di atas, item di bawah.
 * - hub:     gaya JOYCO Hub — strip segmen kotak, label mono, badge, kartu wireframe.
 * - basement: nuansa basement.studio — wordmark, nominal raksasa, grid sel, toggle pill.
 * - basement2: sel bertitik sudut, label piksel, arsir diagonal, pita garis polisi.
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
  | "folio"
  | "hub"
  | "basement"
  | "basement2";

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
  /** Rona panel/segmen (layout hub). Default: ink. */
  tint?: string;
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
  graphite: "#141417",
} as const;

const { blue, white, ice, navy, graphite } = BRAND;

export const themes: Theme[] = [
  // Mengikuti bahasa visual JOYCO Hub: abu gelap, kotak tegas, biru brand.
  {
    id: "joyco-studio",
    name: "JOYCO Studio",
    vibe: "Hub grid, crisp & square",
    layout: "hub",
    ink: "#ebebeb",
    accent: blue,
    onAccent: white,
    paper: "#0b0b0b",
    font: "var(--font-public-sans)",
    weight: 600,
    radius: "0px",
    pattern: "none",
  },
  // Versi terang dari JOYCO Studio: kertas putih bersih, segmen diwarnai
  // rona biru brand (tint) alih-alih abu-abu.
  {
    id: "joyco-studio-light",
    name: "JOYCO Studio Light",
    vibe: "Hub grid, white & blue tint",
    layout: "hub",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: white,
    tint: blue,
    font: "var(--font-public-sans)",
    weight: 600,
    radius: "0px",
    pattern: "none",
  },
  // Nuansa basement.studio: hitam pekat, Geist rapat, satu aksen biru brand.
  {
    id: "basement",
    name: "Basement",
    vibe: "Pitch black, electric blue",
    layout: "basement",
    ink: "#e6e6e6",
    accent: blue,
    onAccent: white,
    paper: "#000000",
    font: "var(--font-geist)",
    weight: 600,
    radius: "0px",
    pattern: "none",
  },
  {
    id: "basement-v2",
    name: "Basement v2",
    vibe: "Police tape, pixel labels",
    layout: "basement2",
    ink: "#e6e6e6",
    accent: blue,
    onAccent: white,
    paper: "#000000",
    font: "var(--font-geist)",
    weight: 600,
    radius: "0px",
    pattern: "none",
  },
  {
    id: "mono",
    name: "Mono",
    vibe: "Ice paper, Swiss grid",
    layout: "swiss",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: ice,
    font: "var(--font-space-grotesk)",
    weight: 700,
    radius: "0px",
    pattern: "none",
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
    radius: "4px",
    pattern: "none",
    solidRules: true,
  },
  {
    id: "atelier",
    name: "Atelier",
    vibe: "Framed boutique folio",
    layout: "folio",
    ink: navy,
    accent: blue,
    onAccent: white,
    paper: "#fbfbfd",
    font: "var(--font-instrument-serif)",
    weight: 400,
    radius: "2px",
    pattern: "none",
    solidRules: true,
  },
  // Kertas biru penuh dengan band putih: header besar, semua kapital.
  {
    id: "electric",
    name: "Electric",
    vibe: "Blue sheet, white band",
    layout: "poster",
    ink: white,
    accent: white,
    onAccent: blue,
    paper: blue,
    font: "var(--font-archivo)",
    weight: 900,
    radius: "0px",
    pattern: "none",
    caps: true,
    solidRules: true,
  },
  {
    id: "midnight",
    name: "Midnight",
    vibe: "Graphite app card",
    layout: "wallet",
    ink: "#f2f2f4",
    accent: blue,
    onAccent: white,
    paper: graphite,
    font: "var(--font-geist)",
    weight: 600,
    radius: "24px",
    pattern: "none",
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
