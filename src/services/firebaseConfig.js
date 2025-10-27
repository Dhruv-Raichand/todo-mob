import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';

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
  SUBMISSIONS: 'submissions',
  NOTIFICATIONS: 'notifications',
};

export { auth, firestore, storage, messaging, functions };
