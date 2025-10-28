import { auth, firestore, COLLECTIONS } from './firebaseConfig';
import { ROLES } from '../constants/roles';

export const authService = {
  // Register new user
  register: async (email, password, name, role = ROLES.STUDENT) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const { uid } = userCredential.user;

      // Update display name
      await userCredential.user.updateProfile({ displayName: name });

      // Create user document in Firestore
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .set({
          uid,
          email,
          name,
          role,
          verified: role === ROLES.STUDENT, // Students auto-verified
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return userCredential.user;
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
