// Core User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  skills: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'project_manager' | 'team_member' | 'client';

// Client Types
export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  notes?: string;
  projectCount?: number;
  lastContactDate?: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export type ClientStatus = 'active' | 'inactive' | 'pending' | 'archived';

// Project Types
export interface Project {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName?: string;
  status: ProjectStatus;
  priority: Priority;
  budget?: number;
  totalSpent?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  taskCount?: number;
  completedTasks?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType =
  | 'ai_automation'
  | 'web_development'
  | 'app_development'
  | 'design'
  | 'consulting';
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string[]; // User IDs
  createdBy: string; // User ID
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  dependencies: string[]; // Task IDs
  tags: string[];
  comments: TaskComment[];
  attachments: TaskFile[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'blocked'
  | 'cancelled';

// Communication Types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  type: MessageType;
  attachments?: MessageFile[];
  replyTo?: string; // Message ID
  mentions: string[]; // User IDs
  reactions: MessageReaction[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'file' | 'image' | 'system';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  projectId?: string;
  members: string[]; // User IDs
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ChannelType = 'general' | 'project' | 'direct' | 'announcement';

// File Types
export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskFile extends ProjectFile {
  taskId: string;
}

export interface MessageFile extends ProjectFile {
  messageId: string;
}

// Comment Types
export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  createdAt: string;
}

// Dashboard & Analytics Types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  teamUtilization: number;
  clientSatisfaction: number;
}

export interface ProjectAnalytics {
  projectId: string;
  timeSpent: number;
  budgetUtilization: number;
  tasksCompleted: number;
  tasksRemaining: number;
  teamPerformance: TeamMemberPerformance[];
}

export interface TeamMemberPerformance {
  userId: string;
  tasksCompleted: number;
  hoursWorked: number;
  productivity: number;
}

// Form Types
export interface CreateProjectForm {
  title: string;
  description: string;
  clientId: string;
  serviceType: ServiceType;
  priority: Priority;
  budget: number;
  estimatedEndDate: string;
  teamMembers: string[];
  projectManager: string;
  tags: string[];
}

export interface CreateTaskForm {
  title: string;
  description: string;
  assignedTo: string[];
  priority: Priority;
  estimatedHours: number;
  dueDate?: string;
  tags: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation Types
export interface NavigationRoute {
  name: string;
  params?: Record<string, any>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  description?: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string, undefined if timer is running
  duration: number; // Duration in minutes
  isRunning: boolean;
  tags: string[];
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveTimer {
  timeEntryId: string;
  taskId: string;
  projectId: string;
  startTime: string;
  description?: string;
  tags: string[];
  billable: boolean;
}

export interface TimeTrackingStats {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalRevenue: number;
  averageHourlyRate: number;
  projectBreakdown: ProjectTimeStats[];
  taskBreakdown: TaskTimeStats[];
  dailyBreakdown: DailyTimeStats[];
}

export interface ProjectTimeStats {
  projectId: string;
  projectTitle: string;
  totalHours: number;
  billableHours: number;
  estimatedHours: number;
  totalRevenue: number;
  completionPercentage: number;
}

export interface TaskTimeStats {
  taskId: string;
  taskTitle: string;
  totalHours: number;
  estimatedHours: number;
  completionPercentage: number;
  isOvertime: boolean;
}

export interface DailyTimeStats {
  date: string; // YYYY-MM-DD format
  totalHours: number;
  billableHours: number;
  entries: number;
  revenue: number;
}

export interface TimeTrackingSettings {
  defaultBillable: boolean;
  reminderEnabled: boolean;
  reminderInterval: number; // minutes
  autoStopEnabled: boolean;
  autoStopDuration: number; // hours
  roundingEnabled: boolean;
  roundingInterval: number; // minutes (e.g., 15 for quarter-hour rounding)
}

// Advanced Analytics Types
export interface BusinessAnalytics {
  overview: BusinessOverview;
  revenue: RevenueAnalytics;
  productivity: ProductivityAnalytics;
  clients: ClientAnalytics;
  projects: ProjectPerformanceAnalytics;
  timeTracking: TimeAnalytics;
  trends: TrendAnalytics;
}

export interface BusinessOverview {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number; // percentage
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  activeClients: number;
  totalHours: number;
  billableHours: number;
  utilization: number; // percentage
}

export interface RevenueAnalytics {
  monthly: MonthlyRevenue[];
  byProject: ProjectRevenue[];
  byClient: ClientRevenue[];
  billableVsNonBillable: {
    billable: number;
    nonBillable: number;
  };
  averageProjectValue: number;
  topPerformingProjects: ProjectRevenue[];
}

export interface ProductivityAnalytics {
  tasksCompleted: number;
  averageTaskCompletionTime: number;
  overdueTasksPercentage: number;
  projectDeliveryRate: number;
  teamEfficiency: TeamEfficiency[];
  bottlenecks: ProductivityBottleneck[];
}

export interface ClientAnalytics {
  totalClients: number;
  newClientsThisMonth: number;
  clientRetentionRate: number;
  averageProjectsPerClient: number;
  topClientsByRevenue: ClientRevenue[];
  clientSatisfactionScores: ClientSatisfaction[];
}

export interface ProjectPerformanceAnalytics {
  onTimeDelivery: number; // percentage
  budgetAdherence: number; // percentage
  profitabilityAnalysis: ProjectProfitability[];
  resourceUtilization: ResourceUtilization[];
  projectStatusDistribution: StatusDistribution[];
}

export interface TimeAnalytics {
  dailyHours: DailyHours[];
  weeklyTrends: WeeklyTrend[];
  monthlyBreakdown: MonthlyTimeBreakdown[];
  projectTimeAllocation: ProjectTimeAllocation[];
  overtimeAnalysis: OvertimeAnalysis;
}

export interface TrendAnalytics {
  revenueGrowth: GrowthTrend[];
  clientGrowth: GrowthTrend[];
  projectVolume: GrowthTrend[];
  productivityTrends: ProductivityTrend[];
  seasonalPatterns: SeasonalPattern[];
}

// Supporting Analytics Interfaces
export interface MonthlyRevenue {
  month: string; // YYYY-MM
  revenue: number;
  billableHours: number;
  projectsCompleted: number;
}

export interface ProjectRevenue {
  projectId: string;
  projectTitle: string;
  revenue: number;
  profitability: number;
  completionPercentage: number;
}

export interface ClientRevenue {
  clientId: string;
  clientName: string;
  revenue: number;
  projectCount: number;
  averageProjectValue: number;
}

export interface TeamEfficiency {
  userId: string;
  userName: string;
  tasksCompleted: number;
  hoursWorked: number;
  efficiency: number;
  utilization: number;
}

export interface ProductivityBottleneck {
  type: 'task' | 'project' | 'resource';
  description: string;
  impact: 'low' | 'medium' | 'high';
  affectedProjects: string[];
}

export interface ClientSatisfaction {
  clientId: string;
  clientName: string;
  score: number; // 1-10
  lastSurveyDate: string;
}

export interface ProjectProfitability {
  projectId: string;
  projectTitle: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
}

export interface ResourceUtilization {
  resourceType: 'human' | 'equipment' | 'software';
  name: string;
  utilization: number;
  capacity: number;
}

export interface StatusDistribution {
  status: ProjectStatus;
  count: number;
  percentage: number;
}

export interface DailyHours {
  date: string; // YYYY-MM-DD
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface WeeklyTrend {
  week: string; // YYYY-WW
  totalHours: number;
  revenue: number;
  efficiency: number;
}

export interface MonthlyTimeBreakdown {
  month: string; // YYYY-MM
  totalHours: number;
  billableHours: number;
  overtimeHours: number;
  averageDailyHours: number;
}

export interface ProjectTimeAllocation {
  projectId: string;
  projectTitle: string;
  allocatedHours: number;
  actualHours: number;
  variance: number;
}

export interface OvertimeAnalysis {
  totalOvertimeHours: number;
  overtimePercentage: number;
  costOfOvertime: number;
  topOvertimeProjects: ProjectTimeAllocation[];
}

export interface GrowthTrend {
  period: string;
  value: number;
  growth: number; // percentage change
}

export interface ProductivityTrend {
  period: string;
  tasksCompleted: number;
  averageCompletionTime: number;
  efficiency: number;
}

export interface SeasonalPattern {
  period: string; // Q1, Q2, Q3, Q4 or month names
  revenue: number;
  projectVolume: number;
  pattern: 'peak' | 'normal' | 'low';
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export interface PieChartData {
  data: ChartDataPoint[];
  centerLabel?: string;
  centerValue?: string;
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// Analytics Filter Types
export interface AnalyticsFilter {
  dateRange: {
    start: string;
    end: string;
  };
  projects?: string[];
  clients?: string[];
  users?: string[];
  includeArchived: boolean;
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'xlsx';
  includeCharts: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  sections: string[];
}

// File Attachments Types
export type AttachmentType = 'client' | 'project' | 'task';

export interface FileAttachment {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  entityId: string;
  entityType: AttachmentType;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface FileUploadResult {
  success: boolean;
  attachment?: FileAttachment;
  error?: string;
}

export interface FilePickerOptions {
  allowMultiple?: boolean;
  fileTypes?: string[];
  maxFileSize?: number; // in bytes
}

export interface AttachmentStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<AttachmentType, number>;
}

// Notification Types
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
