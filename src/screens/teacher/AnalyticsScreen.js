import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { COLORS } from '../../constants/colors';
import { isOverdue } from '../../utils/dateUtils';

const AnalyticsScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = taskService.subscribeToTeacherTasks(user.uid, loadedTasks => {
      console.log('📊 Analytics - Tasks loaded:', loadedTasks.length);
      setTasks(loadedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const analytics = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        totalTasks: 0,
        totalStudents: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        overdueTasks: 0,
        avgProgress: 0,
        completionRate: 0,
        tasksData: [],
      };
    }

    console.log('📈 Calculating analytics for', tasks.length, 'tasks');

    let maxStudents = 0;
    let totalProgressSum = 0;
    let totalProgressCount = 0;
    let completedTasksCount = 0;
    let inProgressTasksCount = 0;
    let notStartedTasksCount = 0;
    let overdueTasksCount = 0;

    const tasksData = tasks.map(task => {
      const studentProgress = task.studentProgress || {};
      const assignedStudents = task.assignedStudents || [];
      const studentCount = assignedStudents.length;

      maxStudents = Math.max(maxStudents, studentCount);

      const progressValues = Object.values(studentProgress);
      
      // Calculate average progress for this task
      const taskAvgProgress = progressValues.length > 0
        ? progressValues.reduce((sum, sp) => sum + (sp?.progress || 0), 0) / progressValues.length
        : 0;

      const taskCompletedStudents = progressValues.filter(sp => sp?.progress === 100).length;
      const taskCompletionRate = studentCount > 0 
        ? (taskCompletedStudents / studentCount) * 100 
        : 0;

      console.log(`Task: ${task.title}`);
      console.log(`  Avg Progress: ${taskAvgProgress.toFixed(1)}%`);
      console.log(`  Completed: ${taskCompletedStudents}/${studentCount}`);

      // Categorize task based on average progress
      if (taskAvgProgress === 100) {
        completedTasksCount++;
      } else if (taskAvgProgress > 0) {
        inProgressTasksCount++;
      } else {
        notStartedTasksCount++;
      }

      if (isOverdue(task.deadline) && taskAvgProgress < 100) {
        overdueTasksCount++;
      }

      totalProgressSum += taskAvgProgress;
      totalProgressCount++;

      return {
        id: task.id,
        title: task.title,
        priority: task.priority,
        avgProgress: Math.round(taskAvgProgress),
        completionRate: Math.round(taskCompletionRate),
        totalStudents: studentCount,
        completedStudents: taskCompletedStudents,
        isOverdue: isOverdue(task.deadline) && taskAvgProgress < 100,
      };
    });

    const avgProgress = totalProgressCount > 0 
      ? Math.round(totalProgressSum / totalProgressCount) 
      : 0;

    const completionRate = tasks.length > 0 
      ? Math.round((completedTasksCount / tasks.length) * 100) 
      : 0;

    console.log('📊 Final Stats:');
    console.log('  Total Tasks:', tasks.length);
    console.log('  Completed:', completedTasksCount);
    console.log('  In Progress:', inProgressTasksCount);
    console.log('  Not Started:', notStartedTasksCount);
    console.log('  Avg Progress:', avgProgress + '%');

    return {
      totalTasks: tasks.length,
      totalStudents: maxStudents,
      completedTasks: completedTasksCount,
      inProgressTasks: inProgressTasksCount,
      notStartedTasks: notStartedTasksCount,
      overdueTasks: overdueTasksCount,
      avgProgress,
      completionRate,
      tasksData,
    };
  }, [tasks]);

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-box-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No tasks created yet</Text>
        <Text style={styles.emptySubtext}>
          Create tasks to see analytics
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Overview Card */}
      <Card style={styles.overviewCard}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.overviewStat}>
            <Icon name="clipboard-text" size={32} color={COLORS.primary} />
            <Text style={styles.overviewValue}>{analytics.totalTasks}</Text>
            <Text style={styles.overviewLabel}>Total Tasks</Text>
          </View>

          <View style={styles.overviewStat}>
            <Icon name="account-group" size={32} color={COLORS.info} />
            <Text style={styles.overviewValue}>{analytics.totalStudents}</Text>
            <Text style={styles.overviewLabel}>Students</Text>
          </View>

          <View style={styles.overviewStat}>
            <Icon name="progress-clock" size={32} color={COLORS.warning} />
            <Text style={styles.overviewValue}>{analytics.inProgressTasks}</Text>
            <Text style={styles.overviewLabel}>In Progress</Text>
          </View>

          <View style={styles.overviewStat}>
            <Icon name="check-circle" size={32} color={COLORS.success} />
            <Text style={styles.overviewValue}>{analytics.completedTasks}</Text>
            <Text style={styles.overviewLabel}>Completed</Text>
          </View>
        </View>

        {analytics.overdueTasks > 0 && (
          <View style={styles.warningBanner}>
            <Icon name="alert" size={20} color={COLORS.error} />
            <Text style={styles.warningText}>
              {analytics.overdueTasks} task(s) overdue
            </Text>
          </View>
        )}
      </Card>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        
        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercentage}>{analytics.avgProgress}%</Text>
            <Text style={styles.progressLabel}>Average</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${analytics.avgProgress}%` },
            ]}
          />
        </View>

        <View style={styles.completionRateContainer}>
          <Text style={styles.completionLabel}>Completion Rate</Text>
          <Text style={[
            styles.completionValue,
            { color: analytics.completionRate > 70 ? COLORS.success : COLORS.warning }
          ]}>
            {analytics.completionRate}%
          </Text>
        </View>
      </Card>

      {/* Tasks Breakdown */}
      <Card style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Tasks Breakdown</Text>
        
        {analytics.tasksData.map(taskData => (
          <View key={taskData.id} style={styles.taskItem}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {taskData.title}
              </Text>
              {taskData.isOverdue && (
                <View style={styles.overdueBadge}>
                  <Icon name="alert" size={12} color="#fff" />
                  <Text style={styles.overdueText}>Overdue</Text>
                </View>
              )}
            </View>

            <View style={styles.taskStats}>
              <View style={styles.taskStat}>
                <Text style={styles.taskStatLabel}>Progress</Text>
                <Text style={[
                  styles.taskStatValue,
                  { color: taskData.avgProgress > 70 ? COLORS.success : COLORS.warning }
                ]}>
                  {taskData.avgProgress}%
                </Text>
              </View>

              <View style={styles.taskStat}>
                <Text style={styles.taskStatLabel}>Students</Text>
                <Text style={styles.taskStatValue}>
                  {taskData.completedStudents}/{taskData.totalStudents}
                </Text>
              </View>

              <View style={styles.taskStat}>
                <Text style={styles.taskStatLabel}>Rate</Text>
                <Text style={[
                  styles.taskStatValue,
                  { color: taskData.completionRate > 70 ? COLORS.success : COLORS.warning }
                ]}>
                  {taskData.completionRate}%
                </Text>
              </View>
            </View>

            <View style={styles.taskProgressBar}>
              <View
                style={[
                  styles.taskProgressFill,
                  {
                    width: `${taskData.avgProgress}%`,
                    backgroundColor: taskData.avgProgress > 70 ? COLORS.success : COLORS.warning,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  overviewCard: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewStat: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.error}15`,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: COLORS.primary,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  completionRateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  completionValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  breakdownCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  taskItem: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  taskStat: {
    alignItems: 'center',
  },
  taskStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  taskStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  taskProgressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default AnalyticsScreen;
