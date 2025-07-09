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
