import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTaskDetail } from '../../hooks/useTaskDetail';
import { taskService } from '../../services/taskService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PriorityBadge from '../../components/task/PriorityBadge';
import CommentList from '../../components/comments/CommentList';
import CommentInput from '../../components/comments/CommentInput';
import { COLORS } from '../../constants/colors';
import { TASK_STATUS, STATUS_LABELS } from '../../constants/taskStatus';
import { formatDate, getTimeRemaining } from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task: routeTask } = route.params;
  const { user, userData } = useAuth();
  const { task, comments, loading } = useTaskDetail(routeTask.id);
  const [progressValue, setProgressValue] = useState(routeTask.progress || 0);
  const [updating, setUpdating] = useState(false);

  const currentTask = task || routeTask;

  if (loading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  const handleUpdateProgress = async newProgress => {
    setUpdating(true);
    try {
      await taskService.updateTaskProgress(currentTask.id, newProgress);
      setProgressValue(newProgress);
      Alert.alert('Success', 'Progress updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async newStatus => {
    try {
      await taskService.updateTaskStatus(currentTask.id, newStatus);
      Alert.alert('Success', 'Status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAddComment = async commentText => {
    try {
      await taskService.addComment(
        currentTask.id,
        user.uid,
        userData.name,
        commentText
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleDeleteComment = async commentId => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await taskService.deleteComment(currentTask.id, commentId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  const deadlineColor = getDeadlineColor(currentTask.deadline);
  const progressColor = getProgressColor(currentTask.progress || 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{currentTask.title}</Text>
            <PriorityBadge priority={currentTask.priority} />
          </View>

          {currentTask.description && (
            <Text style={styles.description}>{currentTask.description}</Text>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {STATUS_LABELS[currentTask.status] || 'Not Started'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={[styles.infoValue, { color: deadlineColor }]}>
                {formatDate(currentTask.deadline)}
              </Text>
              <Text style={styles.timeRemaining}>
                {getTimeRemaining(currentTask.deadline)}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${currentTask.progress || 0}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentTask.progress || 0}% Complete
          </Text>

          <Text style={styles.updateLabel}>Update Progress:</Text>
          <View style={styles.progressButtons}>
            {[0, 25, 50, 75, 100].map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.progressButton,
                  currentTask.progress === value && styles.progressButtonActive,
                ]}
                onPress={() => handleUpdateProgress(value)}
                disabled={updating}
              >
                <Text
                  style={[
                    styles.progressButtonText,
                    currentTask.progress === value &&
                      styles.progressButtonTextActive,
                  ]}
                >
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusButtons}>
            <Button
              title="Mark In Progress"
              onPress={() => handleUpdateStatus(TASK_STATUS.IN_PROGRESS)}
              variant={
                currentTask.status === TASK_STATUS.IN_PROGRESS
                  ? 'primary'
                  : 'outline'
              }
              style={styles.statusButton}
            />
            <Button
              title="Mark Completed"
              onPress={() => handleUpdateStatus(TASK_STATUS.COMPLETED)}
              variant={
                currentTask.status === TASK_STATUS.COMPLETED
                  ? 'primary'
                  : 'outline'
              }
              style={styles.statusButton}
            />
          </View>
        </Card>

        <Card style={styles.commentsCard}>
          <Text style={styles.sectionTitle}>
            Comments ({comments.length})
          </Text>
          <CommentList
            comments={comments}
            onDeleteComment={handleDeleteComment}
          />
        </Card>
      </ScrollView>

      <CommentInput onSubmit={handleAddComment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeRemaining: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  updateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  progressButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressButtonTextActive: {
    color: '#fff',
  },
  statusCard: {
    marginBottom: 16,
  },
  statusButtons: {
    gap: 8,
  },
  statusButton: {
    marginVertical: 0,
  },
  commentsCard: {
    marginBottom: 16,
  },
});

export default TaskDetailScreen;
