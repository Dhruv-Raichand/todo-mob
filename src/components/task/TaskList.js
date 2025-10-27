import React from 'react';
import { FlatList, Text, View, StyleSheet, RefreshControl } from 'react-native';
import TaskCard from './TaskCard';
import { COLORS } from '../../constants/colors';

const TaskList = ({
  tasks,
  onTaskPress,
  emptyMessage = 'No tasks found',
  refreshing = false,
  onRefresh,
}) => {
  if (!refreshing && tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TaskCard task={item} onPress={() => onTaskPress(item)} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TaskList;
