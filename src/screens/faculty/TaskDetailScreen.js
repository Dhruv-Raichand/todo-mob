import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import CommentItem from '../../components/comment/CommentItem';
import CommentInput from '../../components/comment/CommentInput';
import PriorityBadge from '../../components/task/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { COLORS } from '../../constants/colors';
import { formatDate, getTimeRemaining } from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';
import { getRoleDisplay } from '../../utils/roleUtils';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { user, userData } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');
  const [submittingExtension, setSubmittingExtension] = useState(false);

  useEffect(() => {
    loadTask();
    
    // Subscribe to comments
    const unsubscribeComments = taskService.subscribeToComments(taskId, setComments);

    return () => {
      unsubscribeComments();
    };
  }, [taskId]);

  const loadTask = async () => {
    try {
      const taskData = await taskService.getTask(taskId, user.uid);
      if (taskData) {
        setTask(taskData);
        setProgress(taskData.myProgress?.progress || 0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

const handleRequestExtension = async () => {
  if (!extensionReason.trim()) {
    Alert.alert('Required', 'Please provide a reason for the extension request');
    return;
  }

  try {
    setSubmittingExtension(true);
    
    // Get faculty name from multiple sources
    const facultyName = userData?.name || userData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Unknown Faculty';
    
    console.log('🔍 DEBUG - Extension Request Data:', {
      taskId,
      facultyId: user.uid,
      facultyName: facultyName,
      hasUserData: !!userData,
      userDataKeys: userData ? Object.keys(userData) : [],
      deadline: task.deadline,
      reason: extensionReason.substring(0, 50),
    });

    if (!user?.uid) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    await taskService.requestExtension(
      taskId,
      user.uid,
      facultyName,
      task.deadline,
      extensionReason
    );
    
    setShowExtensionModal(false);
    setExtensionReason('');
    Alert.alert('Success', 'Extension request submitted to Chairman');
  } catch (error) {
    console.error('❌ Extension request error:', error);
    Alert.alert('Error', error.message || 'Failed to submit request');
  } finally {
    setSubmittingExtension(false);
  }
};

  const handleUpdateProgress = async () => {
    try {
      setUpdating(true);
      await taskService.updateFacultyProgress(taskId, user.uid, progress);
      
      setTask(prev => ({
        ...prev,
        myProgress: {
          ...prev.myProgress,
          progress: progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
        },
      }));
      
      Alert.alert('Success', 'Progress updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkComplete = () => {
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this task as 100% complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Complete',
          onPress: async () => {
            try {
              setUpdating(true);
              await taskService.updateFacultyProgress(taskId, user.uid, 100);
              setProgress(100);
              setTask(prev => ({
                ...prev,
                myProgress: {
                  ...prev.myProgress,
                  progress: 100,
                  status: 'completed',
                },
              }));
              Alert.alert('Success', 'Task marked as complete!');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark task complete');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleAddComment = async text => {
    try {
      const commenterName = userData?.name || 'Unknown User';
      await taskService.addComment(taskId, user.uid, commenterName, 'faculty', text);
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
      console.error(error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading task..." />;
  }

  // Wait for userData to load
  if (!userData) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const myProgress = task.myProgress || { progress: 0, status: 'not_started' };
  const deadlineColor = getDeadlineColor(task.deadline);
  const progressColor = getProgressColor(progress);
  const hasProgressChanged = progress !== myProgress.progress;
  const isCompleted = progress === 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{task.title}</Text>
            <PriorityBadge priority={task.priority} />
          </View>

          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}

          {/* Deadline Info */}
          <View style={styles.infoRow}>
            <Icon name="calendar-clock" size={24} color={deadlineColor} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={[styles.infoValue, { color: deadlineColor }]}>
                {formatDate(task.deadline)}
              </Text>
              <Text style={[styles.timeRemaining, { color: deadlineColor }]}>
                {getTimeRemaining(task.deadline)}
              </Text>
            </View>
            {/* Request Extension Button */}
            <TouchableOpacity
              style={styles.extensionIconButton}
              onPress={() => setShowExtensionModal(true)}
            >
              <Icon name="clock-plus-outline" size={24} color={COLORS.warning} />
            </TouchableOpacity>
          </View>

          {/* Chairman Info */}
          <View style={styles.infoRow}>
            <Icon name="account-tie" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Assigned by</Text>
              <Text style={styles.infoValue}>{getRoleDisplay('chairman')}</Text>
            </View>
          </View>
        </Card>

        {/* My Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Icon name="chart-line" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>My Progress</Text>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Current Progress</Text>
            <Text style={[styles.progressValue, { color: progressColor }]}>
              {progress}%
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: progressColor },
                ]}
              />
            </View>
          </View>

          {!isCompleted && (
            <>
              <Slider
                style={styles.slider}
                value={progress}
                onValueChange={setProgress}
                minimumValue={0}
                maximumValue={100}
                step={5}
                minimumTrackTintColor={progressColor}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={progressColor}
              />

              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => setProgress(25)}
                >
                  <Text style={styles.quickButtonText}>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => setProgress(50)}
                >
                  <Text style={styles.quickButtonText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => setProgress(75)}
                >
                  <Text style={styles.quickButtonText}>75%</Text>
                </TouchableOpacity>
              </View>

              {hasProgressChanged && (
                <Button
                  title="Update Progress"
                  onPress={handleUpdateProgress}
                  loading={updating}
                  style={styles.updateButton}
                />
              )}

              <Button
                title="Mark as Complete"
                onPress={handleMarkComplete}
                variant="outline"
                loading={updating}
              />
            </>
          )}

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={64} color={COLORS.success} />
              <Text style={styles.completedText}>Task Completed!</Text>
              <Text style={styles.completedSubtext}>Great job! 🎉</Text>
            </View>
          )}
        </Card>

        {/* Comments Section */}
        <Card style={styles.commentsCard}>
          <View style={styles.cardHeader}>
            <Icon name="comment-text-multiple" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Discussion ({comments.length})</Text>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet. Start the discussion!</Text>
          ) : (
            <View style={styles.commentsList}>
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </View>
          )}
        </Card>

        {/* Comment Input */}
        <CommentInput onSubmit={handleAddComment} />
      </ScrollView>

      {/* Extension Request Modal */}
      <Modal
        visible={showExtensionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExtensionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Extension</Text>
              <TouchableOpacity onPress={() => setShowExtensionModal(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalTaskTitle}>{task?.title}</Text>
              <Text style={styles.modalDeadline}>
                Current Deadline: {formatDate(task?.deadline)}
              </Text>

              <Text style={styles.inputLabel}>Reason for Extension *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Explain why you need more time..."
                placeholderTextColor={COLORS.textSecondary}
                value={extensionReason}
                onChangeText={setExtensionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowExtensionModal(false);
                    setExtensionReason('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleRequestExtension}
                  disabled={submittingExtension}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingExtension ? 'Submitting...' : 'Submit Request'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
  errorText: { fontSize: 18, color: COLORS.textSecondary, marginBottom: 20 },
  headerCard: { margin: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginRight: 12 },
  description: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  timeRemaining: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  extensionIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressCard: { marginHorizontal: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginLeft: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  progressLabel: { fontSize: 14, color: COLORS.textSecondary },
  progressValue: { fontSize: 28, fontWeight: 'bold' },
  progressBarContainer: { marginBottom: 16 },
  progressBar: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  slider: { width: '100%', height: 40 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  quickButton: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.background, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary },
  quickButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  updateButton: { marginBottom: 12 },
  completedBadge: { alignItems: 'center', paddingVertical: 32 },
  completedText: { fontSize: 22, fontWeight: 'bold', color: COLORS.success, marginTop: 16 },
  completedSubtext: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 },
  commentsCard: { marginHorizontal: 16, marginBottom: 16 },
  noComments: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14, paddingVertical: 24, fontStyle: 'italic' },
  commentsList: { marginTop: 8 },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
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
  modalBody: {
    padding: 20,
  },
  modalTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalDeadline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: COLORS.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TaskDetailScreen;
