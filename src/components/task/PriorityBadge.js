import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIORITIES } from '../../constants/priorities';

const PriorityBadge = ({ priority }) => {
  const priorityData = PRIORITIES[priority?.toUpperCase()] || PRIORITIES.LOW;

  return (
    <View style={[styles.badge, { backgroundColor: priorityData.color }]}>
      <Text style={styles.text}>{priorityData.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default PriorityBadge;
