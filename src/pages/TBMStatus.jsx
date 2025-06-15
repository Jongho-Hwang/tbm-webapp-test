// File: src/pages/TBMStatus.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { currentUser } from '../services/localAuth';
import { getByRole } from '../services/db';
import { fetchTbmByPartnerDate } from '../services/tbmService';

export default function TBMStatus() {
  const me   = currentUser();
  const nav  = useNavigate();
  const today = new Date().toISOString().slice(0, 10);   // YYYY-MM-DD

  // head 또는 site 관리자만 접근
  if (!me || (me.role !== 'head' && me.role !== 'site')) {
    return <Navigate to="/login" replace />;
  }

  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      /* 1) 협력사 목록 */
      let partners = await getByRole('partner');
      if (me.role === 'site') partners = partners.filter(p => p.siteId === me.uid);

      /* 2) 현장명 매핑 */
      const sites   = await getByRole('site');
      const siteMap = {};
      sites.forEach(s => { siteMap[s.uid] = s.name; });
      if (me.role === 'site') siteMap[me.uid] = me.name;

      /* 3) TBM 제출 여부 */
      const data = await Promise.all(
        partners.map(async p => {
          const recs = await fetchTbmByPartnerDate(p.uid, today);
          return {
            date        : recs.length ? recs[0].date : '',
            siteName    : siteMap[p.siteId] || '',
            partnerName : p.name,
            submitted   : recs.length > 0,
            text        : recs.length ? recs[0].text : '',
          };
        })
      );
      setRows(data);
    })();
  }, [me, today]);

  /* ---- 스타일 ---- */
  const wrap  = { padding: 24, background: '#F5F5F7', minHeight: '100vh' };
  const title = { fontSize: 24, fontWeight: 600, marginBottom: 24, textAlign: 'center' };
  const table = { width: '100%', borderCollapse: 'collapse' };
  const cell  = { border: '1px solid #DDD', padding: 12, textAlign: 'center' };
  const icon  = { fontSize: 20, border: 'none', background: 'none', cursor: 'pointer' };
  const btn   = { width: '100%', padding: 12, borderRadius: 8, background: '#002F3D',
                  color: '#FFF', fontWeight: 500, border: 'none', cursor: 'pointer',
                  marginTop: 24 };

  /* ---- 상세 팝업 ---- */
  const openDetail = r => {
    if (r.submitted) alert(`제출일자: ${r.date}\n\n${r.text}`);
  };

  return (
    <div style={wrap}>
      <h1 style={title}>TBM 제출 현황</h1>

      <table style={table}>
        <thead>
          <tr>
            <th style={cell}>제출일자</th>
            <th style={cell}>현장명</th>
            <th style={cell}>협력사명</th>
            <th style={cell}>제출여부</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={cell}>{r.date}</td>
              <td style={cell}>{r.siteName}</td>
              <td style={cell}>{r.partnerName}</td>
              <td style={cell}>
                {r.submitted
                  ? <button style={icon} onClick={() => openDetail(r)}>🟢</button>
                  : <span   style={icon}>🔴</span>}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} style={cell}>조회할 데이터가 없습니다.</td></tr>
          )}
        </tbody>
      </table>

      <button style={btn} onClick={() => nav(-1)}>뒤로</button>
    </div>
  );
}
