import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import TeacherNavigator from './TeacherNavigator';
import StudentNavigator from './StudentNavigator';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userData?.role === 'teacher' && userData?.verified ? (
          <Stack.Screen name="TeacherApp" component={TeacherNavigator} />
        ) : (
          <Stack.Screen name="StudentApp" component={StudentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
