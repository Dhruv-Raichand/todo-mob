import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';

const CommentItem = ({ comment, currentUserId }) => {
  const isTeacher = comment.userRole === 'teacher';
  const isMyComment = comment.userId === currentUserId;
  
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <View style={[
      styles.container,
      isMyComment && styles.myComment,
    ]}>
      <View style={[
        styles.avatar,
        isTeacher ? styles.teacherAvatar : styles.studentAvatar,
      ]}>
        <Text style={styles.avatarText}>{getInitials(comment.userName)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{comment.userName}</Text>
          {isTeacher && (
            <View style={styles.teacherBadge}>
              <Icon name="school" size={12} color="#fff" />
              <Text style={styles.teacherBadgeText}>Teacher</Text>
            </View>
          )}
          {isMyComment && !isTeacher && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          )}
        </View>

        <Text style={styles.text}>{comment.text}</Text>

        {comment.createdAt && (
          <Text style={styles.timestamp}>
            {new Date(comment.createdAt.toDate()).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
  },
  myComment: {
    backgroundColor: `${COLORS.primary}08`,
    borderLeftColor: COLORS.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teacherAvatar: {
    backgroundColor: COLORS.secondary,
  },
  studentAvatar: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  teacherBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  youBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

export default CommentItem;
