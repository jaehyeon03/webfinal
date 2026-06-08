import "./server/env.js";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { closeDatabase, getCollections, getDatabase, getMongoConfig, initializeDatabase } from "./server/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.join(__dirname, "dist");
const SESSION_COOKIE = "ireoksseo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;
const MAX_JSON_BODY_BYTES = 32 * 1024;
const AUTH_RATE_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };
const REVIEW_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };
const AI_RATE_LIMIT = { limit: 8, windowMs: 60 * 60 * 1000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REVIEW_RATINGS = new Set(["5.0", "4.9", "4.8", "4.7", "4.5"]);
const rateLimitBuckets = new Map();
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function verifyPassword(password, salt, hash) {
  try {
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== 64) return false;
    const candidate = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function parseCookies(request) {
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

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

function normalizeResume(resume) {
  if (!resume) return null;
  return {
    id: resume.id,
    userId: resume.user_id,
    title: resume.title,
    targetJob: resume.target_job,
    formData: resume.form_data,
    generatedResume: resume.generated_resume,
    atsScore: resume.ats_score,
    writingScore: resume.writing_score,
    recommendedJob: resume.recommended_job,
    createdAt: toIso(resume.created_at),
    updatedAt: toIso(resume.updated_at),
  };
}

function normalizeJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    company: job.company,
    title: job.title,
    location: job.location,
    deadline: job.deadline,
    category: job.category,
    description: job.description,
  };
}

function normalizeReview(review, user) {
  if (!review) return null;
  return {
    id: review.id,
    userId: review.user_id,
    name: user?.name || "회원",
    role: review.role,
    rating: review.rating,
    text: review.text,
    createdAt: toIso(review.created_at),
  };
}

function compactText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function safeScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function safeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function safeList(value, maxItems = 12, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => compactText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeResumeInput(value) {
  const form = safeObject(value);
  const targetJob = form.targetJob === "직접 입력" ? form.targetJobDetail : form.targetJob;
  const education = form.education === "직접 입력" ? form.educationDetail : form.education;

  return {
    userName: compactText(form.userName, 40),
    userAge: compactText(form.userAge, 10),
    userPhone: compactText(form.userPhone, 30),
    userEmail: compactText(form.userEmail, 80),
    targetJob: compactText(targetJob, 120),
    resumeTone: compactText(form.resumeTone, 80),
    careerItems: [
      ...safeList(form.careerItems ?? form.careerSummary, 12, 120),
      ...compactText(form.careerSummaryDetail, 700).split(/\n|,/).map((item) => compactText(item, 120)).filter(Boolean),
    ].slice(0, 12),
    achievementItems: [
      ...safeList(form.achievementItems ?? form.achievement, 8, 120),
      ...compactText(form.achievementDetail, 300).split(/\n|,/).map((item) => compactText(item, 120)).filter(Boolean),
    ].slice(0, 8),
    licenseItems: [
      ...safeList(form.licenseItems ?? form.license, 8, 80),
      ...compactText(form.licenseDetail, 200).split(/\n|,/).map((item) => compactText(item, 80)).filter(Boolean),
    ].slice(0, 8),
    education: compactText(education, 80),
    strengths: safeList(form.strengths, 6, 80),
    skillItems: [
      ...safeList(form.skillItems, 10, 80),
      ...compactText(form.skillSet, 300).split(/\n|,/).map((item) => compactText(item, 80)).filter(Boolean),
    ].slice(0, 10),
    careerGoal: compactText(form.careerGoal, 500),
  };
}

function buildResumePrompt(data) {
  return [
    "아래 입력값만 바탕으로 중장년 재취업자를 위한 이력서 초안과 자기소개서를 작성해 주세요.",
    "과장된 수치나 사용자가 말하지 않은 회사명은 만들지 말고, 비어 있는 항목은 자연스럽게 생략해 주세요.",
    "문장은 한국어로 작성하고, 사용자가 선택한 문체를 반영해 주세요.",
    "",
    "[사용자 입력]",
    `이름: ${data.userName || "미입력"}`,
    `나이: ${data.userAge || "미입력"}`,
    `연락처: ${data.userPhone || "미입력"}`,
    `이메일: ${data.userEmail || "미입력"}`,
    `지원 직무: ${data.targetJob || "미입력"}`,
    `희망 문체: ${data.resumeTone || "미입력"}`,
    `주요 경력: ${data.careerItems.join(", ") || "미입력"}`,
    `성과 및 경험: ${data.achievementItems.join(", ") || "미입력"}`,
    `자격증: ${data.licenseItems.join(", ") || "미입력"}`,
    `최종 학력: ${data.education || "미입력"}`,
    `강점: ${data.strengths.join(", ") || "미입력"}`,
    `보유 역량: ${data.skillItems.join(", ") || "미입력"}`,
    `재취업 목표: ${data.careerGoal || "미입력"}`,
    "",
    "[출력 형식]",
    "1. 이력서 핵심 요약",
    "2. 주요 경력",
    "3. 성과 및 강점",
    "4. 자기소개서 초안",
    "5. 보완하면 좋은 점",
  ].join("\n");
}

function extractOpenAiText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

async function generateResumeWithOpenAi(data) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OpenAI API 키가 설정되어 있지 않습니다. .env 또는 Vercel 환경변수에 OPENAI_API_KEY를 입력해 주세요.");
    error.statusCode = 503;
    throw error;
  }

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: "너는 중장년 재취업자를 돕는 전문 이력서 컨설턴트다. 사용자의 실제 입력을 존중하고, 읽기 쉬운 한국어 이력서 문장으로 정리한다.",
      input: buildResumePrompt(data),
      max_output_tokens: 1600,
    }),
  });

  const payload = await openAiResponse.json().catch(() => ({}));
  if (!openAiResponse.ok) {
    const message = payload?.error?.message || "OpenAI API 호출 중 오류가 발생했습니다.";
    const error = new Error(message);
    error.statusCode = openAiResponse.status >= 500 ? 502 : 400;
    throw error;
  }

  const generatedResume = extractOpenAiText(payload);
  if (!generatedResume) {
    const error = new Error("OpenAI 응답에서 생성된 이력서 내용을 찾지 못했습니다.");
    error.statusCode = 502;
    throw error;
  }

  return generatedResume;
}

function isUnsafeMethod(method) {
  return !["GET", "HEAD", "OPTIONS"].includes(method);
}

function getClientIp(request) {
  if (process.env.TRUST_PROXY === "true") {
    const forwardedFor = request.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string" && forwardedFor.trim()) {
      return forwardedFor.split(",")[0].trim();
    }
  }
  return request.socket.remoteAddress || "unknown";
}

function isSecureRequest(request) {
  if (request.socket.encrypted) return true;
  if (process.env.TRUST_PROXY === "true") {
    return String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
  }
  return false;
}

function buildSessionCookie(request, value, maxAgeSeconds) {
  const secure = isSecureRequest(request) || process.env.COOKIE_SECURE === "true" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

function isRateLimited(key, { limit, windowMs }) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

function requireApiRequestHeader(request, response) {
  if (!isUnsafeMethod(request.method)) return true;
  if (request.headers["x-requested-with"] === "ireoksseo") return true;

  sendJson(response, 403, { message: "허용되지 않은 요청입니다." });
  return false;
}

function requireJsonContent(request, response) {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (contentType.startsWith("application/json")) return true;

  sendJson(response, 415, { message: "JSON 요청만 처리할 수 있습니다." });
  return false;
}

async function getCurrentUser(request) {
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

async function setSession(request, response, userId) {
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

async function clearSession(request, response) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (token) {
    const { sessions } = getCollections();
    await sessions.deleteOne({ token_hash: hashToken(token) });
  }
  response.setHeader("Set-Cookie", buildSessionCookie(request, "", 0));
}

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (!origin) return;

  const configuredOrigins = String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const isConfiguredOrigin = configuredOrigins.includes(origin);
  const isLocalOrigin = process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  if (!isConfiguredOrigin && !isLocalOrigin) return;

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
  response.setHeader("Vary", "Origin");
}

function applySecurityHeaders(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
    ].join("; "),
  );

  if (isSecureRequest(request)) {
    response.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let totalBytes = 0;
    const chunks = [];
    let rejected = false;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_JSON_BODY_BYTES) {
        const error = new Error("요청 본문이 너무 큽니다.");
        error.statusCode = 413;
        rejected = true;
        reject(error);
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (rejected) return;
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        resolve(body ? JSON.parse(body) : {});
      } catch {
        const error = new Error("JSON 형식이 올바르지 않습니다.");
        error.statusCode = 400;
        reject(error);
      }
    });
    request.on("error", (error) => reject(error));
  });
}

async function handleHealth(response) {
  await getDatabase().command({ ping: 1 });
  const { dbName } = getMongoConfig();
  const { users, sessions, resumes, reviews, jobs } = getCollections();
  const [userCount, sessionCount, resumeCount, reviewCount, jobCount] = await Promise.all([
    users.countDocuments(),
    sessions.countDocuments(),
    resumes.countDocuments(),
    reviews.countDocuments(),
    jobs.countDocuments(),
  ]);

  return sendJson(response, 200, {
    ok: true,
    database: "mongodb",
    dbName,
    counts: {
      users: userCount,
      sessions: sessionCount,
      resumes: resumeCount,
      reviews: reviewCount,
      jobs: jobCount,
    },
  });
}

async function handleApi(request, response, pathname) {
  if (!requireApiRequestHeader(request, response)) return;

  if (request.method === "GET" && pathname === "/api/health") {
    return handleHealth(response);
  }

  if (request.method === "GET" && pathname === "/api/me") {
    return sendJson(response, 200, { user: normalizeUser(await getCurrentUser(request)) });
  }

  if (request.method === "POST" && pathname === "/api/signup") {
    if (isRateLimited(`auth:${getClientIp(request)}`, AUTH_RATE_LIMIT)) {
      return sendJson(response, 429, { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
    }
    if (!requireJsonContent(request, response)) return;

    const body = await readJson(request);
    const name = compactText(body.name, 40);
    const email = compactText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return sendJson(response, 400, { message: "이름, 이메일, 비밀번호를 모두 입력해 주세요." });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return sendJson(response, 400, { message: "올바른 이메일 형식으로 입력해 주세요." });
    }
    if (password.length < 8 || password.length > 128) {
      return sendJson(response, 400, { message: "비밀번호는 8자 이상 128자 이하로 입력해 주세요." });
    }

    const { users } = getCollections();
    if (await users.findOne({ email })) {
      return sendJson(response, 409, { message: "이미 가입된 이메일입니다." });
    }

    const { salt, hash } = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password_salt: salt,
      password_hash: hash,
      created_at: new Date(),
    };

    await users.insertOne(user);
    await setSession(request, response, user.id);
    return sendJson(response, 201, { user: normalizeUser(user) });
  }

  if (request.method === "POST" && pathname === "/api/login") {
    if (isRateLimited(`auth:${getClientIp(request)}`, AUTH_RATE_LIMIT)) {
      return sendJson(response, 429, { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
    }
    if (!requireJsonContent(request, response)) return;

    const body = await readJson(request);
    const email = compactText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const { users } = getCollections();
    const user = await users.findOne({ email });

    if (!EMAIL_PATTERN.test(email) || password.length > 128 || !user || !verifyPassword(password, user.password_salt, user.password_hash)) {
      return sendJson(response, 401, { message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    await setSession(request, response, user.id);
    return sendJson(response, 200, { user: normalizeUser(user) });
  }

  if (request.method === "POST" && pathname === "/api/logout") {
    await clearSession(request, response);
    return sendJson(response, 200, { message: "로그아웃되었습니다." });
  }

  if (request.method === "POST" && pathname === "/api/resume") {
    if (isRateLimited(`ai:${getClientIp(request)}`, AI_RATE_LIMIT)) {
      return sendJson(response, 429, { message: "AI 이력서 생성 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
    }
    if (!requireJsonContent(request, response)) return;

    const body = await readJson(request);
    const formData = safeObject(body.formData ?? body.form_data ?? body);
    if (JSON.stringify(formData).length > 16 * 1024) {
      return sendJson(response, 413, { message: "이력서 입력 데이터가 너무 큽니다." });
    }

    const resumeInput = normalizeResumeInput(formData);
    if (!resumeInput.userName || !resumeInput.targetJob || !resumeInput.resumeTone) {
      return sendJson(response, 400, { message: "이름, 지원 직무, 이력서 문체를 입력해 주세요." });
    }
    if (!resumeInput.careerItems.length || !resumeInput.education || !resumeInput.strengths.length || !resumeInput.careerGoal) {
      return sendJson(response, 400, { message: "경력, 학력, 강점, 재취업 목표를 입력해 주세요." });
    }

    const generatedResume = await generateResumeWithOpenAi(resumeInput);
    return sendJson(response, 200, {
      generatedResume,
      model: OPENAI_MODEL,
    });
  }

  if (request.method === "GET" && pathname === "/api/resumes") {
    const user = await getCurrentUser(request);
    if (!user) return sendJson(response, 401, { message: "이력서를 확인하려면 로그인해 주세요." });

    const { resumes } = getCollections();
    const items = await resumes
      .find({ user_id: user.id })
      .sort({ updated_at: -1, created_at: -1 })
      .toArray();
    return sendJson(response, 200, { resumes: items.map(normalizeResume) });
  }

  if (request.method === "POST" && pathname === "/api/resumes") {
    const user = await getCurrentUser(request);
    if (!user) return sendJson(response, 401, { message: "이력서를 저장하려면 로그인해 주세요." });
    if (!requireJsonContent(request, response)) return;

    const body = await readJson(request);
    const formData = safeObject(body.form_data ?? body.formData);
    if (JSON.stringify(formData).length > 16 * 1024) {
      return sendJson(response, 413, { message: "이력서 입력 데이터가 너무 큽니다." });
    }

    const targetJob = compactText(body.target_job ?? body.targetJob, 120);
    const generatedResume = compactText(body.generated_resume ?? body.generatedResume, 6000);
    const recommendedJob = compactText(body.recommended_job ?? body.recommendedJob, 120);
    const title = compactText(body.title, 80) || `${targetJob || "새"} 이력서`;

    if (!targetJob || !generatedResume) {
      return sendJson(response, 400, { message: "지원 직무와 생성된 이력서 내용을 저장해 주세요." });
    }

    const now = new Date();
    const resume = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title,
      target_job: targetJob,
      form_data: formData,
      generated_resume: generatedResume,
      ats_score: safeScore(body.ats_score ?? body.atsScore),
      writing_score: safeScore(body.writing_score ?? body.writingScore),
      recommended_job: recommendedJob,
      created_at: now,
      updated_at: now,
    };

    const { resumes } = getCollections();
    await resumes.insertOne(resume);
    return sendJson(response, 201, { resume: normalizeResume(resume) });
  }

  if (request.method === "GET" && pathname === "/api/jobs") {
    const { jobs } = getCollections();
    const items = await jobs.find({}).sort({ id: 1 }).toArray();
    return sendJson(response, 200, { jobs: items.map(normalizeJob) });
  }

  if (request.method === "GET" && pathname === "/api/reviews") {
    const { reviews, users } = getCollections();
    const items = await reviews.find({}).sort({ created_at: 1 }).toArray();
    const userIds = [...new Set(items.map((review) => review.user_id).filter(Boolean))];
    const reviewUsers = await users.find({ id: { $in: userIds } }).project({ id: 1, name: 1 }).toArray();
    const usersById = new Map(reviewUsers.map((user) => [user.id, user]));

    return sendJson(response, 200, {
      reviews: items.map((review) => normalizeReview(review, usersById.get(review.user_id))),
    });
  }

  if (request.method === "POST" && pathname === "/api/reviews") {
    const user = await getCurrentUser(request);
    if (!user) return sendJson(response, 401, { message: "리뷰를 작성하려면 로그인해 주세요." });
    if (isRateLimited(`review:${user.id}:${getClientIp(request)}`, REVIEW_RATE_LIMIT)) {
      return sendJson(response, 429, { message: "리뷰 작성 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
    }
    if (!requireJsonContent(request, response)) return;

    const body = await readJson(request);
    const role = compactText(body.role, 60);
    const rating = compactText(body.rating || "5.0", 3);
    const text = compactText(body.text, 200);

    if (!role || !text) {
      return sendJson(response, 400, { message: "상황과 리뷰 내용을 입력해 주세요." });
    }
    if (!REVIEW_RATINGS.has(rating)) {
      return sendJson(response, 400, { message: "허용된 평점만 선택해 주세요." });
    }

    const review = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role,
      rating,
      text,
      created_at: new Date(),
    };

    const { reviews } = getCollections();
    await reviews.insertOne(review);
    return sendJson(response, 201, { review: normalizeReview(review, user) });
  }

  return sendJson(response, 404, { message: "API 경로를 찾을 수 없습니다." });
}

function serveStatic(request, response, pathname) {
  if (!fs.existsSync(DIST_DIR)) {
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("백엔드 서버가 실행 중입니다. 개발 화면은 http://localhost:5173 에서 확인하세요.");
    return;
  }

  if (pathname.includes("\0")) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("잘못된 요청입니다.");
    return;
  }

  const safePath = pathname === "/" ? "/index.html" : pathname;
  let filePath = resolveStaticPath(safePath);

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("허용되지 않은 경로입니다.");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=31536000, immutable",
  });
  fs.createReadStream(filePath).pipe(response);
}

function resolveStaticPath(urlPath) {
  const distRoot = path.resolve(DIST_DIR);
  const normalizedPath = path.normalize(urlPath).replace(/^([/\\])+/g, "");
  const filePath = path.resolve(distRoot, normalizedPath);
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${path.sep}`)) return null;
  return filePath;
}

const server = http.createServer(async (request, response) => {
  applySecurityHeaders(request, response);
  applyCors(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url.pathname);
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return sendJson(response, 400, { message: "잘못된 요청입니다." });
    }
    serveStatic(request, response, pathname);
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    if (statusCode >= 500) console.error(error);
    sendJson(response, statusCode, { message: statusCode >= 500 ? "서버 오류가 발생했습니다." : error.message });
  }
});

async function startServer() {
  const { uri, dbName } = getMongoConfig();
  await initializeDatabase();
  server.listen(PORT, () => {
    console.log(`Ireoksseo API server running at http://localhost:${PORT}`);
    console.log(`MongoDB connected: ${dbName} (${uri})`);
  });
}

async function shutdown() {
  server.close();
  await closeDatabase();
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});

startServer().catch(async (error) => {
  console.error("서버 시작에 실패했습니다.");
  console.error(error);
  await closeDatabase();
  process.exit(1);
});
