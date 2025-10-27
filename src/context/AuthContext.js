import React, { createContext, useState, useEffect } from 'react';
import { auth, firestore, COLLECTIONS } from '../services/firebaseConfig';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Subscribe to user data changes
        const unsubscribeUser = firestore()
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

        return () => unsubscribeUser();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const value = {
    user,
    userData,
    loading,
    isTeacher: userData?.role === 'teacher' && userData?.verified === true,
    isStudent: userData?.role === 'student',
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    resetPassword: authService.resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
