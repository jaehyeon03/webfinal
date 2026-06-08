export async function apiRequest(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "ireoksseo",
        ...(options.headers || {}),
      },
      credentials: "include",
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, message: data.message || "요청 처리 중 오류가 발생했습니다." };
    }

    return { ok: true, ...data };
  } catch {
    return {
      ok: false,
      message: "서버에 연결할 수 없습니다. npm run dev 실행 후 다시 시도해 주세요.",
    };
  }
}

export async function getCurrentUser() {
  const result = await apiRequest("/api/me");
  return result.ok ? result.user : null;
}

export function signupUser({ name, email, password }) {
  return apiRequest("/api/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function loginUser({ email, password }) {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutUser() {
  return apiRequest("/api/logout", { method: "POST" });
}

export async function getResumes() {
  const result = await apiRequest("/api/resumes");
  return result.ok ? result.resumes : [];
}

export function createResume(resume) {
  return apiRequest("/api/resumes", {
    method: "POST",
    body: JSON.stringify(resume),
  });
}

export function generateAiResume(formData) {
  return apiRequest("/api/resume", {
    method: "POST",
    body: JSON.stringify({ formData }),
  });
}

export async function getJobs() {
  const result = await apiRequest("/api/jobs");
  return result.ok ? result.jobs : [];
}

export async function getReviews() {
  const result = await apiRequest("/api/reviews");
  return result.ok ? result.reviews : [];
}

export function createReview(review) {
  return apiRequest("/api/reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
}
