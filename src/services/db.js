// src/services/db.js
//
// 쓰기(추가·수정·삭제) · 읽기 모두 Firestore(Lite) 직접 사용
//

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore/lite';

/* ───── 사용자 관리 ───── */

/** 사용자 추가·수정 */
export const addUser = (user) =>
  setDoc(doc(db, 'users', user.uid), user);

/** uid로 사용자 조회 */
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

/** 역할(role)별 사용자 목록 */
export const getByRole = async (role) => {
  const q    = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

/** uid 중복 검사 */
export const userExists = async (uid) => !!(await getUser(uid));

/** 'kim' → 'kim-1' 처럼 고유 uid 생성 */
export const makeUniqueUid = async (base) => {
  let uid = base, i = 1;
  while (await userExists(uid)) uid = `${base}-${i++}`;
  return uid;
};

/** 사용자 삭제(연관 데이터는 필요 시 확장) */
export const deleteUserCascade = (uid) =>
  deleteDoc(doc(db, 'users', uid));

/* ───── 공지(notices) ───── */

/** 공지 저장(생성·수정) */
export const saveNotice = (notice) =>
  setDoc(doc(db, 'notices', notice.id), notice);

/** 공지 삭제 */
export const deleteNotice = (id) =>
  deleteDoc(doc(db, 'notices', id));

/** 게시판별 공지 목록 */
export const fetchBoardNotices = async ({
  level,
  siteId    = null,
  partnerId = null,
}) => {
  const col = collection(db, 'notices');
  let   q;

  if (level === 'head') {
    q = query(col, where('level', '==', 'head'));
  } else if (level === 'site') {
    q = query(col,
      where('level',  '==', 'site'),
      where('siteId', '==', siteId));
  } else if (level === 'partner') {
    q = query(col,
      where('level',     '==', 'partner'),
      where('partnerId', '==', partnerId));
  } else {
    q = col;            // 조건 없으면 전체
  }

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.createdAt - a.createdAt);
};

/* ───── 공지 읽음(Ack) ───── */

/** 읽음 표시 저장 */
export const addAck = (ack) =>
  setDoc(doc(db, 'acks', ack.id), ack);

/** 공지 읽음 여부 조회 */
export const getAck = async (noticeId, partnerId) => {
  const snap = await getDoc(
    doc(db, 'acks', `${noticeId}_${partnerId}`)
  );
  return snap.exists() ? snap.data() : null;
};
