import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '../firebase/config';
import { offlineStorage } from '../utils/offlineStorage';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  isPremium: boolean;
  theme: 'light' | 'dark';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isOnline = useOfflineStatus();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (isOnline) {
          try {
            const profileRef = doc(db, 'users', user.uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              const profile = profileSnap.data() as UserProfile;
              setUserProfile(profile);
              offlineStorage.setUserProfile(profile);
            } else {
              setUserProfile(null);
            }
          } catch (error) {
            console.warn('Failed to fetch user profile online, trying offline:', error);
            const offlineProfile = offlineStorage.getUserProfile();
            setUserProfile(offlineProfile);
          }
        } else {
          // Use offline data when not connected
          const offlineProfile = offlineStorage.getUserProfile();
          if (offlineProfile && offlineProfile.uid === user.uid) {
            setUserProfile(offlineProfile);
          } else {
            setUserProfile(null);
          }
        }
      } else {
        setUserProfile(null);
        offlineStorage.clear();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isOnline]);

  const createUserProfile = async (user: User, additionalData: any = {}) => {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: user.displayName || additionalData.name || 'User',
      phone: additionalData.phone,
      isPremium: false,
      theme: 'light',
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userProfile);
    } catch (error) {
      console.warn('Failed to save user profile online, storing offline:', error);
    }
    
    offlineStorage.setUserProfile(userProfile);
    setUserProfile(userProfile);
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    if (!isOnline) {
      throw new Error('Account creation requires an internet connection');
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await createUserProfile(user, { name, phone });
  };

  const login = async (email: string, password: string) => {
    if (!isOnline) {
      throw new Error('Login requires an internet connection');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!isOnline) {
      throw new Error('Social login requires an internet connection');
    }
    const { user } = await signInWithPopup(auth, googleProvider);
    
    try {
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        await createUserProfile(user);
      }
    } catch (error) {
      console.warn('Failed to check existing profile, creating new one:', error);
      await createUserProfile(user);
    }
  };

  const loginWithGithub = async () => {
    if (!isOnline) {
      throw new Error('Social login requires an internet connection');
    }
    const { user } = await signInWithPopup(auth, githubProvider);
    
    try {
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        await createUserProfile(user);
      }
    } catch (error) {
      console.warn('Failed to check existing profile, creating new one:', error);
      await createUserProfile(user);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userProfile,
    login,
    signup,
    loginWithGoogle,
    loginWithGithub,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};