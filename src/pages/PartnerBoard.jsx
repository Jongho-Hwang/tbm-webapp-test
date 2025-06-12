// File: src/pages/PartnerBoard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { currentUser, logout } from '../services/localAuth';
import { fetchBoardNotices, addAck, getAck } from '../services/db';
import {
  saveTbmRecord,
  fetchTbmByPartnerDate,
  updateTbmRecord
} from '../services/tbmService';
import { v4 as uuid } from 'uuid';

export default function PartnerBoard() {
  const me = currentUser();
  const nav = useNavigate();
  if (!me || me.role !== 'partner') {
    return <Navigate to="/login" replace />;
  }

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

  // 공지사항
  const [notices, setNotices] = useState([]);
  useEffect(() => {
    (async () => {
      // Firestore에서 siteId, partnerId 기준 공지 가져오기
      const list = await fetchBoardNotices({ siteId: me.siteId, partnerId: me.uid });
      setNotices(list);
      // 읽음표시 기록 (Ack)
      for (const n of list) {
        const ackId = `${n.id}_${me.uid}`;
        if (!(await getAck(n.id, me.uid))) {
          await addAck({ id: ackId, noticeId: n.id, siteId: me.siteId, partnerId: me.uid, ts: Date.now() });
        }
      }
    })();
  }, [me.siteId, me.uid]);

  // TBM 일지
  const today = new Date().toISOString().slice(0, 10);
  const [record, setRecord] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tbmText, setTbmText] = useState('');

  useEffect(() => {
    (async () => {
      const recs = await fetchTbmByPartnerDate(me.uid, today);
      if (recs.length > 0) {
        setRecord(recs[0]);
        setTbmText(recs[0].text);
        setSubmitted(true);
      }
    })();
  }, [me.uid, today]);

  // 음성 인식
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 SpeechRecognition을 지원하지 않습니다.');
      return null;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'ko-KR';
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) setTbmText((prev) => prev + finalTranscript);
    };
    recog.onend = () => {
      if (listening) recognitionRef.current.start();
    };
    return recog;
  };

  const toggleRecording = () => {
    if (!listening) {
      if (!recognitionRef.current) {
        const recog = initRecognition();
        if (!recog) return;
        recognitionRef.current = recog;
      }
      recognitionRef.current.start();
      setListening(true);
      window.speechSynthesis.speak(new window.SpeechSynthesisUtterance('녹음이 시작되었습니다'));
    } else {
      recognitionRef.current.stop();
      setListening(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new window.SpeechSynthesisUtterance('녹음이 종료되었습니다'));
    }
  };

  // TBM 저장/수정
  const handleSave = async () => {
    if (!tbmText.trim()) {
      alert('내용을 입력하세요.');
      return;
    }
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
        createdAt: Date.now()
      });
      setSubmitted(true);
    }
    const recs = await fetchTbmByPartnerDate(me.uid, today);
    setRecord(recs[0]);
  };

  const enterEdit = () => {
    setEditMode(true);
  };

  // 스타일 보완
  const tbmButtonStyle = { ...buttonStyle, marginBottom: '12px' };
  const listStyle = { listStyle: 'none', padding: 0, marginBottom: '16px' };
  const listItem = { display: 'flex', alignItems: 'center', margin: '0 24px 8px 24px' };
  const tbaTextArea = { ...inputStyle, height: '120px', resize: 'none' };

  return (
    <div>
      {/* 오른쪽 상단 버튼 영역 */}
      <div style={headerBar}>
        <button style={buttonStyle} onClick={() => nav('/change-password')}>
          비밀번호 변경
        </button>
        <button style={buttonStyle} onClick={() => { logout(); nav('/login'); }}>
          로그아웃
        </button>
      </div>

      <div style={container}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>
          협력사 관리자 대시보드
        </h1>

        {/* 공지사항 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '12px' }}>
            공지사항
          </h2>
          <ul style={listStyle}>
            {notices.length > 0 ? (
              notices.map((n) => (
                <li key={n.id} style={listItem}>
                  <span style={{ fontWeight: 500, color: '#002F3D' }}>
                    {n.level === 'head' ? '[본사]' : n.level === 'site' ? '[현장]' : '[협력사]'}{' '}
                    {n.url ? (
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#007AFF', textDecoration: 'underline' }}
                      >
                        {n.title}
                      </a>
                    ) : (
                      n.title
                    )}
                  </span>
                </li>
              ))
            ) : (
              <p style={{ color: '#3C3C4399', textAlign: 'center' }}>등록된 공지가 없습니다.</p>
            )}
          </ul>
          <button
            style={tbmButtonStyle}
            onClick={() => nav(`/board/${me.uid}/manage`)}
          >
            공지등록·수정
          </button>
        </section>

        {/* TBM 제출 */}
        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '12px' }}>
            {submitted && !editMode
              ? `제출된 TBM (${today})`
              : `오늘의 TBM (${today})`}
          </h2>

          {submitted && !editMode ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                whiteSpace: 'pre-wrap',
                padding: '12px',
                background: '#FFF',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                {record && record.text}
              </div>
              <button style={tbmButtonStyle} onClick={enterEdit}>
                수정하기
              </button>
            </div>
          ) : (
            <div>
              <button style={tbmButtonStyle} onClick={toggleRecording}>
                {listening ? '녹음 종료' : '녹음 시작'}
              </button>
              <textarea
                style={tbaTextArea}
                placeholder="TBM 음성→텍스트"
                value={tbmText}
                onChange={e => setTbmText(e.target.value)}
              />
              <button style={tbmButtonStyle} onClick={handleSave}>
                {editMode ? '수정 완료' : '제출하기'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
