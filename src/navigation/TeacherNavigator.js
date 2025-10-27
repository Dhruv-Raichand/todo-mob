import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import CreateTaskScreen from '../screens/teacher/CreateTaskScreen';
import AnalyticsScreen from '../screens/teacher/AnalyticsScreen';
import TaskDetailScreen from '../screens/student/TaskDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
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
      name="DashboardHome"
      component={TeacherDashboard}
      options={{ title: 'Dashboard' }}
    />
    <Stack.Screen
      name="CreateTask"
      component={CreateTaskScreen}
      options={{ title: 'Create Task' }}
    />
    <Stack.Screen
      name="TaskDetail"
      component={TaskDetailScreen}
      options={{ title: 'Task Details' }}
    />
  </Stack.Navigator>
);

const AnalyticsStack = () => (
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
      name="AnalyticsHome"
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
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
    <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Stack.Navigator>
);

const TeacherNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'chart-box' : 'chart-box-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Analytics" component={AnalyticsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default TeacherNavigator;
