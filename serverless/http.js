export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REVIEW_RATINGS = new Set(["5.0", "4.9", "4.8", "4.7", "4.5"]);

const MAX_JSON_BODY_BYTES = 32 * 1024;
const rateLimitBuckets = new Map();

export function applyApiHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

export function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export function sendNoContent(response) {
  response.statusCode = 204;
  response.end();
}

export function methodNotAllowed(response) {
  return sendJson(response, 405, { message: "허용되지 않은 요청 방식입니다." });
}

export function isUnsafeMethod(method) {
  return !["GET", "HEAD", "OPTIONS"].includes(method);
}

export function requireApiRequestHeader(request, response) {
  if (!isUnsafeMethod(request.method)) return true;
  if (request.headers["x-requested-with"] === "ireoksseo") return true;

  sendJson(response, 403, { message: "허용되지 않은 요청입니다." });
  return false;
}

export function requireJsonContent(request, response) {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (contentType.startsWith("application/json")) return true;

  sendJson(response, 415, { message: "JSON 요청만 처리할 수 있습니다." });
  return false;
}

export async function readJson(request) {
  try {
    if (request.body !== undefined) {
      if (Buffer.isBuffer(request.body)) {
        const body = request.body.toString("utf-8");
        return body ? JSON.parse(body) : {};
      }
      if (typeof request.body === "string") {
        return request.body ? JSON.parse(request.body) : {};
      }
      if (typeof request.body === "object" && request.body !== null) return request.body;
    }

    let body = "";
    for await (const chunk of request) {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_JSON_BODY_BYTES) {
        const error = new Error("요청 본문이 너무 큽니다.");
        error.statusCode = 413;
        throw error;
      }
    }

    return body ? JSON.parse(body) : {};
  } catch (error) {
    if (error.statusCode) throw error;
    const parseError = new Error("JSON 형식이 올바르지 않습니다.");
    parseError.statusCode = 400;
    throw parseError;
  }
}

export function getClientIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.socket?.remoteAddress || "unknown";
}

export function isRateLimited(key, { limit, windowMs }) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function compactText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function safeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

export function safeScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function handleApiError(response, error) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (statusCode >= 500) console.error(error);
  return sendJson(response, statusCode, {
    message: statusCode >= 500 ? "서버 오류가 발생했습니다." : error.message,
  });
}
