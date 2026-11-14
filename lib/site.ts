/** Origin publik untuk URL absolut (Open Graph, canonical). Di dev memakai
 * localhost; selain itu domain production, kecuali diganti lewat env. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://joycosupply.vercel.app");

export const SITE = {
  brand: "JOYCO",
  product: "Supply",
  title: "JOYCO Supply",
  tagline: "On-brand receipts in seconds",
  defaultLogo: "/joyco.png",
  description:
    "JOYCO Supply is the receipt studio for JOYCO stores. Design clean, on-brand receipts, then download, print, or share them in seconds.",
  url: SITE_URL,
  locale: "en_US",
};
