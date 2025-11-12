import { auth, firestore, COLLECTIONS } from './firebaseConfig';
import { ROLES } from '../constants/roles';

export const authService = {
  // Register new user
 // In authService.js
register: async (email, password, name, role) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(user.uid)
      .set({
        email: user.email,
        name: name,  // ← Make sure this is included
        role: role,
        verified: role === 'student' ? true : false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    return user;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
},


  // Login
  login: async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async email => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth().currentUser;
  },

  // Get user data from Firestore
  getUserData: async uid => {
    try {
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .get();
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error('Get user data error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (uid, data) => {
    try {
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
