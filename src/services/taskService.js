import { firestore, COLLECTIONS } from './firebaseConfig';
import { TASK_STATUS } from '../constants/taskStatus';
import { notificationService } from './notificationService';
import { userService } from './userService';

export const taskService = {
  // Create new task with per-faculty progress tracking
  createTask: async taskData => {
    try {
      console.log('📝 Creating task with data:', taskData);
      
      const { assignedFaculty, chairmanId, ...restData } = taskData;
      
      if (!assignedFaculty || assignedFaculty.length === 0) {
        throw new Error('No faculty members assigned');
      }
      
      if (!chairmanId) {
        throw new Error('Chairman ID is required');
      }

      // Initialize progress for each faculty
      const facultyProgress = {};
      assignedFaculty.forEach(facultyId => {
        facultyProgress[facultyId] = {
          progress: 0,
          status: TASK_STATUS.NOT_STARTED,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        };
      });

      const taskRef = await firestore()
        .collection(COLLECTIONS.TASKS)
        .add({
          ...restData,
          chairmanId,
          assignedFaculty,
          facultyProgress,
          stats: {
            totalFaculty: assignedFaculty.length,
            completedFaculty: 0,
            avgProgress: 0,
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ Task created with ID:', taskRef.id);

      // 🔔 Create notifications for assigned faculty
      for (const facultyId of assignedFaculty) {
        await notificationService.createNotification(
          facultyId,
          'task_assigned',
          'New Task Assigned',
          `You have been assigned: ${restData.title}`,
          { taskId: taskRef.id }
        );
      }

      return taskRef.id;
    } catch (error) {
      console.error('❌ Create task error:', error);
      throw error;
    }
  },

  // Get single task with faculty-specific progress
  getTask: async (taskId, facultyId = null) => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      if (!taskDoc.exists) return null;
      
      const taskData = { id: taskDoc.id, ...taskDoc.data() };
      
      // If faculty member, add their specific progress
      if (facultyId && taskData.facultyProgress) {
        taskData.myProgress = taskData.facultyProgress[facultyId] || {
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

  // Subscribe to chairman's tasks
  subscribeToChairmanTasks: (chairmanId, callback) => {
    console.log('📡 Subscribing to chairman tasks:', chairmanId);
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .where('chairmanId', '==', chairmanId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          const tasks = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const facultyProgress = data.facultyProgress || {};
            const assignedFaculty = data.assignedFaculty || [];

            const totalFaculty = assignedFaculty.length;
            if (totalFaculty === 0) {
              return {
                id: doc.id,
                ...data,
                stats: {
                  totalFaculty: 0,
                  completedFaculty: 0,
                  avgProgress: 0,
                },
              };
            }

            const progressValues = Object.values(facultyProgress);
            const completedFaculty = progressValues.filter(
              fp => fp.progress === 100
            ).length;
            const avgProgress = progressValues.length > 0
              ? progressValues.reduce((sum, fp) => sum + (fp.progress || 0), 0) / progressValues.length
              : 0;

            return {
              id: doc.id,
              ...data,
              stats: {
                totalFaculty,
                completedFaculty,
                avgProgress: Math.round(avgProgress),
              },
            };
          });

          console.log('✅ Chairman tasks loaded:', tasks.length);
          callback(tasks);
        },
        error => {
          console.error('❌ Error listening to chairman tasks:', error);
        }
      );
  },

  // Subscribe to faculty's tasks with their specific progress (Real-time listener)
  subscribeToFacultyTasks: (facultyId, callback, onError) => {
    console.log('📡 Setting up faculty tasks listener for:', facultyId);

    return firestore()
      .collection(COLLECTIONS.TASKS)
      .where('assignedFaculty', 'array-contains', facultyId)
      .orderBy('deadline', 'asc')
      .onSnapshot(
        querySnapshot => {
          console.log('🔥 Firestore snapshot received! Tasks:', querySnapshot.docs.length);

          const tasks = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const myProgress = data.facultyProgress?.[facultyId] || {
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
          console.error('❌ Error listening to faculty tasks:', error);
          if (onError) onError(error);
        }
      );
  },

  // Request deadline extension (Faculty member)
  requestExtension: async (taskId, facultyId, facultyName, currentDeadline, reason) => {
    try {
      if (!taskId) throw new Error('Task ID is required');
      if (!facultyId) throw new Error('Faculty ID is required');
      if (!currentDeadline) throw new Error('Current deadline is required');
      if (!reason || !reason.trim()) throw new Error('Reason is required');

      // Get task to find chairman
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      const taskData = taskDoc.data();
      if (!taskData) throw new Error('Task not found');

      // Create extension request
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection('extensionRequests')
        .add({
          facultyId,
          facultyName: facultyName || 'Faculty Member',
          currentDeadline,
          reason: reason.trim(),
          status: 'pending',
          requestedAt: firestore.FieldValue.serverTimestamp(),
        });

      // 🔔 Notify chairman about extension request
      await notificationService.createNotification(
        taskData.chairmanId,
        'extension_request',
        'Extension Request',
        `${facultyName} requested deadline extension for "${taskData.title}"`,
        { taskId }
      );

      console.log('✅ Extension request submitted successfully');
    } catch (error) {
      console.error('❌ Request extension error:', error);
      throw error;
    }
  },

  // Get extension requests for a task (Chairman view)
  getExtensionRequests: async (taskId) => {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection('extensionRequests')
        .where('status', '==', 'pending')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Get extension requests error:', error);
      throw error;
    }
  },

  // Approve extension and update deadline (Chairman)
  approveExtension: async (taskId, requestId, additionalDays) => {
    try {
      const batch = firestore().batch();

      // Get current task deadline
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      const taskData = taskDoc.data();
      const currentDeadline = taskData.deadline.toDate();
      const newDeadline = new Date(currentDeadline);
      newDeadline.setDate(newDeadline.getDate() + additionalDays);

      // Get request to find facultyId
      const requestDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection('extensionRequests')
        .doc(requestId)
        .get();
      
      const requestData = requestDoc.data();

      // Update task deadline
      batch.update(
        firestore().collection(COLLECTIONS.TASKS).doc(taskId),
        {
          deadline: firestore.Timestamp.fromDate(newDeadline),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }
      );

      // Update request status
      batch.update(
        firestore()
          .collection(COLLECTIONS.TASKS)
          .doc(taskId)
          .collection('extensionRequests')
          .doc(requestId),
        {
          status: 'approved',
          approvedAt: firestore.FieldValue.serverTimestamp(),
          additionalDays,
          newDeadline: firestore.Timestamp.fromDate(newDeadline),
        }
      );

      await batch.commit();

      // 🔔 Notify faculty about approval
      await notificationService.createNotification(
        requestData.facultyId,
        'extension_approved',
        'Extension Approved',
        `Your extension request for "${taskData.title}" was approved!`,
        { taskId }
      );
    } catch (error) {
      console.error('Approve extension error:', error);
      throw error;
    }
  },

  // Reject extension request (Chairman)
  rejectExtension: async (taskId, requestId, reason) => {
    try {
      // Get request to find facultyId and task title
      const requestDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection('extensionRequests')
        .doc(requestId)
        .get();
      
      const requestData = requestDoc.data();

      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      const taskData = taskDoc.data();

      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .collection('extensionRequests')
        .doc(requestId)
        .update({
          status: 'rejected',
          rejectedAt: firestore.FieldValue.serverTimestamp(),
          rejectionReason: reason,
        });

      // 🔔 Notify faculty about rejection
      await notificationService.createNotification(
        requestData.facultyId,
        'extension_rejected',
        'Extension Rejected',
        `Your extension request for "${taskData.title}" was rejected. ${reason}`,
        { taskId }
      );
    } catch (error) {
      console.error('Reject extension error:', error);
      throw error;
    }
  },

  // Subscribe to extension requests for chairman's tasks (Chairman)
  subscribeToExtensionRequests: (chairmanId, callback) => {
    if (!chairmanId || !callback) {
      console.error('❌ chairmanId or callback missing');
      return () => {};
    }

    console.log('📡 Subscribing to extension requests for chairman:', chairmanId);
    
    const unsubscribe = firestore()
      .collection(COLLECTIONS.TASKS)
      .where('chairmanId', '==', chairmanId)
      .onSnapshot(
        async (tasksSnapshot) => {
          try {
            const allRequests = [];
            
            const promises = tasksSnapshot.docs.map(async (taskDoc) => {
              const taskId = taskDoc.id;
              const taskData = taskDoc.data();
              
              try {
                const requestsSnapshot = await firestore()
                  .collection(COLLECTIONS.TASKS)
                  .doc(taskId)
                  .collection('extensionRequests')
                  .where('status', '==', 'pending')
                  .get();
                
                return requestsSnapshot.docs.map(doc => ({
                  id: doc.id,
                  taskId: taskId,
                  taskTitle: taskData.title,
                  ...doc.data(),
                }));
              } catch (error) {
                console.error(`Error fetching requests for task ${taskId}:`, error);
                return [];
              }
            });
            
            const results = await Promise.all(promises);
            const requests = results.flat();
            
            console.log('✅ Extension requests loaded:', requests.length);
            callback(requests);
          } catch (error) {
            console.error('❌ Error processing extension requests:', error);
            callback([]);
          }
        },
        (error) => {
          console.error('❌ Error listening to extension requests:', error);
          callback([]);
        }
      );

    return unsubscribe;
  },

  // Update faculty member's own progress
  updateFacultyProgress: async (taskId, facultyId, progress) => {
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
          [`facultyProgress.${facultyId}`]: {
            progress,
            status,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // 🔔 Notify chairman if task completed
      if (progress === 100) {
        const taskDoc = await firestore()
          .collection(COLLECTIONS.TASKS)
          .doc(taskId)
          .get();
        
        const taskData = taskDoc.data();
        const facultyUser = await userService.getUserById(facultyId);

        await notificationService.createNotification(
          taskData.chairmanId,
          'task_completed',
          'Task Completed',
          `${facultyUser?.name || 'A faculty member'} completed "${taskData.title}"`,
          { taskId }
        );
      }
    } catch (error) {
      console.error('Update faculty progress error:', error);
      throw error;
    }
  },

  // Get detailed faculty progress for a task (Chairman view)
  getFacultyProgressDetails: async (taskId) => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      if (!taskDoc.exists) return null;
      
      const taskData = taskDoc.data();
      const facultyProgress = taskData.facultyProgress || {};
      const assignedFaculty = taskData.assignedFaculty || [];
      
      const facultyData = await Promise.all(
        assignedFaculty.map(async facultyId => {
          const userDoc = await firestore()
            .collection(COLLECTIONS.USERS)
            .doc(facultyId)
            .get();
          
          const userData = userDoc.data();
          const progress = facultyProgress[facultyId] || {
            progress: 0,
            status: TASK_STATUS.NOT_STARTED,
          };
          
          return {
            id: facultyId,
            name: userData?.name || 'Unknown',
            email: userData?.email || 'N/A',
            ...progress,
          };
        })
      );
      
      return {
        taskId,
        taskTitle: taskData.title,
        faculty: facultyData,
      };
    } catch (error) {
      console.error('Get faculty progress details error:', error);
      throw error;
    }
  },

  // Update entire task (Chairman) - preserves faculty progress
  updateTask: async (taskId, data) => {
    try {
      if (data.assignedTo) {
        const newFaculty = Array.isArray(data.assignedTo) 
          ? data.assignedTo 
          : [data.assignedTo];
        
        const taskDoc = await firestore()
          .collection(COLLECTIONS.TASKS)
          .doc(taskId)
          .get();
        
        const currentProgress = taskDoc.data()?.facultyProgress || {};
        
        newFaculty.forEach(facultyId => {
          if (!currentProgress[facultyId]) {
            currentProgress[facultyId] = {
              progress: 0,
              status: TASK_STATUS.NOT_STARTED,
              lastUpdated: firestore.FieldValue.serverTimestamp(),
            };
          }
        });
        
        data.assignedFaculty = newFaculty;
        data.facultyProgress = currentProgress;
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

  // Add faculty members to existing task
  addFacultyToTask: async (taskId, facultyIds) => {
    try {
      const taskDoc = await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();
      
      const currentProgress = taskDoc.data()?.facultyProgress || {};
      
      facultyIds.forEach(facultyId => {
        if (!currentProgress[facultyId]) {
          currentProgress[facultyId] = {
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
          assignedFaculty: firestore.FieldValue.arrayUnion(...facultyIds),
          facultyProgress: currentProgress,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Add faculty to task error:', error);
      throw error;
    }
  },

  // Remove faculty member from task
  removeFacultyFromTask: async (taskId, facultyId) => {
    try {
      await firestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          assignedFaculty: firestore.FieldValue.arrayRemove(facultyId),
          [`facultyProgress.${facultyId}`]: firestore.FieldValue.delete(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Remove faculty from task error:', error);
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
          userRole,
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
