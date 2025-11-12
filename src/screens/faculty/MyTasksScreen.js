import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import TaskCard from '../../components/task/TaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ExtensionRequestModal from '../../components/task/ExtensionRequestModal';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { COLORS } from '../../constants/colors';

const MyTasksScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { tasks, loading, refreshTasks } = useTasks(user?.uid, false); // false = faculty
  const [refreshing, setRefreshing] = useState(false);
  const [extensionModalVisible, setExtensionModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  }, [refreshTasks]);

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleRequestExtension = task => {
    setSelectedTask(task);
    setExtensionModalVisible(true);
  };

  const handleSubmitExtension = async (reason) => {
    if (!selectedTask) return;

    await taskService.requestExtension(
      selectedTask.id,
      user.uid,
      user.name,
      selectedTask.deadline,
      reason
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onRequestExtension={handleRequestExtension}
            isChairman={false}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      />

      <ExtensionRequestModal
        visible={extensionModalVisible}
        task={selectedTask}
        onClose={() => {
          setExtensionModalVisible(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmitExtension}
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
    paddingVertical: 16,
  },
});

export default MyTasksScreen;
