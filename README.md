# 이력써 AI React

Vite + React 프론트엔드와 Node.js API 서버로 구성된 이력서 작성 서비스입니다. API 서버는 MongoDB를 기본 데이터베이스로 사용합니다.

## 실행 방법

```bash
npm install
npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000
- MongoDB 기본 연결: `mongodb://127.0.0.1:27017`
- MongoDB DB 이름: `ireoksseo`

## MongoDB 설정

로컬 MongoDB 서버가 실행 중이면 별도 설정 없이 바로 연결됩니다. 다른 URI나 DB 이름을 쓰려면 `.env.example`을 참고해 `.env`를 만들면 됩니다.

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=ireoksseo
```

MongoDB Compass에서는 아래 값으로 접속하세요.

```txt
mongodb://127.0.0.1:27017
```

접속 후 `ireoksseo` 데이터베이스에서 다음 컬렉션을 확인할 수 있습니다.

- `users`: 회원 계정과 암호 해시
- `sessions`: 로그인 세션, TTL 인덱스로 자동 만료
- `resumes`: 저장된 이력서
- `reviews`: 사용자 리뷰
- `jobs`: 채용공고 기본 데이터
- `app_meta`: 마이그레이션 메타 정보

## 주요 스크립트

```bash
npm run dev        # React 개발 서버 + API 서버 동시 실행
npm run client     # React 개발 서버만 실행
npm run server     # API 서버만 실행
npm run db:health  # MongoDB 연결과 컬렉션 카운트 확인
npm run db:migrate # data/db.json 데이터를 MongoDB로 가져오기
npm run build      # 배포용 dist 생성
npm start          # dist 정적 파일 + API 서버 실행
```

## 페이지 구조

- `/`: 홈
- `/resume`: AI 이력서 생성
- `/service`: 서비스 소개
- `/jobs`: 채용공고
- `/subscription`: 구독
- `/reviews`: 사용자 리뷰

## 폴더 구조

```txt
ireoksseo-react
├─ public/images
├─ data/db.json
├─ scripts
│  ├─ migrate-json-to-mongodb.js
│  └─ mongodb-health.js
├─ server
│  ├─ database.js
│  └─ env.js
├─ src
│  ├─ components
│  ├─ pages
│  ├─ api.js
│  ├─ data.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ server.js
├─ vite.config.js
└─ package.json
```
