// File: src/pages/SiteManager.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { currentUser, logout, hashPw } from '../services/localAuth';
import {
  getByRole,
  makeUniqueUid,
  addUser,
  deleteUserCascade,
  fetchBoardNotices,
  saveNotice,
  deleteNotice
} from '../services/db';
import { v4 as uuid } from 'uuid';

export default function SiteManager() {
  const me = currentUser();
  const nav = useNavigate();
  if (!me || me.role !== 'site') {
    return <Navigate to="/login" replace />;
  }

  const [partners, setPartners]       = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [notices, setNotices]         = useState([]);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeUrl, setNoticeUrl]     = useState('');

  useEffect(() => {
    (async () => {
      const all = await getByRole('partner');
      setPartners(all.filter(p => p.siteId === me.uid));
      setNotices(await fetchBoardNotices({ level: 'site', siteId: me.uid }));
    })();
  }, [me.uid]);

  const handleAddPartner = async () => {
    const name = companyName.trim();
    if (!name) return alert('협력사명을 입력하세요.');
    const uid = await makeUniqueUid(name);
    await addUser({ uid, name, role: 'partner', siteId: me.uid, pwHash: hashPw('1234'), resetRequired: true });
    alert(`협력사 계정 생성됨\nID: ${uid}\nPW: 1234`);
    setCompanyName('');
    const updated = await getByRole('partner');
    setPartners(updated.filter(p => p.siteId === me.uid));
  };

  const handleDeletePartner = async (uid) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await deleteUserCascade(uid);
    setPartners(ps => ps.filter(p => p.uid !== uid));
  };

  const handleAddNotice = async () => {
    if (!noticeTitle.trim() || !noticeUrl.trim()) return alert('제목과 링크를 입력하세요.');
    await saveNotice({ id: uuid(), level: 'site', siteId: me.uid, partnerId: null, title: noticeTitle.trim(), url: noticeUrl.trim(), body:'', createdAt: Date.now() });
    setNoticeTitle(''); setNoticeUrl('');
    setNotices(await fetchBoardNotices({ level: 'site', siteId: me.uid }));
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await deleteNotice(id);
    setNotices(ns => ns.filter(n => n.id !== id));
  };

  // 스타일 (AdminDashboard와 동일)
  const headerBar = { display:'flex', justifyContent:'flex-end', gap:'8px', padding:'16px', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)' };
  const container = { padding:'24px', background:'#F5F5F7', minHeight:'calc(100vh-64px)' };
  const inputWrapper = { width:'auto', margin:'0 24px', display:'flex', flexDirection:'column', gap:'12px' };
  const buttonWrapper = { width:'auto', margin:'16px 24px', display:'flex', flexDirection:'column', gap:'12px' };
  const inputStyle = { width:'100%', padding:'12px', border:'1px solid #CCC', borderRadius:'8px' };
  const buttonStyle = { width:'100%', padding:'12px', borderRadius:'8px', background:'#002F3D', color:'#FFF', fontWeight:500, border:'none', cursor:'pointer' };
  const deleteBtn = { marginLeft:'auto', padding:'6px 12px', borderRadius:'8px', background:'#FF3B30', color:'#FFF', border:'none', cursor:'pointer' };

  return (
    <div>
      <div style={headerBar}>
        <button style={buttonStyle} onClick={() => nav('/change-password')}>비밀번호 변경</button>
        <button style={buttonStyle} onClick={() => { logout(); nav('/login'); }}>로그아웃</button>
      </div>
      <div style={container}>
        <h1 style={{fontSize:24,fontWeight:600,marginBottom:24}}>현장 관리자 대시보드</h1>

        {/* 협력사 계정 */}
        <section style={{marginBottom:40}}>
          <h2 style={{fontSize:20,fontWeight:500,marginBottom:12}}>협력사 소장 계정 발급</h2>
          <div style={inputWrapper}>
            <input style={inputStyle} placeholder="협력사명 입력" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
          </div>
          <div style={buttonWrapper}>
            <button style={buttonStyle} onClick={handleAddPartner}>발급 (PW:1234)</button>
          </div>
          <h3 style={{fontSize:18,fontWeight:500,margin:'24px 0 12px'}}>등록된 협력사</h3>
          <ul style={{listStyle:'none',padding:0}}>
            {partners.length?partners.map(p=>(
              <li key={p.uid} style={{display:'flex',alignItems:'center',margin:'0 24px 8px 24px'}}>
                <span>{p.name} ({p.uid})</span>
                <button style={deleteBtn} onClick={()=>handleDeletePartner(p.uid)}>삭제</button>
              </li>
            )):<p style={{color:'#3C3C4399',textAlign:'center'}}>등록된 협력사가 없습니다.</p>}
          </ul>
        </section>

        {/* 공지사항 */}
        <section>
          <h2 style={{fontSize:20,fontWeight:500,marginBottom:12}}>공지사항</h2>
          <ul style={{listStyle:'none',padding:0,marginBottom:24}}>
            {notices.length?notices.map(n=>(
              <li key={n.id} style={{display:'flex',alignItems:'center',margin:'0 24px 8px 24px'}}>
                <a href={n.url} target="_blank" rel="noopener noreferrer" style={{color:'#002F3D',textDecoration:'none',fontWeight:500}}>{n.title}</a>
                <button style={deleteBtn} onClick={()=>handleDeleteNotice(n.id)}>삭제</button>
              </li>
            )):<p style={{color:'#3C3C4399',textAlign:'center'}}>등록된 공지가 없습니다.</p>}
          </ul>
          <div style={inputWrapper}>
            <input style={inputStyle} placeholder="공지 제목" value={noticeTitle} onChange={e=>setNoticeTitle(e.target.value)} />
            <input style={inputStyle} placeholder="공지 링크" value={noticeUrl} onChange={e=>setNoticeUrl(e.target.value)} />
          </div>
          <div style={buttonWrapper}>
            <button style={buttonStyle} onClick={handleAddNotice}>등록</button>
            <button style={buttonStyle} onClick={()=>nav('/tbm-status')}>협력사 TBM 제출 현황</button>
          </div>
        </section>
      </div>
    </div>
  );
}
