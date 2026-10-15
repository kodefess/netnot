import { createHash, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE, AUTH_COOKIE_VALUE } from "@/lib/auth";

const ATTEMPTS_COOKIE = "auth_attempts";
const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 60 * 10;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Bandingkan hash supaya panjang buffer selalu sama dan perbandingannya
// constant-time (tidak membocorkan info lewat timing).
const safeEqual = (a: string, b: string) =>
  timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );

export async function POST(request: NextRequest) {
  const correctPassword = process.env.SITE_PASSWORD;
  if (!correctPassword) {
    console.error("SITE_PASSWORD is not configured");
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
  }

  const attempts = Number(request.cookies.get(ATTEMPTS_COOKIE)?.value) || 0;

  // Kunci ditegakkan di server: setelah batas tercapai, password benar pun
  // ditolak sampai cookie percobaan kedaluwarsa.
  if (attempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { success: false, locked: true, attemptsLeft: 0 },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (password && safeEqual(password, correctPassword)) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, AUTH_COOKIE_VALUE, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // sesi login bertahan 7 hari
    });
    response.cookies.delete(ATTEMPTS_COOKIE);
    return response;
  }

  const newAttempts = attempts + 1;
  const locked = newAttempts >= MAX_ATTEMPTS;
  const response = NextResponse.json(
    { success: false, locked, attemptsLeft: Math.max(0, MAX_ATTEMPTS - newAttempts) },
    { status: locked ? 429 : 401 },
  );
  response.cookies.set(ATTEMPTS_COOKIE, String(newAttempts), {
    ...cookieOptions,
    maxAge: LOCK_SECONDS,
  });
  return response;
}
