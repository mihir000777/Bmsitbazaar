import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@bmsitbazaar.com';
  const ALLOWED_DOMAIN = process.env.REACT_APP_ALLOWED_DOMAIN || 'bmsit.in';

  const isAllowedDomain = (email) => {
    return email === ADMIN_EMAIL || email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN);
  };

  const signup = async (email, password) => {
    if (!isAllowedDomain(email)) {
      throw new Error(`Only @${ALLOWED_DOMAIN} college email addresses are allowed.`);
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user, {
      url: window.location.origin,
      handleCodeInApp: false,
    });
    await signOut(auth);
    return cred.user;
  };

  const login = async (email, password) => {
    if (!isAllowedDomain(email)) {
      throw new Error(`Only @${ALLOWED_DOMAIN} college email addresses are allowed.`);
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user.email !== ADMIN_EMAIL && !cred.user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your BMSIT email first. Check your inbox for the verification link.');
    }
    return cred.user;
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    if (!isAllowedDomain(res.user.email)) {
      await signOut(auth);
      throw new Error(`Only @${ALLOWED_DOMAIN} Google accounts allowed. Use your BMSIT college Google account.`);
    }
    return res.user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const resendVerification = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    ADMIN_EMAIL,
    isAllowedDomain,
    signup,
    login,
    googleSignIn,
    logout,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
