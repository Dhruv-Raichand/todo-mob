import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTasks } from '../../hooks/useTasks';
import TaskList from '../../components/task/TaskList';
import { COLORS } from '../../constants/colors';
import { TASK_STATUS } from '../../constants/taskStatus';

const Tab = createMaterialTopTabNavigator();

const MyTasksScreen = ({ navigation }) => {
  const { tasks } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { task });
  };

  const AllTasksTab = () => (
    <View style={styles.tabContainer}>
      <TaskList
        tasks={tasks}
        onTaskPress={handleTaskPress}
        emptyMessage="No tasks found"
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );

  const PendingTasksTab = () => {
    const pendingTasks = tasks.filter(
      task => task.status !== TASK_STATUS.COMPLETED
    );
    return (
      <View style={styles.tabContainer}>
        <TaskList
          tasks={pendingTasks}
          onTaskPress={handleTaskPress}
          emptyMessage="No pending tasks"
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    );
  };

  const CompletedTasksTab = () => {
    const completedTasks = tasks.filter(
      task => task.status === TASK_STATUS.COMPLETED
    );
    return (
      <View style={styles.tabContainer}>
        <TaskList
          tasks={completedTasks}
          onTaskPress={handleTaskPress}
          emptyMessage="No completed tasks yet"
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 13 },
        tabBarStyle: { backgroundColor: COLORS.surface },
      }}
    >
      <Tab.Screen name="All" component={AllTasksTab} />
      <Tab.Screen name="Pending" component={PendingTasksTab} />
      <Tab.Screen name="Completed" component={CompletedTasksTab} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default MyTasksScreen;
