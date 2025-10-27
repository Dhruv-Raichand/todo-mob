import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import {
  formatDate,
  isDeadlineNear,
  isOverdue,
  getTimeRemaining,
} from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';
import PriorityBadge from './PriorityBadge';

const TaskCard = ({ task, onPress }) => {
  const deadlineColor = getDeadlineColor(task.deadline);
  const isNearDeadline = isDeadlineNear(task.deadline);
  const taskOverdue = isOverdue(task.deadline);
  const progressColor = getProgressColor(task.progress || 0);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        taskOverdue && styles.overdueCard,
        isNearDeadline && !taskOverdue && styles.nearDeadlineCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <PriorityBadge priority={task.priority} />
      </View>

      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

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
      <Text style={styles.progressText}>{task.progress || 0}% Complete</Text>

      <View style={styles.footer}>
        <View style={styles.deadlineContainer}>
          <View style={[styles.statusDot, { backgroundColor: deadlineColor }]} />
          <View>
            <Text style={styles.deadlineLabel}>Deadline</Text>
            <Text style={[styles.deadline, taskOverdue && styles.overdueText]}>
              {formatDate(task.deadline)}
            </Text>
            <Text style={styles.timeRemaining}>
              {getTimeRemaining(task.deadline)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  nearDeadlineCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deadlineLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  deadline: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  overdueText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default TaskCard;
