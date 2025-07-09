import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskList, TaskForm } from '../../components';
import { Task, Project } from '../../types';
import { TaskService, ProjectService } from '../../services';
import {
  EnhancedThemedText,
} from '../../../components/ui';
import { Colors, Spacing, BorderRadius, Shadows } from '../../../constants/Colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

const { width } = Dimensions.get('window');

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Initialize and load both tasks and projects
      await Promise.all([
        TaskService.initializeTasks(),
        ProjectService.initializeProjects(),
      ]);

      const [taskData, projectData] = await Promise.all([
        TaskService.getAllTasks(),
        ProjectService.getAllProjects(),
      ]);

      setTasks(taskData);
      setProjects(projectData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        'Error',
        'Failed to load tasks and projects. Please try again.'
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TaskService.deleteTask(task.id);
              await loadData();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleTaskPress = (task: Task) => {
    console.log('Selected task:', task);
  };

  const handleViewTaskDetails = (task: Task) => {
    console.log('View task details:', task);
  };

  const handleFormSubmit = async (taskData: any) => {
    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, taskData);
      } else {
        await TaskService.createTask(taskData);
      }
      setShowForm(false);
      setEditingTask(undefined);
      await loadData();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  // Calculate stats
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(
    t =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
  ).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;

  // Metric Card Component
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, subtitle, color = Colors.light.primary }) => (
    <View style={[styles.metricCard]}>
      <View style={styles.metricContent}>
        <EnhancedThemedText type="caption" color="secondary" style={styles.metricTitle}>
          {title}
        </EnhancedThemedText>
        <EnhancedThemedText type="heading3" style={[styles.metricValue, { color }]}>
          {value}
        </EnhancedThemedText>
        {subtitle && (
          <EnhancedThemedText type="small" color="muted" style={styles.metricSubtitle}>
            {subtitle}
          </EnhancedThemedText>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <EnhancedThemedText type="heading1" style={styles.title}>
            Tasks
          </EnhancedThemedText>
          <EnhancedThemedText type="body" color="secondary" style={styles.subtitle}>
            Manage your task workflow
          </EnhancedThemedText>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <EnhancedThemedText type="bodySemiBold" style={styles.addButtonText}>
            + Add Task
          </EnhancedThemedText>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      {tasks.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <MetricCard
              title="To Do"
              value={todoTasks}
              subtitle={`${tasks.length} total`}
              color={Colors.light.info}
            />
            <MetricCard
              title="In Progress"
              value={inProgressTasks}
              subtitle="Active"
              color={Colors.light.warning}
            />
          </View>
          
          <View style={styles.statsGrid}>
            <MetricCard
              title="Completed"
              value={completedTasks}
              subtitle="Finished"
              color={Colors.light.success}
            />
            <MetricCard
              title="Overdue"
              value={overdueTasks}
              subtitle="Need attention"
              color={Colors.light.error}
            />
          </View>

          <View style={styles.statsGrid}>
            <MetricCard
              title="High Priority"
              value={highPriorityTasks}
              subtitle="Urgent tasks"
              color={Colors.light.accent}
            />
            <MetricCard
              title="Due Today"
              value={tasks.filter(t => {
                const today = new Date().toDateString();
                return t.dueDate && new Date(t.dueDate).toDateString() === today && t.status !== 'completed';
              }).length}
              subtitle="Today's tasks"
              color={Colors.light.primary}
            />
          </View>
        </View>
      )}

      {/* Task List */}
      <View style={styles.content}>
        <TaskList
          tasks={tasks}
          projects={projects}
          onTaskPress={handleTaskPress}
          onTaskEdit={handleEditTask}
          onTaskDelete={(taskId: string) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) handleDeleteTask(task);
          }}
          onViewDetails={handleViewTaskDetails}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
        
        {/* Task List Header */}
        {tasks.length > 0 && (
          <View style={styles.listHeader}>
            <EnhancedThemedText type="heading4">
              All Tasks ({tasks.length})
            </EnhancedThemedText>
            <EnhancedThemedText type="caption" color="secondary">
              {todoTasks} todo • {inProgressTasks} in progress • {completedTasks} completed
            </EnhancedThemedText>
          </View>
        )}
      </View>

      {/* Task Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <TaskForm
          visible={showForm}
          task={editingTask}
          projects={projects}
          onSubmit={handleFormSubmit}
          onClose={handleFormCancel}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  addButtonText: {
    color: Colors.light.textInverse,
  },
  statsSection: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    flex: 1,
    ...Shadows.sm,
  },
  metricContent: {
    padding: Spacing.cardPadding,
    minHeight: 70,
    justifyContent: 'center',
  },
  metricTitle: {
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    marginBottom: Spacing.xs / 2,
  },
  metricSubtitle: {
    lineHeight: 14,
  },
  content: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
    gap: Spacing.xs / 2,
  },
});
