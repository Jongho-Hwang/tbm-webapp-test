/* src/services/firebase.js */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";

const firebaseConfig = {
  apiKey:            "AIzaSyBswT-18BXbocKM_ZvC0XShy6Bi6F4bzNQ",
  authDomain:        "tbm-webapp.firebaseapp.com",
  projectId:         "tbm-webapp",
  storageBucket:     "tbm-webapp.firebasestorage.app",
  messagingSenderId: "804534069654",
  appId:             "1:804534069654:web:f73a438ba672a5a4cb15b7",
};

const app   = initializeApp(firebaseConfig);
export const db    = getFirestore(app);
export const funcs = getFunctions(app, "asia-northeast3");

/* 개발 모드(dev 서버)일 때는 로컬 에뮬레이터로 연결 */
if (import.meta.env.MODE === "development") {
  connectFirestoreEmulator(db,    "127.0.0.1", 8080); // Firestore
  connectFunctionsEmulator(funcs, "127.0.0.1", 5001); // Functions
}
