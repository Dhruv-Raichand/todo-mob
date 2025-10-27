// import React from 'react';
// import { StatusBar, LogBox } from 'react-native';
// import { AuthProvider } from './context/AuthContext';
// import { TaskProvider } from './context/TaskContext';
// import AppNavigator from './navigation/AppNavigator';
// import { COLORS } from './constants/colors';

// LogBox.ignoreLogs([
//   'Non-serializable values were found in the navigation state',
// ]);

// const App = () => {
//   return (
//     <AuthProvider>
//       <TaskProvider>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor={COLORS.primary}
//         />
//         <AppNavigator />
//       </TaskProvider>
//     </AuthProvider>
//   );
// };

// export default App;
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, firestore } from './services/firebaseConfig';

const App = () => {
  const [status, setStatus] = React.useState('Testing Firebase...');
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      console.log('🔥 Testing Firebase connection...');

      // Test 1: Check Auth initialization
      const currentUser = auth().currentUser;
      console.log('✅ Auth initialized');
      setStatus('Auth: OK\n');

      // Test 2: Write to Firestore
      await firestore().collection('test').doc('testDoc').set({
        message: 'Hello Firebase!',
        timestamp: new Date(),
      });
      console.log('✅ Firestore write successful');
      setStatus(prev => prev + 'Firestore: OK\n');

      // Test 3: Read from Firestore
      const doc = await firestore().collection('test').doc('testDoc').get();
      console.log('✅ Firestore read successful:', doc.data());
      setStatus(prev => prev + 'Database: Connected!\n\n✅ Firebase is working!');

      setLoading(false);
    } catch (error) {
      console.error('❌ Firebase error:', error);
      setStatus('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskMaster App 🚀</Text>
      {loading && <ActivityIndicator size="large" color="#6200EE" />}
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.note}>Check console/logcat for detailed logs</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default App;
