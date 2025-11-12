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
import { COLORS } from '../../constants/colors';
import { TASK_STATUS } from '../../constants/taskStatus';

const FacultyDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [extensionModalVisible, setExtensionModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    console.log('🎯 Setting up faculty dashboard for:', user.uid);
    
    const unsubscribe = taskService.subscribeToFacultyTasks(
      user.uid,
      (fetchedTasks) => {
        console.log('✅ Tasks received:', fetchedTasks.length);
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // The real-time listener will automatically update
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleRequestExtension = task => {
    setSelectedTask(task);
    setExtensionModalVisible(true);
  };

  const handleSubmitExtension = async (reason) => {
    if (!selectedTask) return;

    try {
      await taskService.requestExtension(
        selectedTask.id,
        user.uid,
        user.name,
        selectedTask.deadline,
        reason
      );
      Alert.alert('Success', 'Extension request submitted to Chairman');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit extension request');
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(t => t.myProgress.status !== TASK_STATUS.COMPLETED);
      case 'completed':
        return tasks.filter(t => t.myProgress.status === TASK_STATUS.COMPLETED);
      default:
        return tasks;
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.myProgress.status === TASK_STATUS.COMPLETED).length;
    const pending = total - completed;
    const avgProgress = total > 0
      ? Math.round(tasks.reduce((sum, t) => sum + (t.myProgress.progress || 0), 0) / total)
      : 0;

    return { total, completed, pending, avgProgress };
  };

  const stats = getStats();
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="clipboard-text" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="progress-clock" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="chart-line" size={24} color={COLORS.info} />
          <Text style={styles.statNumber}>{stats.avgProgress}%</Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
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
        onSubmit={handleSubmitExtension}
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
