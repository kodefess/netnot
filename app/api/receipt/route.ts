import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";

const PREFIX = "J";
const PAD_LENGTH = 3;
const MAX_ITEMS = 200;

// Dibuat lazy supaya build tidak gagal saat env Redis belum diset.
let redis: Redis | undefined;
const getRedis = () => (redis ??= Redis.fromEnv());

const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.slice(0, max) : "";
const amount = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

function parseReceipt(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  if (!Array.isArray(data.items) || data.items.length > MAX_ITEMS) return null;

  const items = data.items.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    return {
      name: text(item.name),
      detail: text(item.detail),
      qty: Math.max(1, Math.floor(amount(item.qty)) || 1),
      price: amount(item.price),
    };
  });

  return {
    store: text(data.store),
    title: text(data.title),
    payment: text(data.payment),
    currency: text(data.currency, 3).toUpperCase(),
    items,
    // Total dihitung ulang di server, bukan dipercaya dari client.
    total: items.reduce((sum, i) => sum + i.qty * i.price, 0),
  };
}

export async function POST(request: NextRequest) {
  const parsed = parseReceipt(await request.json().catch(() => null));
  if (!parsed) {
    return NextResponse.json({ error: "Invalid receipt payload" }, { status: 400 });
  }

  try {
    const db = getRedis();
    const next = await db.incr("receipt:counter");
    const receiptNumber = `${PREFIX}-${String(next).padStart(PAD_LENGTH, "0")}`;
    const receipt = { receiptNumber, ...parsed, createdAt: new Date().toISOString() };

    await db.set(`receipt:${receiptNumber}`, receipt);
    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Failed to create receipt", error);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const number = request.nextUrl.searchParams.get("number");
  if (!number) {
    return NextResponse.json({ error: "Missing 'number' param" }, { status: 400 });
  }

  try {
    const receipt = await getRedis().get(`receipt:${number}`);
    if (!receipt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Failed to read receipt", error);
    return NextResponse.json({ error: "Failed to read receipt" }, { status: 500 });
  }
}
