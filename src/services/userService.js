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
      console.error('Get all students error:', error);
      throw error;
    }
  },

  // Get all faculty (for chairman to assign tasks)
  getAllFaculty: async () => {
    try {
      const facultySnapshot = await firestore()
        .collection(COLLECTIONS.USERS)
        .where('role', '==', ROLES.FACULTY)
        .orderBy('name', 'asc')
        .get();

      return facultySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Get all faculty error:', error);
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
      console.error('Get user by ID error:', error);
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

  // Search students by name or email
  searchStudents: async searchText => {
    try {
      const studentsSnapshot = await firestore()
        .collection(COLLECTIONS.USERS)
        .where('role', '==', ROLES.STUDENT)
        .get();

      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by search text
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        return students.filter(
          student =>
            student.name.toLowerCase().includes(lowerSearch) ||
            student.email.toLowerCase().includes(lowerSearch)
        );
      }

      return students;
    } catch (error) {
      console.error('Search students error:', error);
      throw error;
    }
  },
};
