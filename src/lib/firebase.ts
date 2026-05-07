import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCqTAt9t9ewP0p4NNQerOQ6fkw8mrRfYV4",
  authDomain: "agri-ripen.firebaseapp.com",
  projectId: "agri-ripen",
  storageBucket: "agri-ripen.firebasestorage.app",
  messagingSenderId: "726368943078",
  appId: "1:726368943078:web:52fccf5c8bcd4a9c9d7427",
  measurementId: "G-4L8B0F5ZDT"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
