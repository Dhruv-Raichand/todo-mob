import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { useTaskDetail } from '../../hooks/useTaskDetail';
import { taskService } from '../../services/taskService';
import { COLORS } from '../../constants/colors';
import { formatDate, getTimeRemaining } from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';
import { STATUS_LABELS } from '../../constants/taskStatus';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { user, userData } = useAuth();
  const { task, comments, loading } = useTaskDetail(taskId);
  const [progress, setProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  React.useEffect(() => {
    if (task) {
      setProgress(task.progress || 0);
    }
  }, [task]);

  const handleUpdateProgress = async () => {
    try {
      setUpdating(true);
      await taskService.updateTaskProgress(taskId, progress);
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
              await taskService.updateTaskProgress(taskId, 100);
              setProgress(100);
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
      await taskService.addComment(taskId, user.uid, userData.name, text);
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
      console.error(error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const deadlineColor = getDeadlineColor(task.deadline);
  const progressColor = getProgressColor(progress);
  const hasProgressChanged = progress !== task.progress;
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
            <Icon name="clock-outline" size={20} color={deadlineColor} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={[styles.infoValue, { color: deadlineColor }]}>
                {formatDate(task.deadline)}
              </Text>
              <Text style={[styles.timeRemaining, { color: deadlineColor }]}>
                {getTimeRemaining(task.deadline)}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.infoRow}>
            <Icon name="information-outline" size={20} color={progressColor} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: progressColor }]}>
                {STATUS_LABELS[task.status]}
              </Text>
            </View>
          </View>
        </Card>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Update Progress</Text>

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
                  {
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>
          </View>

          {!isCompleted && (
            <>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={progress}
                onValueChange={setProgress}
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
                  title="Save Progress"
                  onPress={handleUpdateProgress}
                  loading={updating}
                  style={styles.updateButton}
                />
              )}

              <Button
                title="✓ Mark as Complete"
                onPress={handleMarkComplete}
                variant="secondary"
                disabled={updating}
              />
            </>
          )}

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={48} color={COLORS.success} />
              <Text style={styles.completedText}>Task Completed!</Text>
            </View>
          )}
        </Card>

        {/* Comments Section */}
        <Card style={styles.commentsCard}>
          <View style={styles.commentsHeader}>
            <Icon name="comment-text-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>
              Comments ({comments.length})
            </Text>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet</Text>
          ) : (
            <View style={styles.commentsList}>
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Comment Input */}
      <CommentInput onSend={handleAddComment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  headerCard: {
    margin: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeRemaining: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  quickButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  updateButton: {
    marginBottom: 8,
  },
  completedBadge: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 12,
  },
  commentsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noComments: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
  },
  commentsList: {
    marginTop: 8,
  },
});

export default TaskDetailScreen;
