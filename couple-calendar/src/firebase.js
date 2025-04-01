// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDLGmlRBO0AtFAhKT1OZS8a2TD-ZYbnBuE",
  authDomain: "couple-calendar-f1f1b.firebaseapp.com",
  projectId: "couple-calendar-f1f1b",
  storageBucket: "couple-calendar-f1f1b.firebasestorage.app",
  messagingSenderId: "683868405322",
  appId: "1:683868405322:web:da1f3b3a0dba9bcbaab0b3"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore
const db = getFirestore(app);

// Export các hàm cần thiết
export { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc };