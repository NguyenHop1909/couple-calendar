import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDLGmlRBO0AtFAhKT1OZS8a2TD-ZYbnBuE",
  authDomain: "couple-calendar-f1f1b.firebaseapp.com",
  projectId: "couple-calendar-f1f1b",
  storageBucket: "couple-calendar-f1f1b.firebasestorage.app",
  messagingSenderId: "683868405322",
  appId: "1:683868405322:web:da1f3b3a0dba9bcbaab0b3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, signInWithEmailAndPassword, signOut, onAuthStateChanged };