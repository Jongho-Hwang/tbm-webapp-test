// src/services/firebase.js
import { initializeApp }   from "firebase/app";
import { getFirestore }    from "firebase/firestore/lite";

/* Firebase 콘솔에서 발급받은 설정값 */
const firebaseConfig = {
  apiKey:            "AIzaSyBswT-18BXbocKM_ZvC0XShy6Bi6F4bzNQ",
  authDomain:        "tbm-webapp.firebaseapp.com",
  projectId:         "tbm-webapp",
  storageBucket:     "tbm-webapp.firebasestorage.app",   // ← 수정된 부분
  messagingSenderId: "804534069654",
  appId:             "1:804534069654:web:f73a438ba672a5a4cb15b7",
};

const app = initializeApp(firebaseConfig);

/* Firestore(Lite)를 앱 전역에서 사용 */
export const db = getFirestore(app);
