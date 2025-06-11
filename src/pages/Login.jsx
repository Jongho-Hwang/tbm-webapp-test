// File: src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, currentUser } from '../services/localAuth';

export default function Login() {
  const nav = useNavigate();
  const [uid, setUid] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const u = currentUser();
    if (u) {
      // 이미 로그인된 상태라면 역할별 리다이렉트
      if (u.resetRequired) return nav('/change-password', { replace: true });
      if (u.role === 'head')      return nav('/admin',            { replace: true });
      if (u.role === 'site')      return nav('/site',             { replace: true });
      if (u.role === 'partner')   return nav(`/board/${u.uid}`,   { replace: true });
    }
  }, [nav]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    const ok = await login(uid.trim(), pw);
    if (!ok) {
      setErr('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    const u = currentUser();
    if (u.resetRequired)      return nav('/change-password');
    if (u.role === 'head')    nav('/admin');
    else if (u.role === 'site')    nav('/site');
    else if (u.role === 'partner') nav(`/board/${u.uid}`);
  };

  // 스타일
  const container = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F5F5F7',
    padding: '24px',
  };
  const card = {
    width: '90%',
    maxWidth: '360px',
    background: '#FFF',
    borderRadius: '16px',
    padding: '32px 24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    textAlign: 'center',
  };
  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #CCC',
    borderRadius: '8px',
    fontSize: '16px',
  };
  const buttonStyle = {
    width: '100%',
    padding: '12px',
    background: '#002F3D',
    color: '#FFF',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };
  const errStyle = { color: '#FF3B30', marginBottom: '16px' };

  return (
    <div style={container}>
      <div style={card}>
        {/* public/logo.png 에 파일을 넣고 src="/logo.png" 로 불러옵니다 */}
        <img src="/logo.png" alt="회사 로고" style={{ width: '230px', marginBottom: '16px' }} />
        <p style={{ color: '#3C3C4399', marginBottom: '24px' }}>
          자이 C&A TBM 앱 서비스에 오신 것을 환영합니다.
        </p>

        {err && <div style={errStyle}>{err}</div>}

        <form onSubmit={handleLogin}>
          <input
            style={inputStyle}
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="아이디"
            required
          />
          <input
            style={inputStyle}
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            required
          />
          <button type="submit" style={buttonStyle}>
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
