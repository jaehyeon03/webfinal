import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import Home from "./pages/Home";
import ResumeCreate from "./pages/ResumeCreate";
import Service from "./pages/Service";
import Jobs from "./pages/Jobs";
import Subscription from "./pages/Subscription";
import Reviews from "./pages/Reviews";
import Report from "./pages/Report";
import { getCurrentUser, logoutUser } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    alert("로그아웃되었습니다.");
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">본문 바로가기</a>
      <Header user={user} onLoginOpen={() => setLoginOpen(true)} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<ResumeCreate user={user} />} />
        <Route path="/service" element={<Service />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/reviews" element={<Reviews user={user} onAuthChange={setUser} />} />
        <Route path="/report" element={<Report />} />
      </Routes>
      <footer className="site-footer">
        <div className="container">
          <p>© 2026 이력써 AI. AI 기반 이력서 작성 및 재취업 지원 서비스.</p>
        </div>
      </footer>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onAuth={setUser} />
    </div>
  );
}
