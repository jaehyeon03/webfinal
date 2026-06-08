import { useState } from "react";
import { Link } from "react-router-dom";
import { homeTabData } from "../data";

const tabLabels = {
  senior: "중장년",
  starter: "사회초년생",
  company: "기업",
  public: "공공기관",
};

export default function Home() {
  const [tab, setTab] = useState("senior");

  return (
    <main id="main">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <p className="eyebrow">AI 이력서 작성 도우미</p>
            <h2 className="hero-title">
              막막했던 이력서 작성,<br />
              <span>이력써 AI</span>와 함께 시작하세요.
            </h2>
            <p className="hero-desc">
              복잡한 프롬프트 입력 없이 질문에 답하고 버튼을 선택하면, 중장년 재취업 상황에 맞는 이력서와 자기소개서 초안을 생성합니다.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/resume">이력서 생성 시작</Link>
              <Link className="btn btn-outline" to="/service">서비스 살펴보기</Link>
            </div>
          </div>

          <div className="hero-card" aria-label="서비스 미리보기">
            <img src="/images/main3.png" alt="AI 이력서 생성 화면 이미지" />
            <div className="preview-card">
              <strong>경력은 더 선명하게, 문장은 더 전문적으로</strong>
              <p>사용자의 경력과 강점을 분석하여 지원 직무에 맞는 문서 초안을 구성합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <p className="section-label">SERVICE</p>
            <h2>이런 분들에게 필요합니다</h2>
            <p>이력써 AI는 중장년층, 사회초년생, 기관 담당자 모두가 쉽게 활용할 수 있는 AI 문서 작성 지원 서비스입니다.</p>
          </div>

          <div className="tab-menu" role="tablist" aria-label="대상별 설명">
            {Object.entries(tabLabels).map(([key, label]) => (
              <button key={key} className={`tab${tab === key ? " active" : ""}`} type="button" onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className="feature-panel">
            <div className="feature-image">
              <img src="/images/image3.png" alt="이력써 AI 일러스트" />
            </div>
            <ul className="feature-list">
              {homeTabData[tab].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">PROCESS</p>
            <h2>질문에 답하면 문서 초안이 완성됩니다</h2>
            <p>입력 부담을 줄이기 위해 버튼 선택과 짧은 문장 입력 중심으로 설계했습니다.</p>
          </div>
          <div className="service-feature-grid">
            <article className="service-feature-card"><span>01</span><h3>기본 정보 입력</h3><p>이름, 연락처, 지원 직무 등 필수 정보를 입력합니다.</p></article>
            <article className="service-feature-card"><span>02</span><h3>경력·강점 선택</h3><p>해본 일과 강점을 버튼으로 골라 직무 키워드를 정리합니다.</p></article>
            <article className="service-feature-card"><span>03</span><h3>AI 문장 생성</h3><p>입력 내용을 바탕으로 이력서와 자기소개서 초안을 구성합니다.</p></article>
            <article className="service-feature-card"><span>04</span><h3>지원 준비 연결</h3><p>ATS 점수, 추천 직무, 채용공고까지 한 흐름으로 확인합니다.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}
