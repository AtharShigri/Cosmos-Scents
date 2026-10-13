import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

/**
 * Call this at the top of every admin Server Function (create/update/delete
 * actions), not just in proxy.js. Next's own docs are explicit about this:
 * a proxy matcher change or a Server Function that moves to a different
 * route can silently lose proxy coverage, so each mutation re-checks for
 * itself rather than trusting the route it happened to be called from.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const payload = verifyAdminToken(token);
  if (!payload) {
    throw new Error("Not authenticated as admin.");
  }
  return payload;
}
