
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserProfileStore, useApplicationsStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { loadUserProfile, clearUserProfile, setUserId: setUserProfileUserId } = useUserProfileStore.getState();
  const { loadSavedApplications, clearSavedApplications, setUserId: setApplicationsUserId } = useApplicationsStore.getState();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setUserProfileUserId(currentUser.uid);
        setApplicationsUserId(currentUser.uid);
        await loadUserProfile(currentUser.uid);
        await loadSavedApplications(currentUser.uid);
      } else {
        setUserProfileUserId(null);
        setApplicationsUserId(null);
        clearUserProfile();
        clearSavedApplications();
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile, clearUserProfile, setUserProfileUserId, loadSavedApplications, clearSavedApplications, setApplicationsUserId]);

  const logout = async () => {
    await firebaseSignOut(auth);
    // User state will be cleared by onAuthStateChanged listener
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
