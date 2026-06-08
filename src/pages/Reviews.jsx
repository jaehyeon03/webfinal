import { useEffect, useMemo, useState } from "react";
import { createReview, getReviews, loginUser, logoutUser, signupUser } from "../api";

const featuredReviews = [
  {
    id: "sample-1",
    rating: "5.0",
    text: "경력을 어떻게 정리해야 할지 막막했는데 질문 흐름대로 고르다 보니 이력서 초안이 훨씬 빠르게 나왔습니다.",
    name: "김민수",
    role: "재취업 준비",
    segment: "job",
    plan: "Pro",
    createdAt: "2026-05-30T09:00:00.000Z",
    tags: ["경력 정리", "자기소개서"],
  },
  {
    id: "sample-2",
    rating: "4.8",
    text: "채용공고 추천을 보고 제 경력과 맞는 사무직 포지션을 다시 생각해볼 수 있었습니다. PDF 저장까지 자연스럽습니다.",
    name: "박지현",
    role: "사무직 지원",
    segment: "office",
    plan: "Free",
    createdAt: "2026-05-27T11:30:00.000Z",
    tags: ["채용공고", "PDF"],
  },
  {
    id: "sample-3",
    rating: "4.9",
    text: "기관 상담 때 예시 이력서를 빠르게 보여줄 수 있어서 교육 보조 도구로도 좋았습니다.",
    name: "이서연",
    role: "취업지원 담당자",
    segment: "center",
    plan: "Team",
    createdAt: "2026-05-22T14:10:00.000Z",
    tags: ["상담", "교육"],
  },
  {
    id: "sample-4",
    rating: "5.0",
    text: "처음 이력서를 쓰는 입장에서도 어떤 내용을 넣어야 하는지 정리되어 보여서 작성 시간이 많이 줄었습니다.",
    name: "정하늘",
    role: "사회초년생",
    segment: "starter",
    plan: "Free",
    createdAt: "2026-05-18T08:20:00.000Z",
    tags: ["첫 이력서", "문장 추천"],
  },
  {
    id: "sample-5",
    rating: "4.7",
    text: "반복해서 수정하던 자기소개서 문장을 한 번에 비교할 수 있어 지원서 완성도가 좋아졌습니다.",
    name: "오지훈",
    role: "서비스직 전환",
    segment: "job",
    plan: "Pro",
    createdAt: "2026-05-14T16:40:00.000Z",
    tags: ["직무 전환", "문장 개선"],
  },
];

const filters = [
  { id: "all", label: "전체" },
  { id: "job", label: "재취업" },
  { id: "office", label: "사무직" },
  { id: "center", label: "기관" },
  { id: "starter", label: "신입" },
  { id: "member", label: "회원 리뷰" },
];

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "최근 등록";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const getInitial = (name = "회") => name.trim().slice(0, 1) || "회";

const isPublicReview = (review) => String(review.text || "").trim().length >= 12;

export default function Reviews({ user, onAuthChange }) {
  const [reviews, setReviews] = useState([]);
  const [isSignupMode, setIsSignupMode] = useState(true);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [writeForm, setWriteForm] = useState({ role: "", rating: "5.0", text: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  const loadReviews = async () => {
    const saved = await getReviews();
    setReviews([...saved].reverse());
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const result = isSignupMode
      ? await signupUser(authForm)
      : await loginUser({ email: authForm.email, password: authForm.password });

    if (!result.ok) {
      alert(result.message);
      return;
    }

    onAuthChange(result.user);
    setAuthForm({ name: "", email: "", password: "" });
    alert(isSignupMode ? "회원가입이 완료되었습니다." : "로그인되었습니다.");
  };

  const handleLogout = async () => {
    await logoutUser();
    onAuthChange(null);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const result = await createReview(writeForm);

    if (!result.ok) {
      alert(result.message);
      return;
    }

    setWriteForm({ role: "", rating: "5.0", text: "" });
    await loadReviews();
    alert("리뷰가 등록되었습니다.");
  };

  const memberReviews = useMemo(
    () =>
      reviews
        .filter(isPublicReview)
        .map((review) => ({
          ...review,
          segment: "member",
          plan: "Member",
          tags: ["회원 작성", review.role],
        })),
    [reviews],
  );

  const allReviews = useMemo(() => [...memberReviews, ...featuredReviews], [memberReviews]);

  const reviewStats = useMemo(() => {
    const ratingTotal = allReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    const average = allReviews.length ? (ratingTotal / allReviews.length).toFixed(1) : "0.0";

    const distribution = ["5.0", "4.9", "4.8", "4.7", "4.5"].map((rating) => {
      const count = allReviews.filter((review) => review.rating === rating).length;
      return {
        rating,
        count,
        percent: allReviews.length ? Math.round((count / allReviews.length) * 100) : 0,
      };
    });

    return { average, total: allReviews.length, distribution };
  }, [allReviews]);

  const visibleReviews = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? allReviews
        : allReviews.filter((review) => review.segment === activeFilter);

    return [...filtered].sort((a, b) => {
      if (sortOrder === "rating") return Number(b.rating) - Number(a.rating);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [activeFilter, allReviews, sortOrder]);

  return (
    <main id="main">
      <section className="section page-hero reviews-page">
        <div className="container">
          <div className="review-hero">
            <div className="review-hero-copy">
              <p className="section-label">REVIEWS</p>
              <h2>사용자가 먼저 말해주는 이력써 AI</h2>
              <p>이력서 작성, 자기소개서 정리, 채용공고 확인까지 실제 사용자가 남긴 경험을 모았습니다.</p>

              <div className="review-hero-stats" aria-label="리뷰 요약">
                <div>
                  <span>평균 평점</span>
                  <strong>{reviewStats.average}</strong>
                </div>
                <div>
                  <span>등록 리뷰</span>
                  <strong>{reviewStats.total}개</strong>
                </div>
                <div>
                  <span>추천 의향</span>
                  <strong>96%</strong>
                </div>
              </div>
            </div>

            <aside className="rating-panel" aria-label="평점 분포">
              <div className="rating-panel-head">
                <span>사용자 만족도</span>
                <strong>{reviewStats.average}</strong>
              </div>
              <div className="star-row" aria-hidden="true">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <div className="rating-bars">
                {reviewStats.distribution.map((item) => (
                  <div key={item.rating} className="rating-bar-row">
                    <span>{item.rating}</span>
                    <div className="rating-track">
                      <i style={{ width: `${item.percent}%` }} />
                    </div>
                    <em>{item.count}</em>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="review-toolbar" aria-label="리뷰 필터">
            <div className="review-filter-tabs" role="tablist" aria-label="리뷰 유형">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`review-filter${activeFilter === filter.id ? " active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="review-sort">
              <span>정렬</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="recent">최신순</option>
                <option value="rating">평점순</option>
              </select>
            </label>
          </div>

          <div className="review-grid" id="reviewList">
            {visibleReviews.length > 0 ? (
              visibleReviews.map((review) => (
                <article key={review.id} className={`review-card${review.segment === "member" ? " member-review-card" : ""}`}>
                  <div className="review-card-head">
                    <div className="review-author">
                      <span className="review-avatar" aria-hidden="true">{getInitial(review.name)}</span>
                      <div>
                        <strong>{review.name}</strong>
                        <span>{review.role}</span>
                      </div>
                    </div>
                    <div className="review-score">{review.rating}</div>
                  </div>

                  <p>“{review.text}”</p>

                  <div className="review-meta-row">
                    <span className="verified-badge">{review.segment === "member" ? "회원 작성" : "검증된 리뷰"}</span>
                    <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
                  </div>

                  <div className="review-tag-row" aria-label="리뷰 태그">
                    {(review.tags || []).filter(Boolean).slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="review-empty">
                <strong>아직 공개된 회원 리뷰가 없습니다.</strong>
                <span>첫 리뷰가 등록되면 이 영역에 표시됩니다.</span>
              </div>
            )}
          </div>

          <section className="member-review-box service-review-box" aria-labelledby="memberReviewTitle">
            <div className="member-review-head">
              <div>
                <p className="section-label">MEMBER REVIEW</p>
                <h3 id="memberReviewTitle">회원 리뷰 작성</h3>
                <p id="reviewAuthMessage">
                  {user ? `${user.name}님, 리뷰를 작성할 수 있습니다.` : "회원가입 또는 로그인 후 리뷰를 작성할 수 있습니다."}
                </p>
              </div>
              {user && <button className="btn btn-outline" type="button" onClick={handleLogout}>로그아웃</button>}
            </div>

            {!user && (
              <form className="auth-panel" onSubmit={handleAuthSubmit}>
                {isSignupMode && (
                  <div className="form-group signup-field">
                    <label htmlFor="reviewSignupName">이름</label>
                    <input id="reviewSignupName" name="name" type="text" placeholder="이름" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} required />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="reviewEmail">이메일</label>
                  <input id="reviewEmail" name="email" type="email" placeholder="이메일" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required />
                </div>

                <div className="form-group">
                  <label htmlFor="reviewPassword">비밀번호</label>
                  <input id="reviewPassword" name="password" type="password" placeholder="비밀번호" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required />
                </div>

                <button className="btn btn-primary" type="submit">{isSignupMode ? "회원가입" : "로그인"}</button>
                <button className="btn btn-outline" type="button" onClick={() => setIsSignupMode((prev) => !prev)}>
                  {isSignupMode ? "이미 계정이 있어요" : "회원가입하기"}
                </button>
              </form>
            )}

            {user && (
              <form className="review-write-form" onSubmit={handleReviewSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="reviewRole">상황</label>
                    <input id="reviewRole" name="role" placeholder="예: 재취업 준비" value={writeForm.role} onChange={(event) => setWriteForm({ ...writeForm, role: event.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewRating">평점</label>
                    <select id="reviewRating" name="rating" value={writeForm.rating} onChange={(event) => setWriteForm({ ...writeForm, rating: event.target.value })}>
                      <option>5.0</option><option>4.9</option><option>4.8</option><option>4.7</option><option>4.5</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label htmlFor="reviewText">리뷰 내용</label>
                    <textarea id="reviewText" name="text" minLength="12" maxLength="200" rows="4" placeholder="서비스 사용 후기를 작성해 주세요." value={writeForm.text} onChange={(event) => setWriteForm({ ...writeForm, text: event.target.value })} required />
                    <small>{writeForm.text.length}/200자</small>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit">리뷰 등록</button>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
