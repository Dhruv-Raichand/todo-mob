import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Enable offline persistence
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
};

export { auth, firestore, messaging };
