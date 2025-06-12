/* src/services/db.js
   쓰기(추가·수정·삭제) → Cloud Functions 호출
   읽기(query·get)      → Firestore 직접 조회
*/

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';             // 표준 SDK 사용
import { httpsCallable } from 'firebase/functions';
import { db, funcs } from './firebase';

/* ───────── 사용자 관리 ───────── */

/** Cloud Functions(addUserDoc) 으로 사용자 생성 */
export const addUser = async (user) => {
  await httpsCallable(funcs, 'addUserDoc')(user);
};

/** uid로 사용자 문서 조회 (읽기) */
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

/** 역할(role)별 사용자 배열 반환 */
export const getByRole = async (role) => {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
};

/** uid 중복 확인 */
export const userExists = async (uid) => !!(await getUser(uid));

/** 'kim' → 'kim-1' 처럼 고유 uid 생성 */
export const makeUniqueUid = async (base) => {
  let uid = base, i = 1;
  while (await userExists(uid)) uid = `${base}-${i++}`;
  return uid;
};

/**
 * 사용자 삭제는 Rules 때문에 클라이언트에서 직접 못 함.
 * 필요하면 Cloud Functions(deleteUserDoc) 을 추가하고
 * 아래 호출만 바꿔 주세요.
 */
export const deleteUserCascade = async (uid) => {
  await httpsCallable(funcs, 'deleteUserDoc')({ uid });  // (함수 구현 필요)
};

/* ───────── 공지(notices) ───────── */

/** 공지 저장(생성·수정) */
export const saveNotice = async (notice) => {
  await httpsCallable(funcs, 'saveNotice')(notice);
};

/** 공지 삭제 */
export const deleteNotice = async (id) => {
  await httpsCallable(funcs, 'deleteNotice')({ id });
};

/** 게시판별 공지 목록 가져오기 */
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
      where('level', '==', 'site'),
      where('siteId', '==', siteId));
  } else if (level === 'partner') {
    q = query(col,
      where('level', '==', 'partner'),
      where('partnerId', '==', partnerId));
  } else {
    q = col; // 조건 없으면 전체
  }

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => b.createdAt - a.createdAt);
};

/* ───────── 공지 읽음(Ack) ─────────
   Rules가 write: false 이면 클라이언트 setDoc이 막히므로
   필요하면 Cloud Functions(saveAck) 을 만들어 호출하세요.
*/

/** 읽음 표시 저장 */
export const addAck = async (ack) => {
  // await httpsCallable(funcs, 'saveAck')(ack); // 함수 버전(추천)
  // ↓ 임시: Rules 예외를 두었다면 직접 쓰기
  await httpsCallable(funcs, 'saveAck')(ack);
};

/** 공지 읽음 여부 조회 */
export const getAck = async (noticeId, partnerId) => {
  const snap = await getDoc(doc(db, 'acks', `${noticeId}_${partnerId}`));
  return snap.exists() ? snap.data() : null;
};
