import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Task, TaskStatus, Project, FileAttachment } from '../../types';
import { Timer } from '../time';
import { FileService } from '../../services';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onViewDetails?: (task: Task) => void;
  showActions?: boolean;
  projectName?: string;
  project?: Project;
  showTimer?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
  showActions = true,
  projectName,
  project,
  showTimer = true,
}) => {
  const [attachmentCount, setAttachmentCount] = useState(0);

  useEffect(() => {
    loadAttachmentCount();
  }, [task.id]);

  const loadAttachmentCount = async () => {
    try {
      const attachments = await FileService.getAttachments(task.id, 'task');
      setAttachmentCount(attachments.length);
    } catch (error) {
      console.error('Error loading attachment count:', error);
      setAttachmentCount(0);
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'in_progress':
        return '#3b82f6';
      case 'review':
        return '#f59e0b';
      case 'blocked':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default: // todo
        return '#8b5cf6';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#ca8a04';
      default: // low
        return '#059669';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (): boolean => {
    if (
      !task.dueDate ||
      task.status === 'completed' ||
      task.status === 'cancelled'
    ) {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  };

  const getProgressPercentage = (): number => {
    if (task.estimatedHours === 0) return 0;
    return Math.min((task.actualHours / task.estimatedHours) * 100, 100);
  };

  const handleStatusPress = () => {
    const statusOptions: { label: string; value: TaskStatus }[] = [
      { label: 'To Do', value: 'todo' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Review', value: 'review' },
      { label: 'Completed', value: 'completed' },
      { label: 'Blocked', value: 'blocked' },
      { label: 'Cancelled', value: 'cancelled' },
    ];

    const buttons = statusOptions
      .filter(option => option.value !== task.status)
      .map(option => ({
        text: option.label,
        onPress: () => onStatusChange?.(task.id, option.value),
      }));

    buttons.push({ text: 'Cancel', onPress: () => {}, style: 'cancel' as any });

    Alert.alert('Change Status', 'Select new task status:', buttons);
  };

  const handleLongPress = () => {
    if (!showActions) return;

    const buttons = [
      { text: 'View Details', onPress: () => onPress?.(task) },
      { text: 'Edit', onPress: () => onEdit?.(task) },
      { text: 'Change Status', onPress: handleStatusPress },
      {
        text: 'Manage Files',
        onPress: () => {
          // TODO: Navigate to file management
          Alert.alert(
            'File Management',
            'File management feature coming soon!'
          );
        },
      },
      {
        text: 'Delete',
        onPress: () => onDelete?.(task.id),
        style: 'destructive' as any,
      },
      { text: 'Cancel', onPress: () => {}, style: 'cancel' as any },
    ];

    Alert.alert('Task Actions', 'Choose an action:', buttons);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isOverdue() && styles.overdueCard]}
      onPress={() => onPress?.(task)}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>
          {projectName && <Text style={styles.projectName}>{projectName}</Text>}
        </View>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(task.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {task.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.priorityText}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {task.tags.length > 3 && (
            <Text style={styles.moreTagsText}>
              +{task.tags.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Assignees */}
      {task.assignedTo.length > 0 && (
        <View style={styles.assigneesContainer}>
          <Text style={styles.label}>Assigned to:</Text>
          <Text style={styles.assigneesText}>
            {task.assignedTo.length === 1
              ? '1 person'
              : `${task.assignedTo.length} people`}
          </Text>
        </View>
      )}

      {/* Time Progress */}
      <View style={styles.timeContainer}>
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Progress:</Text>
          <Text style={styles.timeText}>
            {task.actualHours}h / {task.estimatedHours}h
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage()}%`,
                backgroundColor:
                  getProgressPercentage() > 100 ? '#ef4444' : '#3b82f6',
              },
            ]}
          />
        </View>
      </View>

      {/* Dates */}
      <View style={styles.datesContainer}>
        {task.dueDate && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Due:</Text>
            <Text style={[styles.dateText, isOverdue() && styles.overdueText]}>
              {formatDate(task.dueDate)}
            </Text>
          </View>
        )}
        {task.completedAt && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Completed:</Text>
            <Text style={styles.dateText}>{formatDate(task.completedAt)}</Text>
          </View>
        )}
      </View>

      {/* Task Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name='people-outline' size={14} color='#6b7280' />
          <Text style={styles.statText}>{task.assignedTo.length} assigned</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name='attach-outline' size={14} color='#6b7280' />
          <Text style={styles.statText}>
            {attachmentCount} file{attachmentCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {task.comments.length > 0 && (
          <View style={styles.statItem}>
            <Ionicons name='chatbubble-outline' size={14} color='#6b7280' />
            <Text style={styles.statText}>
              {task.comments.length} comment
              {task.comments.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Dependencies Warning */}
      {task.dependencies.length > 0 && (
        <View style={styles.dependenciesContainer}>
          <Text style={styles.dependenciesText}>
            ⚠️ {task.dependencies.length} dependencies
          </Text>
        </View>
      )}

      {/* Overdue Warning */}
      {isOverdue() && (
        <View style={styles.overdueWarning}>
          <Text style={styles.overdueWarningText}>⚠️ OVERDUE</Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actions}>
          {onViewDetails && (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => onViewDetails(task)}
            >
              <Ionicons name='eye-outline' size={12} color='#fff' />
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          )}

          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(task)}
            >
              <Ionicons name='pencil-outline' size={12} color='#fff' />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Timer */}
      {showTimer &&
        project &&
        task.status !== 'completed' &&
        task.status !== 'cancelled' && (
          <View style={styles.timerContainer}>
            <Timer task={task} project={project} compact={true} />
          </View>
        )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
  },
  overdueCard: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    minWidth: 45,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#374151',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  assigneesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  assigneesText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  timeContainer: {
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  timeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#374151',
  },
  overdueText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  dependenciesContainer: {
    marginBottom: 4,
  },
  dependenciesText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '500',
  },
  overdueWarning: {
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  overdueWarningText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  viewButton: {
    backgroundColor: '#007AFF',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  timerContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
