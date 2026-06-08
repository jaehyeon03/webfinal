import { Link, NavLink } from "react-router-dom";
import { navItems } from "../data";

export default function Header({ user, onLoginOpen, onLogout }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <h1 className="logo">
          <Link to="/" aria-label="이력써 홈으로 이동">
            <img src="/images/logo.png" alt="이력써 로고" className="logo-img" />
            <span>이력써 AI</span>
          </Link>
        </h1>

        <input className="nav-toggle" id="navToggle" type="checkbox" hidden />
        <label className="mobile-menu-btn" htmlFor="navToggle" aria-controls="siteNav">
          메뉴
        </label>

        <nav id="siteNav" className="site-nav" aria-label="주요 메뉴">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to={item.to}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button className={`login-btn${user ? " is-logged-in" : ""}`} type="button" onClick={user ? onLogout : onLoginOpen}>
          {user ? "로그아웃" : "로그인"}
        </button>
      </div>
    </header>
  );
}
