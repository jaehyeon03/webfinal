const projectMeta = [
  { label: "프로젝트명", value: "이력써 AI" },
  { label: "프로젝트 유형", value: "AI 기반 이력서 작성 및 재취업 지원 웹 서비스" },
  { label: "주요 대상", value: "이력서 작성이 익숙하지 않은 중장년 구직자와 재취업 준비자" },
  { label: "개발 범위", value: "React 화면 구현, Node.js API, MongoDB 저장, GPT API 이력서 생성, 인증·보안, 반응형 UI" },
  { label: "핵심 구현", value: "AI 이력서 생성, 사용자 인증, 고객 정보 DB 저장, 세션 관리, 개인별 이력서 저장, 채용공고 추천" },
  { label: "보안 방향", value: "비밀번호 해시 저장, 세션 토큰 해시화, HttpOnly 쿠키, 요청 제한, 보안 헤더 적용" },
];

const pageStructure = [
  { path: "/", title: "홈", role: "서비스 진입", desc: "서비스 핵심 가치와 사용 대상을 첫 화면에서 전달하고 이력서 작성 화면으로 이동시킵니다." },
  { path: "/service", title: "서비스 소개", role: "문제 정의", desc: "중장년 재취업자가 겪는 이력서 작성 어려움과 서비스 해결 방식을 설명합니다." },
  { path: "/resume", title: "AI 이력서", role: "핵심 기능", desc: "단계별 입력값을 수집하고 GPT API를 통해 이력서 초안, 자기소개서, 분석 결과를 생성합니다." },
  { path: "/jobs", title: "채용공고", role: "지원 연결", desc: "생성된 이력서의 직무, 경력, 강점 키워드와 연결되는 공고 목록을 제공합니다." },
  { path: "/subscription", title: "구독", role: "수익 모델", desc: "Free, Pro, Team 플랜을 구분해 서비스 확장 가능성을 보여줍니다." },
  { path: "/reviews", title: "사용자 리뷰", role: "사용자 참여", desc: "로그인 사용자의 후기 작성과 리뷰 목록 확인 기능을 제공합니다." },
  { path: "/report", title: "제작보고서", role: "프로젝트 문서", desc: "제작 목적, 페이지 구조, 디자인, 기능, 기술 스택, DB 저장 구조, 보안 구현, 코드, AI 활용 과정을 정리합니다." },
];

const designConcepts = [
  {
    title: "쉬운 작성 경험",
    desc: "긴 서술형 입력 대신 버튼 선택과 짧은 문장 입력을 중심으로 설계했습니다. 사용자는 5단계 흐름을 따라가며 자연스럽게 이력서에 필요한 정보를 완성합니다.",
  },
  {
    title: "신뢰감 있는 시각 언어",
    desc: "파란색을 주 색상으로 사용해 신뢰감과 디지털 서비스 이미지를 강화하고, 흰색 카드와 명확한 여백으로 문서 작성 서비스의 깔끔함을 유지했습니다.",
  },
  {
    title: "결과 중심 레이아웃",
    desc: "작성 영역과 결과 영역을 분리해 입력, 생성, 분석, 저장, 출력 흐름이 한눈에 보이도록 구성했습니다.",
  },
  {
    title: "반응형 접근성",
    desc: "모바일에서도 단계 버튼과 선택 카드가 줄바꿈되도록 구성해 작은 화면에서도 주요 기능을 사용할 수 있게 했습니다.",
  },
];

const featureList = [
  "5단계 이력서 작성 폼",
  "직무·경력·성과·자격증 선택 UI",
  "GPT API 이력서 및 자기소개서 생성",
  "ATS 적합도 및 문장 완성도 분석",
  "맞춤 채용공고 추천",
  "회원가입·로그인과 세션 인증",
  "MongoDB 기반 고객 정보 저장",
  "로그인 기반 이력서 저장",
  "사용자 리뷰 작성 및 조회",
  "임시 저장, 불러오기, 복사, PDF 인쇄",
  "해시 기반 비밀번호·세션 보호",
  "요청 제한 및 보안 헤더 적용",
];

const techList = [
  "React 19",
  "Vite 8",
  "React Router",
  "Node.js HTTP API",
  "MongoDB",
  "MongoDB Index/TTL",
  "OpenAI GPT API",
  "Node.js crypto",
  "HTTP Security Headers",
  "Rate Limiting",
  "CSS Grid/Flex 반응형 UI",
  "localStorage",
  "Clipboard API",
  "Print API",
];

const techDetails = [
  {
    category: "Frontend",
    title: "React 19 기반 컴포넌트 설계",
    desc: "홈, 서비스 소개, 이력서 작성, 채용공고, 구독, 리뷰, 제작보고서를 각각 독립 페이지 컴포넌트로 분리했습니다. 이력서 작성 화면은 useState로 입력 상태와 현재 단계를 관리하고, useMemo로 분석 점수와 추천 공고를 필요한 시점에만 계산해 화면 반응성을 유지했습니다.",
  },
  {
    category: "Build",
    title: "Vite 8 개발·빌드 환경",
    desc: "Vite를 사용해 React 개발 서버를 빠르게 실행하고, 운영 배포 시에는 정적 파일을 dist 폴더로 빌드하도록 구성했습니다. package.json의 dev 스크립트는 Vite 프론트엔드와 Node.js API 서버를 동시에 실행해 실제 서비스 흐름을 개발 중에도 확인할 수 있게 합니다.",
  },
  {
    category: "Routing",
    title: "React Router 기반 SPA 라우팅",
    desc: "React Router를 사용해 /, /service, /resume, /jobs, /subscription, /reviews, /report 경로를 하나의 React 앱 안에서 전환합니다. 공통 Header는 모든 페이지의 진입점을 제공하고, 사용자가 새로고침 없이 서비스 소개에서 이력서 작성까지 자연스럽게 이동하도록 설계했습니다.",
  },
  {
    category: "Backend",
    title: "Node.js 네이티브 HTTP API",
    desc: "별도 프레임워크에 의존하지 않고 Node.js의 http 모듈로 API 서버를 구현했습니다. /api/signup, /api/login, /api/me, /api/resume, /api/resumes, /api/jobs, /api/reviews처럼 기능별 엔드포인트를 분리하고, JSON 응답과 에러 처리를 공통 함수로 통일했습니다.",
  },
  {
    category: "Database",
    title: "MongoDB 사용자·콘텐츠 저장 구조",
    desc: "MongoDB에는 users, sessions, resumes, reviews, jobs 컬렉션을 구성했습니다. 사용자 이메일과 ID, 세션 토큰 해시, 이력서 ID에는 인덱스를 적용해 중복을 방지하고 조회 성능을 확보했습니다. sessions 컬렉션에는 expires_at TTL 인덱스를 적용해 만료된 세션이 자동 정리되도록 했습니다.",
  },
  {
    category: "AI",
    title: "OpenAI Responses API 연동",
    desc: "클라이언트는 사용자가 입력한 이력서 정보를 서버의 /api/resume으로 전달하고, 서버가 환경변수에 저장된 OPENAI_API_KEY로 OpenAI Responses API를 호출합니다. 프롬프트는 이름, 지원 직무, 경력, 성과, 자격, 강점, 보유 역량, 재취업 목표를 구조화해 모델이 과장 없이 실제 입력값을 바탕으로 문장을 생성하도록 설계했습니다.",
  },
  {
    category: "Browser API",
    title: "localStorage·Clipboard·Print API 활용",
    desc: "작성 중인 입력값은 localStorage에 임시 저장해 사용자가 페이지를 이동하거나 다시 돌아와도 이어서 작성할 수 있게 했습니다. 생성 결과는 Clipboard API로 복사할 수 있고, window.print를 통해 PDF 저장 또는 인쇄 흐름으로 연결했습니다.",
  },
  {
    category: "UI",
    title: "CSS Grid/Flex 반응형 인터페이스",
    desc: "선택 카드, 단계 메뉴, 분석 카드, 보고서 카드에는 CSS Grid와 Flex를 함께 사용했습니다. 데스크톱에서는 정보가 두 열 이상으로 배치되고, 모바일에서는 한 열로 접히도록 구성해 작은 화면에서도 입력 순서와 결과 확인 흐름이 깨지지 않게 했습니다.",
  },
];

const securityDetails = [
  {
    title: "비밀번호 해시 저장",
    desc: "회원가입 시 비밀번호 원문은 데이터베이스에 저장하지 않습니다. crypto.randomBytes로 사용자별 salt를 만들고, crypto.scryptSync로 64바이트 해시를 생성해 password_salt와 password_hash만 users 컬렉션에 저장합니다.",
  },
  {
    title: "타이밍 공격 방지 검증",
    desc: "로그인 시에는 입력 비밀번호를 같은 salt로 다시 해시한 뒤 crypto.timingSafeEqual로 비교합니다. 단순 문자열 비교보다 응답 시간 차이가 줄어들어 해시값 추측 공격 가능성을 낮춥니다.",
  },
  {
    title: "세션 토큰 해시화",
    desc: "로그인 성공 후 32바이트 랜덤 토큰을 발급하지만 MongoDB에는 토큰 원문이 아니라 SHA-256 해시(token_hash)만 저장합니다. 따라서 세션 컬렉션이 노출되더라도 저장된 값만으로 사용자 쿠키를 재현하기 어렵습니다.",
  },
  {
    title: "HttpOnly 쿠키 기반 인증",
    desc: "세션 토큰은 ireoksseo_session 쿠키로 전달되며 HttpOnly, SameSite=Lax, Path=/, Max-Age=7일 옵션을 적용했습니다. HTTPS 환경에서는 Secure 속성도 붙도록 구성해 브라우저 스크립트 접근과 교차 사이트 요청 위험을 줄였습니다.",
  },
  {
    title: "요청 제한과 입력 크기 제한",
    desc: "인증 요청은 15분 8회, AI 생성 요청은 1시간 8회, 리뷰 작성은 1시간 10회로 제한했습니다. JSON 본문은 32KB, 이력서 입력 데이터는 16KB로 제한해 과도한 요청이나 비정상적으로 큰 입력으로 인한 서버 부담을 줄였습니다.",
  },
  {
    title: "보안 헤더와 경로 보호",
    desc: "Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS 등을 적용했습니다. 정적 파일 제공 시에는 path.resolve와 path.normalize로 dist 폴더 밖의 파일 접근을 차단합니다.",
  },
];

const customerDataDetails = [
  {
    title: "users 컬렉션: 고객 기본 계정 정보",
    fields: ["id", "name", "email", "password_salt", "password_hash", "created_at"],
    desc: "회원가입 시 고객의 이름과 이메일을 저장하고, 비밀번호는 원문 대신 salt와 scrypt 해시값으로 분리 저장합니다. email과 id에는 unique 인덱스를 적용해 같은 이메일로 중복 가입되는 상황을 방지했습니다.",
  },
  {
    title: "sessions 컬렉션: 로그인 유지 정보",
    fields: ["token_hash", "user_id", "created_at", "expires_at"],
    desc: "로그인 후 발급된 세션 토큰은 브라우저 쿠키로 전달하고, DB에는 SHA-256으로 변환한 token_hash만 저장합니다. user_id로 고객 계정과 연결하며, expires_at에는 TTL 인덱스를 적용해 만료된 세션이 자동 삭제되도록 구성했습니다.",
  },
  {
    title: "resumes 컬렉션: 고객별 이력서 결과 저장",
    fields: ["id", "user_id", "title", "target_job", "form_data", "generated_resume", "ats_score", "writing_score", "recommended_job", "created_at", "updated_at"],
    desc: "로그인 사용자가 AI 이력서를 생성하면 입력 폼, 생성된 이력서 문장, 분석 점수, 추천 직무를 user_id와 함께 저장합니다. 이후 /api/resumes 요청에서는 현재 로그인한 사용자의 user_id와 일치하는 이력서만 조회합니다.",
  },
  {
    title: "reviews 컬렉션: 고객 후기 데이터",
    fields: ["id", "user_id", "role", "rating", "text", "created_at"],
    desc: "후기는 로그인한 고객만 작성할 수 있도록 서버에서 현재 세션을 확인한 뒤 저장합니다. reviews 데이터에는 user_id만 저장하고, 화면에 보여줄 이름은 users 컬렉션과 연결해 가져오는 방식으로 구성했습니다.",
  },
  {
    title: "jobs 컬렉션: 추천 공고 기준 데이터",
    fields: ["id", "company", "title", "location", "deadline", "category", "description"],
    desc: "채용공고는 고객 정보는 아니지만, 고객의 이력서 입력값과 연결되는 추천 기준 데이터입니다. 서버 시작 시 기본 공고를 시드 데이터로 넣고, category와 deadline 인덱스를 적용해 공고 목록 조회와 확장 가능성을 확보했습니다.",
  },
  {
    title: "서버 정규화와 저장 전 검증",
    fields: ["compactText", "safeObject", "safeList", "safeScore", "normalizeUser", "normalizeResume"],
    desc: "DB에 저장하기 전 문자열 길이, 제어 문자, 배열 개수, 점수 범위를 제한합니다. API 응답에서는 normalizeUser와 normalizeResume을 통해 필요한 값만 클라이언트로 내려보내고, 비밀번호 해시와 세션 토큰 해시는 응답에 포함하지 않습니다.",
  },
];

const reviewItems = [
  {
    title: "단계형 입력 상태 관리",
    file: "src/pages/ResumeCreate.jsx",
    desc: "사용자의 입력 부담을 줄이기 위해 이력서 작성을 5단계로 나누었습니다. step 상태값과 validateStep 함수를 사용해 각 단계에서 꼭 필요한 값만 확인하고 다음 단계로 이동합니다.",
  },
  {
    title: "선택값과 직접 입력값 통합",
    file: "src/pages/ResumeCreate.jsx",
    desc: "버튼으로 선택한 값과 사용자가 직접 입력한 값을 buildResumeData 함수에서 하나의 데이터로 정리합니다. 이 구조 덕분에 정해진 선택지만 사용하는 것이 아니라 개인별 특수 경력도 결과에 반영할 수 있습니다.",
  },
  {
    title: "GPT API 이력서 생성",
    file: "server.js / OpenAI API",
    desc: "클라이언트에서 입력된 경력, 강점, 지원 직무 정보를 서버로 전달하면 서버가 GPT API에 구조화된 프롬프트를 보내 이력서 초안과 자기소개서 문장을 생성합니다. API 키는 서버 환경변수로 관리해 클라이언트 노출을 막았습니다.",
  },
  {
    title: "분석 점수와 추천 직무 계산",
    file: "src/pages/ResumeCreate.jsx",
    desc: "생성 결과와 입력 키워드를 기반으로 ATS 적합도, 문장 완성도, 추천 직무를 계산합니다. 사용자가 단순히 문서만 받는 것이 아니라 수정 방향까지 확인할 수 있게 했습니다.",
  },
  {
    title: "이력서 저장 API",
    file: "src/api.js / server.js",
    desc: "로그인 사용자가 이력서를 생성하면 /api/resumes로 결과를 저장합니다. 서버는 사용자 ID, 지원 직무, 입력 폼, 생성 결과, 분석 점수를 MongoDB에 함께 보관합니다.",
  },
  {
    title: "고객 정보 DB 저장 구조",
    file: "server.js / server/database.js",
    desc: "회원 정보는 users, 로그인 세션은 sessions, 생성 이력서는 resumes, 후기는 reviews 컬렉션에 저장합니다. 각 데이터는 user_id로 연결되어 한 고객의 계정, 세션, 이력서, 리뷰 흐름을 추적할 수 있습니다.",
  },
  {
    title: "해시 기반 회원 인증",
    file: "server.js",
    desc: "비밀번호는 원문 저장 없이 사용자별 salt와 scrypt 해시값으로만 저장합니다. 로그인 시에도 입력값을 같은 방식으로 해시한 뒤 timingSafeEqual로 비교해 인증 결과를 판단합니다.",
  },
  {
    title: "세션 토큰 보호",
    file: "server.js / MongoDB sessions",
    desc: "브라우저 쿠키에는 랜덤 세션 토큰을 전달하지만 데이터베이스에는 SHA-256으로 변환한 token_hash만 저장합니다. 이후 요청에서는 쿠키 토큰을 다시 해시해 sessions 컬렉션과 대조합니다.",
  },
];

const codeSamples = [
  {
    title: "1. 단계 검증 후 AI 이력서 생성 실행",
    file: "src/pages/ResumeCreate.jsx",
    code: `const generateResume = async () => {
  if (isGenerating) return;
  const message = validateStep();
  if (message) {
    alert(message);
    return;
  }
  const nextResult = { ...form };
  const resumeData = buildResumeData(nextResult);
  const resumeAnalysis = calculateAnalysis(resumeData);

  setIsGenerating(true);
  try {
    const aiResult = await generateAiResume(resumeData);
    if (!aiResult.ok) {
      alert(aiResult.message);
      return;
    }

    const generatedResume = aiResult.generatedResume;
    setResult({ ...nextResult, generatedResume });

    if (user) {
      await createResume({
        targetJob: resumeData.targetJob,
        formData: nextResult,
        generatedResume,
        atsScore: resumeAnalysis.atsScore,
        writingScore: resumeAnalysis.writingScore,
      });
    }
  } finally {
    setIsGenerating(false);
  }
};`,
  },
  {
    title: "2. 선택 데이터와 직접 입력 데이터 통합",
    file: "src/pages/ResumeCreate.jsx",
    code: `function buildResumeData(form) {
  const targetJob =
    form.targetJob === "직접 입력" ? form.targetJobDetail : form.targetJob;

  return {
    ...form,
    targetJob,
    careerItems: mergeSelectedAndDetail(
      form.careerSummary,
      form.careerSummaryDetail
    ),
    achievementItems: mergeSelectedAndDetail(
      form.achievement,
      form.achievementDetail
    ),
    skillItems: splitText(form.skillSet),
  };
}`,
  },
  {
    title: "3. GPT API 연동 서버 코드",
    file: "server.js",
    code: `const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: OPENAI_MODEL,
    instructions: "중장년 재취업자를 돕는 전문 이력서 컨설턴트입니다.",
    input: buildResumePrompt(resumeInput),
    max_output_tokens: 1600,
  }),
});

const payload = await openAiResponse.json().catch(() => ({}));
const generatedResume = extractOpenAiText(payload);`,
  },
  {
    title: "4. 해시 기반 비밀번호 저장과 검증",
    file: "server.js",
    code: `function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== 64) return false;

  const candidate = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(candidate, expected);
}`,
  },
  {
    title: "5. 세션 토큰 해시와 쿠키 발급",
    file: "server.js",
    code: `function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function setSession(request, response, userId) {
  const token = crypto.randomBytes(32).toString("hex");

  await sessions.insertOne({
    token_hash: hashToken(token),
    user_id: String(userId),
    expires_at: new Date(Date.now() + SESSION_MAX_AGE_MS),
  });

  response.setHeader("Set-Cookie", buildSessionCookie(request, token, 604800));
}`,
  },
  {
    title: "6. 고객 계정 정보 저장",
    file: "server.js",
    code: `const { salt, hash } = hashPassword(password);
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
return sendJson(response, 201, { user: normalizeUser(user) });`,
  },
  {
    title: "7. 생성된 이력서 저장 API",
    file: "src/api.js / server.js",
    code: `export function createResume(resume) {
  return apiRequest("/api/resumes", {
    method: "POST",
    body: JSON.stringify(resume),
  });
}

await resumes.insertOne({
  id: crypto.randomUUID(),
  user_id: user.id,
  target_job: targetJob,
  form_data: formData,
  generated_resume: generatedResume,
  ats_score: atsScore,
  writing_score: writingScore,
});`,
  },
  {
    title: "8. 추천 공고 계산",
    file: "src/pages/ResumeCreate.jsx",
    code: `function getRecommendedJobs(data) {
  const source = [
    data.targetJob,
    ...data.careerItems,
    ...data.strengths,
    ...data.skillItems,
  ].join(" ");

  return jobPosts
    .map((job) => {
      const matched = job.keywords.filter((keyword) =>
        source.includes(keyword)
      );
      return { ...job, score: Math.min(98, 60 + matched.length * 9) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}`,
  },
];

const promptLogs = [
  {
    phase: "기획",
    type: "생성",
    me: "중장년 재취업자를 위한 AI 이력서 작성 서비스를 만들고 싶어. 사용자가 긴 글을 쓰지 않아도 버튼 선택만으로 이력서 초안을 만들 수 있게 전체 서비스 구조를 제안해줘.",
    chatgpt: "핵심 사용자를 중장년 구직자로 정의하고 홈, 서비스 소개, AI 이력서 작성, 채용공고, 구독, 리뷰 페이지로 서비스 구조를 나누어 제안했습니다. 이력서 작성 흐름은 기본 정보, 직무, 경력, 강점, 결과 생성 단계로 정리했습니다.",
    result: "프로젝트 주제, 핵심 사용자, 페이지 구성이 확정되었습니다.",
  },
  {
    phase: "화면 설계",
    type: "생성",
    me: "AI 이력서 페이지를 단계형 폼으로 만들어줘. 지원 직무, 경력, 성과, 자격증, 강점은 버튼으로 선택하고 마지막에 결과를 보여주는 구조면 좋겠어.",
    chatgpt: "React 상태 관리 기반의 단계형 입력 UI를 구성하고, 선택형 카드 컴포넌트와 결과 출력 영역을 분리하는 화면 구조를 제안했습니다.",
    result: "ResumeCreate 페이지의 5단계 작성 흐름과 선택 카드 UI가 구현되었습니다.",
  },
  {
    phase: "AI 기능",
    type: "수정",
    me: "사용자가 입력한 직무와 경력, 강점을 바탕으로 GPT API가 이력서 문장을 만들어주는 흐름으로 정리해줘. API 키는 프론트에 노출되면 안 돼.",
    chatgpt: "클라이언트는 입력 데이터만 서버로 보내고, 서버가 환경변수의 API 키로 GPT API를 호출하는 구조를 제안했습니다. 프롬프트에는 지원 직무, 경력 요약, 성과, 강점, 희망 문체를 포함하도록 정리했습니다.",
    result: "GPT API 서버 연동 방식과 프롬프트 데이터 구조가 보고서 핵심 코드에 반영되었습니다.",
  },
  {
    phase: "데이터 저장",
    type: "수정",
    me: "로그인한 사용자가 생성한 이력서를 나중에 다시 볼 수 있게 저장 기능도 넣어줘.",
    chatgpt: "세션 기반 로그인 상태를 확인한 뒤 /api/resumes로 생성 결과를 저장하고, MongoDB resumes 컬렉션에 사용자 ID와 이력서 데이터를 함께 저장하는 구조를 구성했습니다.",
    result: "사용자별 이력서 저장 API와 데이터베이스 구조가 추가되었습니다.",
  },
  {
    phase: "DB 설계",
    type: "수정",
    me: "고객 정보를 DB에 저장할 때 회원 정보, 로그인 세션, 이력서 결과, 리뷰를 어떻게 나누면 좋을지 자세히 정리해줘.",
    chatgpt: "users에는 고객 기본 계정과 비밀번호 해시를 저장하고, sessions에는 세션 토큰 해시와 만료 시간을 저장하며, resumes와 reviews는 user_id로 고객 계정과 연결하는 구조를 제안했습니다. 또한 이메일 중복 방지 인덱스, 세션 TTL 인덱스, 사용자별 이력서 조회 인덱스를 함께 적용하도록 정리했습니다.",
    result: "MongoDB 컬렉션 구조와 고객 정보 저장 방식이 제작보고서의 DB 저장 구조 섹션에 반영되었습니다.",
  },
  {
    phase: "품질 개선",
    type: "수정",
    me: "결과만 보여주지 말고 ATS 적합도, 문장 완성도, 추천 직무, 추천 채용공고까지 같이 보여주면 좋겠어.",
    chatgpt: "입력 키워드 기반의 분석 점수 계산 로직과 채용공고 매칭 로직을 추가해 결과 화면에서 사용자가 수정 방향과 다음 행동을 함께 확인할 수 있도록 제안했습니다.",
    result: "AI RESULT 영역에 분석 카드와 맞춤 채용공고 추천 영역이 구성되었습니다.",
  },
  {
    phase: "보안 강화",
    type: "수정",
    me: "회원가입과 로그인 기능을 넣을 때 비밀번호를 그대로 저장하지 말고 해시로 안전하게 구축하고 싶어. 세션도 안전하게 관리하는 방식으로 정리해줘.",
    chatgpt: "비밀번호는 사용자별 salt와 scrypt 해시로 저장하고, 세션 토큰은 랜덤 문자열을 쿠키로 전달하되 데이터베이스에는 SHA-256 해시만 저장하는 구조를 제안했습니다. HttpOnly 쿠키, 요청 제한, 보안 헤더도 함께 적용하도록 정리했습니다.",
    result: "server.js에 해시 기반 비밀번호 검증, 세션 토큰 해시 저장, 쿠키 보안 옵션, 요청 제한, 보안 헤더가 반영되었습니다.",
  },
];

export default function Report() {
  return (
    <main id="main" className="report-page">
      <section className="report-hero">
        <div className="container report-hero-grid">
          <div>
            <p className="eyebrow">PROJECT REPORT</p>
            <h2>이력써 AI 제작보고서</h2>
            <p>
              AI 기반 이력서 작성 서비스의 제작 배경, 사용자 문제 정의, 화면 설계, 구현 기술,
              GPT API 연동 흐름, 핵심 코드, AI 협업 과정을 정리한 프로젝트 보고서입니다.
            </p>
          </div>
          <div className="report-hero-panel" aria-label="보고서 요약">
            <strong>보고서 구성</strong>
            <ol>
              <li>개요</li>
              <li>페이지 구조</li>
              <li>디자인 컨셉</li>
              <li>주요 기능과 사용 기술</li>
              <li>DB 고객 정보 저장 구조</li>
              <li>보안·인증 구현</li>
              <li>핵심 코드 리뷰</li>
              <li>주요 AI 프롬프트 기록</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container report-stack">
          <article className="report-section">
            <span className="report-number">01</span>
            <h3>개요</h3>
            <p>
              이력써 AI는 재취업을 준비하는 사용자가 자신의 경력과 강점을 쉽게 정리하고,
              GPT API를 활용해 지원 직무에 맞는 이력서 초안과 자기소개서 문장을 생성할 수
              있도록 제작한 웹 서비스입니다. 기존 이력서 작성 과정은 사용자가 스스로 문장을
              구성해야 하는 부담이 컸기 때문에, 본 프로젝트에서는 질문형 입력과 버튼 선택
              UI를 통해 작성 난이도를 낮추는 것을 핵심 목표로 설정했습니다.
            </p>
            <div className="report-meta-grid">
              {projectMeta.map((item) => (
                <div className="report-meta-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">02</span>
            <h3>페이지 구조</h3>
            <p>
              전체 페이지는 서비스 소개, 핵심 작성 기능, 지원 후속 행동, 사용자 참여, 제작
              보고서로 역할을 분리했습니다. React Router를 사용해 각 페이지를 독립적인
              컴포넌트로 관리하고, 공통 Header 메뉴에서 이동할 수 있도록 구성했습니다.
            </p>
            <div className="report-page-grid">
              {pageStructure.map((page) => (
                <div className="report-page-card" key={page.path}>
                  <small>{page.path}</small>
                  <strong>{page.title}</strong>
                  <em>{page.role}</em>
                  <p>{page.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">03</span>
            <h3>디자인 컨셉</h3>
            <p>
              디자인은 AI 서비스의 전문성과 이력서 작성 도구의 안정감을 동시에 전달하는
              방향으로 구성했습니다. 특히 대상 사용자가 쉽게 따라올 수 있도록 정보 밀도를
              조절하고, 주요 행동 버튼과 단계 진행 상태가 명확하게 보이도록 했습니다.
            </p>
            <div className="report-concept-list">
              {designConcepts.map((item) => (
                <section key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">04</span>
            <h3>주요 기능과 사용 기술</h3>
            <p>
              주요 기능은 이력서 작성, AI 문장 생성, 분석, 저장, 채용공고 연결, 인증과 보안으로
              구성했습니다. 기술적으로는 React 기반 프론트엔드와 Node.js API 서버를 분리하고,
              MongoDB를 사용해 사용자와 이력서 데이터를 저장했습니다. AI 기능은 클라이언트에서
              직접 외부 API를 호출하지 않고 서버를 통해 처리해 API 키와 사용자 입력 데이터를
              더 안정적으로 관리했습니다.
            </p>
            <div className="report-two-column">
              <div>
                <h4>주요기능</h4>
                <ul className="report-chip-list">
                  {featureList.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4>사용기술</h4>
                <ul className="report-chip-list tech">
                  {techList.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="report-detail-grid">
              {techDetails.map((item) => (
                <section className="report-detail-card" key={item.title}>
                  <span>{item.category}</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">05</span>
            <h3>DB 고객 정보 저장 구조</h3>
            <p>
              고객 정보 저장은 MongoDB 컬렉션을 역할별로 분리하는 방식으로 설계했습니다.
              회원의 기본 계정 정보는 users, 로그인 유지 정보는 sessions, 고객이 생성한
              이력서 결과는 resumes, 서비스 후기는 reviews에 저장합니다. 이 데이터들은 모두
              고객 고유 ID인 user_id를 중심으로 연결되어, 로그인한 사용자가 자신의 이력서와
              작성 기록만 조회할 수 있도록 구성했습니다.
            </p>
            <div className="report-detail-grid data">
              {customerDataDetails.map((item) => (
                <section className="report-detail-card data-card" key={item.title}>
                  <h4>{item.title}</h4>
                  <ul className="report-field-list" aria-label={`${item.title} 저장 필드`}>
                    {item.fields.map((field) => <li key={field}>{field}</li>)}
                  </ul>
                  <p>{item.desc}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">06</span>
            <h3>보안·인증 구현</h3>
            <p>
              본 프로젝트의 보안 구현은 단순히 로그인 화면을 만드는 수준이 아니라, 사용자의
              비밀번호와 세션 정보를 안전하게 저장하고 요청을 제한하는 방향으로 설계했습니다.
              특히 비밀번호와 세션 토큰을 모두 해시 기반으로 다루어 데이터베이스에는 민감한
              원문 값이 남지 않도록 했습니다.
            </p>
            <div className="report-detail-grid security">
              {securityDetails.map((item) => (
                <section className="report-detail-card security-card" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">07</span>
            <h3>핵심코드리뷰</h3>
            <p>
              핵심 코드는 작성 단계 관리, 입력 데이터 정리, GPT API 호출, 고객 정보 DB 저장,
              해시 기반 인증, 세션 관리, 분석 점수 계산, 이력서 저장, 추천 공고 계산 흐름으로
              나눌 수 있습니다.
              아래 코드는 프로젝트 동작을 이해하는 데 중요한 부분을 중심으로 정리했습니다.
            </p>
            <div className="code-review-list">
              {reviewItems.map((item) => (
                <section className="code-review-card" key={item.title}>
                  <span>{item.file}</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </section>
              ))}
            </div>
            <div className="code-sample-grid">
              {codeSamples.map((sample) => (
                <div className="code-sample-box" key={sample.title}>
                  <h4>{sample.title}</h4>
                  <span>{sample.file}</span>
                  <pre><code>{sample.code}</code></pre>
                </div>
              ))}
            </div>
          </article>

          <article className="report-section">
            <span className="report-number">08</span>
            <h3>주요 AI 프롬프트 기록 <small>(생성 및 수정)</small></h3>
            <p>
              프로젝트 제작 과정에서 ChatGPT를 단순 코드 생성 도구로만 사용하지 않고, 기획
              정리, 화면 구조 설계, 기능 확장, 코드 흐름 개선, 보고서 정리에 활용했습니다.
              아래 기록은 실제 제작 과정에서 핵심 방향을 결정한 프롬프트 중심으로 정리했습니다.
            </p>
            <div className="prompt-log-list">
              {promptLogs.map((log) => (
                <section className="prompt-log-card" key={`${log.phase}-${log.me}`}>
                  <div className="prompt-log-head">
                    <span>{log.phase}</span>
                    <small>{log.type}</small>
                  </div>
                  <p><strong>나:</strong> {log.me}</p>
                  <p><strong>chatgpt(유료):</strong> {log.chatgpt}</p>
                  <p className="prompt-result"><strong>반영 결과:</strong> {log.result}</p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
