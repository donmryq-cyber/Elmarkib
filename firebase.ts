import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApWxtKJl1oHbtKuCm4c8mHjxZmgEpZLw0",
  authDomain: "elmarkib-clinic.firebaseapp.com",
  projectId: "elmarkib-clinic",
  storageBucket: "elmarkib-clinic.firebasestorage.app",
  messagingSenderId: "809358053498",
  appId: "1:809358053498:web:2a387c0bcaab0a8cf5ebc3",
  measurementId: "G-RMG2V8JKBS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);