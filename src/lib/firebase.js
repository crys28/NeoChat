import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-b6a4f.firebaseapp.com",
  projectId: "reactchat-b6a4f",
  storageBucket: "reactchat-b6a4f.appspot.com",
  messagingSenderId: "580746744243",
  appId: "1:580746744243:web:8d984b2f20d86e9100fbc6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const firestore = getFirestore(app);
export const storage = getStorage();