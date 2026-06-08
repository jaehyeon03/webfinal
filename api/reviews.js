import crypto from "node:crypto";
import { getCollections, initializeDatabase } from "../server/database.js";
import { getCurrentUser } from "../serverless/auth.js";
import {
  applyApiHeaders,
  compactText,
  getClientIp,
  handleApiError,
  isRateLimited,
  methodNotAllowed,
  readJson,
  requireApiRequestHeader,
  requireJsonContent,
  REVIEW_RATINGS,
  sendJson,
  sendNoContent,
} from "../serverless/http.js";
import { normalizeReview } from "../serverless/normalizers.js";

const REVIEW_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (!["GET", "POST"].includes(request.method)) return methodNotAllowed(response);
  if (!requireApiRequestHeader(request, response)) return;

  try {
    await initializeDatabase();
    const { reviews, users } = getCollections();

    if (request.method === "GET") {
      const items = await reviews.find({}).sort({ created_at: 1 }).toArray();
      const userIds = [...new Set(items.map((review) => review.user_id).filter(Boolean))];
      const reviewUsers = await users.find({ id: { $in: userIds } }).project({ id: 1, name: 1 }).toArray();
      const usersById = new Map(reviewUsers.map((user) => [user.id, user]));

      return sendJson(response, 200, {
        reviews: items.map((review) => normalizeReview(review, usersById.get(review.user_id))),
      });
    }

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

    await reviews.insertOne(review);
    return sendJson(response, 201, { review: normalizeReview(review, user) });
  } catch (error) {
    return handleApiError(response, error);
  }
}
