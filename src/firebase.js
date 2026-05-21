import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0TtYvWWyNqAqOSaGxs8zMdyL2gSDY1qA",
  authDomain: "dropwait.firebaseapp.com",
  projectId: "dropwait",
  storageBucket: "dropwait.firebasestorage.app",
  messagingSenderId: "975418615878",
  appId: "1:975418615878:web:c4f18f0dd7be3537478247"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);