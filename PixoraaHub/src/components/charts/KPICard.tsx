import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
  prefix?: string;
  suffix?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = '#2196F3',
  onPress,
  prefix = '',
  suffix = '',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${prefix}${(val / 1000000).toFixed(1)}M${suffix}`;
      } else if (val >= 1000) {
        return `${prefix}${(val / 1000).toFixed(1)}K${suffix}`;
      }
      return `${prefix}${val.toLocaleString()}${suffix}`;
    }
    return `${prefix}${val}${suffix}`;
  };

  const CardContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        minHeight: 140,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: '#666',
            fontWeight: '500',
            flex: 1,
            marginRight: 10,
          }}
        >
          {title}
        </Text>
        {icon && (
          <View
            style={{
              backgroundColor: `${color}15`,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name={icon} size={20} color={color} />
          </View>
        )}
      </View>

      {/* Main Value */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 8,
        }}
      >
        {formatValue(value)}
      </Text>

      {/* Bottom Section */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              color: '#888',
              flex: 1,
            }}
          >
            {subtitle}
          </Text>
        )}

        {trend && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: trend.isPositive ? '#E8F5E8' : '#FFEBEE',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend.isPositive ? '#4CAF50' : '#F44336'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: trend.isPositive ? '#4CAF50' : '#F44336',
              }}
            >
              {Math.abs(trend.value).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{ marginBottom: 15 }}
        activeOpacity={0.7}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ marginBottom: 15 }}>
      <CardContent />
    </View>
  );
};
