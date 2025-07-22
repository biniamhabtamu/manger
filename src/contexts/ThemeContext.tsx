import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { offlineStorage } from '../utils/offlineStorage';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, user } = useAuth();
  const isOnline = useOfflineStatus();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (userProfile) {
      setTheme(userProfile.theme);
    } else {
      const savedTheme = offlineStorage.getTheme() as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    offlineStorage.setTheme(newTheme);
    
    if (user && isOnline) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { theme: newTheme });
      } catch (error) {
        console.warn('Failed to update theme online, stored offline:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};