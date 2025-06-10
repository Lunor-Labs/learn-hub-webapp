import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC4Ntc-ShFVJjvgoH4kT211810QYIkRCCQ",
  authDomain: "lms-v1-514e6.firebaseapp.com",
  projectId: "lms-v1-514e6",
  storageBucket: "lms-v1-514e6.firebasestorage.app",
  messagingSenderId: "14772509105",
  appId: "1:14772509105:web:fd806253b23b190bc80590",
  measurementId: "G-FKNFW0LMJX"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;