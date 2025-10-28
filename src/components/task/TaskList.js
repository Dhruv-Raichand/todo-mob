import React from 'react';
import { FlatList, Text, StyleSheet, View, RefreshControl } from 'react-native';
import TaskCard from './TaskCard';
import { COLORS } from '../../constants/colors';

const TaskList = ({
  tasks,
  onTaskPress,
  emptyMessage = 'No tasks available',
  refreshing = false,
  onRefresh,
}) => {
  const renderItem = ({ item }) => (
    <TaskCard task={item} onPress={() => onTaskPress(item)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.listContent,
        tasks.length === 0 && styles.emptyList,
      ]}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TaskList;
