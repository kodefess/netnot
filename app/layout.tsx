import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import { COLOR_SCHEME_SCRIPT } from "@/components/color-scheme-toggle";

export const metadata: Metadata = {
  title: `${SITE.title} — receipts with a point of view`,
  description: SITE.description,
  generator: SITE.title,
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
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
