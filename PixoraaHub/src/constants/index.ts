// App Configuration
export const APP_CONFIG = {
  APP_NAME: "Pixoraa Hub",
  VERSION: "1.0.0",
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// API Endpoints
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Users
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    BY_ID: (id: string) => `/users/${id}`,
    SEARCH: "/users/search",
  },

  // Clients
  CLIENTS: {
    BASE: "/clients",
    BY_ID: (id: string) => `/clients/${id}`,
    PROJECTS: (id: string) => `/clients/${id}/projects`,
  },

  // Projects
  PROJECTS: {
    BASE: "/projects",
    BY_ID: (id: string) => `/projects/${id}`,
    TASKS: (id: string) => `/projects/${id}/tasks`,
    MEMBERS: (id: string) => `/projects/${id}/members`,
    FILES: (id: string) => `/projects/${id}/files`,
    ANALYTICS: (id: string) => `/projects/${id}/analytics`,
  },

  // Tasks
  TASKS: {
    BASE: "/tasks",
    BY_ID: (id: string) => `/tasks/${id}`,
    COMMENTS: (id: string) => `/tasks/${id}/comments`,
    ATTACHMENTS: (id: string) => `/tasks/${id}/attachments`,
  },

  // Communication
  MESSAGES: {
    BASE: "/messages",
    BY_CHANNEL: (channelId: string) => `/messages/channel/${channelId}`,
    SEND: "/messages/send",
  },

  CHANNELS: {
    BASE: "/channels",
    BY_ID: (id: string) => `/channels/${id}`,
    MEMBERS: (id: string) => `/channels/${id}/members`,
  },

  // Files
  FILES: {
    UPLOAD: "/files/upload",
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    DELETE: (id: string) => `/files/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: "/dashboard/stats",
    ANALYTICS: "/dashboard/analytics",
  },
} as const;

// Service Types
export const SERVICE_TYPES = {
  AI_AUTOMATION: "ai_automation",
  WEB_DEVELOPMENT: "web_development",
  APP_DEVELOPMENT: "app_development",
  DESIGN: "design",
  CONSULTING: "consulting",
} as const;

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.AI_AUTOMATION]: "AI & Automation",
  [SERVICE_TYPES.WEB_DEVELOPMENT]: "Web Development",
  [SERVICE_TYPES.APP_DEVELOPMENT]: "App Development",
  [SERVICE_TYPES.DESIGN]: "Design",
  [SERVICE_TYPES.CONSULTING]: "Consulting",
} as const;

// Status Constants
export const PROJECT_STATUSES = {
  PROPOSAL: "proposal",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed",
  ON_HOLD: "on_hold",
  CANCELLED: "cancelled",
} as const;

export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed",
  BLOCKED: "blocked",
  CANCELLED: "cancelled",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  TEAM_MEMBER: "team_member",
  CLIENT: "client",
} as const;

export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// UI Constants
export const COLORS = {
  PRIMARY: "#6366F1",
  SECONDARY: "#8B5CF6",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  INFO: "#3B82F6",

  // Status Colors
  PROPOSAL: "#8B5CF6",
  IN_PROGRESS: "#3B82F6",
  REVIEW: "#F59E0B",
  COMPLETED: "#10B981",
  ON_HOLD: "#6B7280",
  CANCELLED: "#EF4444",

  // Priority Colors
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  URGENT: "#DC2626",

  // Background
  BACKGROUND: "#F9FAFB",
  SURFACE: "#FFFFFF",
  CARD: "#FFFFFF",

  // Text
  TEXT_PRIMARY: "#111827",
  TEXT_SECONDARY: "#6B7280",
  TEXT_MUTED: "#9CA3AF",
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32,
} as const;

// Navigation Constants
export const SCREEN_NAMES = {
  // Auth
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",

  // Main Tabs
  DASHBOARD: "Dashboard",
  PROJECTS: "Projects",
  TASKS: "Tasks",
  TEAM: "Team",
  CLIENTS: "Clients",
  COMMUNICATION: "Communication",

  // Project Screens
  PROJECT_DETAILS: "ProjectDetails",
  CREATE_PROJECT: "CreateProject",
  EDIT_PROJECT: "EditProject",

  // Task Screens
  TASK_DETAILS: "TaskDetails",
  CREATE_TASK: "CreateTask",
  EDIT_TASK: "EditTask",

  // Team Screens
  TEAM_MEMBER_PROFILE: "TeamMemberProfile",

  // Client Screens
  CLIENT_DETAILS: "ClientDetails",
  CREATE_CLIENT: "CreateClient",

  // Communication Screens
  CHAT: "Chat",
  CHANNEL_DETAILS: "ChannelDetails",
  CREATE_CHANNEL: "CreateChannel",

  // Settings
  SETTINGS: "Settings",
  PROFILE: "Profile",
  NOTIFICATIONS: "Notifications",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  THEME: "theme",
  LANGUAGE: "language",
  LAST_SYNC: "last_sync",
  OFFLINE_DATA: "offline_data",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: "task_assigned",
  TASK_COMPLETED: "task_completed",
  PROJECT_UPDATED: "project_updated",
  MESSAGE_RECEIVED: "message_received",
  DEADLINE_APPROACHING: "deadline_approaching",
  TEAM_INVITATION: "team_invitation",
} as const;

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  ARCHIVES: ["application/zip", "application/x-rar-compressed"],
} as const;

// Query Keys (for React Query)
export const QUERY_KEYS = {
  // Auth
  AUTH_USER: ["auth", "user"],

  // Dashboard
  DASHBOARD_STATS: ["dashboard", "stats"],

  // Projects
  PROJECTS: ["projects"],
  PROJECT: (id: string) => ["projects", id],
  PROJECT_TASKS: (id: string) => ["projects", id, "tasks"],
  PROJECT_ANALYTICS: (id: string) => ["projects", id, "analytics"],

  // Tasks
  TASKS: ["tasks"],
  TASK: (id: string) => ["tasks", id],
  TASK_COMMENTS: (id: string) => ["tasks", id, "comments"],

  // Users/Team
  USERS: ["users"],
  USER: (id: string) => ["users", id],

  // Clients
  CLIENTS: ["clients"],
  CLIENT: (id: string) => ["clients", id],
  CLIENT_PROJECTS: (id: string) => ["clients", id, "projects"],

  // Communication
  CHANNELS: ["channels"],
  CHANNEL: (id: string) => ["channels", id],
  MESSAGES: (channelId: string) => ["messages", "channel", channelId],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  INVALID_FILE_TYPE: "Invalid file type.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: "Project created successfully!",
  PROJECT_UPDATED: "Project updated successfully!",
  TASK_CREATED: "Task created successfully!",
  TASK_UPDATED: "Task updated successfully!",
  MESSAGE_SENT: "Message sent successfully!",
  FILE_UPLOADED: "File uploaded successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
} as const;
