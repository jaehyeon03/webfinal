import { Link } from "react-router-dom";
import { pricingPlans } from "../data";

export default function Subscription() {
  return (
    <main id="main">
      <section className="section page-hero subscription-page">
        <div className="container">
          <div className="section-header">
            <p className="section-label">SUBSCRIPTION</p>
            <h2>필요한 만큼 선택하는 구독 플랜</h2>
            <p>가볍게 시작하는 무료 플랜부터 팀 단위 관리까지, 이력서 작성과 채용 준비에 필요한 기능을 상황에 맞게 선택하세요.</p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`pricing-card${plan.featured ? " featured" : ""}`}>
                <div className="pricing-head"><h3>{plan.name}</h3><p>{plan.desc}</p></div>
                <div className="price-row">
                  {plan.oldPrice && <del>{plan.oldPrice}</del>}
                  <strong>{plan.price}</strong>
                  {plan.name === "Pro" && <span>/월, 연간 결제</span>}
                </div>
                <Link className={`btn ${plan.featured ? "btn-primary" : "btn-outline"} plan-btn`} to="/resume">{plan.cta}</Link>
                <ul className="plan-feature-list">
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
