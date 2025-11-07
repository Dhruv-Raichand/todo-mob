import { firestore, COLLECTIONS } from './firebaseConfig';
import { TASK_STATUS } from '../constants/taskStatus';

export const taskService = {
  // Create new task with per-student progress tracking
  createTask: async taskData => {
    try {
      const { assignedTo, ...restData } = taskData;
      
      const assignedStudents = Array.isArray(assignedTo) 
        ? assignedTo 
        : [assignedTo];

      // Initialize progress for each student
      const studentProgress = {};
      assignedStudents.forEach(studentId => {
        studentProgress[studentId] = {
          progress: 0,
          status: TASK_STATUS.NOT_STARTED,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        };
      });

      const taskRef = await firestore()
        .collection(COLLECTIONS.TASKS)
        .add({
          ...restData,
          assignedStudents,
          studentProgress, // Per-student tracking!
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      return taskRef.id;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  // Get single task with student-specific progress
  getTask: async (taskId, studentId = null) => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      if (!taskDoc.exists) return null;
      
      const taskData = { id: taskDoc.id, ...taskDoc.data() };
      
      // If student, add their specific progress
      if (studentId && taskData.studentProgress) {
        taskData.myProgress = taskData.studentProgress[studentId] || {
          progress: 0,
          status: TASK_STATUS.NOT_STARTED,
        };
      }
      
      return taskData;
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  },

  // Subscribe to teacher's tasks with student progress summary
// Subscribe to teacher's tasks with student progress summary
subscribeToTeacherTasks: (teacherId, callback) => {
  return firestore()
    .collection(COLLECTIONS.TASKS)
    .where('teacherId', '==', teacherId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      querySnapshot => {
        const tasks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const studentProgress = data.studentProgress || {};
          const assignedStudents = data.assignedStudents || [];
          
          // If no studentProgress exists, initialize it
          const totalStudents = assignedStudents.length;
          
          if (totalStudents === 0) {
            return {
              id: doc.id,
              ...data,
              stats: {
                totalStudents: 0,
                completedStudents: 0,
                avgProgress: 0,
              },
            };
          }

          // Calculate stats from studentProgress
          const progressValues = Object.values(studentProgress);
          const completedStudents = progressValues.filter(
            sp => sp.progress === 100
          ).length;
          
          const avgProgress = progressValues.length > 0
            ? progressValues.reduce((sum, sp) => sum + (sp.progress || 0), 0) / progressValues.length
            : 0;
          
          return {
            id: doc.id,
            ...data,
            stats: {
              totalStudents,
              completedStudents,
              avgProgress: Math.round(avgProgress),
            },
          };
        });
        
        console.log('Teacher tasks loaded:', tasks.length);
        tasks.forEach(t => console.log(`Task: ${t.title}, Stats:`, t.stats));
        
        callback(tasks);
      },
      error => {
        console.error('Error listening to teacher tasks:', error);
      }
    );
},


  // Subscribe to student's tasks with their specific progress
// Subscribe to student's tasks (Real-time listener) - Updated for array
subscribeToStudentTasks: (studentId, callback, onError) => {
  console.log('📡 Setting up student tasks listener for:', studentId);

  return firestore()
    .collection(COLLECTIONS.TASKS)
    .where('assignedStudents', 'array-contains', studentId)
    .orderBy('deadline', 'asc')
    .onSnapshot(
      querySnapshot => {
        console.log('🔥 Firestore snapshot received! Tasks:', querySnapshot.docs.length);

        const tasks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const myProgress = data.studentProgress?.[studentId] || {
            progress: 0,
            status: TASK_STATUS.NOT_STARTED,
          };

          console.log(`  📋 ${data.title}: ${myProgress.progress}%`);

          return {
            id: doc.id,
            ...data,
            myProgress,
          };
        });

        console.log('✅ Calling callback with', tasks.length, 'tasks');
        callback(tasks);
      },
      error => {
        console.error('❌ Error listening to student tasks:', error);
        if (onError) onError(error);
      }
    );
},



  // Update student's own progress
  updateStudentProgress: async (taskId, studentId, progress) => {
    try {
      const status = progress === 0 
        ? TASK_STATUS.NOT_STARTED
        : progress === 100 
        ? TASK_STATUS.COMPLETED 
        : TASK_STATUS.IN_PROGRESS;

      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          [`studentProgress.${studentId}`]: {
            progress,
            status,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update student progress error:', error);
      throw error;
    }
  },

  // Get detailed student progress for a task (Teacher view)
  getStudentProgressDetails: async (taskId) => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      if (!taskDoc.exists) return null;
      
      const taskData = taskDoc.data();
      const studentProgress = taskData.studentProgress || {};
      const assignedStudents = taskData.assignedStudents || [];
      
      // Get student details
      const studentsData = await Promise.all(
        assignedStudents.map(async studentId => {
          const userDoc = await firestore()
            .collection(COLLECTIONS.USERS)
            .doc(studentId)
            .get();
          
          const userData = userDoc.data();
          const progress = studentProgress[studentId] || {
            progress: 0,
            status: TASK_STATUS.NOT_STARTED,
          };
          
          return {
            id: studentId,
            name: userData?.name || 'Unknown',
            email: userData?.email || 'N/A',
            ...progress,
          };
        })
      );
      
      return {
        taskId,
        taskTitle: taskData.title,
        students: studentsData,
      };
    } catch (error) {
      console.error('Get student progress details error:', error);
      throw error;
    }
  },

  // Update entire task (Teacher) - preserves student progress
  updateTask: async (taskId, data) => {
    try {
      // If adding new students, initialize their progress
      if (data.assignedTo) {
        const newStudents = Array.isArray(data.assignedTo) 
          ? data.assignedTo 
          : [data.assignedTo];
        
        const taskDoc = await firestore()
          .collection(COLLECTIONS.TASKS)
          .doc(taskId)
          .get();
        
        const currentProgress = taskDoc.data()?.studentProgress || {};
        
        newStudents.forEach(studentId => {
          if (!currentProgress[studentId]) {
            currentProgress[studentId] = {
              progress: 0,
              status: TASK_STATUS.NOT_STARTED,
              lastUpdated: firestore.FieldValue.serverTimestamp(),
            };
          }
        });
        
        data.assignedStudents = newStudents;
        data.studentProgress = currentProgress;
        delete data.assignedTo;
      }

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

  // Update task priority
  updateTaskPriority: async (taskId, priority) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          priority,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update task priority error:', error);
      throw error;
    }
  },

  // Add students to existing task
  addStudentsToTask: async (taskId, studentIds) => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      const currentProgress = taskDoc.data()?.studentProgress || {};
      
      studentIds.forEach(studentId => {
        if (!currentProgress[studentId]) {
          currentProgress[studentId] = {
            progress: 0,
            status: TASK_STATUS.NOT_STARTED,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          };
        }
      });

      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          assignedStudents: firestore.FieldValue.arrayUnion(...studentIds),
          studentProgress: currentProgress,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Add students to task error:', error);
      throw error;
    }
  },

  // Remove student from task
  removeStudentFromTask: async (taskId, studentId) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          assignedStudents: firestore.FieldValue.arrayRemove(studentId),
          [`studentProgress.${studentId}`]: firestore.FieldValue.delete(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Remove student from task error:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async taskId => {
    try {
      await firestore().collection(COLLECTIONS.TASKS).doc(taskId).delete();
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  },

  // Add comment with user role
  addComment: async (taskId, userId, userName, userRole, text) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection(COLLECTIONS.COMMENTS)
        .add({
          userId,
          userName,
          userRole, // 'teacher' or 'student'
          text,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  // Subscribe to comments
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
