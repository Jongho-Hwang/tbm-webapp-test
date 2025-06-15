// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, currentUser } from '../services/localAuth';

export default function Login() {
  const nav            = useNavigate();
  const [uid, setUid ] = useState('');
  const [pw , setPw  ] = useState('');
  const [err, setErr ] = useState('');

  /* 이미 로그인돼 있으면 즉시 리다이렉트 */
  useEffect(() => {
    const u = currentUser();
    if (!u) return;
    if (u.resetRequired)      return nav('/change-password', { replace:true });
    if (u.role === 'head')    return nav('/admin',           { replace:true });
    if (u.role === 'site')    return nav('/site',            { replace:true });
    if (u.role === 'partner') return nav(`/board/${u.uid}`,  { replace:true });
  }, [nav]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    if (!(await login(uid.trim(), pw))) {
      setErr('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    const u = currentUser();
    if (u.resetRequired)      return nav('/change-password');
    if (u.role === 'head')    nav('/admin');
    else if (u.role === 'site') nav('/site');
    else nav(`/board/${u.uid}`);
  };

  /* ───── 인라인 스타일 ───── */
  const container = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F5F5F7',
    padding: 24,
  };
  const card = {
    width: '100%',
    maxWidth: 360,
    background: '#FFF',
    borderRadius: 16,
    padding: '32px 24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    textAlign: 'center',
  };
  const inputStyle = {
    width: '90%',
    padding: 12,
    marginBottom: 16,
    border: '1px solid #CCC',
    borderRadius: 8,
    fontSize: 16,
  };
  const buttonStyle = {
    width: '100%',
    padding: 12,
    background: '#002F3D',
    color: '#FFF',
    fontSize: 16,
    fontWeight: 500,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  };
  const errStyle = { color: '#FF3B30', marginBottom: 16 };

  return (
    <div style={container}>
      <div style={card}>
        {/* base URL을 포함해 정적 자산 경로를 맞춥니다 */}
        <img
          src={import.meta.env.BASE_URL + 'logo.png'}
          alt="회사 로고"
          style={{ width: 230, marginBottom: 16 }}
        />
        <p style={{ color:'#3C3C4399', marginBottom: 24 }}>
          자이 C&amp;A TBM 앱 서비스에 오신 것을 환영합니다.
        </p>

        {err && <div style={errStyle}>{err}</div>}

        <form onSubmit={handleLogin}>
          <input
            style={inputStyle}
            type="text"
            value={uid}
            onChange={e => setUid(e.target.value)}
            placeholder="아이디"
            required
          />
          <input
            style={inputStyle}
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
            required
          />
          <button type="submit" style={buttonStyle}>로그인</button>
        </form>
      </div>
    </div>
  );
}
