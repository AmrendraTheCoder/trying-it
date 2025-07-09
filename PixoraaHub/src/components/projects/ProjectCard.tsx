import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  showClient?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  onEdit,
  onDelete,
  showClient = true,
}) => {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'on_hold':
        return '#FF9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateProgress = () => {
    if (!project.budget || project.budget === 0 || !project.totalSpent)
      return 0;
    return Math.min((project.totalSpent / project.budget) * 100, 100);
  };

  const progress = calculateProgress();

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(project)}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {project.title}
          </Text>
          {showClient && project.clientName && (
            <Text style={styles.clientName}>{project.clientName}</Text>
          )}
        </View>
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status) },
            ]}
          >
            <Text style={styles.badgeText}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(project.priority) },
            ]}
          >
            <Text style={styles.badgeText}>
              {project.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {project.description && (
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      )}

      {/* Budget and Progress */}
      {project.budget && (
        <View style={styles.budgetContainer}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget:</Text>
            <Text style={styles.budgetAmount}>
              {formatCurrency(project.budget)}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Spent:</Text>
            <Text
              style={[
                styles.budgetAmount,
                (project.totalSpent || 0) > project.budget && styles.overBudget,
              ]}
            >
              {formatCurrency(project.totalSpent || 0)}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress}%`,
                    backgroundColor: progress > 100 ? '#f44336' : '#4CAF50',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
          </View>
        </View>
      )}

      {/* Dates */}
      <View style={styles.datesContainer}>
        {project.startDate && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Start:</Text>
            <Text style={styles.dateValue}>
              {new Date(project.startDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        {project.endDate && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>End:</Text>
            <Text style={styles.dateValue}>
              {new Date(project.endDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        {project.deadline && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Deadline:</Text>
            <Text
              style={[
                styles.dateValue,
                new Date(project.deadline) < new Date() &&
                  project.status !== 'completed' &&
                  styles.overdue,
              ]}
            >
              {new Date(project.deadline).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Task Summary */}
      {project.taskCount !== undefined && (
        <View style={styles.taskSummary}>
          <Text style={styles.taskText}>
            {project.completedTasks || 0} of {project.taskCount} tasks completed
          </Text>
          {project.taskCount > 0 && (
            <View style={styles.taskProgressContainer}>
              <View style={styles.taskProgressBackground}>
                <View
                  style={[
                    styles.taskProgressBar,
                    {
                      width: `${
                        ((project.completedTasks || 0) / project.taskCount) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(project)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(project)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  budgetContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  overBudget: {
    color: '#f44336',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  datesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  overdue: {
    color: '#f44336',
  },
  taskSummary: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  taskText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskProgressContainer: {
    width: '100%',
  },
  taskProgressBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  taskProgressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
