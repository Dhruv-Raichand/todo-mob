import React, { createContext, useState, useEffect } from 'react';
import { auth, firestore, COLLECTIONS } from '../services/firebaseConfig';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser = null;

    const unsubscribeAuth = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Subscribe to user data changes
        unsubscribeUser = firestore()
          .collection(COLLECTIONS.USERS)
          .doc(firebaseUser.uid)
          .onSnapshot(
            doc => {
              if (doc.exists) {
                setUserData(doc.data());
              }
              setLoading(false);
            },
            error => {
              console.error('Error listening to user data:', error);
              setLoading(false);
            }
          );
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  const value = {
    user,
    userData,
    loading,
    isChairman: userData?.role === 'chairman',
    isFaculty: userData?.role === 'faculty',
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    resetPassword: authService.resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
