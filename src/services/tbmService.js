// src/services/tbmService.js
import { db } from './firebase';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore/lite';

/* TBM 기록 저장 */
export const saveTbmRecord = (data) =>
  addDoc(collection(db, 'tbms'), data);

/* 협력사·날짜별 TBM 조회(최신 1건) */
export const fetchTbmByPartnerDate = async (partnerId, date) => {
  const q = query(
    collection(db, 'tbms'),
    where('partnerId', '==', partnerId),
    where('date', '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
};

/* TBM 기록 수정 */
export const updateTbmRecord = (id, data) =>
  updateDoc(doc(db, 'tbms', id), data);
