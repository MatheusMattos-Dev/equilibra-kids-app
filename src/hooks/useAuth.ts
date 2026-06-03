import { useState, useEffect } from 'react';
import { 
  type User, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err: any) {
      setError(err.code || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err: any) {
      setError(err.code || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      // Force user refresh to get updated profile info
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err.code || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.code || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.code || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword
  };
};
