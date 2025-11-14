import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TaskCard from '../../components/task/TaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ExtensionRequestModal from '../../components/task/ExtensionRequestModal';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { notificationService } from '../../services/notificationService'; // ✅ ADD THIS
import { COLORS } from '../../constants/colors';
import { TASK_STATUS } from '../../constants/taskStatus';

const FacultyDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [extensionModalVisible, setExtensionModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ ADD THIS

  useEffect(() => {
    if (!user?.uid) return;

    console.log('👤 Faculty Dashboard - User ID:', user.uid);
    
    const unsubscribe = taskService.subscribeToFacultyTasks(
      user.uid,
      (fetchedTasks) => {
        console.log('✅ Tasks received in dashboard:', fetchedTasks.length);
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error in dashboard:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up faculty tasks subscription');
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  // ✅ ADD THIS: Subscribe to notifications for unread count
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (notifications) => {
        const count = notifications.filter(n => !n.read).length;
        setUnreadCount(count);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleRequestExtension = (task) => {
    setSelectedTask(task);
    setExtensionModalVisible(true);
  };

  const handleExtensionSubmit = async (reason) => {
    try {
      if (!selectedTask) return;

      const facultyName = user.name || user.displayName || user.email?.split('@')[0] || 'Faculty Member';

      await taskService.requestExtension(
        selectedTask.id,
        user.uid,
        facultyName,
        selectedTask.deadline,
        reason
      );

      Alert.alert('Success', 'Extension request submitted successfully');
      setExtensionModalVisible(false);
      setSelectedTask(null);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit extension request');
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(t => 
          t.myProgress.status === TASK_STATUS.NOT_STARTED || 
          t.myProgress.status === TASK_STATUS.IN_PROGRESS
        );
      case 'completed':
        return tasks.filter(t => t.myProgress.status === TASK_STATUS.COMPLETED);
      default:
        return tasks;
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => 
      t.myProgress.status === TASK_STATUS.NOT_STARTED || 
      t.myProgress.status === TASK_STATUS.IN_PROGRESS
    ).length;
    const completed = tasks.filter(t => t.myProgress.status === TASK_STATUS.COMPLETED).length;
    const avgProgress = tasks.length > 0 
      ? tasks.reduce((sum, t) => sum + (t.myProgress.progress || 0), 0) / tasks.length 
      : 0;

    return { total, pending, completed, avgProgress: Math.round(avgProgress) };
  };

  const stats = getStats();
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* ✅ ADD THIS: Header with Notification Bell */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name || 'Faculty'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell" size={26} color={COLORS.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="clipboard-text" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="clock-outline" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="chart-arc" size={24} color={COLORS.info} />
          <Text style={styles.statNumber}>{stats.avgProgress}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending ({stats.pending})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed ({stats.completed})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onRequestExtension={handleRequestExtension}
            isChairman={false}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-check-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        }
      />

      <ExtensionRequestModal
        visible={extensionModalVisible}
        task={selectedTask}
        onClose={() => {
          setExtensionModalVisible(false);
          setSelectedTask(null);
        }}
        onSubmit={handleExtensionSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default FacultyDashboard;
