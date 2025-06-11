// File: src/pages/PartnerNoticeManage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { currentUser } from "../services/localAuth";
import {
  fetchBoardNotices,
  saveNotice,
  deleteNotice
} from "../services/db";
import { v4 as uuid } from "uuid";

export default function PartnerNoticeManage() {
  const { partnerId } = useParams();
  const me = currentUser();
  const nav = useNavigate();
  if (!me || me.role !== "partner" || me.uid !== partnerId) {
    return <Navigate to="/login" replace />;
  }

  // 스타일
  const container = {
    padding: "24px",
    background: "#F5F5F7",
    minHeight: "calc(100vh - 64px)",
  };
  const inputWrapper = {
    width: "auto",
    margin: "0 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  };
  const buttonWrapper = {
    width: "auto",
    margin: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  };
  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #CCC",
    borderRadius: "8px"
  };
  const buttonStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    background: "#002F3D",
    color: "#FFF",
    fontWeight: 500,
    border: "none",
    cursor: "pointer"
  };
  const deleteBtn = {
    marginLeft: "8px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "#FF3B30",
    color: "#FFF",
    border: "none",
    cursor: "pointer"
  };

  // 공지 데이터
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await fetchBoardNotices({ partnerId });
      const list = all
        .filter((n) => n.level === "partner" && n.partnerId === partnerId)
        .sort((a, b) => b.createdAt - a.createdAt);
      setNotices(list);
    })();
  }, [partnerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("공지 제목과 링크를 입력하세요.");
      return;
    }
    const id = editId || uuid();
    await saveNotice({
      id,
      level: "partner",
      siteId: me.siteId,
      partnerId,
      title: title.trim(),
      url: url.trim(),
      body: "",
      createdAt: Date.now(),
    });
    setTitle("");
    setUrl("");
    setEditId(null);
    const all = await fetchBoardNotices({ partnerId });
    setNotices(
      all
        .filter((n) => n.level === "partner" && n.partnerId === partnerId)
        .sort((a, b) => b.createdAt - a.createdAt)
    );
  };

  const handleEdit = (n) => {
    setEditId(n.id);
    setTitle(n.title);
    setUrl(n.url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await deleteNotice(id);
    setNotices((ns) => ns.filter((n) => n.id !== id));
    if (editId === id) {
      setEditId(null);
      setTitle("");
      setUrl("");
    }
  };

  return (
    <div>
      <div style={container}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px" }}>
          협력사 공지 등록·수정
        </h1>

        {/* 등록/수정 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={inputWrapper}>
            <input
              style={inputStyle}
              placeholder="공지 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              style={inputStyle}
              placeholder="공지 링크"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div style={buttonWrapper}>
            <button type="submit" style={buttonStyle}>
              {editId ? "수정 완료" : "등록"}
            </button>
            {editId && (
              <button
                type="button"
                style={{ ...buttonStyle, background: "#AAA" }}
                onClick={() => {
                  setEditId(null);
                  setTitle("");
                  setUrl("");
                }}
              >
                취소
              </button>
            )}
            <button
              type="button"
              style={buttonStyle}
              onClick={() => nav(`/board/${partnerId}`)}
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
        </form>

        {/* 공지 목록 */}
        <section style={{ marginTop: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "12px" }}>내 공지 목록</h2>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
            {notices.length === 0 && (
              <p style={{ color: "#3C3C4399", textAlign: "center" }}>등록된 공지가 없습니다.</p>
            )}
            {notices.map((n) => (
              <li
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "0 24px 8px 24px"
                }}
              >
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#007AFF",
                    textDecoration: "underline",
                    fontWeight: 500,
                    flex: 1
                  }}
                >
                  {n.title}
                </a>
                <button
                  style={{ ...deleteBtn, background: "#FFD60A", color: "#222" }}
                  onClick={() => handleEdit(n)}
                >
                  수정
                </button>
                <button
                  style={deleteBtn}
                  onClick={() => handleDelete(n.id)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
