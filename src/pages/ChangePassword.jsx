import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { currentUser, logout, changePassword } from '../services/localAuth';

export default function ChangePassword() {
  const user = currentUser();
  const nav = useNavigate();
  if (!user) {
    logout();
    return <Navigate to="/login" replace />;
  }

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setMsg('새 비밀번호와 확인이 일치하지 않습니다');
      return;
    }
    const ok = await changePassword(oldPw, newPw);
    if (!ok) {
      setMsg('현재 비밀번호가 올바르지 않습니다');
      return;
    }
    setMsg('비밀번호가 변경되었습니다. 다시 로그인해주세요');
    setTimeout(() => {
      logout();
      nav('/login', { replace: true });
    }, 1500);
  };

  // 스타일 정의
  const containerStyle = {
    padding: '24px',
    background: '#F5F5F7',
    minHeight: '100vh',
  };
  const inputWrapperStyle = {
    width: 'auto',
    margin: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };
  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #CCC',
    borderRadius: '8px',
  };
  const buttonStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    background: '#002F3D',
    color: '#FFF',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    marginTop: '12px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 24px 24px' }}>
        비밀번호 변경
      </h1>
      <form onSubmit={handleSubmit} style={inputWrapperStyle}>
        <label style={{ fontSize: '14px', fontWeight: 500 }}>현재 비밀번호</label>
        <input
          type="password"
          required
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          style={inputStyle}
        />

        <label style={{ fontSize: '14px', fontWeight: 500 }}>새 비밀번호</label>
        <input
          type="password"
          required
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          style={inputStyle}
        />

        <label style={{ fontSize: '14px', fontWeight: 500 }}>새 비밀번호 확인</label>
        <input
          type="password"
          required
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          변경하기
        </button>
      </form>

      {msg && (
        <p style={{ color: '#FF3B30', textAlign: 'center', marginTop: '12px' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
