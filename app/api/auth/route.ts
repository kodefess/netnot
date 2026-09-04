import { NextResponse } from "next/server";

const AUTH_COOKIE = "site_auth";
const ATTEMPTS_COOKIE = "auth_attempts";
const MAX_ATTEMPTS = 3;

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.SITE_PASSWORD;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const attemptsMatch = cookieHeader.match(
    new RegExp(`${ATTEMPTS_COOKIE}=(\\d+)`),
  );
  const currentAttempts = attemptsMatch ? parseInt(attemptsMatch[1], 10) : 0;

  // Password benar
  if (password && password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "granted", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // sesi login bertahan 7 hari
    });
    response.cookies.delete(ATTEMPTS_COOKIE);
    return response;
  }

  // Password salah
  const newAttempts = currentAttempts + 1;
  const locked = newAttempts >= MAX_ATTEMPTS;

  const response = NextResponse.json({
    success: false,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - newAttempts),
    locked,
  });
  response.cookies.set(ATTEMPTS_COOKIE, String(newAttempts), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // reset percobaan setelah 10 menit
  });

  return response;
}
