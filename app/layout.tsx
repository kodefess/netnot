import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import { COLOR_SCHEME_SCRIPT } from "@/components/color-scheme-toggle";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.title}`,
  },
  description: SITE.description,
  applicationName: SITE.title,
  generator: SITE.title,
  keywords: ["JOYCO", "JOYCO Supply", "receipt generator", "receipt maker", "nota", "struk", "invoice"],
  alternates: { canonical: "/" },
  // Gambar share otomatis dari app/opengraph-image.tsx & twitter-image.tsx.
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.title,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  // Favicon = logo JOYCO.
  icons: {
    icon: [{ url: "/joyco.png", type: "image/png", sizes: "200x200" }],
    shortcut: "/joyco.png",
    apple: "/joyco.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme diset oleh script sebelum paint, jadi atributnya memang
    // berbeda dari HTML server — wajar, bukan bug hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />
      </head>
      <body className={fontVariables}>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
