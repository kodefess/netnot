import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#1337ff";
const INK = "#ebebeb";
const MUTED = "#8a8a8a";
const SEG = "#1c1c1c";

/** Gambar share 1200×630: panel gelap ala JOYCO Hub + nota wireframe biru. */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/joyco.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const row = (w: number, accent = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ width: w, height: 10, borderRadius: 5, background: accent ? BLUE : "#3a3a3a" }} />
      <div style={{ width: 54, height: 10, borderRadius: 5, background: accent ? BLUE : "#2c2c2c" }} />
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b0b0b", padding: 4, gap: 4 }}>
        {/* Rail kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 96 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" />
          <div style={{ display: "flex", flex: 1, background: SEG }} />
          <div style={{ display: "flex", height: 96, background: SEG }} />
        </div>

        {/* Panel utama */}
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 72px",
            background: "#141414",
            backgroundImage: "radial-gradient(#262626 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 14px",
                background: SEG,
                color: MUTED,
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Receipt studio
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 92, fontWeight: 700, color: INK, letterSpacing: -3, lineHeight: 1 }}>
              {SITE.brand}
              <span style={{ color: BLUE, marginLeft: 22 }}>{SITE.product}</span>
            </div>
            <div style={{ display: "flex", marginTop: 26, fontSize: 32, color: MUTED, lineHeight: 1.35 }}>
              {SITE.tagline}. Design, download, print, share.
            </div>
          </div>

          {/* Nota wireframe */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              width: 300,
              padding: "30px 28px 40px",
              background: "#f7f8ff",
              transform: "rotate(4deg)",
              boxShadow: `0 0 0 4px ${BLUE}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: 44, height: 44, background: BLUE }} />
              <div style={{ width: 70, height: 10, borderRadius: 5, background: "#c9cfe8" }} />
            </div>
            <div style={{ display: "flex", width: 170, height: 22, borderRadius: 4, background: "#0a0f33", marginTop: 6 }} />
            <div style={{ display: "flex", borderTop: "2px dashed #c9cfe8", marginTop: 4 }} />
            {row(130)}
            {row(100)}
            {row(150)}
            <div style={{ display: "flex", borderTop: "2px dashed #c9cfe8" }} />
            {row(80, true)}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
