import {
  Archivo,
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Rubik,
  Sora,
  Space_Grotesk,
} from "next/font/google";

// next/font wajib dipanggil di module scope, jadi semua typeface nota
// di-load di sini lalu diekspos sebagai CSS variable. Tema cukup merujuk
// nama variable-nya (lihat lib/themes.ts). Variable dinamai sesuai font,
// bukan sesuai tema, supaya satu font bisa dipakai ulang oleh tema lain.

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-bricolage",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

// Geist, Geist Mono & Instrument Serif dipakai chrome aplikasi sekaligus
// beberapa tema nota (Mono, Midnight, Ticket, Atelier).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

export const fontVariables = [
  geist,
  geistMono,
  instrumentSerif,
  archivo,
  sora,
  rubik,
  bricolage,
  spaceGrotesk,
]
  .map((font) => font.variable)
  .join(" ");
