import crypto from "node:crypto";
import { getCollections, initializeDatabase } from "../server/database.js";
import { getCurrentUser } from "../serverless/auth.js";
import {
  applyApiHeaders,
  compactText,
  handleApiError,
  methodNotAllowed,
  readJson,
  requireApiRequestHeader,
  requireJsonContent,
  safeObject,
  safeScore,
  sendJson,
  sendNoContent,
} from "../serverless/http.js";
import { normalizeResume } from "../serverless/normalizers.js";

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (!["GET", "POST"].includes(request.method)) return methodNotAllowed(response);
  if (!requireApiRequestHeader(request, response)) return;

  try {
    await initializeDatabase();

    const user = await getCurrentUser(request);
    if (!user) {
      const message = request.method === "GET"
        ? "이력서를 확인하려면 로그인해 주세요."
        : "이력서를 저장하려면 로그인해 주세요.";
      return sendJson(response, 401, { message });
    }

    const { resumes } = getCollections();
    if (request.method === "GET") {
      const items = await resumes
        .find({ user_id: user.id })
        .sort({ updated_at: -1, created_at: -1 })
        .toArray();
      return sendJson(response, 200, { resumes: items.map(normalizeResume) });
    }

    if (!requireJsonContent(request, response)) return;
    const body = await readJson(request);
    const formData = safeObject(body.form_data ?? body.formData);
    if (JSON.stringify(formData).length > 16 * 1024) {
      return sendJson(response, 413, { message: "이력서 입력 데이터가 너무 큽니다." });
    }

    const targetJob = compactText(body.target_job ?? body.targetJob, 120);
    const generatedResume = compactText(body.generated_resume ?? body.generatedResume, 6000);
    const recommendedJob = compactText(body.recommended_job ?? body.recommendedJob, 120);
    const title = compactText(body.title, 80) || `${targetJob || "AI"} 이력서`;

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

    await resumes.insertOne(resume);
    return sendJson(response, 201, { resume: normalizeResume(resume) });
  } catch (error) {
    return handleApiError(response, error);
  }
}
