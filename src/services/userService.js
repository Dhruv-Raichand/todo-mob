import { firestore, COLLECTIONS } from './firebaseConfig';
import { ROLES } from '../constants/roles';

export const userService = {
  // Get all students (for teacher to assign tasks)
  getAllStudents: async () => {
    try {
      const studentsSnapshot = await firestore()
        .collection(COLLECTIONS.USERS)
        .where('role', '==', ROLES.STUDENT)
        .orderBy('name', 'asc')
        .get();

      return studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async userId => {
    try {
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .get();
      return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to user data changes
  subscribeToUser: (userId, callback) => {
    return firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            callback({ id: doc.id, ...doc.data() });
          }
        },
        error => {
          console.error('Error listening to user:', error);
        }
      );
  },
};
