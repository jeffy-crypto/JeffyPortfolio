// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// PASTE YOUR CONFIG FROM FIREBASE CONSOLE HERE
const firebaseConfig = {
  apiKey: "AIzaSyDX8JmD94qLTwUODZxSUh7CXfXbB-nja0k",
  authDomain: "jefiece-portfolio.firebaseapp.com",
  projectId: "jefiece-portfolio",
  storageBucket: "jefiece-portfolio.firebasestorage.app",
  messagingSenderId: "927744727000",
  appId: "1:927744727000:web:6061b17c144d52627ac4ad",
  measurementId: "G-TDQ1J2N81C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);