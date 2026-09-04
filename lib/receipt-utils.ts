export type Item = {
  id: number;
  name: string;
  detail: string;
  qty: number;
  price: number;
};

export const initialItems: Item[] = [
  {
    id: 1,
    name: "Daily tote bag",
    detail: "natural / one size",
    qty: 1,
    price: 10000,
  },
  { id: 2, name: "Studio mug", detail: "matte black", qty: 2, price: 20000 },
];

export const currencies = [
  { code: "IDR", label: "Indonesian rupiah", flag: "ID", locale: "id-ID" },
  { code: "USD", label: "US dollar", flag: "US", locale: "en-US" },
  { code: "EUR", label: "Euro", flag: "EU", locale: "de-DE" },
  { code: "GBP", label: "British pound", flag: "GB", locale: "en-GB" },
  { code: "JPY", label: "Japanese yen", flag: "JP", locale: "ja-JP" },
  { code: "SGD", label: "Singapore dollar", flag: "SG", locale: "en-SG" },
  { code: "MYR", label: "Malaysian ringgit", flag: "MY", locale: "ms-MY" },
  { code: "AUD", label: "Australian dollar", flag: "AU", locale: "en-AU" },
];

// Beberapa varian ucapan terima kasih, tiap entri 2 baris (kalimat utama +
// penutup singkat). Dipilih acak sekali per resi lewat pickThankYou(),
// supaya preview tidak selalu menampilkan kalimat yang itu-itu saja.
export const thankYouMessages: [string, string][] = [
  ["Thank you for your order!", "We hope to serve you again. 𓆩𓆪"],
  ["Thanks a bunch for shopping with us!", "See you again soon. ✦"],
  ["Your support means the world to us.", "Come back anytime. ⋆"],
  ["Appreciate you choosing us today.", "Until next time. ˖"],
  ["Every order makes our day.", "Thanks for stopping by. ⋆⁺"],
  ["Made with care, just for you.", "Hope to see you again. 𓂃"],
];

export const pickThankYou = () =>
  thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];

export const money = (value: number, currency: string) => {
  const option =
    currencies.find((item) => item.code === currency) ?? currencies[0];
  return new Intl.NumberFormat(option.locale, {
    style: "currency",
    currency: option.code,
    maximumFractionDigits: ["IDR", "JPY"].includes(option.code) ? 0 : 2,
  }).format(Math.max(0, value || 0));
};

// EU tidak punya representasi regional-indicator standar, jadi dipetakan
// manual ke bendera Uni Eropa; kode negara lain dikonversi otomatis.
export const isoToFlag = (iso: string) =>
  iso === "EU"
    ? "🇪🇺"
    : iso
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint(127397 + char.charCodeAt(0)),
        );

// Format tanggal saat ini sesuai zona waktu Asia/Jakarta (GMT+7),
// output "DD.MM.YYYY" agar konsisten dengan format resi sebelumnya.
// Dipanggil di useEffect (bukan langsung di useState) supaya render
// pertama server & client tetap identik dan tidak memicu hydration mismatch.
export const getJakartaDate = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());

  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "2026";

  return `${day}.${month}.${year}`;
};

// Nilai default sebelum useEffect menyetel tanggal asli Asia/Jakarta.
export const DEFAULT_DATE_PLACEHOLDER = "01.01.2026";
