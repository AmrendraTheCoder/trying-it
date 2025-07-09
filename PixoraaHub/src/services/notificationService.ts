import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Storage keys
const NOTIFICATIONS_KEY = '@PixoraaHub:notifications';
const NOTIFICATION_SETTINGS_KEY = '@PixoraaHub:notification_settings';
const NOTIFICATION_TOKEN_KEY = '@PixoraaHub:notification_token';

// Notification types
export type NotificationType =
  | 'task_due'
  | 'task_assigned'
  | 'task_completed'
  | 'project_update'
  | 'client_message'
  | 'system_update'
  | 'reminder'
  | 'time_tracking';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  data?: Record<string, any>;
  entityId?: string; // Related task, project, or client ID
  entityType?: 'task' | 'project' | 'client';
  read: boolean;
  createdAt: string;
  scheduledFor?: string; // For scheduled notifications
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  categories: {
    [K in NotificationType]: {
      enabled: boolean;
      pushEnabled: boolean;
      soundEnabled: boolean;
    };
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  todayCount: number;
  weekCount: number;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private settings: NotificationSettings | null = null;
  private pushToken: string | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Configure notifications
      await this.configureNotifications();

      // Load stored data
      await Promise.all([
        this.loadNotifications(),
        this.loadSettings(),
        this.loadPushToken(),
      ]);

      // Register for push notifications if enabled
      if (this.settings?.pushEnabled) {
        await this.registerForPushNotifications();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  private async configureNotifications(): Promise<void> {
    // Set the notification handler
    Notifications.setNotificationHandler({
      handleNotification: async notification => {
        const settings = await this.getSettings();

        // Check quiet hours
        if (
          settings.quietHours.enabled &&
          this.isQuietHours(settings.quietHours)
        ) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: settings.soundEnabled,
          shouldSetBadge: true,
        };
      },
    });

    // Request permissions on iOS
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this.settings = JSON.parse(stored);
      } else {
        this.settings = this.getDefaultSettings();
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  private async loadPushToken(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
      this.pushToken = stored;
    } catch (error) {
      console.error('Failed to load push token:', error);
    }
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      this.pushToken = token;
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  private getDefaultSettings(): NotificationSettings {
    const defaultCategorySettings = {
      enabled: true,
      pushEnabled: true,
      soundEnabled: true,
    };

    return {
      enabled: true,
      pushEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
      categories: {
        task_due: defaultCategorySettings,
        task_assigned: defaultCategorySettings,
        task_completed: defaultCategorySettings,
        project_update: defaultCategorySettings,
        client_message: defaultCategorySettings,
        system_update: { ...defaultCategorySettings, soundEnabled: false },
        reminder: defaultCategorySettings,
        time_tracking: { ...defaultCategorySettings, pushEnabled: false },
      },
    };
  }

  private isQuietHours(
    quietHours: NotificationSettings['quietHours']
  ): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = quietHours.startTime;
    const end = quietHours.endTime;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= start && currentTime <= end;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      await this.savePushToken(token);
      return token;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  async createNotification(
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<AppNotification> {
    await this.initialize();

    const newNotification: AppNotification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    await this.saveNotifications();

    // Show local notification if enabled and not scheduled
    if (
      !notification.scheduledFor &&
      this.shouldShowNotification(notification.type)
    ) {
      await this.showLocalNotification(newNotification);
    }

    // Schedule notification if scheduled
    if (notification.scheduledFor) {
      await this.scheduleNotification(newNotification);
    }

    return newNotification;
  }

  async getNotifications(options?: {
    type?: NotificationType;
    read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AppNotification[]> {
    await this.initialize();

    let filtered = [...this.notifications];

    if (options?.type) {
      filtered = filtered.filter(n => n.type === options.type);
    }

    if (options?.read !== undefined) {
      filtered = filtered.filter(n => n.read === options.read);
    }

    // Sort by creation date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (options?.limit) {
      const start = options.offset || 0;
      filtered = filtered.slice(start, start + options.limit);
    }

    return filtered;
  }

  async getNotificationById(id: string): Promise<AppNotification | null> {
    await this.initialize();
    return this.notifications.find(n => n.id === id) || null;
  }

  async markAsRead(id: string): Promise<boolean> {
    await this.initialize();

    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return false;

    notification.read = true;
    await this.saveNotifications();
    return true;
  }

  async markAllAsRead(type?: NotificationType): Promise<number> {
    await this.initialize();

    let updatedCount = 0;
    this.notifications.forEach(notification => {
      if (!notification.read && (!type || notification.type === type)) {
        notification.read = true;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await this.saveNotifications();
    }

    return updatedCount;
  }

  async deleteNotification(id: string): Promise<boolean> {
    await this.initialize();

    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    // Cancel scheduled notification if it exists
    await Notifications.cancelScheduledNotificationAsync(id);

    this.notifications.splice(index, 1);
    await this.saveNotifications();
    return true;
  }

  async clearNotifications(type?: NotificationType): Promise<number> {
    await this.initialize();

    const before = this.notifications.length;

    if (type) {
      this.notifications = this.notifications.filter(n => n.type !== type);
    } else {
      this.notifications = [];
    }

    const deleted = before - this.notifications.length;

    if (deleted > 0) {
      await this.saveNotifications();

      // Cancel all scheduled notifications if clearing all
      if (!type) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    }

    return deleted;
  }

  async getSettings(): Promise<NotificationSettings> {
    await this.initialize();
    return this.settings!;
  }

  async updateSettings(updates: Partial<NotificationSettings>): Promise<void> {
    await this.initialize();

    this.settings = { ...this.settings!, ...updates };
    await this.saveSettings();

    // Update push notification registration based on settings
    if (updates.pushEnabled !== undefined) {
      if (updates.pushEnabled) {
        await this.registerForPushNotifications();
      }
    }
  }

  async getStats(): Promise<NotificationStats> {
    await this.initialize();

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: NotificationStats = {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.read).length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      todayCount: this.notifications.filter(n => n.createdAt.startsWith(today))
        .length,
      weekCount: this.notifications.filter(
        n => new Date(n.createdAt) >= weekAgo
      ).length,
    };

    // Initialize counters
    const types: NotificationType[] = [
      'task_due',
      'task_assigned',
      'task_completed',
      'project_update',
      'client_message',
      'system_update',
      'reminder',
      'time_tracking',
    ];
    const priorities: NotificationPriority[] = [
      'low',
      'normal',
      'high',
      'urgent',
    ];

    types.forEach(type => {
      stats.byType[type] = 0;
    });
    priorities.forEach(priority => {
      stats.byPriority[priority] = 0;
    });

    // Count by type and priority
    this.notifications.forEach(notification => {
      stats.byType[notification.type]++;
      stats.byPriority[notification.priority]++;
    });

    return stats;
  }

  async scheduleNotification(notification: AppNotification): Promise<void> {
    if (!notification.scheduledFor) return;

    const settings = await this.getSettings();
    if (!this.shouldShowNotification(notification.type)) return;

    const scheduledDate = new Date(notification.scheduledFor);

    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: settings.soundEnabled ? 'default' : undefined,
        priority: this.mapPriorityToExpo(notification.priority),
      },
      trigger: {
        date: scheduledDate,
      },
    });

    // Handle recurring notifications
    if (notification.recurring) {
      await this.scheduleRecurringNotification(notification);
    }
  }

  private async scheduleRecurringNotification(
    notification: AppNotification
  ): Promise<void> {
    if (!notification.recurring || !notification.scheduledFor) return;

    const { frequency, interval, endDate } = notification.recurring;
    let nextDate = new Date(notification.scheduledFor);
    const end = endDate ? new Date(endDate) : new Date('2025-12-31'); // Default end date

    let count = 0;
    const maxRecurrences = 100; // Prevent infinite loop

    while (nextDate <= end && count < maxRecurrences) {
      // Calculate next occurrence
      switch (frequency) {
        case 'daily':
          nextDate = new Date(
            nextDate.getTime() + interval * 24 * 60 * 60 * 1000
          );
          break;
        case 'weekly':
          nextDate = new Date(
            nextDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000
          );
          break;
        case 'monthly':
          nextDate = new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + interval,
            nextDate.getDate()
          );
          break;
      }

      if (nextDate <= end) {
        const recurringNotification: AppNotification = {
          ...notification,
          id: this.generateId(),
          scheduledFor: nextDate.toISOString(),
          createdAt: new Date().toISOString(),
        };

        await Notifications.scheduleNotificationAsync({
          identifier: recurringNotification.id,
          content: {
            title: recurringNotification.title,
            body: recurringNotification.body,
            data: recurringNotification.data || {},
          },
          trigger: {
            date: nextDate,
          },
        });

        this.notifications.unshift(recurringNotification);
        count++;
      }
    }

    if (count > 0) {
      await this.saveNotifications();
    }
  }

  private async showLocalNotification(
    notification: AppNotification
  ): Promise<void> {
    const settings = await this.getSettings();

    await Notifications.presentNotificationAsync({
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: settings.soundEnabled ? 'default' : undefined,
      priority: this.mapPriorityToExpo(notification.priority),
    });
  }

  private shouldShowNotification(type: NotificationType): boolean {
    if (!this.settings?.enabled) return false;
    if (!this.settings.categories[type]?.enabled) return false;

    return true;
  }

  private mapPriorityToExpo(
    priority: NotificationPriority
  ): 'min' | 'low' | 'normal' | 'high' | 'max' {
    switch (priority) {
      case 'low':
        return 'low';
      case 'normal':
        return 'normal';
      case 'high':
        return 'high';
      case 'urgent':
        return 'max';
      default:
        return 'normal';
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getPushToken(): Promise<string | null> {
    await this.initialize();
    return this.pushToken;
  }

  // Convenience methods for common notification types
  async createTaskDueNotification(
    taskTitle: string,
    dueDate: Date,
    taskId: string
  ): Promise<AppNotification> {
    return this.createNotification({
      title: 'Task Due Soon',
      body: `"${taskTitle}" is due ${this.formatDueDate(dueDate)}`,
      type: 'task_due',
      priority: 'high',
      entityId: taskId,
      entityType: 'task',
      data: { taskId, dueDate: dueDate.toISOString() },
    });
  }

  async createTaskAssignedNotification(
    taskTitle: string,
    assignedBy: string,
    taskId: string
  ): Promise<AppNotification> {
    return this.createNotification({
      title: 'New Task Assigned',
      body: `You have been assigned "${taskTitle}" by ${assignedBy}`,
      type: 'task_assigned',
      priority: 'normal',
      entityId: taskId,
      entityType: 'task',
      data: { taskId, assignedBy },
    });
  }

  async createProjectUpdateNotification(
    projectTitle: string,
    updateType: string,
    projectId: string
  ): Promise<AppNotification> {
    return this.createNotification({
      title: 'Project Update',
      body: `${updateType} in project "${projectTitle}"`,
      type: 'project_update',
      priority: 'normal',
      entityId: projectId,
      entityType: 'project',
      data: { projectId, updateType },
    });
  }

  private formatDueDate(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days < 0) return 'overdue';
    if (days <= 7) return `in ${days} days`;

    return `on ${date.toLocaleDateString()}`;
  }
}

export const notificationService = new NotificationService();
