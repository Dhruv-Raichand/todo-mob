import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import AppNavigator from './navigation/AppNavigator';
import { COLORS } from './constants/colors';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
    <AuthProvider>
      <TaskProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary}
        />
        <AppNavigator />
      </TaskProvider>
    </AuthProvider>
  );
};

export default App;
