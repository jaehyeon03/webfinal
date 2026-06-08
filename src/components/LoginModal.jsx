import { useState } from "react";
import { loginUser, signupUser } from "../api";

export default function LoginModal({ open, onClose, onAuth }) {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const title = isSignupMode ? "회원가입" : "로그인";

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const result = isSignupMode
      ? await signupUser(form)
      : await loginUser({ email: form.email, password: form.password });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setForm({ name: "", email: "", password: "" });
    setIsSignupMode(false);
    onAuth(result.user);
    onClose();
    alert(isSignupMode ? "회원가입이 완료되었습니다." : "로그인되었습니다.");
  };

  return (
    <div className={`modal${open ? " open" : ""}`} aria-hidden={!open} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <div className="modal-header">
          <h2 id="loginTitle">{title}</h2>
          <button className="close-btn" type="button" onClick={onClose} aria-label="로그인 창 닫기">
            ×
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <p className="auth-status-message full" aria-live="polite">{message}</p>

          {isSignupMode && (
            <div className="form-group full">
              <label htmlFor="signupName">이름</label>
              <input id="signupName" name="name" type="text" placeholder="이름을 입력해 주세요" value={form.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group full">
            <label htmlFor="loginEmail">이메일</label>
            <input id="loginEmail" name="email" type="email" placeholder="이메일을 입력해 주세요" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group full">
            <label htmlFor="loginPassword">비밀번호</label>
            <input id="loginPassword" name="password" type="password" placeholder="비밀번호를 입력해 주세요" value={form.password} onChange={handleChange} required />
          </div>

          <button className="btn-primary" type="submit">{title}</button>
          <button className="btn-outline" type="button" onClick={() => setIsSignupMode((prev) => !prev)}>
            {isSignupMode ? "로그인으로 돌아가기" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}
