import { Link } from "react-router-dom";

export default function Service() {
  return (
    <main id="main">
      <section className="service-hero">
        <div className="container service-hero-grid">
          <div className="service-hero-text">
            <p className="eyebrow">CAREER REDESIGN AI</p>
            <h2>경력 재설계를 통해 중장년의 재취업을 돕는 AI 이력서 도우미</h2>
            <p>
              이력써는 복잡한 서술식 프롬프트 대신 질문과 버튼 선택으로 경력, 강점, 지원 직무를 정리하고 재취업에 맞는 이력서와 자기소개서 초안을 만들어 줍니다.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/resume">AI 이력서 작성</Link>
              <Link className="btn btn-outline" to="/subscription">프로 기능 보기</Link>
            </div>
          </div>
          <div className="service-summary-panel">
            <strong>이력써가 해결하는 문제</strong>
            <ul>
              <li>이력서와 자기소개서 작성에 대한 막막함</li>
              <li>온라인 채용 환경과 생성형 AI 사용의 진입장벽</li>
              <li>기존 경력을 새 직무에 맞게 재구성하는 어려움</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-stat-grid">
            <article className="service-stat-card"><strong>40~64세</strong><p>중장년 재취업과 직무 전환을 준비하는 핵심 사용자층</p></article>
            <article className="service-stat-card"><strong>Q&A UI</strong><p>글쓰기보다 쉬운 질문 답변형 입력과 키워드 선택 방식</p></article>
            <article className="service-stat-card"><strong>통합 준비</strong><p>이력서 작성, 진단, 자기소개서, 면접 질문을 한 흐름으로 제공</p></article>
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">WHY IREOKSSEO</p>
            <h2>중장년 재취업에 맞춘 서비스 구조</h2>
            <p>일반적인 이력서 생성기가 아니라 경력 단절과 직무 전환 상황을 고려한 재취업 준비 플랫폼입니다.</p>
          </div>
          <div className="service-feature-grid">
            <article className="service-feature-card"><span>01</span><h3>버튼 기반 단계별 입력</h3><p>지원 직무, 성격, 경력, 자격증을 고르면서 작성 부담을 줄입니다.</p></article>
            <article className="service-feature-card"><span>02</span><h3>경력 재구성</h3><p>과거 경력을 현재 지원 직무에 맞는 표현으로 바꿔줍니다.</p></article>
            <article className="service-feature-card"><span>03</span><h3>문장 품질 진단</h3><p>ATS 적합도와 문장 완성도를 함께 보여주어 수정 방향을 제시합니다.</p></article>
            <article className="service-feature-card"><span>04</span><h3>채용공고 연결</h3><p>이력서 생성 이후 지원 가능한 공고를 자연스럽게 탐색하도록 돕습니다.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}
