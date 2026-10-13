import { NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

// Next.js 16 renamed `middleware.js` to `proxy.js` (same mechanism, new
// name/file). Proxy always runs on the Node.js runtime now, which is what
// lets this use the same jsonwebtoken-based verification as the rest of
// the app instead of an Edge-compatible subset.
//
// This is a first layer of defense, not the only one: every admin Server
// Function also calls requireAdmin() itself (see lib/requireAdmin.js),
// per Next's own guidance that a proxy matcher change could otherwise
// silently stop protecting a route.
export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const payload = verifyAdminToken(token);

  if (!payload) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
