import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { receiptFontVariables, uiFontVariables } from "@/lib/fonts";
import { SmoothScroll } from "@/components/smooth-scroll";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Receipt Studio — receipts with a point of view",
  description:
    "Create beautiful, customizable receipts for your store in seconds.",
  generator: "Receipt Studio",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${uiFontVariables} ${receiptFontVariables} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
