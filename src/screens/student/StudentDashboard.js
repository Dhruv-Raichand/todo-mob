import React, { useState, useMemo, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import TaskList from '../../components/task/TaskList';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';
import { isOverdue } from '../../utils/dateUtils';

const StudentDashboard = ({ navigation }) => {
  const { user, userData, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force update on screen focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Student Dashboard focused - forcing update');
      setForceUpdate(prev => prev + 1);
    }, [])
  );

  // Real-time subscription
  useEffect(() => {
    console.log('Student Dashboard - Setting up subscription for:', user.uid);
    
    const unsubscribe = taskService.subscribeToStudentTasks(user.uid, loadedTasks => {
      console.log('Student tasks updated:', loadedTasks.length);
      loadedTasks.forEach(t => {
        console.log(`  - ${t.title}: ${t.myProgress?.progress}%`);
      });
      setTasks(loadedTasks);
      setLoading(false);
    });

    return () => {
      console.log('Student Dashboard - Unsubscribing');
      unsubscribe();
    };
  }, [user.uid, forceUpdate]);

  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0, overdue: 0 };
    }

    const total = tasks.length;
    const completed = tasks.filter(t => t.myProgress?.progress === 100).length;
    const inProgress = tasks.filter(
      t => (t.myProgress?.progress || 0) > 0 && (t.myProgress?.progress || 0) < 100
    ).length;
    const notStarted = tasks.filter(t => (t.myProgress?.progress || 0) === 0).length;
    const overdue = tasks.filter(
      t => isOverdue(t.deadline) && (t.myProgress?.progress || 0) < 100
    ).length;

    console.log('Student Dashboard Stats:', { total, completed, inProgress, notStarted, overdue });

    return { total, completed, inProgress, notStarted, overdue };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    if (filter === 'completed') {
      return tasks.filter(t => t.myProgress?.progress === 100);
    }
    if (filter === 'active') {
      return tasks.filter(t => (t.myProgress?.progress || 0) < 100);
    }
    if (filter === 'overdue') {
      return tasks.filter(
        t => isOverdue(t.deadline) && (t.myProgress?.progress || 0) < 100
      );
    }
    return tasks;
  }, [tasks, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    // The real-time listener will update automatically
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
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
          <Icon name="clipboard-text-outline" size={28} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="progress-clock" size={28} color={COLORS.info} />
          <Text style={styles.statValue}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="check-circle-outline" size={28} color={COLORS.success} />
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </Card>

        {stats.overdue > 0 && (
          <Card style={[styles.statCard, styles.overdueCard]}>
            <Icon name="alert-circle-outline" size={28} color={COLORS.error} />
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
            All ({stats.total})
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
            Active ({stats.inProgress + stats.notStarted})
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
});

export default StudentDashboard;
