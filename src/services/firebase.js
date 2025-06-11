import { initializeApp } from "firebase/app";
import { getFirestore }  from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBswT-18BXbocKM_ZvC0XShy6Bi6F4bzNQ",
  authDomain:        "tbm-webapp.firebaseapp.com",
  projectId:         "tbm-webapp",
  storageBucket:     "tbm-webapp.firebasestorage.app",
  messagingSenderId: "804534069654",
  appId:             "1:804534069654:web:f73a438ba6725a4cb15b7"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
