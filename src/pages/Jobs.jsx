import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jobPosts } from "../data";
import { getJobs } from "../api";

function getDday(deadline) {
  if (!deadline) return "상시";
  const today = new Date();
  const dueDate = new Date(`${deadline}T23:59:59`);
  const remainingDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (!Number.isFinite(remainingDays)) return "상시";
  if (remainingDays < 0) return "마감";
  if (remainingDays === 0) return "D-Day";
  return `D-${remainingDays}`;
}

function toJobPost(job, index) {
  const company = job.company || "회사명 미정";
  return {
    id: job.id,
    dday: getDday(job.deadline),
    mark: company.slice(0, 4),
    markClass: "data",
    title: job.title || "제목 미정",
    company,
    location: job.location || "지역 미정",
    views: "-",
    type: index < 4 ? "popular" : "new",
    keywords: [job.category, job.description, job.title, job.company].filter(Boolean),
  };
}

function JobCard({ job, compact = false }) {
  return (
    <article className={`job-post-card${compact ? " compact" : ""}`}>
      <span className="job-dday">{job.dday}</span>
      <div className={`company-mark ${job.markClass}`}>{job.mark}</div>
      <h4>{job.title}</h4>
      <p>{job.company}</p>
      <div className="job-meta"><span>{job.location}</span><span>조회 {job.views}</span></div>
    </article>
  );
}

export default function Jobs() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("전체");
  const [serverJobs, setServerJobs] = useState([]);

  useEffect(() => {
    getJobs().then((jobs) => {
      if (jobs.length) setServerJobs(jobs);
    });
  }, []);

  const jobs = useMemo(() => (serverJobs.length ? serverJobs.map(toJobPost) : jobPosts), [serverJobs]);
  const popularJobs = jobs.filter((job) => job.type === "popular");
  const filteredJobs = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return jobs.filter((job) => {
      const keywordOk = !lower || [job.title, job.company, job.location, ...job.keywords].join(" ").toLowerCase().includes(lower);
      const locationOk = location === "전체" || job.location.includes(location);
      return keywordOk && locationOk;
    });
  }, [jobs, keyword, location]);

  return (
    <main id="main">
      <section className="jobs-hero">
        <div className="container jobs-hero-inner">
          <div>
            <p className="eyebrow">JOB BOARD</p>
            <h2>나에게 맞는 채용공고 모아보기</h2>
            <p>이력서 작성 후 바로 지원 흐름을 이어갈 수 있도록 직무, 경력, 마감일 기준으로 확인하기 쉬운 공고를 모았습니다.</p>
          </div>
          <Link className="btn btn-primary" to="/resume">이력서 먼저 만들기</Link>
        </div>
      </section>

      <section className="jobs-board section">
        <div className="container">
          <div className="job-notice">
            <strong>이력써 AI 추천</strong>
            <span>내 경력과 희망 직무를 입력하면 더 잘 맞는 공고를 추천받을 수 있습니다.</span>
            <Link to="/resume">맞춤 추천 받기</Link>
          </div>

          <div className="job-section-head">
            <div><p className="section-label">POPULAR</p><h3>인기 TOP 추천 공고</h3></div>
            <a href="#allJobs">전체보기</a>
          </div>
          <div className="job-post-grid">
            {popularJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>

          <div className="job-row" id="allJobs">
            <div className="job-section-head">
              <div><p className="section-label">NEW</p><h3>전체 채용공고</h3></div>
            </div>

            <div className="search-filter-row">
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="직무, 회사, 키워드 검색" />
              <select value={location} onChange={(event) => setLocation(event.target.value)}>
                <option>전체</option><option>서울</option><option>경기</option><option>강원</option><option>원주</option><option>전국</option>
              </select>
            </div>

            <div className="job-post-grid">
              {filteredJobs.map((job) => <JobCard key={job.id} job={job} compact />)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
