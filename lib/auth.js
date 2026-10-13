import jwt from "jsonwebtoken";

export const ADMIN_COOKIE_NAME = "admin_session";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Copy .env.example to .env.local and fill it " +
        "in (see README.md for how to generate one)."
    );
  }
  return secret;
}

export function signAdminToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role },
    getSecret(),
    { expiresIn: "7d" }
  );
}

// Returns the decoded payload if the token is a valid, unexpired admin
// session, otherwise null -- never throws, so callers can just check truthiness.
export function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret());
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}
