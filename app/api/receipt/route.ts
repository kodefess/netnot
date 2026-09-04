import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

const PREFIX = "J";
const PAD_LENGTH = 3;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    // incr() tetap atomik seperti sebelumnya, cuma beda nama package
    const nextNumber = await redis.incr("receipt:counter");
    const receiptNumber = `${PREFIX}-${String(nextNumber).padStart(PAD_LENGTH, "0")}`;

    const receipt = {
      receiptNumber,
      store: body.store,
      title: body.title,
      payment: body.payment,
      currency: body.currency,
      items: body.items,
      total: body.total,
      createdAt: new Date().toISOString(),
    };

    await redis.set(`receipt:${receiptNumber}`, receipt);

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Failed to create receipt", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number");

  if (!number) {
    return NextResponse.json(
      { error: "Missing 'number' param" },
      { status: 400 },
    );
  }

  const receipt = await redis.get(`receipt:${number}`);
  if (!receipt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(receipt);
}
