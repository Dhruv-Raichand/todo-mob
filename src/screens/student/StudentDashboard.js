import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import TaskList from '../../components/task/TaskList';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';
import { isOverdue } from '../../utils/dateUtils';

const StudentDashboard = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const { tasks, loading } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.progress === 100).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const overdue = tasks.filter(t => isOverdue(t.deadline) && t.progress < 100).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'completed') {
      return tasks.filter(t => t.progress === 100);
    }
    if (filter === 'active') {
      return tasks.filter(t => t.progress < 100);
    }
    return tasks;
  }, [tasks, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Tasks auto-refresh via real-time listener
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your tasks..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{userData?.name || 'Student'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="clipboard-text-outline" size={32} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="progress-clock" size={32} color={COLORS.info} />
          <Text style={styles.statValue}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="check-circle-outline" size={32} color={COLORS.success} />
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>

        {stats.overdue > 0 && (
          <Card style={[styles.statCard, styles.overdueCard]}>
            <Icon name="alert-circle-outline" size={32} color={COLORS.error} />
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {stats.overdue}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'active' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'active' && styles.filterTextActive,
            ]}
          >
            Active ({stats.inProgress + (stats.total - stats.completed - stats.inProgress)})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.filterTextActive,
            ]}
          >
            Done ({stats.completed})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        onTaskPress={handleTaskPress}
        emptyMessage={
          filter === 'completed'
            ? 'No completed tasks yet'
            : filter === 'active'
            ? 'No active tasks'
            : 'No tasks assigned yet'
        }
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
  },
  overdueCard: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
});

export default StudentDashboard;
