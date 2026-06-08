import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DB_PATH = path.join(PROJECT_ROOT, "data", "db.json");
const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017";
const DEFAULT_DB_NAME = "ireoksseo";
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000;

export const defaultJobs = [
  {
    id: "job-001",
    company: "이력써커리어",
    title: "AI 이력서 상담 매니저",
    location: "서울",
    deadline: "2026-06-30",
    category: "상담",
    description: "중장년 구직자의 이력서 작성과 직무 추천을 돕는 상담 업무입니다.",
  },
  {
    id: "job-002",
    company: "데이터온",
    title: "공공데이터 입력 및 문서관리 담당",
    location: "원주",
    deadline: "2026-07-10",
    category: "사무",
    description: "문서 정리, 데이터 입력, 행정 보조 경험이 있는 지원자를 찾습니다.",
  },
  {
    id: "job-003",
    company: "커리어교육센터",
    title: "디지털 교육 운영 보조",
    location: "강원",
    deadline: "2026-07-15",
    category: "교육",
    description: "교육 일정 관리, 수강생 안내, 강의실 운영을 지원하는 포지션입니다.",
  },
];

let client;
let database;
let collections;
let initPromise;

export function getMongoConfig() {
  return {
    uri: process.env.MONGODB_URI || DEFAULT_MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME,
  };
}

export function getCollections() {
  if (!collections) {
    throw new Error("MongoDB가 아직 초기화되지 않았습니다.");
  }
  return collections;
}

export function getDatabase() {
  if (!database) {
    throw new Error("MongoDB가 아직 초기화되지 않았습니다.");
  }
  return database;
}

export async function initializeDatabase({ importJson = process.env.MONGODB_IMPORT_JSON_ON_START !== "false" } = {}) {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { uri, dbName } = getMongoConfig();
    client = new MongoClient(uri, {
      appName: "ireoksseo-react",
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    database = client.db(dbName);
    collections = {
      users: database.collection("users"),
      sessions: database.collection("sessions"),
      resumes: database.collection("resumes"),
      reviews: database.collection("reviews"),
      jobs: database.collection("jobs"),
      meta: database.collection("app_meta"),
    };

    await createIndexes(collections);
    await seedDefaultJobs(collections);

    if (importJson) {
      await importJsonDatabase();
    }

    return database;
  })();

  return initPromise;
}

export async function closeDatabase() {
  if (!client) return;
  await client.close();
  client = undefined;
  database = undefined;
  collections = undefined;
  initPromise = undefined;
}

async function createIndexes({ users, sessions, resumes, reviews, jobs }) {
  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex({ id: 1 }, { unique: true }),
    sessions.createIndex({ token_hash: 1 }, { unique: true }),
    sessions.createIndex({ user_id: 1 }),
    sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
    resumes.createIndex({ id: 1 }, { unique: true }),
    resumes.createIndex({ user_id: 1, updated_at: -1 }),
    reviews.createIndex({ id: 1 }, { unique: true }),
    reviews.createIndex({ user_id: 1, created_at: -1 }),
    reviews.createIndex({ created_at: -1 }),
    jobs.createIndex({ id: 1 }, { unique: true }),
    jobs.createIndex({ category: 1, deadline: 1 }),
  ]);
}

async function seedDefaultJobs({ jobs }) {
  const count = await jobs.countDocuments();
  if (count > 0) return;

  await jobs.bulkWrite(
    defaultJobs.map((job) => ({
      updateOne: {
        filter: { id: job.id },
        update: { $setOnInsert: job },
        upsert: true,
      },
    })),
  );
}

export async function importJsonDatabase({ force = false } = {}) {
  if (!collections) {
    await initializeDatabase({ importJson: false });
  }

  const { meta, users, sessions, resumes, reviews, jobs } = getCollections();
  const importKey = "json-db-import-v1";

  if (!force) {
    const alreadyImported = await meta.findOne({ _id: importKey });
    if (alreadyImported) return { imported: false, reason: "already-imported" };
  }

  if (!fs.existsSync(DB_PATH)) {
    await meta.updateOne(
      { _id: importKey },
      { $set: { imported_at: new Date(), source: DB_PATH, skipped: true } },
      { upsert: true },
    );
    return { imported: false, reason: "missing-json-db" };
  }

  const jsonDb = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const summary = {
    users: await upsertMany(users, (jsonDb.users || []).map(toStoredUser), "id"),
    sessions: await upsertMany(sessions, (jsonDb.sessions || []).map(toStoredSession), "token_hash"),
    resumes: await upsertMany(resumes, (jsonDb.resumes || []).map(toStoredResume), "id"),
    reviews: await upsertMany(reviews, (jsonDb.reviews || []).map(toStoredReview), "id"),
    jobs: await upsertMany(jobs, [...defaultJobs, ...(jsonDb.jobs || []).map(toStoredJob)], "id"),
  };

  await meta.updateOne(
    { _id: importKey },
    {
      $set: {
        imported_at: new Date(),
        source: DB_PATH,
        summary,
      },
    },
    { upsert: true },
  );

  return { imported: true, summary };
}

async function upsertMany(collection, documents, idField) {
  const cleanDocuments = documents.filter(Boolean);
  if (cleanDocuments.length === 0) return 0;

  const result = await collection.bulkWrite(
    cleanDocuments.map((document) => ({
      updateOne: {
        filter: { [idField]: document[idField] },
        update: { $setOnInsert: document },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  return result.upsertedCount || 0;
}

function toDate(value, fallback = new Date()) {
  const date = value instanceof Date ? value : new Date(value || fallback);
  return Number.isNaN(date.getTime()) ? fallback : date;
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

function toStoredUser(user) {
  if (!user) return null;
  const id = compactText(user.id, 80);
  const email = compactText(user.email, 254).toLowerCase();
  if (!id || !email) return null;

  return {
    id,
    name: compactText(user.name, 40) || "회원",
    email,
    password_salt: compactText(user.password_salt ?? user.passwordSalt, 128),
    password_hash: compactText(user.password_hash ?? user.passwordHash, 256),
    created_at: toDate(user.created_at ?? user.createdAt),
  };
}

function toStoredSession(session) {
  if (!session) return null;
  const tokenHash = compactText(session.token_hash ?? session.tokenHash, 128);
  const userId = compactText(session.user_id ?? session.userId, 80);
  if (!tokenHash || !userId) return null;

  const createdAt = toDate(session.created_at ?? session.createdAt);
  return {
    token_hash: tokenHash,
    user_id: userId,
    created_at: createdAt,
    expires_at: toDate(session.expires_at ?? session.expiresAt, new Date(createdAt.getTime() + SESSION_MAX_AGE_MS)),
  };
}

function toStoredResume(resume) {
  if (!resume) return null;
  const id = compactText(resume.id, 80);
  const userId = compactText(resume.user_id ?? resume.userId, 80);
  if (!id || !userId) return null;

  const createdAt = toDate(resume.created_at ?? resume.createdAt);
  return {
    id,
    user_id: userId,
    title: compactText(resume.title, 80),
    target_job: compactText(resume.target_job ?? resume.targetJob, 120),
    form_data: safeObject(resume.form_data ?? resume.formData),
    generated_resume: compactText(resume.generated_resume ?? resume.generatedResume, 6000),
    ats_score: safeScore(resume.ats_score ?? resume.atsScore),
    writing_score: safeScore(resume.writing_score ?? resume.writingScore),
    recommended_job: compactText(resume.recommended_job ?? resume.recommendedJob, 120),
    created_at: createdAt,
    updated_at: toDate(resume.updated_at ?? resume.updatedAt, createdAt),
  };
}

function toStoredReview(review) {
  if (!review) return null;
  const id = compactText(review.id, 80);
  const userId = compactText(review.user_id ?? review.userId, 80);
  if (!id || !userId) return null;

  return {
    id,
    user_id: userId,
    role: compactText(review.role, 60),
    rating: compactText(review.rating || "5.0", 3),
    text: compactText(review.text, 200),
    created_at: toDate(review.created_at ?? review.createdAt),
  };
}

function toStoredJob(job) {
  if (!job) return null;
  const id = compactText(job.id, 80);
  if (!id) return null;

  return {
    id,
    company: compactText(job.company, 80),
    title: compactText(job.title, 160),
    location: compactText(job.location, 60),
    deadline: compactText(job.deadline, 20),
    category: compactText(job.category, 60),
    description: compactText(job.description, 500),
  };
}
