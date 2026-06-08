import { toIso } from "./http.js";

export function normalizeResume(resume) {
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

export function normalizeJob(job) {
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

export function normalizeReview(review, user) {
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
