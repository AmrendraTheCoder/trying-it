import { Logger } from '../utils/logger';
import {
  TimeEntry,
  ActiveTimer,
  TimeTrackingStats,
  ProjectTimeStats,
  TaskTimeStats,
  DailyTimeStats,
  TimeTrackingSettings,
} from '../types';
import { StorageService } from './storage';
import { ProjectService } from './projectService';
import { TaskService } from './taskService';

const TIME_ENTRIES_KEY = 'pixoraahub_time_entries';
const ACTIVE_TIMER_KEY = 'pixoraahub_active_timer';
const TIME_SETTINGS_KEY = 'pixoraahub_time_settings';

// Default time tracking settings
const defaultSettings: TimeTrackingSettings = {
  defaultBillable: true,
  reminderEnabled: true,
  reminderInterval: 30, // 30 minutes
  autoStopEnabled: false,
  autoStopDuration: 8, // 8 hours
  roundingEnabled: false,
  roundingInterval: 15, // 15 minutes
};

// Default time entries for demonstration
const defaultTimeEntries: TimeEntry[] = [
  {
    id: '1',
    taskId: '1',
    projectId: '1',
    userId: 'user-1',
    description: 'Setting up project repository and initial configuration',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T12:30:00Z',
    duration: 210, // 3.5 hours in minutes
    isRunning: false,
    tags: ['setup', 'development'],
    billable: true,
    hourlyRate: 80,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T12:30:00Z',
  },
  {
    id: '2',
    taskId: '2',
    projectId: '1',
    userId: 'user-1',
    description: 'Designing UI wireframes and mockups',
    startTime: '2024-01-16T10:00:00Z',
    endTime: '2024-01-16T15:45:00Z',
    duration: 345, // 5.75 hours in minutes
    isRunning: false,
    tags: ['design', 'ui'],
    billable: true,
    hourlyRate: 80,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: '3',
    taskId: '3',
    projectId: '2',
    userId: 'user-1',
    description: 'Code review and testing',
    startTime: '2024-01-17T14:00:00Z',
    endTime: '2024-01-17T16:30:00Z',
    duration: 150, // 2.5 hours in minutes
    isRunning: false,
    tags: ['review', 'testing'],
    billable: true,
    hourlyRate: 80,
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T16:30:00Z',
  },
  {
    id: '4',
    taskId: '4',
    projectId: '2',
    userId: 'user-1',
    description: 'Team meeting and planning session',
    startTime: '2024-01-18T09:30:00Z',
    endTime: '2024-01-18T11:00:00Z',
    duration: 90, // 1.5 hours in minutes
    isRunning: false,
    tags: ['meeting', 'planning'],
    billable: false,
    hourlyRate: 0,
    createdAt: '2024-01-18T09:30:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
  },
];

export class TimeTrackingService {
  // Initialize time tracking data
  static async initializeTimeEntries(): Promise<void> {
    try {
      const existingEntries =
        await StorageService.getItem<TimeEntry[]>(TIME_ENTRIES_KEY);
      if (!existingEntries || existingEntries.length === 0) {
        await StorageService.setItem(TIME_ENTRIES_KEY, defaultTimeEntries);
      }

      // Initialize settings if they don't exist
      const existingSettings =
        await StorageService.getItem<TimeTrackingSettings>(TIME_SETTINGS_KEY);
      if (!existingSettings) {
        await StorageService.setItem(TIME_SETTINGS_KEY, defaultSettings);
      }
    } catch (error) {
      Logger.error('Error initializing time entries:', error);
      throw error;
    }
  }

  // Get all time entries
  static async getAllTimeEntries(): Promise<TimeEntry[]> {
    try {
      const entries =
        await StorageService.getItem<TimeEntry[]>(TIME_ENTRIES_KEY);
      return entries || [];
    } catch (error) {
      Logger.error('Error getting time entries:', error);
      return [];
    }
  }

  // Get time entries for a specific task
  static async getTimeEntriesByTask(taskId: string): Promise<TimeEntry[]> {
    try {
      const allEntries = await this.getAllTimeEntries();
      return allEntries.filter(entry => entry.taskId === taskId);
    } catch (error) {
      Logger.error('Error getting time entries by task:', error);
      return [];
    }
  }

  // Get time entries for a specific project
  static async getTimeEntriesByProject(
    projectId: string
  ): Promise<TimeEntry[]> {
    try {
      const allEntries = await this.getAllTimeEntries();
      return allEntries.filter(entry => entry.projectId === projectId);
    } catch (error) {
      Logger.error('Error getting time entries by project:', error);
      return [];
    }
  }

  // Get time entries for a date range
  static async getTimeEntriesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<TimeEntry[]> {
    try {
      const allEntries = await this.getAllTimeEntries();
      return allEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end;
      });
    } catch (error) {
      Logger.error('Error getting time entries by date range:', error);
      return [];
    }
  }

  // Start a new timer
  static async startTimer(
    taskId: string,
    projectId: string,
    description?: string,
    tags: string[] = [],
    billable?: boolean
  ): Promise<ActiveTimer | null> {
    try {
      // Stop any existing timer first
      await this.stopTimer();

      const settings = await this.getSettings();
      const now = new Date().toISOString();
      const timeEntryId = Date.now().toString();

      const timer: ActiveTimer = {
        timeEntryId,
        taskId,
        projectId,
        startTime: now,
        description,
        tags,
        billable: billable !== undefined ? billable : settings.defaultBillable,
      };

      await StorageService.setItem(ACTIVE_TIMER_KEY, timer);
      return timer;
    } catch (error) {
      Logger.error('Error starting timer:', error);
      return null;
    }
  }

  // Stop the active timer and create a time entry
  static async stopTimer(description?: string): Promise<TimeEntry | null> {
    try {
      const activeTimer = await this.getActiveTimer();
      if (!activeTimer) {
        return null;
      }

      const now = new Date().toISOString();
      const startTime = new Date(activeTimer.startTime);
      const endTime = new Date(now);
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      ); // Duration in minutes

      // Get project hourly rate
      const project = await ProjectService.getProjectById(
        activeTimer.projectId
      );
      const hourlyRate = project?.hourlyRate || 0;

      const timeEntry: TimeEntry = {
        id: activeTimer.timeEntryId,
        taskId: activeTimer.taskId,
        projectId: activeTimer.projectId,
        userId: 'user-1', // Current user ID
        description: description || activeTimer.description || '',
        startTime: activeTimer.startTime,
        endTime: now,
        duration,
        isRunning: false,
        tags: activeTimer.tags,
        billable: activeTimer.billable,
        hourlyRate: activeTimer.billable ? hourlyRate : 0,
        createdAt: activeTimer.startTime,
        updatedAt: now,
      };

      // Save the time entry
      await this.addTimeEntry(timeEntry);

      // Clear the active timer
      await StorageService.removeItem(ACTIVE_TIMER_KEY);

      // Update task actual hours
      await this.updateTaskActualHours(activeTimer.taskId);

      return timeEntry;
    } catch (error) {
      Logger.error('Error stopping timer:', error);
      return null;
    }
  }

  // Get the currently active timer
  static async getActiveTimer(): Promise<ActiveTimer | null> {
    try {
      const timer = await StorageService.getItem<ActiveTimer>(ACTIVE_TIMER_KEY);
      return timer || null;
    } catch (error) {
      Logger.error('Error getting active timer:', error);
      return null;
    }
  }

  // Add a time entry manually
  static async addTimeEntry(
    entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> | TimeEntry
  ): Promise<TimeEntry> {
    try {
      const now = new Date().toISOString();
      const timeEntry: TimeEntry = {
        id: 'id' in entry ? entry.id : Date.now().toString(),
        ...entry,
        createdAt: 'createdAt' in entry ? entry.createdAt : now,
        updatedAt: now,
      };

      const allEntries = await this.getAllTimeEntries();
      const existingIndex = allEntries.findIndex(e => e.id === timeEntry.id);

      if (existingIndex >= 0) {
        allEntries[existingIndex] = timeEntry;
      } else {
        allEntries.push(timeEntry);
      }

      await StorageService.setItem(TIME_ENTRIES_KEY, allEntries);
      await this.updateTaskActualHours(timeEntry.taskId);

      return timeEntry;
    } catch (error) {
      Logger.error('Error adding time entry:', error);
      throw error;
    }
  }

  // Update a time entry
  static async updateTimeEntry(
    id: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry | null> {
    try {
      const allEntries = await this.getAllTimeEntries();
      const entryIndex = allEntries.findIndex(entry => entry.id === id);

      if (entryIndex === -1) {
        return null;
      }

      const updatedEntry = {
        ...allEntries[entryIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      allEntries[entryIndex] = updatedEntry;
      await StorageService.setItem(TIME_ENTRIES_KEY, allEntries);
      await this.updateTaskActualHours(updatedEntry.taskId);

      return updatedEntry;
    } catch (error) {
      Logger.error('Error updating time entry:', error);
      return null;
    }
  }

  // Delete a time entry
  static async deleteTimeEntry(id: string): Promise<boolean> {
    try {
      const allEntries = await this.getAllTimeEntries();
      const entryIndex = allEntries.findIndex(entry => entry.id === id);

      if (entryIndex === -1) {
        return false;
      }

      const taskId = allEntries[entryIndex].taskId;
      allEntries.splice(entryIndex, 1);
      await StorageService.setItem(TIME_ENTRIES_KEY, allEntries);
      await this.updateTaskActualHours(taskId);

      return true;
    } catch (error) {
      Logger.error('Error deleting time entry:', error);
      return false;
    }
  }

  // Update task actual hours based on time entries
  static async updateTaskActualHours(taskId: string): Promise<void> {
    try {
      const taskEntries = await this.getTimeEntriesByTask(taskId);
      const totalMinutes = taskEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places

      await TaskService.updateTask(taskId, { actualHours: totalHours });
    } catch (error) {
      Logger.error('Error updating task actual hours:', error);
    }
  }

  // Get time tracking statistics
  static async getTimeTrackingStats(
    projectId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeTrackingStats> {
    try {
      let entries = await this.getAllTimeEntries();

      // Filter by project if specified
      if (projectId) {
        entries = entries.filter(entry => entry.projectId === projectId);
      }

      // Filter by date range if specified
      if (startDate && endDate) {
        entries = this.filterEntriesByDateRange(entries, startDate, endDate);
      }

      const totalMinutes = entries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );
      const totalHours = totalMinutes / 60;

      const billableEntries = entries.filter(entry => entry.billable);
      const billableMinutes = billableEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );
      const billableHours = billableMinutes / 60;
      const nonBillableHours = totalHours - billableHours;

      const totalRevenue = billableEntries.reduce((sum, entry) => {
        return sum + (entry.duration / 60) * (entry.hourlyRate || 0);
      }, 0);

      const averageHourlyRate =
        billableHours > 0 ? totalRevenue / billableHours : 0;

      // Get project and task breakdowns
      const projectBreakdown = await this.getProjectTimeBreakdown(entries);
      const taskBreakdown = await this.getTaskTimeBreakdown(entries);
      const dailyBreakdown = this.getDailyTimeBreakdown(entries);

      return {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round(nonBillableHours * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
        projectBreakdown,
        taskBreakdown,
        dailyBreakdown,
      };
    } catch (error) {
      Logger.error('Error getting time tracking stats:', error);
      return {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        totalRevenue: 0,
        averageHourlyRate: 0,
        projectBreakdown: [],
        taskBreakdown: [],
        dailyBreakdown: [],
      };
    }
  }

  // Get time tracking settings
  static async getSettings(): Promise<TimeTrackingSettings> {
    try {
      const settings =
        await StorageService.getItem<TimeTrackingSettings>(TIME_SETTINGS_KEY);
      return settings || defaultSettings;
    } catch (error) {
      Logger.error('Error getting time tracking settings:', error);
      return defaultSettings;
    }
  }

  // Update time tracking settings
  static async updateSettings(
    updates: Partial<TimeTrackingSettings>
  ): Promise<TimeTrackingSettings> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      await StorageService.setItem(TIME_SETTINGS_KEY, newSettings);
      return newSettings;
    } catch (error) {
      Logger.error('Error updating time tracking settings:', error);
      throw error;
    }
  }

  // Helper methods
  private static filterEntriesByDateRange(
    entries: TimeEntry[],
    startDate: string,
    endDate: string
  ): TimeEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= start && entryDate <= end;
    });
  }

  private static async getProjectTimeBreakdown(
    entries: TimeEntry[]
  ): Promise<ProjectTimeStats[]> {
    try {
      const projectMap = new Map<
        string,
        { entries: TimeEntry[]; project: any }
      >();

      // Group entries by project
      for (const entry of entries) {
        if (!projectMap.has(entry.projectId)) {
          const project = await ProjectService.getProjectById(entry.projectId);
          projectMap.set(entry.projectId, { entries: [], project });
        }
        projectMap.get(entry.projectId)?.entries.push(entry);
      }

      // Calculate stats for each project
      const breakdown: ProjectTimeStats[] = [];
      for (const [
        projectId,
        { entries: projectEntries, project },
      ] of projectMap) {
        const totalMinutes = projectEntries.reduce(
          (sum, entry) => sum + entry.duration,
          0
        );
        const totalHours = totalMinutes / 60;

        const billableEntries = projectEntries.filter(entry => entry.billable);
        const billableMinutes = billableEntries.reduce(
          (sum, entry) => sum + entry.duration,
          0
        );
        const billableHours = billableMinutes / 60;

        const totalRevenue = billableEntries.reduce((sum, entry) => {
          return sum + (entry.duration / 60) * (entry.hourlyRate || 0);
        }, 0);

        const estimatedHours = project?.estimatedHours || 0;
        const completionPercentage =
          estimatedHours > 0
            ? Math.min((totalHours / estimatedHours) * 100, 100)
            : 0;

        breakdown.push({
          projectId,
          projectTitle: project?.title || 'Unknown Project',
          totalHours: Math.round(totalHours * 100) / 100,
          billableHours: Math.round(billableHours * 100) / 100,
          estimatedHours,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          completionPercentage: Math.round(completionPercentage * 100) / 100,
        });
      }

      return breakdown.sort((a, b) => b.totalHours - a.totalHours);
    } catch (error) {
      Logger.error('Error getting project time breakdown:', error);
      return [];
    }
  }

  private static async getTaskTimeBreakdown(
    entries: TimeEntry[]
  ): Promise<TaskTimeStats[]> {
    try {
      const taskMap = new Map<string, { entries: TimeEntry[]; task: any }>();

      // Group entries by task
      for (const entry of entries) {
        if (!taskMap.has(entry.taskId)) {
          const task = await TaskService.getTaskById(entry.taskId);
          taskMap.set(entry.taskId, { entries: [], task });
        }
        taskMap.get(entry.taskId)?.entries.push(entry);
      }

      // Calculate stats for each task
      const breakdown: TaskTimeStats[] = [];
      for (const [taskId, { entries: taskEntries, task }] of taskMap) {
        const totalMinutes = taskEntries.reduce(
          (sum, entry) => sum + entry.duration,
          0
        );
        const totalHours = totalMinutes / 60;

        const estimatedHours = task?.estimatedHours || 0;
        const completionPercentage =
          estimatedHours > 0
            ? Math.min((totalHours / estimatedHours) * 100, 100)
            : 0;
        const isOvertime = totalHours > estimatedHours && estimatedHours > 0;

        breakdown.push({
          taskId,
          taskTitle: task?.title || 'Unknown Task',
          totalHours: Math.round(totalHours * 100) / 100,
          estimatedHours,
          completionPercentage: Math.round(completionPercentage * 100) / 100,
          isOvertime,
        });
      }

      return breakdown.sort((a, b) => b.totalHours - a.totalHours);
    } catch (error) {
      Logger.error('Error getting task time breakdown:', error);
      return [];
    }
  }

  private static getDailyTimeBreakdown(entries: TimeEntry[]): DailyTimeStats[] {
    try {
      const dailyMap = new Map<string, TimeEntry[]>();

      // Group entries by date
      for (const entry of entries) {
        const date = new Date(entry.startTime).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, []);
        }
        dailyMap.get(date)?.push(entry);
      }

      // Calculate stats for each day
      const breakdown: DailyTimeStats[] = [];
      for (const [date, dayEntries] of dailyMap) {
        const totalMinutes = dayEntries.reduce(
          (sum, entry) => sum + entry.duration,
          0
        );
        const totalHours = totalMinutes / 60;

        const billableEntries = dayEntries.filter(entry => entry.billable);
        const billableMinutes = billableEntries.reduce(
          (sum, entry) => sum + entry.duration,
          0
        );
        const billableHours = billableMinutes / 60;

        const revenue = billableEntries.reduce((sum, entry) => {
          return sum + (entry.duration / 60) * (entry.hourlyRate || 0);
        }, 0);

        breakdown.push({
          date,
          totalHours: Math.round(totalHours * 100) / 100,
          billableHours: Math.round(billableHours * 100) / 100,
          entries: dayEntries.length,
          revenue: Math.round(revenue * 100) / 100,
        });
      }

      return breakdown.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      Logger.error('Error getting daily time breakdown:', error);
      return [];
    }
  }
}
