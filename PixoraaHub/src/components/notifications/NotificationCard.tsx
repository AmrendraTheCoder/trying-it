import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppNotification,
  NotificationType,
  NotificationPriority,
} from '../../types';

interface NotificationCardProps {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
  showActions = true,
  compact = false,
}) => {
  const handlePress = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onPress?.(notification);
  };

  const handleMarkAsRead = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(notification.id),
        },
      ]
    );
  };

  const getTypeIcon = (type: NotificationType): string => {
    switch (type) {
      case 'task_due':
        return 'alarm-outline';
      case 'task_assigned':
        return 'person-add-outline';
      case 'task_completed':
        return 'checkmark-circle-outline';
      case 'project_update':
        return 'folder-outline';
      case 'client_message':
        return 'chatbubble-outline';
      case 'system_update':
        return 'settings-outline';
      case 'reminder':
        return 'notifications-outline';
      case 'time_tracking':
        return 'time-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case 'task_due':
        return '#FF5722';
      case 'task_assigned':
        return '#2196F3';
      case 'task_completed':
        return '#4CAF50';
      case 'project_update':
        return '#FF9800';
      case 'client_message':
        return '#9C27B0';
      case 'system_update':
        return '#607D8B';
      case 'reminder':
        return '#FFC107';
      case 'time_tracking':
        return '#00BCD4';
      default:
        return '#666';
    }
  };

  const getPriorityColor = (priority: NotificationPriority): string => {
    switch (priority) {
      case 'urgent':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'normal':
        return '#4CAF50';
      case 'low':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  const typeColor = getTypeColor(notification.type);
  const priorityColor = getPriorityColor(notification.priority);

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          !notification.read && styles.unreadContainer,
        ]}
        onPress={handlePress}
      >
        <View
          style={[styles.compactIcon, { backgroundColor: `${typeColor}15` }]}
        >
          <Ionicons
            name={getTypeIcon(notification.type) as any}
            size={16}
            color={typeColor}
          />
        </View>

        <View style={styles.compactContent}>
          <Text
            style={[
              styles.compactTitle,
              !notification.read && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.compactTime}>
            {formatTime(notification.createdAt)}
          </Text>
        </View>

        {!notification.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unreadContainer]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <View
            style={[styles.typeIcon, { backgroundColor: `${typeColor}15` }]}
          >
            <Ionicons
              name={getTypeIcon(notification.type) as any}
              size={20}
              color={typeColor}
            />
          </View>

          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: priorityColor },
            ]}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, !notification.read && styles.unreadText]}
              numberOfLines={2}
            >
              {notification.title}
            </Text>
            <Text style={styles.time}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>

          <Text style={styles.body} numberOfLines={3}>
            {notification.body}
          </Text>

          {notification.entityType && notification.entityId && (
            <View style={styles.metadata}>
              <Ionicons
                name={
                  notification.entityType === 'task'
                    ? 'checkbox-outline'
                    : notification.entityType === 'project'
                      ? 'folder-outline'
                      : 'person-outline'
                }
                size={12}
                color='#666'
              />
              <Text style={styles.metadataText}>
                {notification.entityType.charAt(0).toUpperCase() +
                  notification.entityType.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {showActions && (
          <View style={styles.actions}>
            {!notification.read && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMarkAsRead}
              >
                <Ionicons name='checkmark-outline' size={20} color='#4CAF50' />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name='trash-outline' size={20} color='#F44336' />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!notification.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  compactContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '700',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  compactTime: {
    fontSize: 11,
    color: '#999',
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2196F3',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
});
