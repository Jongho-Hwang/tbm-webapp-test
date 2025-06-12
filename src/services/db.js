// src/services/db.js
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore/lite';

/* ───────── 사용자 관리 ───────── */
export const addUser = async (user) =>
  setDoc(doc(db, 'users', user.uid), user);

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const getByRole = async (role) => {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

export const userExists = async (uid) => !!(await getUser(uid));

export const makeUniqueUid = async (base) => {
  let uid = base, i = 1;
  while (await userExists(uid)) uid = `${base}-${i++}`;
  return uid;
};

export const deleteUserCascade = async (uid) =>
  deleteDoc(doc(db, 'users', uid));   // 연관 데이터 삭제는 필요 시 확장

/* ───────── 공지 ───────── */
export const saveNotice   = (notice) => setDoc(doc(db, 'notices', notice.id), notice);
export const deleteNotice = (id)     => deleteDoc(doc(db, 'notices', id));

export const fetchBoardNotices = async ({
  level,
  siteId     = null,
  partnerId  = null,
}) => {
  const col = collection(db, 'notices');
  let q;

  if (level === 'head') {
    q = query(col, where('level', '==', 'head'));
  } else if (level === 'site') {
    q = query(col, where('level', '==', 'site'), where('siteId', '==', siteId));
  } else if (level === 'partner') {
    q = query(
      col,
      where('level', '==', 'partner'),
      where('partnerId', '==', partnerId)
    );
  } else {
    q = col;
  }

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.createdAt - a.createdAt);
};

/* ───────── 공지 읽음(Ack) ───────── */
export const addAck = (ack) =>
  setDoc(doc(db, 'acks', ack.id), ack);

export const getAck = async (noticeId, partnerId) => {
  const snap = await getDoc(doc(db, 'acks', `${noticeId}_${partnerId}`));
  return snap.exists() ? snap.data() : null;
};
