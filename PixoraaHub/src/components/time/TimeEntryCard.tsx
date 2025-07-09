import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TimeEntry } from '../../types';

interface TimeEntryCardProps {
  timeEntry: TimeEntry;
  taskTitle?: string;
  projectTitle?: string;
  onEdit?: (timeEntry: TimeEntry) => void;
  onDelete?: (timeEntryId: string) => void;
  showActions?: boolean;
  showProject?: boolean;
  showTask?: boolean;
}

export const TimeEntryCard: React.FC<TimeEntryCardProps> = ({
  timeEntry,
  taskTitle,
  projectTitle,
  onEdit,
  onDelete,
  showActions = true,
  showProject = true,
  showTask = true,
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year:
          date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const calculateRevenue = (): number => {
    if (!timeEntry.billable || !timeEntry.hourlyRate) return 0;
    return (timeEntry.duration / 60) * timeEntry.hourlyRate;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Time Entry',
      'Are you sure you want to delete this time entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(timeEntry.id),
        },
      ]
    );
  };

  const revenue = calculateRevenue();

  return (
    <View style={styles.container}>
      {/* Header with date and duration */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.date}>{formatDate(timeEntry.startTime)}</Text>
          <View style={styles.timeRange}>
            <Text style={styles.timeText}>
              {formatTime(timeEntry.startTime)}
              {timeEntry.endTime && ` - ${formatTime(timeEntry.endTime)}`}
            </Text>
          </View>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.duration}>
            {formatDuration(timeEntry.duration)}
          </Text>
          {timeEntry.billable && (
            <View style={styles.billableTag}>
              <Text style={styles.billableText}>💰 Billable</Text>
            </View>
          )}
        </View>
      </View>

      {/* Project and Task info */}
      {(showProject || showTask) && (
        <View style={styles.projectTaskInfo}>
          {showProject && projectTitle && (
            <Text style={styles.projectTitle}>📁 {projectTitle}</Text>
          )}
          {showTask && taskTitle && (
            <Text style={styles.taskTitle}>📋 {taskTitle}</Text>
          )}
        </View>
      )}

      {/* Description */}
      {timeEntry.description && (
        <Text style={styles.description}>{timeEntry.description}</Text>
      )}

      {/* Tags */}
      {timeEntry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {timeEntry.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Revenue and Status */}
      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          {timeEntry.isRunning ? (
            <View style={styles.runningIndicator}>
              <Text style={styles.runningText}>🔴 Running</Text>
            </View>
          ) : (
            timeEntry.billable &&
            revenue > 0 && (
              <Text style={styles.revenue}>
                ${revenue.toFixed(2)} @ ${timeEntry.hourlyRate}/hr
              </Text>
            )
          )}
        </View>

        {/* Actions */}
        {showActions && !timeEntry.isRunning && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit?.(timeEntry)}
            >
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftHeader: {
    flex: 1,
  },
  rightHeader: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  duration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  billableTag: {
    backgroundColor: '#d1fae5',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  billableText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  projectTaskInfo: {
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftFooter: {
    flex: 1,
  },
  runningIndicator: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  runningText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  revenue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#dc2626',
  },
});
