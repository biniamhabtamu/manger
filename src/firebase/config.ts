import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDV_xZk8LxeBXkCJ8MVeUFVQ8moIuK6wKo",
  authDomain: "task-manage-aff13.firebaseapp.com",
  projectId: "task-manage-aff13",
  storageBucket: "task-manage-aff13.firebasestorage.app",
  messagingSenderId: "1062995412324",
  appId: "1:1062995412324:web:fef5dd19b6f71077de6671",
  measurementId: "G-80FN7QLB82"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence immediately after db initialization
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firebase persistence failed: Browser not supported');
    }
  });
} catch (error) {
  // Handle synchronous errors including internal assertion failures
  console.warn('Firebase persistence initialization failed:', error);
}

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;