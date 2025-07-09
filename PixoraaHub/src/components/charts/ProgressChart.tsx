import React from 'react';
import { View, Text } from 'react-native';
import { ProgressChart as RNProgressChart } from 'react-native-chart-kit';

interface ProgressChartProps {
  data: {
    labels: string[];
    data: number[]; // Values between 0 and 1
  };
  title?: string;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  colors?: string[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  size = 200,
  strokeWidth = 16,
  showPercentage = true,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1, index = 0) => colors[index % colors.length] || `rgba(31, 119, 180, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    strokeWidth,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={{ 
      marginBottom: 20,
      alignItems: 'center',
    }}>
      {title && (
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 15,
          textAlign: 'center',
          color: '#333'
        }}>
          {title}
        </Text>
      )}
      
      <View style={{
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
      }}>
        <RNProgressChart
          data={data}
          width={size}
          height={size}
          strokeWidth={strokeWidth}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
        />
      </View>

      {/* Custom Legend with Values */}
      <View style={{
        marginTop: 15,
        width: '100%',
      }}>
        {data.labels.map((label, index) => {
          const value = data.data[index];
          const percentage = (value * 100).toFixed(1);
          const color = colors[index % colors.length];
          
          return (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              paddingHorizontal: 15,
              marginVertical: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <View style={{
                  width: 12,
                  height: 12,
                  backgroundColor: color,
                  borderRadius: 6,
                  marginRight: 10,
                }} />
                <Text style={{
                  fontSize: 14,
                  color: '#333',
                  flex: 1,
                }}>
                  {label}
                </Text>
              </View>
              {showPercentage && (
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: color,
                  backgroundColor: '#e9ecef',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}>
                  {percentage}%
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}; 