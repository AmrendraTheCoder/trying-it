import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/Colors';
import { useThemeColor } from '../../hooks/useThemeColor';

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  rightButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  leftButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  style?: any;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  title,
  subtitle,
  rightButton,
  leftButton,
  style,
}) => {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor(
    { light: Colors.light.textSecondary, dark: Colors.dark.textSecondary },
    'text'
  );

  return (
    <View style={[styles.header, style]}>
      <View style={styles.titleContainer}>
        {leftButton && <ActionButton {...leftButton} />}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightButton && <ActionButton {...rightButton} />}
    </View>
  );
};

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    ];

    if (disabled) {
      return [...baseStyle, styles.buttonDisabled];
    }

    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.buttonPrimary];
      case 'secondary':
        return [...baseStyle, styles.buttonSecondary];
      case 'outline':
        return [...baseStyle, styles.buttonOutline];
      default:
        return [...baseStyle, styles.buttonPrimary];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.buttonText,
      styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}`],
    ];

    if (disabled) {
      return [...baseStyle, styles.buttonTextDisabled];
    }

    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.buttonTextPrimary];
      case 'secondary':
        return [...baseStyle, styles.buttonTextSecondary];
      case 'outline':
        return [...baseStyle, styles.buttonTextOutline];
      default:
        return [...baseStyle, styles.buttonTextPrimary];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outlined';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'medium',
}) => {
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '');

    switch (normalizedStatus) {
      case 'active':
      case 'completed':
      case 'done':
        return Colors.light.success;
      case 'pending':
      case 'todo':
      case 'waiting':
        return Colors.light.warning;
      case 'inactive':
      case 'cancelled':
      case 'paused':
        return Colors.light.textMuted;
      case 'overdue':
      case 'urgent':
        return Colors.light.error;
      case 'inprogress':
      case 'working':
        return Colors.light.info;
      default:
        return Colors.light.textMuted;
    }
  };

  const color = getStatusColor(status);
  const displayText = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const badgeStyle = [
    styles.badge,
    styles[`badge${size.charAt(0).toUpperCase() + size.slice(1)}`],
    variant === 'outlined'
      ? { borderColor: color, borderWidth: 1, backgroundColor: 'transparent' }
      : { backgroundColor: color + '20' },
  ];

  const textStyle = [
    styles.badgeText,
    styles[`badgeText${size.charAt(0).toUpperCase() + size.slice(1)}`],
    { color },
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    ...Typography.heading2,
    marginBottom: Spacing.xs / 2,
  },
  subtitle: {
    ...Typography.caption,
  },
  // Button styles
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 32,
  },
  buttonMedium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  buttonLarge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.light.surface,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.surfaceSecondary,
    opacity: 0.6,
  },
  // Button text styles
  buttonText: {
    fontWeight: '600',
  },
  buttonTextSmall: {
    ...Typography.captionMedium,
  },
  buttonTextMedium: {
    ...Typography.bodyMedium,
  },
  buttonTextLarge: {
    ...Typography.bodySemiBold,
  },
  buttonTextPrimary: {
    color: Colors.light.textInverse,
  },
  buttonTextSecondary: {
    color: Colors.light.primary,
  },
  buttonTextOutline: {
    color: Colors.light.primary,
  },
  buttonTextDisabled: {
    color: Colors.light.textMuted,
  },
  // Badge styles
  badge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmall: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  badgeText: {
    fontWeight: '500',
  },
  badgeTextSmall: {
    ...Typography.small,
  },
  badgeTextMedium: {
    ...Typography.captionMedium,
  },
});
