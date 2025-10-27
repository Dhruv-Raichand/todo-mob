import React, { useState } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import TaskList from '../../components/task/TaskList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { TASK_STATUS } from '../../constants/taskStatus';

const StudentDashboard = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const { tasks, loading } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { task });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading your tasks..." />;
  }

  const incompleteTasks = tasks.filter(
    task => task.status !== TASK_STATUS.COMPLETED
  );
  const completedTasks = tasks.filter(
    task => task.status === TASK_STATUS.COMPLETED
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.name}! 👋</Text>
          <Text style={styles.subtitle}>
            You have {incompleteTasks.length} pending task
            {incompleteTasks.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          textStyle={styles.logoutText}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>
            {incompleteTasks.length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {completedTasks.length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <TaskList
        tasks={tasks}
        onTaskPress={handleTaskPress}
        emptyMessage="No tasks assigned yet 📝"
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 0,
  },
  logoutText: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default StudentDashboard;
