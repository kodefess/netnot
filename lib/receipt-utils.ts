export type Item = {
  id: string;
  name: string;
  detail: string;
  qty: number;
  price: number;
};

export type ThankYou = [string, string];

export type CurrencyCode = (typeof currencies)[number]["code"];

export const currencies = [
  { code: "IDR", label: "Indonesian rupiah", flag: "ID", locale: "id-ID", decimals: 0 },
  { code: "USD", label: "US dollar", flag: "US", locale: "en-US", decimals: 2 },
  { code: "EUR", label: "Euro", flag: "EU", locale: "de-DE", decimals: 2 },
  { code: "GBP", label: "British pound", flag: "GB", locale: "en-GB", decimals: 2 },
  { code: "JPY", label: "Japanese yen", flag: "JP", locale: "ja-JP", decimals: 0 },
  { code: "SGD", label: "Singapore dollar", flag: "SG", locale: "en-SG", decimals: 2 },
  { code: "MYR", label: "Malaysian ringgit", flag: "MY", locale: "ms-MY", decimals: 2 },
  { code: "AUD", label: "Australian dollar", flag: "AU", locale: "en-AU", decimals: 2 },
] as const;

export const isCurrency = (value: unknown): value is CurrencyCode =>
  currencies.some((c) => c.code === value);

// Ucapan penutup 2 baris (kalimat utama + penutup singkat).
export const thankYouMessages: ThankYou[] = [
  ["Thank you for your order!", "We hope to serve you again. 𓆩𓆪"],
  ["Thanks a bunch for shopping with us!", "See you again soon. ✦"],
  ["Your support means the world to us.", "Come back anytime. ⋆"],
  ["Appreciate you choosing us today.", "Until next time. ˖"],
  ["Every order makes our day.", "Thanks for stopping by. ⋆⁺"],
  ["Made with care, just for you.", "Hope to see you again. 𓂃"],
];

/** Pilih ucapan acak, dijamin beda dari yang sedang dipakai. */
export const pickThankYou = (current?: ThankYou): ThankYou => {
  const pool = thankYouMessages.filter((m) => m[0] !== current?.[0]);
  return pool[Math.floor(Math.random() * pool.length)];
};

let idCounter = 0;
export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${idCounter++}`;

export const createItem = (overrides: Partial<Item> = {}): Item => ({
  id: newId(),
  name: "",
  detail: "",
  qty: 1,
  price: 0,
  ...overrides,
});

export const initialItems = (): Item[] => [
  { id: "seed-1", name: "Daily tote bag", detail: "natural / one size", qty: 1, price: 10000 },
  { id: "seed-2", name: "Studio mug", detail: "matte black", qty: 2, price: 20000 },
];

export const sumItems = (items: Item[]) => ({
  total: items.reduce((sum, i) => sum + i.qty * i.price, 0),
  count: items.reduce((sum, i) => sum + i.qty, 0),
});

const formatters = new Map<string, Intl.NumberFormat>();

export const money = (value: number, currency: string) => {
  const option = currencies.find((c) => c.code === currency) ?? currencies[0];
  let formatter = formatters.get(option.code);
  if (!formatter) {
    formatter = new Intl.NumberFormat(option.locale, {
      style: "currency",
      currency: option.code,
      maximumFractionDigits: option.decimals,
    });
    formatters.set(option.code, formatter);
  }
  return formatter.format(Math.max(0, value || 0));
};

// EU tidak punya regional-indicator standar, jadi dipetakan manual.
export const isoToFlag = (iso: string) =>
  iso === "EU"
    ? "🇪🇺"
    : iso
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

/** Tanggal hari ini di zona Asia/Jakarta, format "DD.MM.YYYY". */
export const getJakartaDate = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}`;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "receipt";
