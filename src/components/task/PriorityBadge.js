import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIORITIES } from '../../constants/priorities';

const PriorityBadge = ({ priority }) => {
  const priorityData = PRIORITIES[priority?.toUpperCase()] || PRIORITIES.MEDIUM;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${priorityData.color}15` },
      ]}
    >
      <Text style={styles.icon}>{priorityData.icon}</Text>
      <Text style={[styles.text, { color: priorityData.color }]}>
        {priorityData.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PriorityBadge;
