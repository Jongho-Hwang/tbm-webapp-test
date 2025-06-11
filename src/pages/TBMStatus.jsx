// File: src/pages/TBMStatus.jsx

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { currentUser } from '../services/localAuth';
import { getByRole } from '../services/db';
import { fetchTbmByPartnerDate } from '../services/tbmService';

export default function TBMStatus() {
  const me = currentUser();
  const nav = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  // 권한 체크: head 또는 site 관리자만 접근
  if (!me || (me.role !== 'head' && me.role !== 'site')) {
    return <Navigate to="/login" replace />;
  }

  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      // 1) 모든 협력사 목록
      let partners = await getByRole('partner');

      // 2) site 관리자는 자기 현장의 협력사만 필터
      if (me.role === 'site') {
        partners = partners.filter((p) => p.siteId === me.uid);
      }

      // 3) 현장명 매핑을 위해 site 관리자 목록 조회
      const sites = await getByRole('site');
      const siteMap = {};
      sites.forEach((s) => {
        siteMap[s.uid] = s.name;
      });
      if (me.role === 'site') {
        siteMap[me.uid] = me.name;
      }

      // 4) 파트너별 TBM 제출 여부 및 날짜 조회
      const data = await Promise.all(
        partners.map(async (p) => {
          const recs = await fetchTbmByPartnerDate(p.uid, today);
          return {
            date: recs.length > 0 ? recs[0].date : '',
            siteName: siteMap[p.siteId] || '',
            partnerName: p.name,
            submitted: recs.length > 0,
            text: recs.length > 0 ? recs[0].text : '',
          };
        })
      );

      setRows(data);
    })();
  }, [me]);

  // 스타일 객체
  const containerStyle = {
    padding: '24px',
    background: '#F5F5F7',
    minHeight: '100vh',
  };
  const titleStyle = {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '24px',
    textAlign: 'center',
  };
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };
  const cellStyle = {
    border: '1px solid #DDD',
    padding: '12px',
    textAlign: 'center',  // 가운데 정렬
  };
  const circleBtnStyle = {
    fontSize: '20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  };
  const backBtnStyle = {
    width: '100%',        // 좌우 끝까지
    padding: '12px',
    borderRadius: '8px',
    background: '#002F3D',
    color: '#FFF',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    marginTop: '24px',
  };

  // 제출여부 클릭 시 상세 보기
  const handleClick = (row) => {
    if (row.submitted) {
      alert(`제출일자: ${row.date}\n\n${row.text}`);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>TBM 제출 현황</h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>제출일자</th>
            <th style={cellStyle}>현장명</th>
            <th style={cellStyle}>협력사명</th>
            <th style={cellStyle}>제출여부</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td style={cellStyle}>{r.date}</td>
              <td style={cellStyle}>{r.siteName}</td>
              <td style={cellStyle}>{r.partnerName}</td>
              <td style={cellStyle}>
                {r.submitted ? (
                  <button
                    style={circleBtnStyle}
                    onClick={() => handleClick(r)}
                  >
                    🟢
                  </button>
                ) : (
                  <span style={circleBtnStyle}>🔴</span>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} style={cellStyle}>
                조회할 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button style={backBtnStyle} onClick={() => nav(-1)}>
        뒤로
      </button>
    </div>
  );
}
