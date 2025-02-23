import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2SgnU6rftQUVqHJs5mDbSOoYVcQkffxA",
  authDomain: "prototype-fitness.firebaseapp.com",
  projectId: "prototype-fitness",
  storageBucket: "prototype-fitness.firebasestorage.app",
  messagingSenderId: "626754705168",
  appId: "1:626754705168:web:48fa7c49000f6c6cf47795",
  measurementId: "G-4HX3ZMM9JW",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
