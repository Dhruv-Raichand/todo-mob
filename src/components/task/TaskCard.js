import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../common/Card';
import PriorityBadge from './PriorityBadge';
import { COLORS } from '../../constants/colors';
import { formatDate, getTimeRemaining, isOverdue } from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';

const TaskCard = ({ task, onPress, onLongPress, onViewProgress, isTeacher = false }) => {
  const deadlineColor = getDeadlineColor(task.deadline);
  const overdue = isOverdue(task.deadline);

  // For students: use their own progress
  const progress = isTeacher 
    ? (task.stats?.avgProgress || 0)
    : (task.myProgress?.progress || 0);
  
  const progressColor = getProgressColor(progress);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <Card style={[styles.card, overdue && progress < 100 && styles.overdueCard]}>
          {/* Priority Banner for Urgent */}
          {task.priority === 'urgent' && (
            <View style={styles.urgentBanner}>
              <Text style={styles.urgentText}>🔥 URGENT</Text>
            </View>
          )}

          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {task.title}
              </Text>
            </View>
            <PriorityBadge priority={task.priority} style={styles.priorityBadge} />
          </View>

          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          {/* Teacher Stats - Outside TouchableOpacity */}
          {isTeacher && task.stats && (
            <View style={styles.teacherStats}>
              <View style={styles.statBadge}>
                <Icon name="account-group" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>
                  {task.stats.completedStudents}/{task.stats.totalStudents} completed
                </Text>
              </View>
            </View>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {isTeacher ? 'Average Progress' : 'My Progress'}
              </Text>
              <Text style={[styles.progressPercent, { color: progressColor }]}>
                {Math.round(progress)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progress)}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.deadlineSection}>
              <Icon name="clock-outline" size={16} color={deadlineColor} />
              <View style={styles.deadlineText}>
                <Text style={[styles.deadline, { color: deadlineColor }]}>
                  {formatDate(task.deadline)}
                </Text>
                <Text style={[styles.timeRemaining, { color: deadlineColor }]}>
                  {getTimeRemaining(task.deadline)}
                </Text>
              </View>
            </View>

            {progress === 100 && !isTeacher && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={18} color={COLORS.success} />
                <Text style={styles.completedText}>Done</Text>
              </View>
            )}
          </View>

          {/* Overdue Strip */}
          {overdue && progress < 100 && (
            <View style={styles.overdueStrip}>
              <Icon name="alert" size={14} color="#fff" />
              <Text style={styles.overdueText}>OVERDUE</Text>
            </View>
          )}

          {/* Long Press Hint for Teachers */}
          {isTeacher && (
            <View style={styles.longPressHint}>
              <Text style={styles.longPressText}>Hold to edit</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>

      {/* View Progress Button - OUTSIDE the main TouchableOpacity */}
      {isTeacher && onViewProgress && (
        <TouchableOpacity 
          style={styles.viewProgressButtonWrapper}
          onPress={() => onViewProgress(task)}
          activeOpacity={0.7}
        >
          <View style={styles.viewProgressButton}>
            <Icon name="chart-line" size={18} color="#fff" />
            <Text style={styles.viewProgressText}>View Progress</Text>
            <Icon name="chevron-right" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  overdueCard: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  urgentBanner: {
    backgroundColor: COLORS.error,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  priorityBadge: {
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  teacherStats: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 8,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewProgressButtonWrapper: {
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
  },
  viewProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewProgressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 6,
  },
  deadline: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 11,
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  overdueStrip: {
    position: 'absolute',
    top: 8,
    right: -30,
    backgroundColor: COLORS.error,
    paddingHorizontal: 40,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overdueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  longPressHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  longPressText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default TaskCard;
