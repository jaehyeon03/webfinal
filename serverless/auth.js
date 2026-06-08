import crypto from "node:crypto";
import { getCollections } from "../server/database.js";

const SESSION_COOKIE = "ireoksseo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyPassword(password, salt, hash) {
  try {
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== 64) return false;
    const candidate = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function parseCookies(request) {
  const header = request.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separatorIndex = item.indexOf("=");
        const key = separatorIndex >= 0 ? item.slice(0, separatorIndex) : item;
        const value = separatorIndex >= 0 ? item.slice(separatorIndex + 1) : "";
        try {
          return [key, decodeURIComponent(value)];
        } catch {
          return [key, ""];
        }
      })
      .filter(([key, value]) => key && value),
  );
}

function isSecureRequest(request) {
  if (request.socket?.encrypted) return true;
  const forwardedProto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  if (forwardedProto === "https") return true;
  return process.env.VERCEL === "1" || process.env.COOKIE_SECURE === "true";
}

function buildSessionCookie(request, value, maxAgeSeconds) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

export function normalizeUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export async function getCurrentUser(request) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;

  const { sessions, users } = getCollections();
  const session = await sessions.findOne({
    token_hash: hashToken(token),
    expires_at: { $gt: new Date() },
  });
  if (!session) return null;

  return users.findOne({ id: session.user_id });
}

export async function setSession(request, response, userId) {
  const { sessions } = getCollections();
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = new Date();

  await sessions.insertOne({
    token_hash: hashToken(token),
    user_id: String(userId),
    created_at: createdAt,
    expires_at: new Date(createdAt.getTime() + SESSION_MAX_AGE_MS),
  });

  response.setHeader("Set-Cookie", buildSessionCookie(request, token, SESSION_MAX_AGE_SECONDS));
}

export async function clearSession(request, response) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (token) {
    const { sessions } = getCollections();
    await sessions.deleteOne({ token_hash: hashToken(token) });
  }
  response.setHeader("Set-Cookie", buildSessionCookie(request, "", 0));
}
