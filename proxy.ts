import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE, AUTH_COOKIE_VALUE } from "@/lib/auth";

const PUBLIC_PATHS = ["/gate", "/api/auth"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (request.cookies.get(AUTH_COOKIE)?.value === AUTH_COOKIE_VALUE) {
    return NextResponse.next();
  }

  // API dapat 401 JSON, halaman di-rewrite ke /gate (URL di address bar tetap).
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  return NextResponse.rewrite(url);
}

export const config = {
  // Lewati aset statis Next.js dan file di /public (punya ekstensi).
  matcher: ["/((?!_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
