import { useMemo, useState } from "react";
import {
  achievementOptions,
  careerGroups,
  educationOptions,
  jobCategories,
  jobPosts,
  licenseOptions,
  strengthOptions,
  toneOptions,
} from "../data";
import { createResume, generateAiResume } from "../api";

const initialForm = {
  userName: "",
  userAge: "",
  userPhone: "",
  userEmail: "",
  targetJob: "",
  targetJobDetail: "",
  resumeTone: "",
  careerSummary: [],
  careerSummaryDetail: "",
  achievement: [],
  achievementDetail: "",
  license: [],
  licenseDetail: "",
  education: "",
  educationDetail: "",
  strengths: [],
  skillSet: "",
  careerGoal: "",
};

function TextInput({ label, name, form, setForm, type = "text", required = false, placeholder = "", small = "" }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}{required ? " *" : ""}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required={required} />
      {small && <small>{small}</small>}
    </div>
  );
}

function TextArea({ label, name, form, setForm, required = false, placeholder = "", maxLength = 300 }) {
  return (
    <div className="form-group full">
      <label htmlFor={name}>{label}{required ? " *" : ""}</label>
      <textarea id={name} name={name} rows="4" maxLength={maxLength} placeholder={placeholder} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required={required} />
      <small>{form[name].length}/{maxLength}자</small>
    </div>
  );
}

function ChoiceButton({ selected, label, value, onClick }) {
  return (
    <button className={`choice-card${selected ? " selected" : ""}`} type="button" onClick={() => onClick(value)}>
      {label}
    </button>
  );
}

function SingleChoice({ value, setValue, items }) {
  return (
    <div className="choice-grid">
      {items.map((item) => (
        <ChoiceButton key={item} selected={value === item} label={item.replace(" 문체", "")} value={item} onClick={setValue} />
      ))}
    </div>
  );
}

function MultiChoice({ values, setValues, items, max = 3 }) {
  const toggle = (item) => {
    if (item === "해당 없음") {
      setValues(values.includes(item) ? [] : [item]);
      return;
    }

    const withoutNone = values.filter((value) => value !== "해당 없음");
    if (withoutNone.includes(item)) {
      setValues(withoutNone.filter((value) => value !== item));
      return;
    }

    if (withoutNone.length >= max) {
      alert(`최대 ${max}개까지 선택할 수 있습니다.`);
      return;
    }

    setValues([...withoutNone, item]);
  };

  return (
    <div className="choice-grid large-choice-grid">
      {items.map((item) => (
        <ChoiceButton key={item} selected={values.includes(item)} label={item} value={item} onClick={toggle} />
      ))}
    </div>
  );
}

function GroupedMultiChoice({ values, setValues, groups, max = 8 }) {
  return (
    <div className="choice-grid large-choice-grid">
      {groups.map((group) => (
        <div className="choice-fragment" key={group.title}>
          <p className="choice-category-title">{group.title}</p>
          {group.items.map((item) => (
            <ChoiceButton
              key={item}
              selected={values.includes(item)}
              label={item.replace(" 업무 경험", "").replace(" 경험", "")}
              value={item}
              onClick={(selected) => {
                if (values.includes(selected)) setValues(values.filter((value) => value !== selected));
                else if (values.length >= max) alert(`최대 ${max}개까지 선택할 수 있습니다.`);
                else setValues([...values, selected]);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function JobChoice({ form, setForm }) {
  return (
    <div className="choice-grid job-choice-grid">
      {jobCategories.map((group) => (
        <div className="choice-fragment" key={group.title}>
          <p className="choice-category-title">{group.title}</p>
          {group.items.map((item) => (
            <ChoiceButton
              key={item}
              selected={form.targetJob === item}
              label={item}
              value={item}
              onClick={(value) => setForm({ ...form, targetJob: value })}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function splitText(text) {
  return String(text || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeSelectedAndDetail(selected, detail) {
  const base = Array.isArray(selected) ? selected.filter((item) => item !== "직접 입력") : [selected].filter(Boolean);
  const extra = splitText(detail);
  return [...base, ...extra].filter((item) => item && item !== "해당 없음");
}

function buildResumeData(form) {
  const targetJob = form.targetJob === "직접 입력" ? form.targetJobDetail : form.targetJob;
  const education = form.education === "직접 입력" ? form.educationDetail : form.education;
  return {
    ...form,
    targetJob,
    careerItems: mergeSelectedAndDetail(form.careerSummary, form.careerSummaryDetail),
    achievementItems: mergeSelectedAndDetail(form.achievement, form.achievementDetail),
    licenseItems: mergeSelectedAndDetail(form.license, form.licenseDetail),
    education,
    skillItems: splitText(form.skillSet),
  };
}

function buildGeneratedResumeText(data) {
  return [
    data.userName || "이름 미입력",
    data.targetJob || "지원 직무 미입력",
    "",
    "주요 경력",
    data.careerItems.length ? data.careerItems.join("\n") : "경력 미입력",
    "",
    "강점",
    data.strengths.length ? data.strengths.join(", ") : "강점 미입력",
    "",
    "목표",
    data.careerGoal || "목표 미입력",
  ].join("\n");
}

function calculateAnalysis(data) {
  const fullText = [
    data.targetJob,
    ...data.careerItems,
    ...data.achievementItems,
    ...data.licenseItems,
    data.education,
    ...data.strengths,
    ...data.skillItems,
    data.careerGoal,
  ].join(" ");

  const atsKeywords = ["문서", "엑셀", "고객", "상담", "관리", "안전", "물류", "교육", "데이터", "책임감", "소통", "문제 해결", "품질", "재고", "행정"];
  const matched = atsKeywords.filter((keyword) => fullText.includes(keyword)).length;
  const atsScore = Math.min(98, 58 + matched * 4 + data.careerItems.length * 2 + data.strengths.length * 3);
  const writingScore = Math.min(96, 62 + Math.min(18, data.careerGoal.length / 10) + data.achievementItems.length * 4 + data.resumeTone.length / 4);

  const source = fullText;
  let recommendedJob = data.targetJob || "지원 직무";
  if (source.includes("고객") || source.includes("상담")) recommendedJob = "고객상담·서비스 운영";
  if (source.includes("물류") || source.includes("재고")) recommendedJob = "물류·재고관리";
  if (source.includes("데이터") || source.includes("문서")) recommendedJob = "사무행정·데이터 입력";
  if (source.includes("교육") || source.includes("복지") || source.includes("요양")) recommendedJob = "교육·돌봄·공공지원";

  return {
    atsScore: Math.round(atsScore),
    writingScore: Math.round(writingScore),
    recommendedJob,
  };
}

function getRecommendedJobs(data) {
  const source = [data.targetJob, ...data.careerItems, ...data.strengths, ...data.skillItems].join(" ");
  return jobPosts
    .map((job) => {
      const matched = job.keywords.filter((keyword) => source.includes(keyword));
      return { ...job, matched, score: Math.min(98, 60 + matched.length * 9) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function ResumeResult({ data }) {
  if (!data) {
    return <div className="resume-result-box empty">아직 생성된 이력서가 없습니다. 위 정보를 입력한 뒤 AI 이력서 생성을 눌러주세요.</div>;
  }

  const aiGeneratedResume = data.generatedResume;
  const selfIntro = `${data.userName || "지원자"}님은 ${data.careerItems.slice(0, 2).join(", ") || "다양한 실무 경험"}을 바탕으로 ${data.targetJob || "지원 직무"}에 필요한 기본 역량을 갖추고 있습니다. 특히 ${data.strengths.join(", ") || "성실함과 책임감"}을 강점으로 하며, 맡은 업무를 안정적으로 수행하고 조직에 기여하는 것을 목표로 합니다. ${data.careerGoal || "앞으로도 기존 경험을 살려 꾸준히 성장하겠습니다."}`;

  return (
    <div className="resume-result-box">
      <article className="resume-paper">
        <header className="resume-paper-header">
          <div>
            <h3 className="resume-paper-name">{data.userName || "이름 미입력"}</h3>
            <p className="resume-paper-job">{data.targetJob || "지원 직무 미입력"}</p>
          </div>
          <div className="resume-paper-contact">
            <p>{data.userAge && `${data.userAge}세`}</p>
            <p>{data.userPhone || "연락처 미입력"}</p>
            <p>{data.userEmail || "이메일 미입력"}</p>
          </div>
        </header>

        {aiGeneratedResume && (
          <section className="resume-paper-section">
            <h4>AI 작성 초안</h4>
            <p className="resume-letter">{aiGeneratedResume}</p>
          </section>
        )}

        <section className="resume-paper-section">
          <h4>핵심 역량</h4>
          <div className="resume-chip-list">
            {[...data.strengths, ...data.skillItems].slice(0, 8).map((item) => <span className="resume-chip" key={item}>{item}</span>)}
          </div>
        </section>

        <section className="resume-paper-section">
          <h4>주요 경력</h4>
          <ul>{data.careerItems.map((item) => <li key={item}>• {item}</li>)}</ul>
        </section>

        <section className="resume-paper-section">
          <h4>성과 및 경험</h4>
          <ul>{data.achievementItems.length ? data.achievementItems.map((item) => <li key={item}>• {item}</li>) : <li>• 지원 직무와 관련된 성과를 추가하면 완성도가 높아집니다.</li>}</ul>
        </section>

        <section className="resume-paper-section">
          <h4>학력 및 자격</h4>
          <p>{data.education || "학력 미입력"}</p>
          <p>{data.licenseItems.length ? data.licenseItems.join(", ") : "자격증 미입력"}</p>
        </section>

        <section className="resume-paper-section">
          <h4>자기소개서 초안</h4>
          <p className="resume-letter">{selfIntro}</p>
        </section>
      </article>
    </div>
  );
}

export default function ResumeCreate({ user }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const data = result ? buildResumeData(result) : null;
  const analysis = useMemo(() => (data ? calculateAnalysis(data) : null), [data]);
  const recommendedJobs = useMemo(() => (data ? getRecommendedJobs(data) : []), [data]);

  const validateStep = () => {
    if (step === 0 && !form.userName.trim()) return "이름을 입력해 주세요.";
    if (step === 1 && (!form.targetJob || !form.resumeTone)) return "지원 직무와 문체를 선택해 주세요.";
    if (step === 2 && (!form.careerSummary.length || !form.education)) return "주요 경력과 최종 학력을 선택해 주세요.";
    if (step === 3 && (!form.strengths.length || !form.careerGoal.trim())) return "강점과 재취업 목표를 입력해 주세요.";
    return "";
  };

  const goNext = () => {
    const message = validateStep();
    if (message) {
      alert(message);
      return;
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const generateResume = async () => {
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

      const generatedResume = aiResult.generatedResume || buildGeneratedResumeText(resumeData);
      const generatedResult = { ...nextResult, generatedResume };
      setResult(generatedResult);
      setTimeout(() => document.querySelector(".resume-result-zone")?.scrollIntoView({ behavior: "smooth" }), 50);

      if (user) {
        const saveResult = await createResume({
          title: `${resumeData.userName || "새"} 이력서`,
          targetJob: resumeData.targetJob,
          formData: generatedResult,
          generatedResume,
          atsScore: resumeAnalysis.atsScore,
          writingScore: resumeAnalysis.writingScore,
          recommendedJob: resumeAnalysis.recommendedJob,
        });

        if (!saveResult.ok) {
          console.warn("Resume save failed:", saveResult.message);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = () => {
    localStorage.setItem("ireoksseoReactResumeDraft", JSON.stringify(form));
    alert("작성 내용을 저장했습니다.");
  };

  const loadDraft = () => {
    const saved = localStorage.getItem("ireoksseoReactResumeDraft");
    if (!saved) {
      alert("저장된 내용이 없습니다.");
      return;
    }
    setForm(JSON.parse(saved));
    alert("저장된 내용을 불러왔습니다.");
  };

  const reset = () => {
    if (!confirm("작성한 내용을 모두 지울까요?")) return;
    setForm(initialForm);
    setResult(null);
    setStep(0);
  };

  const copyResult = async () => {
    if (!data) return alert("복사할 결과가 없습니다.");
    await navigator.clipboard.writeText(data.generatedResume || buildGeneratedResumeText(data));
    alert("결과를 복사했습니다.");
  };

  return (
    <main id="main" className="resume-ai-page">
      <section className="resume-builder-zone" id="resumeBuilder">
        <div className="container">
          <div className="section-header">
            <p className="section-label">RESUME BUILDER</p>
            <h2>쉬운 이력서 작성</h2>
            <p>아는 내용부터 입력해 주세요.</p>
          </div>

          <div className="resume-builder-wrap">
            <aside className="resume-step-menu" aria-label="이력서 작성 단계">
              {["기본 정보", "지원 직무", "경력 작성", "강점 선택", "이력서 완성"].map((label, index) => (
                <button key={label} className={`step-nav-btn${step === index ? " active" : ""}`} type="button" onClick={() => setStep(index)}>
                  <span>{index + 1}</span><p>{label}</p><small>{index + 1}단계</small>
                </button>
              ))}
            </aside>

            <form className="resume-builder-card" onSubmit={(event) => event.preventDefault()}>
              <section className={`builder-step${step === 0 ? " active" : ""}`}>
                <div className="step-title-box"><p>1 / 5단계</p><h3>기본 정보를 입력해 주세요</h3><span>이력서 상단에 들어갈 이름, 연락처, 이메일을 입력하는 단계입니다.</span></div>
                <div className="senior-guide-box"><strong>작성 팁</strong><p>필수 항목은 이름뿐입니다. 연락처나 이메일이 아직 없으면 비워두고 다음 단계로 넘어가도 됩니다.</p></div>
                <div className="form-grid">
                  <TextInput label="이름" name="userName" form={form} setForm={setForm} required placeholder="예: 김재현" small="이력서에 표시될 이름입니다." />
                  <TextInput label="나이" name="userAge" form={form} setForm={setForm} type="number" placeholder="예: 45" small="숫자만 입력해 주세요." />
                  <TextInput label="연락처" name="userPhone" form={form} setForm={setForm} placeholder="예: 010-0000-0000" small="채용 담당자가 연락할 수 있는 번호입니다." />
                  <TextInput label="이메일" name="userEmail" form={form} setForm={setForm} type="email" placeholder="예: example@email.com" small="이메일이 없다면 비워두어도 됩니다." />
                </div>
              </section>

              <section className={`builder-step${step === 1 ? " active" : ""}`}>
                <div className="step-title-box"><p>2 / 5단계</p><h3>지원 직무와 문체를 선택해 주세요</h3><span>원하는 일을 하나 고르고, 이력서 문장을 어떤 느낌으로 쓸지 선택해 주세요.</span></div>
                <div className="select-block"><h4>지원 직무 선택 * <small>1개 선택</small></h4><JobChoice form={form} setForm={setForm} />
                  <input className="custom-input" value={form.targetJobDetail} onChange={(event) => setForm({ ...form, targetJobDetail: event.target.value })} placeholder="직접 입력 선택 시 원하는 직무를 입력하세요" />
                </div>
                <div className="select-block"><h4>이력서 문체 선택 * <small>1개 선택</small></h4>
                  <SingleChoice value={form.resumeTone} setValue={(value) => setForm({ ...form, resumeTone: value })} items={toneOptions} />
                </div>
              </section>

              <section className={`builder-step${step === 2 ? " active" : ""}`}>
                <div className="step-title-box"><p>3 / 5단계</p><h3>경력, 성과, 자격증, 학력을 선택해 주세요</h3><span>예전에 해본 일이나 자신 있는 경험을 고르면 이력서 문장으로 바꿔드립니다.</span></div>
                <div className="select-block"><h4>주요 경력 선택 * <small>최대 8개</small></h4>
                  <GroupedMultiChoice values={form.careerSummary} setValues={(value) => setForm({ ...form, careerSummary: value })} groups={careerGroups} max={8} />
                  <textarea className="custom-input" value={form.careerSummaryDetail} onChange={(event) => setForm({ ...form, careerSummaryDetail: event.target.value })} rows="3" maxLength="500" placeholder="버튼에 없는 경력을 직접 입력하세요." />
                </div>
                <div className="select-block"><h4>주요 성과 선택 <small>최대 4개</small></h4>
                  <MultiChoice values={form.achievement} setValues={(value) => setForm({ ...form, achievement: value })} items={achievementOptions} max={4} />
                  <input className="custom-input" value={form.achievementDetail} onChange={(event) => setForm({ ...form, achievementDetail: event.target.value })} placeholder="직접 입력 성과 예: 월 평균 민원 처리 20건" />
                </div>
                <div className="select-block"><h4>자격증 선택 <small>최대 5개</small></h4>
                  <MultiChoice values={form.license} setValues={(value) => setForm({ ...form, license: value })} items={licenseOptions} max={5} />
                  <input className="custom-input" value={form.licenseDetail} onChange={(event) => setForm({ ...form, licenseDetail: event.target.value })} placeholder="버튼에 없는 자격증을 직접 입력하세요." />
                </div>
                <div className="select-block"><h4>최종 학력 선택 * <small>1개 선택</small></h4>
                  <SingleChoice value={form.education} setValue={(value) => setForm({ ...form, education: value })} items={educationOptions} />
                  <input className="custom-input" value={form.educationDetail} onChange={(event) => setForm({ ...form, educationDetail: event.target.value })} placeholder="직접 입력 선택 시 최종 학력을 입력하세요." />
                </div>
              </section>

              <section className={`builder-step${step === 3 ? " active" : ""}`}>
                <div className="step-title-box"><p>4 / 5단계</p><h3>강점과 보유 역량을 선택해 주세요</h3><span>본인에게 가장 잘 맞는 강점을 최대 3개까지 선택해 주세요.</span></div>
                <div className="select-block"><h4>핵심 강점 선택 * <small>최대 3개</small></h4>
                  <MultiChoice values={form.strengths} setValues={(value) => setForm({ ...form, strengths: value })} items={strengthOptions} max={3} />
                </div>
                <div className="form-grid">
                  <TextArea label="보유 역량" name="skillSet" form={form} setForm={setForm} placeholder="예: 엑셀 문서 작성, 고객 응대, 재고 관리, 안전 점검" maxLength={300} />
                  <TextArea label="재취업 목표" name="careerGoal" form={form} setForm={setForm} required placeholder="예: 기존 경력을 살려 안정적으로 근무하며 조직에 도움이 되는 인재가 되고 싶습니다." maxLength={300} />
                </div>
              </section>

              <section className={`builder-step${step === 4 ? " active" : ""}`}>
                <div className="step-title-box"><p>5 / 5단계</p><h3>이력서 초안을 만들 준비가 끝났습니다</h3><span>입력한 내용을 바탕으로 이력서 초안과 자기소개서를 생성합니다.</span></div>
                <div className="ai-ready-box"><strong>생성되는 결과</strong><ul><li>지원 직무 맞춤 이력서 초안</li><li>자기소개서 문장 자동 구성</li><li>ATS 키워드 적합도 점수</li><li>문장 완성도 점수</li><li>맞춤 채용공고 추천</li></ul></div>
              </section>

              <div className="builder-control-row">
                <button className="btn btn-outline" type="button" onClick={() => setStep((prev) => Math.max(0, prev - 1))}>이전 단계</button>
                {step < 4 ? <button className="btn btn-primary" type="button" onClick={goNext}>다음 단계로 이동</button> : <button className="btn btn-primary" type="button" onClick={generateResume} disabled={isGenerating}>{isGenerating ? "이력서 생성 중..." : "AI 이력서 만들기"}</button>}
              </div>
              <div className="builder-tool-row">
                <button className="tool-btn" type="button" onClick={saveDraft}>작성 내용 저장</button>
                <button className="tool-btn" type="button" onClick={loadDraft}>저장 내용 불러오기</button>
                <button className="tool-btn danger" type="button" onClick={reset}>처음부터 다시 작성</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="resume-result-zone">
        <div className="container">
          <div className="section-header"><p className="section-label">AI RESULT</p><h2>생성 결과</h2><p>이력서 생성 후 분석 점수와 맞춤 채용공고가 함께 표시됩니다.</p></div>
          <div className="analysis-grid">
            <article className="analysis-card"><span>ATS 적합도</span><strong>{analysis ? `${analysis.atsScore}점` : "-"}</strong><p>{analysis ? "직무 키워드와 경력 표현을 기준으로 계산했습니다." : "생성 후 분석 결과가 표시됩니다."}</p></article>
            <article className="analysis-card"><span>문장 완성도</span><strong>{analysis ? `${analysis.writingScore}점` : "-"}</strong><p>{analysis ? "목표 문장과 성과 입력량을 기준으로 평가했습니다." : "생성 후 문장 품질이 표시됩니다."}</p></article>
            <article className="analysis-card"><span>추천 직무</span><strong>{analysis ? analysis.recommendedJob : "-"}</strong><p>입력한 경력과 역량을 바탕으로 추천됩니다.</p></article>
          </div>
          <div className="result-action-row">
            <button className="btn btn-outline" type="button" onClick={copyResult}>결과 복사</button>
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>PDF 저장/인쇄</button>
          </div>
          <ResumeResult data={data} />
          <section className="job-recommend-box" aria-labelledby="jobRecommendTitle">
            <div className="job-recommend-head"><div><span className="interview-badge">JOB MATCH</span><h3 id="jobRecommendTitle">채용공고 추천</h3><p>이력서에 입력한 직무, 경력, 강점과 잘 맞는 공고를 추천합니다.</p></div></div>
            <div className={`job-recommend-list${recommendedJobs.length ? "" : " empty"}`}>
              {recommendedJobs.length ? recommendedJobs.map((job) => (
                <article className="job-recommend-card" key={job.id}>
                  <strong>{job.title}</strong><p>{job.company} · {job.location} · {job.dday}</p><small>매칭 점수 {job.score}점 · {job.matched.join(", ") || "기본 추천"}</small>
                </article>
              )) : "이력서를 생성하면 맞춤 채용공고가 표시됩니다."}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
