import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TaskCard from '../../components/task/TaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/dateUtils';

const ChairmanDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    console.log('🎯 Setting up chairman dashboard for:', user.uid);
    
    const unsubscribeTasks = taskService.subscribeToChairmanTasks(
      user.uid,
      (fetchedTasks) => {
        console.log('✅ Tasks received:', fetchedTasks.length);
        setTasks(fetchedTasks);
        setLoading(false);
      }
    );

    // FIXED: Safe extension requests subscription
    const unsubscribeExtensions = taskService.subscribeToExtensionRequests(
      user.uid,
      (requests) => {
        console.log('🔔 Extension requests received:', requests.length);
        console.log('📋 Requests data:', JSON.stringify(requests, null, 2));
        setExtensionRequests(requests || []);
      }
    );

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeExtensions) unsubscribeExtensions();
    };
  }, [user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Manually check for extension requests
    try {
      const allRequests = [];
      for (const task of tasks) {
        const requests = await taskService.getExtensionRequests(task.id);
        allRequests.push(...requests.map(r => ({ ...r, taskId: task.id, taskTitle: task.title })));
      }
      console.log('🔄 Manually fetched requests:', allRequests.length);
      if (allRequests.length > 0) {
        setExtensionRequests(allRequests);
      }
    } catch (error) {
      console.error('Error manually checking requests:', error);
    }
    
    setRefreshing(false);
  }, [tasks]);

  // Manual check function
  const checkExtensionRequestsManually = async () => {
    try {
      console.log('🔍 Manually checking extension requests...');
      
      const allRequests = [];
      for (const task of tasks) {
        console.log(`📋 Checking task: ${task.id} - ${task.title}`);
        const requests = await taskService.getExtensionRequests(task.id);
        console.log(`   ✅ Found ${requests.length} requests for this task`);
        
        requests.forEach(r => {
          console.log(`      - Request from: ${r.facultyName}, Reason: ${r.reason}`);
        });
        
        allRequests.push(...requests.map(r => ({ 
          ...r, 
          taskId: task.id, 
          taskTitle: task.title 
        })));
      }
      
      console.log('📊 Total requests found:', allRequests.length);
      console.log('📄 All requests:', JSON.stringify(allRequests, null, 2));
      
      if (allRequests.length > 0) {
        setExtensionRequests(allRequests);
        Alert.alert(
          'Extension Requests Found!', 
          `Found ${allRequests.length} pending request(s).`,
          [
            { text: 'View', onPress: () => setShowExtensionModal(true) },
            { text: 'Later', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('No Requests', 'No pending extension requests found.');
      }
    } catch (error) {
      console.error('❌ Error checking requests:', error);
      Alert.alert('Error', error.message || 'Failed to check extension requests');
    }
  };

  const handleTaskPress = task => {
    navigation.navigate('StudentProgress', { taskId: task.id });
  };

  const handleLongPress = task => {
    Alert.alert(
      'Task Options',
      `What would you like to do with "${task.title}"?`,
      [
        {
          text: 'Edit',
          onPress: () => navigation.navigate('EditTask', { taskId: task.id }),
        },
        {
          text: 'Delete',
          onPress: () => confirmDeleteTask(task.id),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const confirmDeleteTask = taskId => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await taskService.deleteTask(taskId);
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleApproveExtension = async (request, days) => {
    try {
      await taskService.approveExtension(request.taskId, request.id, days);
      Alert.alert('Success', `Extension of ${days} days approved!`);
      
      // Remove from local state
      setExtensionRequests(prev => prev.filter(r => r.id !== request.id));
      
      // Refresh
      setTimeout(() => onRefresh(), 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to approve extension');
      console.error('Approve error:', error);
    }
  };

  const handleRejectExtension = async (request) => {
    Alert.prompt(
      'Reject Extension',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (reason) {
          try {
            await taskService.rejectExtension(request.taskId, request.id, reason);
            Alert.alert('Success', 'Extension request rejected');
            
            // Remove from local state
            setExtensionRequests(prev => prev.filter(r => r.id !== request.id));
            
            // Refresh
            setTimeout(() => onRefresh(), 1000);
          } catch (error) {
            Alert.alert('Error', 'Failed to reject extension');
          }
        }
      }
    );
  };

  const getFilteredTasks = () => {
    const now = new Date();
    switch (filter) {
      case 'active':
        return tasks.filter(t => {
          const deadline = t.deadline.toDate();
          return deadline >= now && t.stats.completedFaculty < t.stats.totalFaculty;
        });
      case 'completed':
        return tasks.filter(t => t.stats.completedFaculty === t.stats.totalFaculty);
      case 'overdue':
        return tasks.filter(t => {
          const deadline = t.deadline.toDate();
          return deadline < now && t.stats.completedFaculty < t.stats.totalFaculty;
        });
      default:
        return tasks;
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const now = new Date();
    const active = tasks.filter(t => {
      const deadline = t.deadline.toDate();
      return deadline >= now && t.stats.completedFaculty < t.stats.totalFaculty;
    }).length;
    const completed = tasks.filter(t => t.stats.completedFaculty === t.stats.totalFaculty).length;
    const overdue = tasks.filter(t => {
      const deadline = t.deadline.toDate();
      return deadline < now && t.stats.completedFaculty < t.stats.totalFaculty;
    }).length;

    return { total, active, completed, overdue };
  };

  const stats = getStats();
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Extension Notification Badge */}
      {extensionRequests.length > 0 && (
        <TouchableOpacity
          style={styles.extensionBanner}
          onPress={() => setShowExtensionModal(true)}
        >
          <Icon name="clock-alert" size={20} color="#fff" />
          <Text style={styles.extensionBannerText}>
            {extensionRequests.length} Extension Request{extensionRequests.length > 1 ? 's' : ''} Pending
          </Text>
          <Icon name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="clipboard-text" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="progress-clock" size={24} color={COLORS.info} />
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="alert-circle" size={24} color={COLORS.error} />
          <Text style={styles.statNumber}>{stats.overdue}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'overdue' && styles.filterTabActive]}
          onPress={() => setFilter('overdue')}
        >
          <Text style={[styles.filterText, filter === 'overdue' && styles.filterTextActive]}>
            Overdue
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
            onLongPress={() => handleLongPress(item)}
            isChairman={true}
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
            <Text style={styles.emptySubtext}>Create your first task to get started</Text>
          </View>
        }
      />

      {/* Extension Check FAB - Bottom Left */}
      <TouchableOpacity
        style={styles.extensionFab}
        onPress={checkExtensionRequestsManually}
      >
        <Icon name="clock-check" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Create Task FAB - Bottom Right */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Extension Requests Modal */}
      <Modal
        visible={showExtensionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExtensionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Extension Requests ({extensionRequests.length})</Text>
              <TouchableOpacity onPress={() => setShowExtensionModal(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.requestsList}>
              {extensionRequests.length === 0 ? (
                <Text style={styles.emptyRequestsText}>No pending requests</Text>
              ) : (
                extensionRequests.map((request) => (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Icon name="account" size={20} color={COLORS.primary} />
                      <Text style={styles.requestFacultyName}>{request.facultyName}</Text>
                    </View>

                    <Text style={styles.requestTaskTitle}>Task: {request.taskTitle}</Text>

                    <Text style={styles.requestTime}>
                      {request.requestedAt ? formatDateTime(request.requestedAt) : 'Just now'}
                    </Text>

                    <View style={styles.requestReason}>
                      <Text style={styles.requestReasonLabel}>Reason:</Text>
                      <Text style={styles.requestReasonText}>{request.reason}</Text>
                    </View>

                    <View style={styles.requestActions}>
                      <Text style={styles.quickApproveLabel}>Quick Approve:</Text>
                      <View style={styles.quickButtons}>
                        <TouchableOpacity
                          style={styles.quickButton}
                          onPress={() => handleApproveExtension(request, 2)}
                        >
                          <Text style={styles.quickButtonText}>+2 Days</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickButton}
                          onPress={() => handleApproveExtension(request, 4)}
                        >
                          <Text style={styles.quickButtonText}>+4 Days</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickButton}
                          onPress={() => handleApproveExtension(request, 7)}
                        >
                          <Text style={styles.quickButtonText}>+7 Days</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectExtension(request)}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
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
  extensionBanner: {
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  extensionBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
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
    paddingBottom: 80,
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
  // NEW: Extension Check FAB (bottom left)
  extensionFab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Create Task FAB (bottom right)
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  requestsList: {
    padding: 16,
  },
  emptyRequestsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 16,
    paddingVertical: 40,
  },
  requestCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requestFacultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  requestTaskTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  requestTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  requestReason: {
    marginBottom: 16,
  },
  requestReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  requestReasonText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  requestActions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  quickApproveLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChairmanDashboard;
