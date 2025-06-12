// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore/lite';

/* ───── Firebase 프로젝트 설정 ───── */
const firebaseConfig = {
  apiKey:            'AIzaSyBswT-18BXbocKM_ZvC0XShy6Bi6F4bzNQ',
  authDomain:        'tbm-webapp.firebaseapp.com',
  projectId:         'tbm-webapp',
  storageBucket:     'tbm-webapp.firebasestorage.app',
  messagingSenderId: '804534069654',
  appId:             '1:804534069654:web:f73a438ba672a5a4cb15b7',
};

/* 초기화 및 내보내기 */
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* ───── 로컬 에뮬레이터 연결(개발 모드 한정) ───── */
if (import.meta.env.MODE === 'development') {
  const host = import.meta.env.VITE_EMULATOR_HOST ?? '127.0.0.1';
  const port = Number(import.meta.env.VITE_EMULATOR_PORT ?? 8080);
  connectFirestoreEmulator(db, host, port);
  // console.info(`[Firestore] Emulator 연결: ${host}:${port}`);
}
