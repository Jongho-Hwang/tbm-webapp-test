// src/services/tbmService.js
// TBM 관련 모든 작업을 Firestore(Lite) 직접 호출로 구현

import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore/lite';

/* TBM 기록 저장 */
export const saveTbmRecord = (data) =>
  addDoc(collection(db, 'tbms'), data);

/* TBM 수정 */
export const updateTbmRecord = (id, data) =>
  updateDoc(doc(db, 'tbms', id), data);

/* 특정 협력사·날짜 TBM 조회(최신 1건) */
export const fetchTbmByPartnerDate = async (partnerId, date) => {
  const q = query(
    collection(db, 'tbms'),
    where('partnerId', '==', partnerId),
    where('date',      '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
};
