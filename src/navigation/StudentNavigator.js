import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentDashboard from '../screens/student/StudentDashboard';
import TaskDetailScreen from '../screens/student/TaskDetailScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const StudentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={StudentDashboard}
        options={{ title: 'My Tasks' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
