import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

type JWTPayload = { role?: string };

async function getSessionPayload(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: require authenticated admin ────────────────────────────
  if (pathname.startsWith("/admin")) {
    const session = await getSessionPayload(request);
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── User routes: require authenticated user ──────────────────────────────
  const userPrefixes = ["/dashboard", "/profile"];
  if (userPrefixes.some((p) => pathname.startsWith(p))) {
    const session = await getSessionPayload(request);
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
