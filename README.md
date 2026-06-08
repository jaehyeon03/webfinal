# 이력써 AI React

AI 기반 이력서 작성 및 재취업 지원 웹 서비스입니다. Vite + React 프론트엔드, Node.js API, MongoDB, OpenAI API로 구성되어 있으며, 로컬 개발에서는 `server.js`를 사용하고 Vercel 배포에서는 `api/` 폴더의 Vercel Functions가 API를 처리합니다.

## 주요 기능

- 5단계 이력서 작성 폼
- OpenAI API 기반 이력서 초안 및 자기소개서 생성
- ATS 적합도, 문장 완성도, 추천 직무 분석
- 회원가입, 로그인, 로그아웃, 세션 유지
- 로그인 사용자별 이력서 저장 및 조회
- 사용자 리뷰 작성 및 조회
- MongoDB 기반 회원, 세션, 이력서, 리뷰, 채용공고 저장
- Vercel 배포용 Serverless API 지원

## 로컬 실행

```bash
npm install
npm run dev
```

- 프론트엔드: `http://localhost:5173`
- 백엔드 API: `http://localhost:3000`
- MongoDB 기본 연결: `mongodb://127.0.0.1:27017`
- MongoDB DB 이름: `ireoksseo`

로컬에서 프론트만 실행하려면:

```bash
npm run client
```

로컬에서 API 서버만 실행하려면:

```bash
npm run server
```

## 환경변수

`.env.example`을 참고해 로컬에서는 `.env`를 만들고, Vercel에서는 Project Settings 또는 Import 화면의 Environment Variables에 같은 값을 등록합니다.

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=ireoksseo
MONGODB_IMPORT_JSON_ON_START=true
COOKIE_SECURE=false
TRUST_PROXY=false
CORS_ORIGINS=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Vercel 배포 환경변수

Vercel에서는 아래 값을 등록해야 전체 기능이 동작합니다.

```txt
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=ireoksseo
MONGODB_IMPORT_JSON_ON_START=false
```

`OPENAI_API_KEY`와 `MONGODB_URI`는 공개 저장소에 커밋하지 말고 Vercel 환경변수로만 관리합니다.

## MongoDB Atlas 설정

Vercel 배포에서 로그인, 회원가입, 이력서 저장, 리뷰 작성까지 모두 사용하려면 MongoDB Atlas 같은 외부 MongoDB가 필요합니다.

1. MongoDB Atlas에서 클러스터를 생성합니다.
2. Database Access에서 앱 전용 DB 사용자를 만듭니다.
3. Network Access에서 Vercel 접속을 허용합니다.
   - 시연용으로는 `0.0.0.0/0`을 사용할 수 있습니다.
   - 운영용이라면 더 제한적인 접근 정책을 사용하는 것이 좋습니다.
4. Atlas 연결 문자열을 Vercel의 `MONGODB_URI`에 등록합니다.

연결 문자열 예시는 다음과 같습니다.

```txt
mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/?retryWrites=true&w=majority
```

DB 이름은 별도 환경변수로 지정합니다.

```txt
MONGODB_DB_NAME=ireoksseo
```

## Vercel 배포

GitHub 리포지토리를 Vercel에서 import합니다.

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Root Directory: 기본값
```

배포 후 React Router 경로 새로고침을 지원하기 위해 `vercel.json`에서 모든 비 API 경로를 `index.html`로 rewrite합니다. `/api/*` 경로는 Vercel Functions로 처리됩니다.

## API 구조

로컬 개발:

- `server.js`가 정적 파일과 API를 함께 처리합니다.
- Vite 개발 서버는 `vite.config.js`의 proxy 설정으로 `/api` 요청을 `http://localhost:3000`으로 전달합니다.

Vercel 배포:

- `api/resume.js`: OpenAI 이력서 생성
- `api/signup.js`: 회원가입
- `api/login.js`: 로그인
- `api/me.js`: 현재 로그인 사용자 확인
- `api/logout.js`: 로그아웃
- `api/resumes.js`: 이력서 저장 및 조회
- `api/reviews.js`: 리뷰 작성 및 조회
- `api/jobs.js`: 채용공고 조회
- `api/health.js`: MongoDB 연결 및 컬렉션 상태 확인
- `serverless/`: Vercel Functions에서 공유하는 인증, HTTP, 응답 정규화 유틸

## MongoDB 컬렉션

- `users`: 회원 계정, 이메일, 비밀번호 salt/hash
- `sessions`: 로그인 세션 token hash, 만료 시간, TTL 인덱스
- `resumes`: 사용자별 이력서 입력값, 생성 결과, 분석 점수
- `reviews`: 사용자 리뷰
- `jobs`: 채용공고 기본 데이터
- `app_meta`: JSON 마이그레이션 메타 정보

## 주요 스크립트

```bash
npm run dev        # React 개발 서버 + Node.js API 서버 동시 실행
npm run client     # React 개발 서버만 실행
npm run server     # Node.js API 서버만 실행
npm run db:health  # MongoDB 연결과 컬렉션 카운트 확인
npm run db:migrate # data/db.json 데이터를 MongoDB로 가져오기
npm run build      # 배포용 dist 생성
npm start          # dist 정적 파일 + Node.js API 서버 실행
```

## 페이지 구조

- `/`: 홈
- `/resume`: AI 이력서 생성
- `/service`: 서비스 소개
- `/jobs`: 채용공고
- `/subscription`: 구독
- `/reviews`: 사용자 리뷰
- `/report`: 제작보고서

## 폴더 구조

```txt
ireoksseo-react
├─ api
│  ├─ health.js
│  ├─ jobs.js
│  ├─ login.js
│  ├─ logout.js
│  ├─ me.js
│  ├─ resume.js
│  ├─ resumes.js
│  ├─ reviews.js
│  └─ signup.js
├─ public/images
├─ data/db.json
├─ scripts
│  ├─ migrate-json-to-mongodb.js
│  └─ mongodb-health.js
├─ server
│  ├─ database.js
│  └─ env.js
├─ serverless
│  ├─ auth.js
│  ├─ http.js
│  └─ normalizers.js
├─ src
│  ├─ components
│  ├─ pages
│  ├─ api.js
│  ├─ data.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ server.js
├─ vercel.json
├─ vite.config.js
└─ package.json
```
