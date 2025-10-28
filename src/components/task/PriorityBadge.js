import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIORITIES } from '../../constants/priorities';

const PriorityBadge = ({ priority, style }) => {
  const priorityData = PRIORITIES[priority?.toUpperCase()] || PRIORITIES.MEDIUM;

  return (
    <View
      style={[
        styles.badge,
        { 
          backgroundColor: priorityData.color,
          borderColor: priorityData.color,
        },
        style
      ]}
    >
      <View style={styles.dot} />
      <Text style={styles.text}>{priorityData.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default PriorityBadge;
