// File: src/pages/TBMStatus.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate }       from 'react-router-dom';
import { currentUser }                 from '../services/localAuth';
import { getByRole }                   from '../services/db';
import { fetchTbmByPartnerDate }       from '../services/tbmService';
import { doc, getDoc }                 from 'firebase/firestore/lite';
import { db }                          from '../services/firebase';

export default function TBMStatus() {
  /* ── 권한 & 공통 ─────────────────────────────────────────────── */
  const me  = currentUser();
  const nav = useNavigate();

  const today      = new Date().toISOString().slice(0, 10);          // YYYY-MM-DD
  const todayLabel = new Date()
    .toLocaleDateString('ko-KR')
    .replace(/\. /g, '.')
    .replace('.', '');                                               // yyyy.mm.dd

  if (!me || (me.role !== 'head' && me.role !== 'site')) {
    return <Navigate to="/login" replace />;
  }

  /* ── 상태 ────────────────────────────────────────────────────── */
  const [rows, setRows] = useState([]);

  /* ── 데이터 로딩 ─────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      // 1) 협력사 목록
      let partners = await getByRole('partner');
      if (me.role === 'site') {
        partners = partners.filter((p) => p.siteId === me.uid);
      }

      // 2) 현장명 매핑
      const sites   = await getByRole('site');
      const siteMap = {};
      sites.forEach((s) => {
        siteMap[s.uid] = s.name;
      });
      if (me.role === 'site') siteMap[me.uid] = me.name;

      // 3) 파트너별 TBM 제출 여부 + 확인 인원
      const data = await Promise.all(
        partners.map(async (p) => {
          const tbmRecs = await fetchTbmByPartnerDate(p.uid, today);
          const confDoc = await getDoc(
            doc(db, 'tbmConfirms', `${p.uid}_${today}`)
          );

          return {
            siteName   : siteMap[p.siteId] || '',
            partnerName: p.name,
            submitted  : tbmRecs.length > 0,
            confirmCnt : confDoc.exists() ? confDoc.data().count : 0,
            text       : tbmRecs.length ? tbmRecs[0].text : '',
          };
        })
      );

      setRows(data);
    })();
  }, [me, today]); // today는 문자열이므로 안전

  /* ── 스타일 객체 ─────────────────────────────────────────────── */
  const wrap  = { padding: 24, background: '#F5F5F7', minHeight: '100vh' };
  const title = { fontSize: 24, fontWeight: 600, marginBottom: 24 };
  const table = { width: '100%', borderCollapse: 'collapse' };
  const cell  = { border: '1px solid #DDD', padding: 12, textAlign: 'center' };
  const icon  = { fontSize: 20, border: 'none', background: 'none', cursor: 'pointer' };
  const btn   = {
    width      : '100%',
    padding    : 12,
    borderRadius: 8,
    background : '#002F3D',
    color      : '#FFF',
    fontWeight : 500,
    border     : 'none',
    cursor     : 'pointer',
    marginTop  : 24,
  };

  /* ── 세부 보기 ──────────────────────────────────────────────── */
  const openDetail = (r) => {
    if (r.submitted) {
      alert(`제출일자: ${today}\n\n${r.text}`);
    }
  };

  /* ── JSX ───────────────────────────────────────────────────── */
  return (
    <div style={wrap}>
      <h1 style={title}>TBM 제출 현황&nbsp;[{todayLabel}]</h1>

      <table style={table}>
        <thead>
          <tr>
            <th style={cell}>현장명</th>
            <th style={cell}>협력사명</th>
            <th style={cell}>제출여부</th>
            <th style={cell}>확인인원</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={cell}>{r.siteName}</td>
              <td style={cell}>{r.partnerName}</td>
              <td style={cell}>
                {r.submitted ? (
                  <button style={icon} onClick={() => openDetail(r)}>
                    🟢
                  </button>
                ) : (
                  <span style={icon}>🔴</span>
                )}
              </td>
              <td style={cell}>{r.confirmCnt}명</td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={4} style={cell}>
                조회할 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button style={btn} onClick={() => nav(-1)}>
        뒤로
      </button>
    </div>
  );
}
