import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import CreateTaskScreen from '../screens/teacher/CreateTaskScreen';
import EditTaskScreen from '../screens/teacher/EditTaskScreen';
import TaskDetailScreen from '../screens/student/TaskDetailScreen';
import AnalyticsScreen from '../screens/teacher/AnalyticsScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const TeacherNavigator = () => {
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
        component={TeacherDashboard}
        options={{ title: 'Teacher Dashboard' }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Create New Task' }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ title: 'Edit Task' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </Stack.Navigator>
  );
};

export default TeacherNavigator;
