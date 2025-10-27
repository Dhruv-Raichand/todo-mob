import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';

const CommentItem = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?.uid === comment.userId;

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.userName}>{comment.userName}</Text>
        <Text style={styles.timestamp}>
          {formatDateTime(comment.createdAt)}
        </Text>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      {isOwner && onDelete && (
        <TouchableOpacity onPress={() => onDelete(comment.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const CommentList = ({ comments, onDeleteComment }) => {
  if (comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No comments yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <CommentItem comment={item} onDelete={onDeleteComment} />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  commentContainer: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default CommentList;
