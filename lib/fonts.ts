import {
  Quicksand,
  Space_Grotesk,
  Libre_Caslon_Text,
  Manrope,
  Fraunces,
  Bricolage_Grotesque,
  Inter,
  Cormorant_Garamond,
  Bodoni_Moda,
  Baloo_2,
  Outfit,
  IBM_Plex_Mono,
  IBM_Plex_Serif,
  Unbounded,
  Sora,
  IBM_Plex_Sans,
  Instrument_Sans,
  Instrument_Serif,
} from "next/font/google";

// Setiap tema nota punya identitas tipografi sendiri — bukan sekadar
// "sans / serif / mono" generik, tapi typeface spesifik yang dipilih
// sesuai mood temanya. Semua di-load di sini (module scope, wajib untuk
// next/font) lalu diekspos sebagai CSS variable, supaya saat tema
// berganti kita cukup ganti nama variable-nya di objek tema — tidak perlu
// load font baru secara dinamis.

export const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cute",
});
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cool",
});
export const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-classic",
});
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-modern",
});
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
});
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-retro",
});
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-minimal",
});
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-botanical",
});
export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-noir",
});
export const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-pastel",
});
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sunset",
});
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-thermal",
});
export const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-newsprint",
});
export const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-terrazzo",
});
export const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-citrus",
});
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-slate",
});

// Font untuk chrome aplikasi itu sendiri (bukan nota) — dipisah dari
// font tema supaya identitas alat (studio) tidak ikut berubah saat
// pengguna gonta-ganti tema nota.
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
});
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const receiptFontVariables = [
  quicksand.variable,
  spaceGrotesk.variable,
  libreCaslon.variable,
  manrope.variable,
  fraunces.variable,
  bricolage.variable,
  inter.variable,
  cormorant.variable,
  bodoni.variable,
  baloo.variable,
  outfit.variable,
  plexMono.variable,
  plexSerif.variable,
  unbounded.variable,
  sora.variable,
  plexSans.variable,
].join(" ");

export const uiFontVariables = `${instrumentSans.variable} ${instrumentSerif.variable}`;