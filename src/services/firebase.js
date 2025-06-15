// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

/* Firebase 콘솔의 설정값 */
const firebaseConfig = {
  apiKey:            'AIzaSyBswT-18BXbocKM_ZvC0XShy6Bi6F4bzNQ',
  authDomain:        'tbm-webapp.firebaseapp.com',
  projectId:         'tbm-webapp',
  storageBucket:     'tbm-webapp.appspot.com',   // ← 오타 수정
  messagingSenderId: '804534069654',
  appId:             '1:804534069654:web:f73a438ba672a5a4cb15b7',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
