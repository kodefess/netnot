import { useId } from "react";

/** FNV-1a 32-bit — hash kecil & deterministik untuk seed pola segel. */
export function sealHash(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Kode segel yang bisa dicocokkan, mis. "A3F9-21C0". */
export const sealCode = (seed: string) => {
  const hex = sealHash(seed).toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
};

// PRNG mulberry32: dari satu hash menghasilkan deret angka yang selalu sama.
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => n.toFixed(2);

/** Kurva guilloche: lingkaran yang radiusnya dimodulasi sinus. */
function guilloche(base: number, amp: number, waves: number, phase: number) {
  const steps = 360;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = base + amp * Math.sin(waves * t + phase);
    d += `${i ? "L" : "M"}${fmt(r * Math.cos(t))},${fmt(r * Math.sin(t))}`;
  }
  return `${d}Z`;
}

/** Tepi bergerigi seperti stiker segel / rosette. */
function starburst(points: number, outer: number, inner: number) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const t = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    d += `${i ? "L" : "M"}${fmt(r * Math.cos(t))},${fmt(r * Math.sin(t))}`;
  }
  return `${d}Z`;
}

/**
 * Segel "Paid / Lunas" bergaya stiker hologram. Pola guilloche, jumlah
 * gerigi, dan teks mikro di cincinnya diturunkan dari data nota (nomor,
 * tanggal, toko, total), jadi tiap nota punya segel unik dan mengubah
 * datanya otomatis mengubah segelnya.
 */
export function PaidSeal({ seed, microText }: { seed: string; microText: string }) {
  const id = useId().replace(/:/g, "");
  const rand = rng(sealHash(seed));

  const points = 26 + Math.floor(rand() * 10);
  const outerWaves = 9 + Math.floor(rand() * 7);
  const innerWaves = 5 + Math.floor(rand() * 5);
  const angle = Math.floor(rand() * 360);
  const phase = rand() * Math.PI;

  const outerBand = Array.from({ length: 7 }, (_, i) =>
    guilloche(29 + i * 0.9, 3.2, outerWaves, phase + i * 0.45),
  );
  const innerBand = Array.from({ length: 5 }, (_, i) =>
    guilloche(20 + i * 0.7, 1.8, innerWaves, -phase + i * 0.6),
  );

  // Diulang supaya cincin teks mikro selalu penuh, sependek apa pun datanya.
  const ring = `${microText} • `.repeat(6);

  return (
    <svg viewBox="-50 -50 100 100" className="paid-seal" aria-hidden="true">
      <defs>
        <linearGradient
          id={`${id}-holo`}
          x1="-50"
          y1="-50"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`rotate(${angle})`}
        >
          {/* Foil biru brand: #1337FF dengan pantulan terang di antaranya. */}
          <stop offset="0" stopColor="#1337ff" />
          <stop offset="0.2" stopColor="#7d93ff" />
          <stop offset="0.36" stopColor="#dfe6ff" />
          <stop offset="0.5" stopColor="#5f7bff" />
          <stop offset="0.66" stopColor="#1337ff" />
          <stop offset="0.82" stopColor="#b9c6ff" />
          <stop offset="1" stopColor="#3355ff" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.48" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <path id={`${id}-ring`} d="M0,-40.5a40.5,40.5 0 1,1 0,81a40.5,40.5 0 1,1 0,-81" />
      </defs>

      <path d={starburst(points, 49.5, 45.5)} fill={`url(#${id}-holo)`} />
      <path
        d={starburst(points, 49.5, 45.5)}
        fill="none"
        stroke="#0a0f33"
        strokeOpacity="0.35"
        strokeWidth="0.6"
      />
      {/* Pita navy tempat teks mikro, supaya tetap terbaca di atas foil. */}
      <circle r="40.6" fill="none" stroke="#0a0f33" strokeWidth="6.2" />
      <circle r="44" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="0.4" />
      <circle r="37.2" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="0.4" />

      <text fontSize="3.3" fontWeight="700" letterSpacing="0.6" fill="#ffffff">
        <textPath href={`#${id}-ring`}>{ring}</textPath>
      </text>

      <g fill="none" strokeWidth="0.32">
        {outerBand.map((d, i) => (
          <path key={`o${i}`} d={d} stroke={i % 2 ? "#ffffff" : "#0a0f33"} strokeOpacity={i % 2 ? 0.9 : 0.45} />
        ))}
        {innerBand.map((d, i) => (
          <path key={`i${i}`} d={d} stroke={i % 2 ? "#0a0f33" : "#ffffff"} strokeOpacity={i % 2 ? 0.45 : 0.9} />
        ))}
      </g>

      <circle r="17" fill="#ffffff" fillOpacity="0.9" />
      <circle r="17" fill="none" stroke="#0a0f33" strokeOpacity="0.55" strokeWidth="0.5" />
      <text
        y="1.2"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        letterSpacing="0.4"
        fill="#1337ff"
      >
        PAID
      </text>
      <text
        y="7.6"
        textAnchor="middle"
        fontSize="3.6"
        fontWeight="700"
        letterSpacing="1.4"
        fill="#0a0f33"
        fillOpacity="0.75"
      >
        LUNAS
      </text>
      <path d={starburst(5, 3.2, 1.35)} fill="#1337ff" transform="translate(0 -10)" />

      {/* Kilau diagonal — memberi kesan foil hologram. */}
      <path d={starburst(points, 49.5, 45.5)} fill={`url(#${id}-sheen)`} className="paid-seal-sheen" />
    </svg>
  );
}
