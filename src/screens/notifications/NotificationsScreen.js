import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { notificationService, NOTIFICATION_TYPES } from '../../services/notificationService';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/dateUtils';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (data) => setNotifications(data)
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(user.uid);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.taskId) {
      navigation.navigate('TaskDetail', { taskId: notification.data.taskId });
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.TASK_ASSIGNED:
        return { name: 'clipboard-text', color: COLORS.primary };
      case NOTIFICATION_TYPES.EXTENSION_REQUEST:
        return { name: 'clock-alert', color: COLORS.warning };
      case NOTIFICATION_TYPES.EXTENSION_APPROVED:
        return { name: 'check-circle', color: COLORS.success };
      case NOTIFICATION_TYPES.EXTENSION_REJECTED:
        return { name: 'close-circle', color: COLORS.error };
      case NOTIFICATION_TYPES.DEADLINE_REMINDER:
        return { name: 'alarm', color: COLORS.warning };
      case NOTIFICATION_TYPES.TASK_COMPLETED:
        return { name: 'checkbox-marked-circle', color: COLORS.success };
      default:
        return { name: 'bell', color: COLORS.textSecondary };
    }
  };

  const renderNotification = ({ item }) => {
    const icon = getIcon(item.type);
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          <Icon name={icon.name} size={24} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, isUnread && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {item.createdAt ? formatDateTime(item.createdAt) : 'Just now'}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  markAllRead: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default NotificationsScreen;
