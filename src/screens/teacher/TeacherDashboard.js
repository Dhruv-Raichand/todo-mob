import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { taskService } from '../../services/taskService';
import TaskList from '../../components/task/TaskList';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';
import { isOverdue } from '../../utils/dateUtils';
import { PRIORITY_LIST } from '../../constants/priorities';

const TeacherDashboard = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const { tasks, loading } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0, overdue: 0 };
    }

    const total = tasks.length;
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    let overdueCount = 0;

    tasks.forEach(task => {
      const avgProgress = task.stats?.avgProgress || 0;
      const isTaskOverdue = isOverdue(task.deadline);

      if (avgProgress === 100) {
        completedCount++;
      } else if (avgProgress > 0) {
        inProgressCount++;
      } else {
        notStartedCount++;
      }

      if (isTaskOverdue && avgProgress < 100) {
        overdueCount++;
      }
    });

    return {
      total,
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
      overdue: overdueCount,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    if (filter === 'completed') {
      return tasks.filter(t => t.stats?.avgProgress === 100);
    }
    if (filter === 'active') {
      return tasks.filter(t => t.stats?.avgProgress < 100);
    }
    if (filter === 'overdue') {
      return tasks.filter(t => isOverdue(t.deadline) && t.stats?.avgProgress < 100);
    }
    return tasks;
  }, [tasks, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleViewProgress = task => {
    navigation.navigate('StudentProgress', { taskId: task.id });
  };

  const handleEditTask = task => {
    navigation.navigate('EditTask', { taskId: task.id });
  };

  const handleChangePriority = task => {
    setSelectedTask(task);
    setShowPriorityModal(true);
  };

  const handleDeleteTask = task => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(task.id);
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const updatePriority = async priority => {
    try {
      await taskService.updateTaskPriority(selectedTask.id, priority);
      setShowPriorityModal(false);
      setSelectedTask(null);
      Alert.alert('Success', 'Priority updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update priority');
    }
  };

  const handleCreateTask = () => {
    navigation.navigate('CreateTask');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('Analytics');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleTaskLongPress = task => {
    Alert.alert(
      'Task Options',
      `What would you like to do with "${task.title}"?`,
      [
        {
          text: 'View Details',
          onPress: () => handleTaskPress(task),
        },
        {
          text: 'View Progress',
          onPress: () => handleViewProgress(task),
        },
        {
          text: 'Edit',
          onPress: () => handleEditTask(task),
        },
        {
          text: 'Change Priority',
          onPress: () => handleChangePriority(task),
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteTask(task),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{userData?.name || 'Teacher'}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleViewAnalytics}
            style={styles.analyticsButton}
          >
            <Icon name="chart-box-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
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

      {/* Create Task Button */}
      <View style={styles.createButtonContainer}>
        <Button
          title="+ Create New Task"
          onPress={handleCreateTask}
          style={styles.createButton}
        />
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
            All ({tasks?.length || 0})
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
        onTaskLongPress={handleTaskLongPress}
        onViewProgress={handleViewProgress}
        isTeacher={true}
        emptyMessage={
          filter === 'completed'
            ? 'No completed tasks yet'
            : filter === 'active'
            ? 'No active tasks'
            : 'No tasks created yet. Create your first task!'
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Priority Change Modal */}
      <Modal
        visible={showPriorityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Priority</Text>
            <Text style={styles.modalSubtitle}>
              {selectedTask?.title}
            </Text>

            <View style={styles.priorityOptions}>
              {PRIORITY_LIST.map(priority => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityOption,
                    {
                      backgroundColor: `${priority.color}15`,
                      borderColor: priority.color,
                    },
                  ]}
                  onPress={() => updatePriority(priority.value)}
                >
                  <View style={styles.priorityOptionContent}>
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priority.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityOptionText,
                        { color: priority.color },
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </View>
                  {selectedTask?.priority === priority.value && (
                    <Icon name="check-circle" size={24} color={priority.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Cancel"
              onPress={() => setShowPriorityModal(false)}
              variant="outline"
            />
          </View>
        </View>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsButton: {
    padding: 8,
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
    textAlign: 'center',
  },
  createButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createButton: {
    backgroundColor: COLORS.secondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  priorityOptions: {
    gap: 12,
    marginBottom: 24,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  priorityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeacherDashboard;
