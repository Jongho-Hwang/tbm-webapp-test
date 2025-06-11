// File: src/services/tbmService.js

import { db } from './firebase';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

export async function saveTbmRecord(data) {
  await addDoc(collection(db, 'tbms'), data);
}

export async function fetchTbmByPartnerDate(partnerId, date) {
  const q = query(
    collection(db, 'tbms'),
    where('partnerId', '==', partnerId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function updateTbmRecord(id, data) {
  await updateDoc(doc(db, 'tbms', id), data);
}

export async function fetchTbmStatusRecords() {
  // ... (생략)
}
