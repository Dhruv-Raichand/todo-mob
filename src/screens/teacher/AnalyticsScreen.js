import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import { useTasks } from '../../hooks/useTasks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';
import { isOverdue, getDaysUntilDeadline } from '../../utils/dateUtils';

const AnalyticsScreen = () => {
  const { tasks, loading } = useTasks();

  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.progress === 100).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const notStarted = tasks.filter(t => t.progress === 0).length;
    const overdue = tasks.filter(t => isOverdue(t.deadline) && t.progress < 100).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const avgProgress = total > 0
      ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total)
      : 0;

    const priorityBreakdown = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    const dueSoon = tasks.filter(t => {
      const days = getDaysUntilDeadline(t.deadline);
      return days > 0 && days <= 3 && t.progress < 100;
    }).length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate,
      avgProgress,
      priorityBreakdown,
      dueSoon,
    };
  }, [tasks]);

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Overview Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="chart-line" size={28} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.total}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {analytics.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>
              {analytics.inProgress}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.textSecondary }]}>
              {analytics.notStarted}
            </Text>
            <Text style={styles.statLabel}>Not Started</Text>
          </View>
        </View>
      </Card>

      {/* Completion Rate Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="percent-outline" size={28} color={COLORS.success} />
          <Text style={styles.cardTitle}>Completion Rate</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${analytics.completionRate}%`,
                  backgroundColor: COLORS.success,
                },
              ]}
            />
          </View>
          <Text style={styles.progressValue}>{analytics.completionRate}%</Text>
        </View>

        <View style={styles.progressDetails}>
          <Text style={styles.progressText}>
            {analytics.completed} of {analytics.total} tasks completed
          </Text>
        </View>
      </Card>

      {/* Average Progress Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="chart-arc" size={28} color={COLORS.info} />
          <Text style={styles.cardTitle}>Average Progress</Text>
        </View>

        <View style={styles.avgProgressContainer}>
          <Text style={styles.avgProgressValue}>{analytics.avgProgress}%</Text>
          <Text style={styles.avgProgressLabel}>across all tasks</Text>
        </View>
      </Card>

      {/* Priority Breakdown Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="flag-variant-outline" size={28} color={COLORS.warning} />
          <Text style={styles.cardTitle}>Priority Breakdown</Text>
        </View>

        <View style={styles.priorityList}>
          <View style={styles.priorityItem}>
            <View style={styles.priorityLabel}>
              <View style={[styles.priorityDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.priorityText}>Urgent</Text>
            </View>
            <Text style={styles.priorityValue}>
              {analytics.priorityBreakdown.urgent}
            </Text>
          </View>

          <View style={styles.priorityItem}>
            <View style={styles.priorityLabel}>
              <View style={[styles.priorityDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.priorityText}>High</Text>
            </View>
            <Text style={styles.priorityValue}>
              {analytics.priorityBreakdown.high}
            </Text>
          </View>

          <View style={styles.priorityItem}>
            <View style={styles.priorityLabel}>
              <View style={[styles.priorityDot, { backgroundColor: COLORS.info }]} />
              <Text style={styles.priorityText}>Medium</Text>
            </View>
            <Text style={styles.priorityValue}>
              {analytics.priorityBreakdown.medium}
            </Text>
          </View>

          <View style={styles.priorityItem}>
            <View style={styles.priorityLabel}>
              <View style={[styles.priorityDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.priorityText}>Low</Text>
            </View>
            <Text style={styles.priorityValue}>
              {analytics.priorityBreakdown.low}
            </Text>
          </View>
        </View>
      </Card>

      {/* Alerts Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="alert-circle-outline" size={28} color={COLORS.error} />
          <Text style={styles.cardTitle}>Alerts</Text>
        </View>

        <View style={styles.alertsList}>
          {analytics.overdue > 0 && (
            <View style={[styles.alertItem, styles.alertDanger]}>
              <Icon name="alert" size={20} color={COLORS.error} />
              <Text style={styles.alertText}>
                {analytics.overdue} task{analytics.overdue > 1 ? 's' : ''} overdue
              </Text>
            </View>
          )}

          {analytics.dueSoon > 0 && (
            <View style={[styles.alertItem, styles.alertWarning]}>
              <Icon name="clock-alert-outline" size={20} color={COLORS.warning} />
              <Text style={styles.alertText}>
                {analytics.dueSoon} task{analytics.dueSoon > 1 ? 's' : ''} due within 3 days
              </Text>
            </View>
          )}

          {analytics.overdue === 0 && analytics.dueSoon === 0 && (
            <View style={styles.alertItem}>
              <Icon name="check-circle-outline" size={20} color={COLORS.success} />
              <Text style={[styles.alertText, { color: COLORS.success }]}>
                All tasks are on track!
              </Text>
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
    minWidth: 50,
  },
  progressDetails: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  avgProgressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avgProgressValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.info,
  },
  avgProgressLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  priorityList: {
    gap: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  priorityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 16,
    color: COLORS.text,
  },
  priorityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  alertDanger: {
    backgroundColor: `${COLORS.error}10`,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  alertWarning: {
    backgroundColor: `${COLORS.warning}10`,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
});

export default AnalyticsScreen;
