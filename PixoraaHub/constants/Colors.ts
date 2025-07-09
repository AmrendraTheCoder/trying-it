/**
 * Clean mobile-first color scheme for PixoraaHub
 * Optimized for white theme with excellent contrast and readability
 */

const tintColorLight = '#007AFF'; // iOS blue
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    // Primary colors - clean iOS-style blue
    primary: '#007AFF',
    primaryLight: '#4DA2FF',
    primaryDark: '#0056CC',

    // Secondary colors - subtle purple
    secondary: '#5856D6',
    secondaryLight: '#7B7AE8',
    secondaryDark: '#4B49C4',

    // Accent colors - fresh green
    accent: '#34C759',
    accentLight: '#62D584',
    accentDark: '#28A745',

    // Semantic colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',

    // Neutral colors - clean white theme
    background: '#FFFFFF',
    surface: '#F2F2F7', // iOS light gray
    surfaceSecondary: '#FFFFFF', // Pure white for cards
    border: '#D1D1D6', // iOS separator
    borderLight: '#F2F2F7',

    // Text colors - high contrast for readability
    text: '#000000',
    textSecondary: '#3C3C43', // iOS secondary text
    textMuted: '#8E8E93', // iOS tertiary text
    textInverse: '#FFFFFF',

    // Icon colors
    icon: '#8E8E93',
    iconActive: '#007AFF',

    // Tab colors
    tint: tintColorLight,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,

    // Status colors
    statusActive: '#34C759',
    statusInactive: '#8E8E93',
    statusPending: '#FF9500',
    statusCompleted: '#34C759',
    statusOverdue: '#FF3B30',
  },
  dark: {
    // Primary colors
    primary: '#0A84FF',
    primaryLight: '#409CFF',
    primaryDark: '#0056CC',

    // Secondary colors
    secondary: '#5E5CE6',
    secondaryLight: '#7D7AFF',
    secondaryDark: '#4B49C4',

    // Accent colors
    accent: '#30D158',
    accentLight: '#64D787',
    accentDark: '#28A745',

    // Semantic colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',

    // Neutral colors
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    border: '#38383A',
    borderLight: '#2C2C2E',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textMuted: '#8E8E93',
    textInverse: '#000000',

    // Icon colors
    icon: '#8E8E93',
    iconActive: '#0A84FF',

    // Tab colors
    tint: tintColorDark,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,

    // Status colors
    statusActive: '#30D158',
    statusInactive: '#8E8E93',
    statusPending: '#FF9F0A',
    statusCompleted: '#30D158',
    statusOverdue: '#FF453A',
  },
};

// Mobile-optimized spacing system
export const Spacing = {
  xs: 4, // Minimal spacing
  sm: 8, // Small spacing
  md: 16, // Standard spacing
  lg: 20, // Large spacing (reduced for mobile)
  xl: 24, // Extra large (reduced for mobile)
  xxl: 32, // Maximum spacing (reduced for mobile)

  // Touch targets for mobile
  touchTarget: 44, // iOS standard touch target
  cardPadding: 16, // Standard card padding
  screenPadding: 16, // Screen edge padding
};

// Mobile-optimized typography
export const Typography = {
  heading1: {
    fontSize: 28, // Reduced for mobile
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  heading2: {
    fontSize: 22, // Reduced for mobile
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  heading4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16, // iOS body text
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  bodySemiBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13, // iOS caption
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 11, // iOS footnote
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  smallMedium: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
};

// Mobile-optimized shadows
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Mobile-optimized border radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8, // iOS standard
  lg: 12, // Cards
  xl: 16, // Large cards
  round: 20, // Buttons
  full: 999, // Circles
};
