import { firestore } from './firebaseConfig';

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  EXTENSION_REQUEST: 'extension_request',
  EXTENSION_APPROVED: 'extension_approved',
  EXTENSION_REJECTED: 'extension_rejected',
  DEADLINE_REMINDER: 'deadline_reminder',
  TASK_COMPLETED: 'task_completed',
};

export const notificationService = {
  // Create notification in Firestore
  createNotification: async (userId, type, title, message, data = {}) => {
    try {
      await firestore().collection('notifications').add({
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('✅ Notification created for user:', userId);
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  },

  // Subscribe to user's notifications (real-time) - ✅ FIXED
  subscribeToNotifications: (userId, callback) => {
    try {
      return firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .onSnapshot(
          snapshot => {
            // ✅ Check if snapshot exists and has docs
            if (!snapshot || !snapshot.docs) {
              console.log('⚠️ No notifications found');
              callback([]);
              return;
            }

            const notifications = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            
            console.log('✅ Loaded notifications:', notifications.length);
            callback(notifications);
          },
          error => {
            console.error('❌ Notification subscription error:', error);
            
            // ✅ Check if it's an index error
            if (error.message && error.message.includes('index')) {
              console.error('🔥 FIRESTORE INDEX REQUIRED!');
              console.error('Click this link to create index:', error.message);
            }
            
            // Return empty array on error
            callback([]);
          }
        );
    } catch (error) {
      console.error('❌ Subscribe error:', error);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({ read: true });
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      if (!snapshot || !snapshot.docs || snapshot.docs.length === 0) {
        console.log('⚠️ No unread notifications');
        return;
      }

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await firestore().collection('notifications').doc(notificationId).delete();
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  },
};
