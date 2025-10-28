import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../common/Card';
import PriorityBadge from './PriorityBadge';
import { COLORS } from '../../constants/colors';
import { formatDate, getTimeRemaining } from '../../utils/dateUtils';
import { getDeadlineColor, getProgressColor } from '../../utils/colorUtils';
import { STATUS_LABELS } from '../../constants/taskStatus';

const TaskCard = ({ task, onPress }) => {
  const deadlineColor = getDeadlineColor(task.deadline);
  const progressColor = getProgressColor(task.progress || 0);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
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

        <View style={styles.progressContainer}>
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
          <Text style={styles.progressText}>{task.progress || 0}%</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.deadlineContainer}>
            <Icon name="clock-outline" size={16} color={deadlineColor} />
            <Text style={[styles.deadline, { color: deadlineColor }]}>
              {formatDate(task.deadline)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${progressColor}15` },
            ]}
          >
            <Text style={[styles.statusText, { color: progressColor }]}>
              {STATUS_LABELS[task.status] || 'Not Started'}
            </Text>
          </View>
        </View>

        <View style={styles.timeRemaining}>
          <Text style={[styles.timeText, { color: deadlineColor }]}>
            {getTimeRemaining(task.deadline)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRemaining: {
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TaskCard;
