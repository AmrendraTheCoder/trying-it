import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { TaskList, TaskForm, TaskFormData } from '../../components/tasks';
import { TaskService, ProjectService } from '../../services';
import { Task, Project, TaskStatus } from '../../types';

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        TaskService.getAllTasks(),
        ProjectService.getAllProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize tasks with default data if none exist
        await TaskService.initializeTasks();
        await loadData();
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [loadData]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Handle task press (view details)
  const handleTaskPress = useCallback(
    (task: Task) => {
      const project = projects.find(p => p.id === task.projectId);

      Alert.alert(
        task.title,
        `Project: ${project?.title || 'Unknown'}\n\nDescription: ${task.description}\n\nStatus: ${task.status.replace('_', ' ')}\nPriority: ${task.priority}\nEstimated: ${task.estimatedHours}h\nActual: ${task.actualHours}h${task.dueDate ? `\nDue: ${new Date(task.dueDate).toLocaleDateString()}` : ''}${task.tags.length > 0 ? `\n\nTags: ${task.tags.join(', ')}` : ''}`,
        [
          { text: 'Edit', onPress: () => handleTaskEdit(task) },
          { text: 'Close', style: 'cancel' },
        ]
      );
    },
    [projects]
  );

  // Handle task edit
  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  // Handle task delete
  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await TaskService.deleteTask(taskId);
                if (success) {
                  await loadData(); // Refresh data
                  Alert.alert('Success', 'Task deleted successfully.');
                } else {
                  Alert.alert('Error', 'Failed to delete task.');
                }
              } catch (error) {
                console.error('Error deleting task:', error);
                Alert.alert('Error', 'Failed to delete task.');
              }
            },
          },
        ]
      );
    },
    [loadData]
  );

  // Handle task status change
  const handleTaskStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        const updatedTask = await TaskService.updateTask(taskId, { status });
        if (updatedTask) {
          await loadData(); // Refresh data
        } else {
          Alert.alert('Error', 'Failed to update task status.');
        }
      } catch (error) {
        console.error('Error updating task status:', error);
        Alert.alert('Error', 'Failed to update task status.');
      }
    },
    [loadData]
  );

  // Handle create new task
  const handleCreateTask = useCallback(() => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  }, []);

  // Handle task form submit
  const handleTaskFormSubmit = useCallback(
    async (formData: TaskFormData) => {
      try {
        if (editingTask) {
          // Update existing task
          const taskData = {
            ...formData,
            // Convert dates to ISO strings if provided
            dueDate: formData.dueDate
              ? new Date(formData.dueDate + 'T00:00:00').toISOString()
              : undefined,
            startDate: formData.startDate
              ? new Date(formData.startDate + 'T00:00:00').toISOString()
              : undefined,
          };

          const updatedTask = await TaskService.updateTask(
            editingTask.id,
            taskData
          );
          if (updatedTask) {
            setShowTaskForm(false);
            setEditingTask(undefined);
            await loadData();
            Alert.alert('Success', 'Task updated successfully.');
          } else {
            Alert.alert('Error', 'Failed to update task.');
          }
        } else {
          // Create new task
          const taskData = {
            ...formData,
            assignedTo:
              formData.assignedTo.length > 0 ? formData.assignedTo : ['user-1'], // Default assignee
            createdBy: 'user-1', // Current user ID
            comments: [],
            attachments: [],
            // Convert dates to ISO strings if provided
            dueDate: formData.dueDate
              ? new Date(formData.dueDate + 'T00:00:00').toISOString()
              : undefined,
            startDate: formData.startDate
              ? new Date(formData.startDate + 'T00:00:00').toISOString()
              : undefined,
          };

          const newTask = await TaskService.addTask(taskData);
          setShowTaskForm(false);
          await loadData();
          Alert.alert('Success', 'Task created successfully.');
        }
      } catch (error) {
        console.error('Error saving task:', error);
        Alert.alert('Error', 'Failed to save task.');
      }
    },
    [editingTask, loadData]
  );

  // Handle task form close
  const handleTaskFormClose = useCallback(() => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  }, []);

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(
      t =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== 'completed' &&
        t.status !== 'cancelled'
    ).length;

    return { total, completed, inProgress, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} total • {stats.completed} completed •{' '}
            {stats.inProgress} in progress
            {stats.overdue > 0 && ` • ${stats.overdue} overdue`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateTask}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        projects={projects}
        onTaskPress={handleTaskPress}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskStatusChange={handleTaskStatusChange}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showProjectName={true}
      />

      {/* Task Form Modal */}
      <TaskForm
        visible={showTaskForm}
        onClose={handleTaskFormClose}
        onSubmit={handleTaskFormSubmit}
        task={editingTask}
        projects={projects}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
