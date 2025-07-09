import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskList, TaskForm } from '../../components';
import { Task, Project } from '../../types';
import { TaskService, ProjectService } from '../../services';
import {
  ProfessionalHeader,
  EnhancedThemedText,
  StatCard,
  StatusBadge,
} from '../../../components/ui';
import { Colors, Spacing } from '../../../constants/Colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  // Load initial data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    const statusText = task.status.replace('_', ' ').toUpperCase();
    const priorityText = task.priority.toUpperCase();
    const dueDateText = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : 'No due date';

    Alert.alert(
      task.title,
      `Status: ${statusText}\nPriority: ${priorityText}\nDue Date: ${dueDateText}\n\nDescription: ${task.description || 'No description'}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditTask(task) },
      ]
    );
  };

  const handleAddTask = () => {
    if (projects.length === 0) {
      Alert.alert(
        'No Projects Available',
        'You need to add at least one project before creating a task.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleViewTaskDetails = (task: Task) => {
    const statusText = task.status.replace('_', ' ').toUpperCase();
    const priorityText = task.priority.toUpperCase();
    const dueDateText = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : 'No due date';
    const project = projects.find(p => p.id === task.projectId);
    const projectTitle = project?.title || 'No project';

    Alert.alert(
      `${task.title} - Details`,
      `Status: ${statusText}\nPriority: ${priorityText}\nDue Date: ${dueDateText}\nProject: ${projectTitle}\n\nDescription: ${task.description || 'No description'}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditTask(task) },
        {
          text: 'Manage Files',
          onPress: () => {
            // TODO: Navigate to file management screen
            Alert.alert(
              'File Management',
              'File management feature coming soon!'
            );
          },
        },
      ]
    );
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await TaskService.deleteTask(task.id);
              if (success) {
                setTasks(prev => prev.filter(t => t.id !== task.id));
                Alert.alert('Success', 'Task deleted successfully.');
              } else {
                Alert.alert('Error', 'Task not found.');
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (taskData: any) => {
    try {
      setLoading(true);

      if (editingTask) {
        // Update existing task
        const updatedTask = await TaskService.updateTask(
          editingTask.id,
          taskData
        );
        if (updatedTask) {
          setTasks(prev =>
            prev.map(t => (t.id === editingTask.id ? updatedTask : t))
          );
          Alert.alert('Success', 'Task updated successfully.');
        }
      } else {
        // Add new task
        const newTask = await TaskService.addTask(taskData);
        setTasks(prev => [newTask, ...prev]);
        Alert.alert('Success', 'Task added successfully.');
      }

      setShowForm(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const [taskData, projectData] = await Promise.all([
        TaskService.getAllTasks(),
        ProjectService.getAllProjects(),
      ]);

      setTasks(taskData);
      setProjects(projectData);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate task statistics
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(
    t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  ).length;

  const highPriorityTasks = tasks.filter(
    t => t.priority === 'high' && t.status !== 'completed'
  ).length;
  const todayTasks = tasks.filter(
    t =>
      t.dueDate &&
      new Date(t.dueDate).toDateString() === new Date().toDateString() &&
      t.status !== 'completed'
  ).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle='dark-content' backgroundColor={backgroundColor} />

      <ProfessionalHeader
        title='Tasks'
        subtitle={`${tasks.length} tasks across ${projects.length} projects`}
        rightButton={{
          title: '+ New Task',
          onPress: handleAddTask,
          variant: 'primary',
        }}
      />

      <View style={styles.container}>
        {/* Task Statistics */}
        {tasks.length > 0 && (
          <View style={styles.statsSection}>
            <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
              Overview
            </EnhancedThemedText>
            <View style={styles.statsGrid}>
              <StatCard
                title='To Do'
                value={todoTasks}
                subtitle={`${tasks.length} total`}
                color={Colors.light.info}
              />
              <StatCard
                title='In Progress'
                value={inProgressTasks}
                subtitle='Active work'
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                title='Completed'
                value={completedTasks}
                subtitle='This period'
                color={Colors.light.success}
              />
              <StatCard
                title='Overdue'
                value={overdueTasks}
                subtitle='Need attention'
                color={Colors.light.error}
              />
            </View>
          </View>
        )}

        {/* Priority & Schedule */}
        {tasks.length > 0 && (
          <View style={styles.prioritySection}>
            <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
              Priority & Schedule
            </EnhancedThemedText>
            <View style={styles.statsGrid}>
              <StatCard
                title='High Priority'
                value={highPriorityTasks}
                subtitle='Urgent tasks'
                color={Colors.light.warning}
              />
              <StatCard
                title='Due Today'
                value={todayTasks}
                subtitle='Focus items'
                color={Colors.light.secondary}
              />
            </View>
          </View>
        )}

        {/* Task Status Summary */}
        {tasks.length > 0 && (
          <View style={styles.statusSection}>
            <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
              Status Summary
            </EnhancedThemedText>
            <View style={styles.statusBadgesContainer}>
              <View style={styles.statusBadgeItem}>
                <StatusBadge status='todo' />
                <EnhancedThemedText
                  type='caption'
                  color='secondary'
                  style={styles.statusCount}
                >
                  {todoTasks}
                </EnhancedThemedText>
              </View>
              <View style={styles.statusBadgeItem}>
                <StatusBadge status='in_progress' />
                <EnhancedThemedText
                  type='caption'
                  color='secondary'
                  style={styles.statusCount}
                >
                  {inProgressTasks}
                </EnhancedThemedText>
              </View>
              <View style={styles.statusBadgeItem}>
                <StatusBadge status='completed' />
                <EnhancedThemedText
                  type='caption'
                  color='secondary'
                  style={styles.statusCount}
                >
                  {completedTasks}
                </EnhancedThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Task List Header */}
        <View style={styles.listHeader}>
          <EnhancedThemedText type='heading4'>All Tasks</EnhancedThemedText>
          {tasks.length > 0 && (
            <EnhancedThemedText type='caption' color='secondary'>
              {inProgressTasks} active • {overdueTasks} overdue
            </EnhancedThemedText>
          )}
        </View>

        <View style={styles.listContainer}>
          <TaskList
            tasks={tasks}
            projects={projects}
            onTaskPress={handleTaskPress}
            onTaskEdit={(taskId: string) => {
              const task = tasks.find(t => t.id === taskId);
              if (task) handleEditTask(task);
            }}
            onTaskDelete={(taskId: string) => {
              const task = tasks.find(t => t.id === taskId);
              if (task) handleDeleteTask(task);
            }}
            onViewDetails={handleViewTaskDetails}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </View>
      </View>

      {/* Task Form Modal */}
      <Modal
        visible={showForm}
        animationType='slide'
        presentationStyle='pageSheet'
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
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  prioritySection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusBadgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusBadgeItem: {
    alignItems: 'center',
  },
  statusCount: {
    marginTop: Spacing.xs / 2,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  listContainer: {
    flex: 1,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
