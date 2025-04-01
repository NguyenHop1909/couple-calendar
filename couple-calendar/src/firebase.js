import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLGmlRBO0AtFAhKT1OZS8a2TD-ZYbnBuE",
  authDomain: "couple-calendar-f1f1b.firebaseapp.com",
  projectId: "couple-calendar-f1f1b",
  storageBucket: "couple-calendar-f1f1b.firebasestorage.app",
  messagingSenderId: "683868405322",
  appId: "1:683868405322:web:da1f3b3a0dba9bcbaab0b3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, addDoc, onSnapshot };