import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  showZero?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'medium',
  color = 'white',
  backgroundColor = '#F44336',
  style,
  showZero = false,
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyles = getSize();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, sizeStyles.text, { color }]} numberOfLines={1}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallContainer: {
    minHeight: 16,
    minWidth: 16,
    borderRadius: 8,
    paddingHorizontal: 2,
  },
  smallText: {
    fontSize: 10,
  },
  mediumContainer: {
    minHeight: 20,
    minWidth: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  mediumText: {
    fontSize: 12,
  },
  largeContainer: {
    minHeight: 24,
    minWidth: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  largeText: {
    fontSize: 14,
  },
});
