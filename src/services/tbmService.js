/* src/services/tbmService.js */
import {
  collection, query, where, getDocs,
} from 'firebase/firestore';
import { httpsCallable } from "firebase/functions";
import { db, funcs } from './firebase';

/* TBM 기록 저장 → Cloud Function */
export async function saveTbmRecord(data) {
  await httpsCallable(funcs, "saveTbm")(data);
}

/* TBM 수정 → Cloud Function */
export async function updateTbmRecord(id, data) {
  await httpsCallable(funcs, "updateTbm")({ id, data });
}

/* 조회(읽기)는 Firestore 직접 */
export async function fetchTbmByPartnerDate(partnerId, date) {
  const q = query(
    collection(db, 'tbms'),
    where('partnerId', '==', partnerId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
}
