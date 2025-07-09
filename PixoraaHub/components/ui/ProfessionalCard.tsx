import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Colors,
  Spacing,
  Typography,
  Shadows,
  BorderRadius,
} from '../../constants/Colors';
import { useThemeColor } from '../../hooks/useThemeColor';

interface ProfessionalCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadows;
  variant?: 'default' | 'surface' | 'bordered';
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
  shadow = 'sm',
  variant = 'default',
}) => {
  const backgroundColor = useThemeColor(
    {
      light:
        variant === 'surface' ? Colors.light.surface : Colors.light.background,
      dark:
        variant === 'surface' ? Colors.dark.surface : Colors.dark.background,
    },
    'background'
  );

  const borderColor = useThemeColor(
    { light: Colors.light.border, dark: Colors.dark.border },
    'border'
  );

  const cardStyle = [
    styles.card,
    {
      backgroundColor,
      padding: Spacing[padding],
      ...Shadows[shadow],
      borderWidth: variant === 'bordered' ? 1 : 0,
      borderColor: variant === 'bordered' ? borderColor : 'transparent',
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  onPress,
  trend,
  trendValue,
}) => {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor(
    { light: Colors.light.textSecondary, dark: Colors.dark.textSecondary },
    'text'
  );
  const textMuted = useThemeColor(
    { light: Colors.light.textMuted, dark: Colors.dark.textMuted },
    'text'
  );

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return Colors.light.success;
      case 'down':
        return Colors.light.error;
      default:
        return textMuted;
    }
  };

  return (
    <ProfessionalCard onPress={onPress} shadow='md'>
      <View>
        <Text style={[styles.statTitle, { color: textMuted }]}>{title}</Text>
        <Text style={[styles.statValue, { color: color || textColor }]}>
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: textSecondary }]}>
            {subtitle}
          </Text>
        )}
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}{' '}
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </ProfessionalCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  statTitle: {
    ...Typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.heading2,
    marginBottom: Spacing.xs / 2,
  },
  statSubtitle: {
    ...Typography.caption,
  },
  trendContainer: {
    marginTop: Spacing.xs,
  },
  trendText: {
    ...Typography.captionMedium,
  },
});
