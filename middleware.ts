import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "site_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Biarkan lewat: API auth, aset statis Next.js, dan halaman gate itu sendiri
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/gate" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isAuthed = request.cookies.get(AUTH_COOKIE)?.value === "granted";

  if (!isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/gate";
    return NextResponse.rewrite(url); // rewrite, bukan redirect, jadi URL di address bar tetap sama
  }

  return NextResponse.next();
}

export const config = {
  // Middleware jalan di semua route KECUALI yang di-exclude di atas
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
