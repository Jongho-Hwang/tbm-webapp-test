import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { currentUser, logout, hashPw } from '../services/localAuth';
import {
  fetchBoardNotices,
  saveNotice,
  deleteNotice,
  addUser,
  makeUniqueUid,
  getByRole,
  deleteUserCascade
} from '../services/db';
import { v4 as uuid } from 'uuid';

export default function AdminDashboard() {
  const nav = useNavigate();
  const me = currentUser();
  if (!me || me.role !== 'head') {
    return <Navigate to="/login" replace />;
  }

  const [notices, setNotices]     = useState([]);
  const [title, setTitle]         = useState('');
  const [url, setUrl]             = useState('');
  const [siteName, setSiteName]   = useState('');
  const [siteManagers, setSiteManagers] = useState([]);

  useEffect(() => {
    (async () => {
      setNotices(await fetchBoardNotices({ level: 'head' }));
      setSiteManagers(await getByRole('site'));
    })();
  }, []);

  const handleRegisterNotice = async () => {
    if (!title.trim() || !url.trim()) return;
    await saveNotice({
      id: uuid(),
      level: 'head',
      title: title.trim(),
      url: url.trim(),
      createdAt: Date.now(),
    });
    setTitle(''); setUrl('');
    setNotices(await fetchBoardNotices({ level: 'head' }));
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteNotice(id);
    setNotices(await fetchBoardNotices({ level: 'head' }));
  };

  const handleCreateSite = async () => {
    const name = siteName.trim();
    if (!name) return alert('현장 관리자명을 입력하세요.');
    const uid = await makeUniqueUid(name);
    await addUser({ uid, name, role: 'site', pwHash: hashPw('1234'), resetRequired: true });
    alert(`현장 관리자 계정 생성됨\nID: ${uid}\nPW: 1234`);
    setSiteName('');
    setSiteManagers(await getByRole('site'));
  };

  const handleDeleteSite = async (uid) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteUserCascade(uid);
    setSiteManagers(await getByRole('site'));
  };

  // 스타일
  const headerBar = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
  };
  const container = {
    padding: '24px',
    background: '#F5F5F7',
    minHeight: 'calc(100vh - 64px)',
  };
  const inputWrapper = { width: 'auto', margin: '0 24px', display: 'flex', flexDirection: 'column', gap: '12px' };
  const buttonWrapper = { width: 'auto', margin: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' };
  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #CCC', borderRadius: '8px' };
  const buttonStyle = { width: '100%', padding: '12px', borderRadius: '8px', background: '#002F3D', color: '#FFF', fontWeight: 500, border: 'none', cursor: 'pointer' };
  const deleteBtn = { marginLeft: 'auto', padding: '6px 12px', borderRadius: '8px', background: '#FF3B30', color: '#FFF', border: 'none', cursor: 'pointer' };

  return (
    <div>
      <div style={headerBar}>
        <button style={buttonStyle} onClick={() => nav('/change-password')}>비밀번호 변경</button>
        <button style={buttonStyle} onClick={() => { logout(); nav('/login'); }}>로그아웃</button>
      </div>
      <div style={container}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>본사 관리자 대시보드</h1>

        {/* 현장 관리자 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '12px' }}>현장 관리자 계정 생성</h2>
          <div style={inputWrapper}>
            <input style={inputStyle} placeholder="현장 관리자명 입력" value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div style={buttonWrapper}>
            <button style={buttonStyle} onClick={handleCreateSite}>생성 (PW:1234)</button>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 500, margin: '24px 0 12px' }}>생성된 현장 관리자</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {siteManagers.length > 0 ? siteManagers.map(sm => (
              <li key={sm.uid} style={{ display: 'flex', alignItems: 'center', margin: '0 24px 8px 24px' }}>
                <span>{sm.name} ({sm.uid})</span>
                <button style={deleteBtn} onClick={() => handleDeleteSite(sm.uid)}>삭제</button>
              </li>
            )) : <p style={{ color: '#3C3C4399', textAlign: 'center' }}>등록된 현장 관리자가 없습니다.</p>}
          </ul>
        </section>

        {/* 공지 관리 */}
        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '12px' }}>공지 관리</h2>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
            {notices.map(n => (
              <li key={n.id} style={{ display: 'flex', alignItems: 'center', margin: '0 24px 8px 24px' }}>
                <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: '#002F3D', textDecoration: 'none', fontWeight: 500 }}>
                  {n.title}
                </a>
                <button style={deleteBtn} onClick={() => handleDeleteNotice(n.id)}>삭제</button>
              </li>
            ))}
            {!notices.length && <p style={{ color: '#3C3C4399', textAlign: 'center' }}>등록된 공지가 없습니다.</p>}
          </ul>
          <div style={inputWrapper}>
            <input style={inputStyle} placeholder="공지 제목" value={title} onChange={e => setTitle(e.target.value)} />
            <input style={inputStyle} placeholder="공지 링크" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div style={buttonWrapper}>
            <button style={buttonStyle} onClick={handleRegisterNotice}>등록</button>
            <button style={buttonStyle} onClick={() => nav('/tbm-status')}>TBM 제출 현황</button>
          </div>
        </section>
      </div>
    </div>
  );
}
