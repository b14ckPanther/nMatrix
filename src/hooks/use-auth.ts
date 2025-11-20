'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
  role: 'admin' | 'user';
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Check if Firebase is configured
          if (!db) {
            console.warn('Firestore is not configured');
            setUserData({ role: 'user' });
            return;
          }

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              role: 'user', // Default role
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUserData);
            setUserData(newUserData);
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          // Continue with default role if Firestore fails
          setUserData({ role: 'user' });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const isAdmin = userData?.role === 'admin';

  return {
    user,
    userData,
    loading,
    isAdmin,
    signIn,
    signOut,
  };
}
