import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTasks } from '../../hooks/useTasks';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { TASK_STATUS } from '../../constants/taskStatus';
import { PRIORITIES } from '../../constants/priorities';

const AnalyticsScreen = () => {
  const { tasks } = useTasks();

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    task => task.status === TASK_STATUS.COMPLETED
  ).length;
  const inProgressTasks = tasks.filter(
    task => task.status === TASK_STATUS.IN_PROGRESS
  ).length;
  const notStartedTasks = tasks.filter(
    task => task.status === TASK_STATUS.NOT_STARTED
  ).length;

  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  // Priority breakdown
  const priorityBreakdown = {
    urgent: tasks.filter(task => task.priority === 'urgent').length,
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };

  // Average progress
  const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
  const averageProgress =
    totalTasks > 0 ? (totalProgress / totalTasks).toFixed(1) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.pageTitle}>Task Analytics 📊</Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {totalTasks}
            </Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>
              {completedTasks}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.info }]}>
              {inProgressTasks}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>
              {notStartedTasks}
            </Text>
            <Text style={styles.statLabel}>Not Started</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Completion Rate</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionRate}%` },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{completionRate}%</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Average Progress</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${averageProgress}%`,
                  backgroundColor: COLORS.info,
                },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{averageProgress}%</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Priority Breakdown</Text>
        <View style={styles.priorityList}>
          {Object.entries(priorityBreakdown).map(([key, count]) => (
            <View key={key} style={styles.priorityItem}>
              <View style={styles.priorityLeft}>
                <View
                  style={[
                    styles.priorityDot,
                    {
                      backgroundColor:
                        PRIORITIES[key.toUpperCase()]?.color || COLORS.textSecondary,
                    },
                  ]}
                />
                <Text style={styles.priorityLabel}>
                  {PRIORITIES[key.toUpperCase()]?.label || key}
                </Text>
              </View>
              <Text style={styles.priorityCount}>{count}</Text>
            </View>
          ))}
        </View>
      </Card>

      {totalTasks === 0 && (
        <Card style={styles.card}>
          <Text style={styles.emptyText}>
            No tasks created yet. Start creating tasks to see analytics!
          </Text>
        </Card>
      )}
    </ScrollView>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 50,
  },
  priorityList: {
    gap: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  priorityCount: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
