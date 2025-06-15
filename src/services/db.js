// src/services/db.js
//
// 쓰기·읽기 모두 Firestore(Lite) 직접 사용
//
import { db } from './firebase';
import {
  collection, doc,
  getDoc, getDocs,
  setDoc, deleteDoc,
  query, where,
} from 'firebase/firestore/lite';

/* ───── 사용자 관리 ───── */
export const addUser = (user) =>
  setDoc(doc(db, 'users', user.uid), user);

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const getByRole = async (role) => {
  const q    = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

export const userExists = async (uid) => !!(await getUser(uid));

export const makeUniqueUid = async (base) => {
  let uid = base, i = 1;
  while (await userExists(uid)) uid = `${base}-${i++}`;
  return uid;
};

export const deleteUserCascade = (uid) =>
  deleteDoc(doc(db, 'users', uid));

/* ───── 공지(notices) ───── */
export const saveNotice = (notice) =>
  setDoc(doc(db, 'notices', notice.id), notice);

export const deleteNotice = (id) =>
  deleteDoc(doc(db, 'notices', id));

export const fetchBoardNotices = async ({
  level,
  siteId    = null,
  partnerId = null,
}) => {
  const col = collection(db, 'notices');
  let q;

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
    return [];            // 잘못된 호출 방지
  }

  const snap = await getDocs(q);
  return snap.docs
    .map(d => d.data())
    .sort((a, b) => b.createdAt - a.createdAt);
};

/* ───── 공지 읽음(Ack) ───── */
export const addAck = (ack) =>
  setDoc(doc(db, 'acks', ack.id), ack);

export const getAck = async (noticeId, partnerId) => {
  const snap = await getDoc(doc(db, 'acks', `${noticeId}_${partnerId}`));
  return snap.exists() ? snap.data() : null;
};
