import React, { useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/splash/SplashScreen'; // ✅ ADD THIS
import { COLORS } from './constants/colors';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [showSplash, setShowSplash] = useState(true); // ✅ ADD THIS

  const handleSplashFinish = () => { // ✅ ADD THIS
    setShowSplash(false);
  };

  // ✅ ADD THIS: Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

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
