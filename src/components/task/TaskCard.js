import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../common/Card';
import PriorityBadge from './PriorityBadge';
import { COLORS } from '../../constants/colors';
import { formatDate, getTimeRemaining, isOverdue } from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';

const TaskCard = ({ task, onPress, onLongPress, isTeacher = false }) => {
  const deadlineColor = getDeadlineColor(task.deadline);
  const progressColor = getProgressColor(task.progress || 0);
  const overdue = isOverdue(task.deadline);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <Card style={[styles.card, overdue && task.progress < 100 && styles.overdueCard]}>
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

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressPercent, { color: progressColor }]}>
              {task.progress || 0}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${task.progress || 0}%`,
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

          {task.progress === 100 && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={18} color={COLORS.success} />
              <Text style={styles.completedText}>Done</Text>
            </View>
          )}
        </View>

        {/* Overdue Strip */}
        {overdue && task.progress < 100 && (
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
  );
};

const styles = StyleSheet.create({
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
    paddingVertical: 4,
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
