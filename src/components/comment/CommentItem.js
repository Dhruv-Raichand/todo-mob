import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/dateUtils';

const CommentItem = ({ comment }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Icon name="account-circle" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.time}>
            {formatDateTime(comment.createdAt)}
          </Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default CommentItem;
