import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

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

// Initialize auth providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Initialize Firestore with persistent cache and multi-tab support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export default app;