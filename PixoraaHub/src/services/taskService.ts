import { Logger } from '../utils/logger';
import { Task, TaskStatus, Priority } from '../types';
import { StorageService } from './storage';
import { ProjectService } from './projectService';

const TASKS_KEY = 'pixoraahub_tasks';

// Default tasks to seed the app
const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Set up project repository',
    description:
      'Initialize Git repository, set up project structure, and configure development environment.',
    projectId: '1',
    assignedTo: ['user-1'],
    createdBy: 'user-1',
    status: 'completed',
    priority: 'high',
    estimatedHours: 4,
    actualHours: 3.5,
    startDate: '2024-01-15',
    dueDate: '2024-01-16',
    completedAt: '2024-01-15T16:30:00Z',
    dependencies: [],
    tags: ['setup', 'development'],
    comments: [],
    attachments: [],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z',
  },
  {
    id: '2',
    title: 'Design database schema',
    description:
      'Create comprehensive database schema for the e-commerce platform including user management, product catalog, and order processing.',
    projectId: '1',
    assignedTo: ['user-1', 'user-2'],
    createdBy: 'user-1',
    status: 'completed',
    priority: 'high',
    estimatedHours: 8,
    actualHours: 7,
    startDate: '2024-01-16',
    dueDate: '2024-01-18',
    completedAt: '2024-01-17T14:00:00Z',
    dependencies: ['1'],
    tags: ['database', 'design'],
    comments: [],
    attachments: [],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
  {
    id: '3',
    title: 'Implement user authentication',
    description:
      'Build secure user authentication system with JWT tokens, password hashing, and session management.',
    projectId: '1',
    assignedTo: ['user-2'],
    createdBy: 'user-1',
    status: 'in_progress',
    priority: 'high',
    estimatedHours: 12,
    actualHours: 8,
    startDate: '2024-01-18',
    dueDate: '2024-01-22',
    dependencies: ['2'],
    tags: ['authentication', 'security'],
    comments: [],
    attachments: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '4',
    title: 'Create product catalog API',
    description:
      'Develop RESTful API endpoints for product management including CRUD operations, search, and filtering.',
    projectId: '1',
    assignedTo: ['user-1'],
    createdBy: 'user-1',
    status: 'todo',
    priority: 'medium',
    estimatedHours: 16,
    actualHours: 0,
    startDate: '2024-01-22',
    dueDate: '2024-01-26',
    dependencies: ['2', '3'],
    tags: ['api', 'products'],
    comments: [],
    attachments: [],
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '5',
    title: 'Design mobile app wireframes',
    description:
      'Create wireframes and user flow diagrams for the portfolio showcase mobile app.',
    projectId: '2',
    assignedTo: ['user-3'],
    createdBy: 'user-1',
    status: 'completed',
    priority: 'high',
    estimatedHours: 6,
    actualHours: 5.5,
    startDate: '2024-01-20',
    dueDate: '2024-01-22',
    completedAt: '2024-01-21T17:00:00Z',
    dependencies: [],
    tags: ['design', 'wireframes'],
    comments: [],
    attachments: [],
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-21T17:00:00Z',
  },
  {
    id: '6',
    title: 'Set up React Native project',
    description:
      'Initialize React Native project with Expo, configure navigation, and set up development environment.',
    projectId: '2',
    assignedTo: ['user-2'],
    createdBy: 'user-1',
    status: 'in_progress',
    priority: 'high',
    estimatedHours: 5,
    actualHours: 3,
    startDate: '2024-01-22',
    dueDate: '2024-01-23',
    dependencies: ['5'],
    tags: ['setup', 'react-native'],
    comments: [],
    attachments: [],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
];

export class TaskService {
  // Initialize with default tasks if none exist
  static async initializeTasks(): Promise<void> {
    try {
      const existingTasks = await StorageService.getItem<Task[]>(TASKS_KEY);
      if (!existingTasks || existingTasks.length === 0) {
        await StorageService.setItem(TASKS_KEY, defaultTasks);
      }
    } catch (error) {
      Logger.error('Error initializing tasks:', error);
      throw error;
    }
  }

  // Get all tasks
  static async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await StorageService.getItem<Task[]>(TASKS_KEY);
      return tasks || [];
    } catch (error) {
      Logger.error('Error getting tasks:', error);
      return [];
    }
  }

  // Get tasks by project ID
  static async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter(task => task.projectId === projectId);
    } catch (error) {
      Logger.error('Error getting tasks by project:', error);
      return [];
    }
  }

  // Get task by ID
  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.find(task => task.id === taskId) || null;
    } catch (error) {
      Logger.error('Error getting task by ID:', error);
      return null;
    }
  }

  // Add new task
  static async addTask(
    taskData: Omit<
      Task,
      'id' | 'createdAt' | 'updatedAt' | 'actualHours' | 'completedAt'
    >
  ): Promise<Task> {
    try {
      const tasks = await this.getAllTasks();

      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        actualHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTasks = [newTask, ...tasks];
      await StorageService.setItem(TASKS_KEY, updatedTasks);

      // Update project task counts
      await this.updateProjectTaskCounts(taskData.projectId);

      return newTask;
    } catch (error) {
      Logger.error('Error adding task:', error);
      throw error;
    }
  }

  // Update task
  static async updateTask(
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        Logger.error('Task not found:', taskId);
        return null;
      }

      const updatedTask: Task = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        // Set completedAt when status changes to completed
        ...(updates.status === 'completed' &&
          tasks[taskIndex].status !== 'completed' && {
            completedAt: new Date().toISOString(),
          }),
        // Clear completedAt when status changes from completed
        ...(updates.status !== 'completed' &&
          tasks[taskIndex].status === 'completed' && {
            completedAt: undefined,
          }),
      };

      tasks[taskIndex] = updatedTask;
      await StorageService.setItem(TASKS_KEY, tasks);

      // Update project task counts if status changed
      if (updates.status && updates.status !== tasks[taskIndex].status) {
        await this.updateProjectTaskCounts(updatedTask.projectId);
      }

      return updatedTask;
    } catch (error) {
      Logger.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        Logger.error('Task not found:', taskId);
        return false;
      }

      const task = tasks[taskIndex];
      tasks.splice(taskIndex, 1);

      // Remove this task from dependencies of other tasks
      const updatedTasks = tasks.map(t => ({
        ...t,
        dependencies: t.dependencies.filter(dep => dep !== taskId),
      }));

      await StorageService.setItem(TASKS_KEY, updatedTasks);

      // Update project task counts
      await this.updateProjectTaskCounts(task.projectId);

      return true;
    } catch (error) {
      Logger.error('Error deleting task:', error);
      return false;
    }
  }

  // Get tasks by status
  static async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter(task => task.status === status);
    } catch (error) {
      Logger.error('Error getting tasks by status:', error);
      return [];
    }
  }

  // Get tasks assigned to user
  static async getTasksByAssignee(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter(task => task.assignedTo.includes(userId));
    } catch (error) {
      Logger.error('Error getting tasks by assignee:', error);
      return [];
    }
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      const now = new Date();

      return tasks.filter(
        task =>
          task.dueDate &&
          new Date(task.dueDate) < now &&
          task.status !== 'completed' &&
          task.status !== 'cancelled'
      );
    } catch (error) {
      Logger.error('Error getting overdue tasks:', error);
      return [];
    }
  }

  // Update project task counts
  private static async updateProjectTaskCounts(
    projectId: string
  ): Promise<void> {
    try {
      const projectTasks = await this.getTasksByProject(projectId);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(
        task => task.status === 'completed'
      ).length;

      await ProjectService.updateProject(projectId, {
        taskCount: totalTasks,
        completedTasks: completedTasks,
      });
    } catch (error) {
      Logger.error('Error updating project task counts:', error);
    }
  }

  // Get task statistics
  static async getTaskStats(projectId?: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    blocked: number;
  }> {
    try {
      const tasks = projectId
        ? await this.getTasksByProject(projectId)
        : await this.getAllTasks();

      const now = new Date();

      return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: tasks.filter(
          t =>
            t.dueDate &&
            new Date(t.dueDate) < now &&
            t.status !== 'completed' &&
            t.status !== 'cancelled'
        ).length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
      };
    } catch (error) {
      Logger.error('Error getting task stats:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
        blocked: 0,
      };
    }
  }

  // Bulk update task status
  static async bulkUpdateTaskStatus(
    taskIds: string[],
    status: TaskStatus
  ): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      const updatedTasks: Task[] = [];
      const projectIds = new Set<string>();

      tasks.forEach(task => {
        if (taskIds.includes(task.id)) {
          const updatedTask: Task = {
            ...task,
            status,
            updatedAt: new Date().toISOString(),
            ...(status === 'completed' &&
              task.status !== 'completed' && {
                completedAt: new Date().toISOString(),
              }),
            ...(status !== 'completed' &&
              task.status === 'completed' && {
                completedAt: undefined,
              }),
          };
          updatedTasks.push(updatedTask);
          projectIds.add(task.projectId);

          // Update the task in the array
          const index = tasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            tasks[index] = updatedTask;
          }
        }
      });

      await StorageService.setItem(TASKS_KEY, tasks);

      // Update project task counts for affected projects
      for (const projectId of projectIds) {
        await this.updateProjectTaskCounts(projectId);
      }

      return updatedTasks;
    } catch (error) {
      Logger.error('Error bulk updating task status:', error);
      throw error;
    }
  }
}
