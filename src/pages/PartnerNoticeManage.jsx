import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { currentUser } from "../services/localAuth";
import {
  fetchBoardNotices,
  saveNotice,
  deleteNotice,
} from "../services/db";
import { v4 as uuid } from "uuid";

export default function PartnerNoticeManage() {
  /* ───────── 기본 정보 & 권한 ───────── */
  const { partnerId } = useParams();
  const me  = currentUser();
  const nav = useNavigate();

  if (!me || me.role !== "partner" || me.uid !== partnerId) {
    return <Navigate to="/login" replace />;
  }

  /* ───────── 공통 스타일 ───────── */
  const container = {
    padding: 24,
    background: "#F5F5F7",
    minHeight: "100vh",
  };
  const inputBox = {
    width: "100%",
    padding: 12,
    border: "1px solid #CCC",
    borderRadius: 8,
  };
  const formCol = { display: "flex", flexDirection: "column", gap: 12 };
  const fullBtn = {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    background: "#002F3D",
    color: "#FFF",
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
  };
  /* 작은(목록) 버튼 */
  const smBtnBase = {
    padding: "4px 10px",
    fontSize: 14,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  };
  const smWarn   = { ...smBtnBase, background: "#FFD60A", color: "#222" };
  const smDanger = { ...smBtnBase, background: "#FF3B30", color: "#FFF" };

  /* ───────── 상태 ───────── */
  const [notices, setNotices] = useState([]);   // 일반 공지
  const [edus,    setEdus]    = useState([]);   // 교육자료

  const [nTitle, setNTitle]   = useState("");
  const [nUrl,   setNUrl]     = useState("");
  const [nEditId,setNEdit]    = useState(null);

  const [eTitle, setETitle]   = useState("");
  const [eUrl,   setEUrl]     = useState("");
  const [eEditId,setEEdit]    = useState(null);

  /* ───────── Firestore 로드/갱신 ───────── */
  const refresh = async () => {
    const all = await fetchBoardNotices({ partnerId });   // partnerId 기준만 전달
    setNotices(
      all
        .filter((n) => n.level === "partner" && !n.category)
        .sort((a, b) => b.createdAt - a.createdAt)
    );
    setEdus(
      all
        .filter((n) => n.category === "edu" && n.partnerId === partnerId)
        .sort((a, b) => b.createdAt - a.createdAt)
    );
  };
  useEffect(() => { refresh(); }, [partnerId]);

  /* ───────── 저장 helper ───────── */
  /**
   * @param {Object} param0
   *  - isEdu: true → 교육, false → 일반 공지
   */
  const save = async ({ id, title, url, isEdu }) => {
    const data = {
      id,
      level: "partner",
      siteId: me.siteId,
      partnerId,
      title,
      url,
      body: "",
      createdAt: Date.now(),
    };
    if (isEdu) data.category = "edu";  // ★ edu 일 때만 필드 추가

    await saveNotice(data);
    await refresh();
  };

  /* ───────── 폼 제출 ───────── */
  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    if (!nTitle.trim() || !nUrl.trim()) return alert("제목과 링크를 입력하세요");

    save({
      id: nEditId || uuid(),
      title: nTitle.trim(),
      url: nUrl.trim(),
      isEdu: false,
    });
    setNTitle(""); setNUrl(""); setNEdit(null);
  };

  const handleEduSubmit = (e) => {
    e.preventDefault();
    if (!eTitle.trim() || !eUrl.trim()) return alert("제목과 링크를 입력하세요");

    save({
      id: eEditId || uuid(),
      title: eTitle.trim(),
      url: eUrl.trim(),
      isEdu: true,
    });
    setETitle(""); setEUrl(""); setEEdit(null);
  };

  /* ───────── 삭제 ───────── */
  const remove = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await deleteNotice(id);
    await refresh();
  };

  /* ───────── 재사용 가능한 목록 컴포넌트 ───────── */
  const List = ({ items, isEdu }) => (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.length === 0 && (
        <p style={{ color: "#3C3C4399" }}>
          등록된 {isEdu ? "교육자료" : "공지"}가 없습니다.
        </p>
      )}
      {items.map((it) => (
        <li
          key={it.id}
          style={{ display: "flex", alignItems: "center", marginBottom: 6 }}
        >
          <a
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, color: "#007AFF", textDecoration: "underline" }}
          >
            {it.title}
          </a>
          <button
            style={smWarn}
            onClick={() => {
              if (isEdu) {
                setEEdit(it.id); setETitle(it.title); setEUrl(it.url);
              } else {
                setNEdit(it.id); setNTitle(it.title); setNUrl(it.url);
              }
            }}
          >
            수정
          </button>
          <button style={smDanger} onClick={() => remove(it.id)}>
            삭제
          </button>
        </li>
      ))}
    </ul>
  );

  /* ───────── JSX ───────── */
  return (
    <div style={container}>
      {/* ===== 공지 ===== */}
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        공지 등록·수정
      </h1>

      <form onSubmit={handleNoticeSubmit} style={formCol}>
        <input
          style={inputBox}
          placeholder="공지 제목"
          value={nTitle}
          onChange={(e) => setNTitle(e.target.value)}
          required
        />
        <input
          style={inputBox}
          placeholder="공지 링크"
          value={nUrl}
          onChange={(e) => setNUrl(e.target.value)}
          required
        />
        <button type="submit" style={fullBtn}>
          {nEditId ? "수정 완료" : "등록"}
        </button>
      </form>

      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "32px 0 12px" }}>
        내 공지 목록
      </h2>
      <List items={notices} isEdu={false} />

      {/* ===== 교육자료 ===== */}
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: "48px 0 24px" }}>
        위험성 평가 교육자료 등록·수정
      </h1>

      <form onSubmit={handleEduSubmit} style={formCol}>
        <input
          style={inputBox}
          placeholder="제목"
          value={eTitle}
          onChange={(e) => setETitle(e.target.value)}
          required
        />
        <input
          style={inputBox}
          placeholder="링크"
          value={eUrl}
          onChange={(e) => setEUrl(e.target.value)}
          required
        />
        <button type="submit" style={fullBtn}>
          {eEditId ? "수정 완료" : "등록"}
        </button>
      </form>

      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "32px 0 12px" }}>
        교육자료 목록
      </h2>
      <List items={edus} isEdu={true} />

      {/* ===== 돌아가기 ===== */}
      <button
        style={{ ...fullBtn, marginTop: 40 }}
        onClick={() => nav(`/board/${partnerId}`)}
      >
        ← 대시보드로 돌아가기
      </button>
    </div>
  );
}
