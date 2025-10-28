import { firestore, COLLECTIONS } from './firebaseConfig';
import { TASK_STATUS } from '../constants/taskStatus';

export const taskService = {
  // Create new task (Teacher only)
  createTask: async taskData => {
    try {
      const taskRef = await firestore()
        .collection(COLLECTIONS.TASKS)
        .add({
          ...taskData,
          status: TASK_STATUS.NOT_STARTED,
          progress: 0,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return taskRef.id;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  // Get single task
  getTask: async taskId => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      return taskDoc.exists ? { id: taskDoc.id, ...taskDoc.data() } : null;
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  },

  // Subscribe to teacher's tasks (Real-time listener)
  subscribeToTeacherTasks: (teacherId, callback) => {
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .where('teacherId', '==', teacherId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const tasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(tasks);
        },
        error => {
          console.error('Error listening to teacher tasks:', error);
        }
      );
  },

  // Subscribe to student's tasks (Real-time listener)
  subscribeToStudentTasks: (studentId, callback) => {
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .where('assignedTo', '==', studentId)
      .orderBy('deadline', 'asc')
      .onSnapshot(
        querySnapshot => {
          const tasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(tasks);
        },
        error => {
          console.error('Error listening to student tasks:', error);
        }
      );
  },

  // Update task (Teacher)
  updateTask: async (taskId, data) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  // Update task status (Student)
  updateTaskStatus: async (taskId, status) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          status,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update task status error:', error);
      throw error;
    }
  },

  // Update task progress (Student)
  updateTaskProgress: async (taskId, progress) => {
    try {
      const updates = {
        progress,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Auto-update status based on progress
      if (progress === 0) {
        updates.status = TASK_STATUS.NOT_STARTED;
      } else if (progress === 100) {
        updates.status = TASK_STATUS.COMPLETED;
      } else {
        updates.status = TASK_STATUS.IN_PROGRESS;
      }

      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update(updates);
    } catch (error) {
      console.error('Update task progress error:', error);
      throw error;
    }
  },

  // Delete task (Teacher only)
  deleteTask: async taskId => {
    try {
      await firestore().collection(COLLECTIONS.TASKS).doc(taskId).delete();
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  },

  // Add comment to task
  addComment: async (taskId, userId, userName, text) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection(COLLECTIONS.COMMENTS)
        .add({
          userId,
          userName,
          text,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  // Subscribe to comments (Real-time)
  subscribeToComments: (taskId, callback) => {
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .doc(taskId)
      .collection(COLLECTIONS.COMMENTS)
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        querySnapshot => {
          const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(comments);
        },
        error => {
          console.error('Error listening to comments:', error);
        }
      );
  },

  // Delete comment
  deleteComment: async (taskId, commentId) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection(COLLECTIONS.COMMENTS)
        .doc(commentId)
        .delete();
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },
};
