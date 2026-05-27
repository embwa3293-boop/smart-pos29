// ============================================================
//  firebase.ts — إعداد Firebase
// ============================================================
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCVWIQfC0uxGMHjCUijYeFEsST5I6iDs3E",
  authDomain: "posegp-e521c.firebaseapp.com",
  databaseURL: "https://posegp-e521c-default-rtdb.firebaseio.com",
  projectId: "posegp-e521c",
  storageBucket: "posegp-e521c.firebasestorage.app",
  messagingSenderId: "182995764698",
  appId: "1:182995764698:web:68bf44ba281c3083c86ce3",
  measurementId: "G-SQ2F724Y2D"
};

export const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const db       = getDatabase(app);
export const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });
