const MAX_JSON_BODY_BYTES = 32 * 1024;
const MAX_FORM_DATA_BYTES = 16 * 1024;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DIRECT_INPUT = "\uc9c1\uc811 \uc785\ub825";
const NONE_VALUE = "\ud574\ub2f9 \uc5c6\uc74c";

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function compactText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function safeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function safeList(value, maxItems = 12, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => compactText(item, maxLength))
    .filter((item) => item && item !== NONE_VALUE)
    .slice(0, maxItems);
}

function splitDetail(value, maxItems, maxLength) {
  return compactText(value, maxItems * maxLength)
    .split(/\n|,/)
    .map((item) => compactText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function directOrSelected(selected, detail) {
  if (selected === DIRECT_INPUT && detail) return detail;
  return selected;
}

function normalizeResumeInput(value) {
  const form = safeObject(value);
  const targetJob = directOrSelected(form.targetJob, form.targetJobDetail);
  const education = directOrSelected(form.education, form.educationDetail);

  return {
    userName: compactText(form.userName, 40),
    userAge: compactText(form.userAge, 10),
    userPhone: compactText(form.userPhone, 30),
    userEmail: compactText(form.userEmail, 80),
    targetJob: compactText(targetJob, 120),
    resumeTone: compactText(form.resumeTone, 80),
    careerItems: [
      ...safeList(form.careerItems ?? form.careerSummary, 12, 120),
      ...splitDetail(form.careerSummaryDetail, 12, 120),
    ].slice(0, 12),
    achievementItems: [
      ...safeList(form.achievementItems ?? form.achievement, 8, 120),
      ...splitDetail(form.achievementDetail, 8, 120),
    ].slice(0, 8),
    licenseItems: [
      ...safeList(form.licenseItems ?? form.license, 8, 80),
      ...splitDetail(form.licenseDetail, 8, 80),
    ].slice(0, 8),
    education: compactText(education, 80),
    strengths: safeList(form.strengths, 6, 80),
    skillItems: [
      ...safeList(form.skillItems, 10, 80),
      ...splitDetail(form.skillSet, 10, 80),
    ].slice(0, 10),
    careerGoal: compactText(form.careerGoal, 500),
  };
}

function buildResumePrompt(data) {
  return [
    "Create a Korean resume draft and self-introduction for a job seeker.",
    "Use only the user's actual input. Do not invent company names, dates, certifications, awards, or numbers.",
    "Write in natural Korean. Keep the tone close to the requested tone.",
    "If a field is empty, omit it naturally instead of saying it is empty.",
    "Use Korean section headings.",
    "",
    "[User input]",
    `Name: ${data.userName || "Not provided"}`,
    `Age: ${data.userAge || "Not provided"}`,
    `Phone: ${data.userPhone || "Not provided"}`,
    `Email: ${data.userEmail || "Not provided"}`,
    `Target job: ${data.targetJob || "Not provided"}`,
    `Requested tone: ${data.resumeTone || "Not provided"}`,
    `Career: ${data.careerItems.join(", ") || "Not provided"}`,
    `Achievements: ${data.achievementItems.join(", ") || "Not provided"}`,
    `Licenses: ${data.licenseItems.join(", ") || "Not provided"}`,
    `Education: ${data.education || "Not provided"}`,
    `Strengths: ${data.strengths.join(", ") || "Not provided"}`,
    `Skills: ${data.skillItems.join(", ") || "Not provided"}`,
    `Career goal: ${data.careerGoal || "Not provided"}`,
    "",
    "[Output]",
    "1. Resume summary",
    "2. Key experience",
    "3. Strengths and achievements",
    "4. Self-introduction draft",
    "5. Suggested improvements",
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

async function readJson(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return request.body ? JSON.parse(request.body) : {};

  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_JSON_BODY_BYTES) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
  }

  return body ? JSON.parse(body) : {};
}

async function generateResumeWithOpenAi(data) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured in Vercel Environment Variables.");
    error.statusCode = 503;
    throw error;
  }

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions:
        "You are a careful Korean resume writing consultant. Respect the user's real background, avoid exaggeration, and return concise Korean writing that is ready to edit.",
      input: buildResumePrompt(data),
      max_output_tokens: 1600,
    }),
  });

  const payload = await openAiResponse.json().catch(() => ({}));
  if (!openAiResponse.ok) {
    const message = payload?.error?.message || "OpenAI API request failed.";
    const error = new Error(message);
    error.statusCode = openAiResponse.status >= 500 ? 502 : 400;
    throw error;
  }

  const generatedResume = extractOpenAiText(payload);
  if (!generatedResume) {
    const error = new Error("OpenAI returned an empty response.");
    error.statusCode = 502;
    throw error;
  }

  return generatedResume;
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { message: "Method not allowed." });
  }

  if (request.headers["x-requested-with"] !== "ireoksseo") {
    return sendJson(response, 403, { message: "Forbidden request." });
  }

  try {
    const body = await readJson(request);
    const formData = safeObject(body.formData ?? body.form_data ?? body);
    if (JSON.stringify(formData).length > MAX_FORM_DATA_BYTES) {
      return sendJson(response, 413, { message: "Resume input is too large." });
    }

    const resumeInput = normalizeResumeInput(formData);
    if (!resumeInput.userName || !resumeInput.targetJob || !resumeInput.resumeTone) {
      return sendJson(response, 400, { message: "Name, target job, and tone are required." });
    }
    if (!resumeInput.careerItems.length || !resumeInput.education || !resumeInput.strengths.length || !resumeInput.careerGoal) {
      return sendJson(response, 400, { message: "Career, education, strengths, and career goal are required." });
    }

    const generatedResume = await generateResumeWithOpenAi(resumeInput);
    return sendJson(response, 200, {
      generatedResume,
      model: OPENAI_MODEL,
    });
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    return sendJson(response, statusCode, {
      message: statusCode >= 500 ? "Server error occurred." : error.message,
    });
  }
}
