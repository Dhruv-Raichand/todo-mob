import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { taskService } from '../../services/taskService';
import { COLORS } from '../../constants/colors';
import { getProgressColor } from '../../utils/colorUtils';
import { STATUS_LABELS } from '../../constants/taskStatus';
import { getRoleDisplay } from '../../utils/roleUtils';

const StudentProgressScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [taskId]);

  const loadProgressData = async () => {
    try {
      const data = await taskService.getStudentProgressDetails(taskId);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentItem = ({ item }) => {
    const progressColor = getProgressColor(item.progress);
    
    return (
      <Card style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={48} color={COLORS.primary} />
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentEmail}>{item.email}</Text>
          </View>
          {item.progress === 100 && (
            <Icon name="check-circle" size={32} color={COLORS.success} />
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: progressColor }]}>
              {item.progress}%
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${item.progress}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>

          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: progressColor }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {item.lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(item.lastUpdated.toDate()).toLocaleString()}
          </Text>
        )}
      </Card>
    );
  };

  const renderStats = () => {
    if (!progressData || !progressData.students.length) return null;

    const totalStudents = progressData.students.length;
    const completed = progressData.students.filter(s => s.progress === 100).length;
    const inProgress = progressData.students.filter(s => s.progress > 0 && s.progress < 100).length;
    const notStarted = progressData.students.filter(s => s.progress === 0).length;
    const avgProgress = Math.round(
      progressData.students.reduce((sum, s) => sum + s.progress, 0) / totalStudents
    );

    return (
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Overall Progress</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="account-group" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="check-circle" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="progress-clock" size={32} color={COLORS.info} />
            <Text style={styles.statValue}>{inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="circle-outline" size={32} color={COLORS.textSecondary} />
            <Text style={styles.statValue}>{notStarted}</Text>
            <Text style={styles.statLabel}>Not Started</Text>
          </View>
        </View>

        <View style={styles.avgProgressContainer}>
          <Text style={styles.avgLabel}>Average Progress</Text>
          <Text style={[styles.avgValue, { color: getProgressColor(avgProgress) }]}>
            {avgProgress}%
          </Text>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading student progress..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={progressData?.students || []}
        keyExtractor={item => item.id}
        renderItem={renderStudentItem}
        ListHeaderComponent={renderStats}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students assigned to this task</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  avgProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  avgLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  avgValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  studentCard: {
    marginBottom: 16,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  studentEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 40,
  },
});

export default StudentProgressScreen;
