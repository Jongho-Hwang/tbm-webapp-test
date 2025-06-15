// src/services/tbmService.js
// TBM 관련 Firestore 호출
import { db } from './firebase';
import {
  collection, setDoc, updateDoc, doc,
  query, where, getDocs,
} from 'firebase/firestore/lite';

/* TBM 기록 저장 (ID 직접 지정) */
export const saveTbmRecord = (data) =>
  setDoc(doc(db, 'tbms', data.id), data);

/* TBM 수정 */
export const updateTbmRecord = (id, data) =>
  updateDoc(doc(db, 'tbms', id), data);

/* 특정 협력사·날짜 TBM 조회(최신 1건) */
export const fetchTbmByPartnerDate = async (partnerId, date) => {
  const q = query(
    collection(db, 'tbms'),
    where('partnerId', '==', partnerId),
    where('date',      '==', date),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
};
