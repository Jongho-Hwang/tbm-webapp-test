// File: src/pages/PartnerBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { currentUser, logout } from '../services/localAuth';
import { fetchBoardNotices, addAck, getAck } from '../services/db';
import {
  saveTbmRecord,
  fetchTbmByPartnerDate,
  updateTbmRecord,
} from '../services/tbmService';
import { Mic } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';     // ← named export 사용
import { v4 as uuid } from 'uuid';

export default function PartnerBoard() {
  /* ───────── 인증 ───────── */
  const me = currentUser();
  const nav = useNavigate();
  if (!me || me.role !== 'partner') return <Navigate to="/login" replace />;

  /* ───────── 스타일 ───────── */
  const headerBar = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
  };
  const container = {
    padding: 24,
    background: '#F5F5F7',
    minHeight: 'calc(100vh - 64px)',
  };
  const buttonStyle = {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    background: '#002F3D',
    color: '#FFF',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
  };
  const boardBox = {
    border: '2px solid #D1D1D6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  };

  /* ───────── 공지 & 교육 ───────── */
  const [notices, setNotices] = useState([]);
  const [educations, setEducations] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await fetchBoardNotices({
        siteId: me.siteId,
        partnerId: me.uid,
      });

      const ntcs = [],
        edus = [];
      list.forEach((n) => (n.category === 'edu' ? edus : ntcs).push(n));

      const order = { head: 0, site: 1, partner: 2 };
      ntcs.sort((a, b) => order[a.level] - order[b.level]);
      edus.sort((a, b) => b.createdAt - a.createdAt);

      setNotices(ntcs);
      setEducations(edus.slice(0, 3));

      for (const n of ntcs) {
        const ackId = `${n.id}_${me.uid}`;
        if (!(await getAck(n.id, me.uid))) {
          await addAck({
            id: ackId,
            noticeId: n.id,
            siteId: me.siteId,
            partnerId: me.uid,
            ts: Date.now(),
          });
        }
      }
    })();
  }, [me.siteId, me.uid]);

  /* ───────── TBM ───────── */
  const today = new Date().toISOString().slice(0, 10);
  const [record, setRecord] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tbmText, setTbmText] = useState('');

  useEffect(() => {
    (async () => {
      const recs = await fetchTbmByPartnerDate(me.uid, today);
      if (recs.length) {
        setRecord(recs[0]);
        setTbmText(recs[0].text);
        setSubmitted(true);
      }
    })();
  }, [me.uid, today]);

  /* ───────── 음성 녹음 ───────── */
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const initRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('이 브라우저는 SpeechRecognition을 지원하지 않습니다.');
      return null;
    }
    const r = new SR();
    r.lang = 'ko-KR';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setTbmText((p) => p + final);
    };
    r.onend = () => listening && recognitionRef.current.start();
    return r;
  };

  const toggleRecording = () => {
    if (!listening) {
      if (!recognitionRef.current) {
        const r = initRecognition();
        if (!r) return;
        recognitionRef.current = r;
      }
      recognitionRef.current.start();
      setListening(true);
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance('녹음이 시작되었습니다')
      );
    } else {
      recognitionRef.current.stop();
      setListening(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance('녹음이 종료되었습니다')
      );
    }
  };

  /* ───────── TBM 저장/수정 ───────── */
  const handleSave = async () => {
    if (!tbmText.trim()) return alert('내용을 입력하세요.');
    if (editMode) {
      await updateTbmRecord(record.id, { text: tbmText });
      setEditMode(false);
    } else {
      await saveTbmRecord({
        id: uuid(),
        siteId: me.siteId,
        partnerId: me.uid,
        date: today,
        text: tbmText,
        createdAt: Date.now(),
      });
      setSubmitted(true);
    }
    const recs = await fetchTbmByPartnerDate(me.uid, today);
    setRecord(recs[0]);
  };

  /* ───────── 근로자 페이지 QR ───────── */
  const qrUrl = `${window.location.origin}/worker/${me.uid}`;
  const [showQr, setShowQr] = useState(false);
  const toggleQr = () => setShowQr((p) => !p);

  /* ───────── JSX ───────── */
  return (
    <div>
      {/* 상단 메뉴 */}
      <div style={headerBar}>
        <button style={buttonStyle} onClick={() => nav('/change-password')}>
          비밀번호 변경
        </button>
        <button
          style={buttonStyle}
          onClick={() => {
            logout();
            nav('/login');
          }}
        >
          로그아웃
        </button>
      </div>

      <div style={container}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
          {me.uid} 관리자 대시보드
        </h1>

        {/* 녹음 버튼 */}
        <button
          style={{
            ...buttonStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 32,
          }}
          onClick={toggleRecording}
        >
          <Mic
            size={28}
            color="#E03131"
            fill={listening ? '#E03131' : 'none'}
          />
          {listening ? '녹음 종료' : 'TBM 녹음 시작'}
        </button>

        {/* 공지사항 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12 }}>
            공지사항
          </h2>
          <div style={boardBox}>
            {notices.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {notices.map((n) => (
                  <li key={n.id} style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#002F3D' }}>
                      {n.level === 'head'
                        ? '[본사]'
                        : n.level === 'site'
                        ? '[현장]'
                        : '[협력사]'}{' '}
                      {n.url ? (
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#007AFF',
                            textDecoration: 'underline',
                          }}
                        >
                          {n.title}
                        </a>
                      ) : (
                        n.title
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#3C3C4399', margin: 0 }}>
                등록된 공지가 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* 위험성 평가 교육 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12 }}>
            위험성 평가 교육
          </h2>
          <div style={boardBox}>
            {educations.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {educations.map((e) => (
                  <li key={e.id} style={{ marginBottom: 4 }}>
                    {e.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#3C3C4399', margin: 0 }}>
                등록된 교육이 없습니다.
              </p>
            )}
          </div>
          <button
            style={{ ...buttonStyle, marginBottom: 4 }}
            onClick={() => nav(`/board/${me.uid}/manage`)}
          >
            공지 및 위험성 평가 교육 등록·수정
          </button>
        </section>

        {/* 오늘의 TBM */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12 }}>
            {submitted && !editMode
              ? `제출된 TBM (${today})`
              : `오늘의 TBM (${today})`}
          </h2>

          {submitted && !editMode ? (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  padding: 12,
                  background: '#FFF',
                  borderRadius: 8,
                  marginBottom: 12,
                  border: '1px solid #DDD',
                }}
              >
                {record && record.text}
              </div>
              <button
                style={{ ...buttonStyle, marginBottom: 12 }}
                onClick={() => setEditMode(true)}
              >
                수정하기
              </button>
            </div>
          ) : (
            <div>
              <textarea
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #CCC',
                  borderRadius: 8,
                  height: 72,
                  resize: 'none',
                  marginBottom: 12,
                }}
                placeholder="TBM 음성→텍스트"
                value={tbmText}
                onChange={(e) => setTbmText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button
                  style={{ ...buttonStyle, flex: 1 }}
                  onClick={handleSave}
                >
                  {editMode ? '수정 완료' : '제출하기'}
                </button>
                <button
                  style={{ ...buttonStyle, flex: 1 }}
                  onClick={toggleQr}
                >
                  근로자 페이지 QR코드 생성
                </button>
              </div>

              {showQr && (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <QRCodeCanvas value={qrUrl} size={160} />
                  <p style={{ fontSize: 12, color: '#3C3C43' }}>
                    스캔하여 근로자용 페이지 열기
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
