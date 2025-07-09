import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { PieChartData } from '../../types';

interface PieChartProps {
  data: PieChartData;
  title?: string;
  size?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  hasLegend?: boolean;
}

const screenWidth = Dimensions.get('window').width;

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  size = Math.min(screenWidth - 80, 250),
  showLegend = true,
  showPercentage = true,
  hasLegend = true
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  // Default colors for pie chart segments
  const defaultColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  // Prepare chart data with colors
  const chartData = data.data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
    legendFontColor: '#666666',
    legendFontSize: 12,
  }));

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <RNPieChart
          data={chartData}
          width={size}
          height={size * 0.8}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          hasLegend={hasLegend}
          absolute={!showPercentage}
        />

        {/* Center Label */}
        {data.centerLabel && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -50 }, { translateY: -30 }],
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#333',
              textAlign: 'center',
            }}>
              {data.centerLabel}
            </Text>
            {data.centerValue && (
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#2196F3',
                textAlign: 'center',
              }}>
                {data.centerValue}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Custom Legend with Percentages */}
      {showLegend && !hasLegend && (
        <View style={{
          marginTop: 15,
          width: '100%',
        }}>
          {chartData.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
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
                    backgroundColor: item.color,
                    borderRadius: 6,
                    marginRight: 10,
                  }} />
                  <Text style={{
                    fontSize: 14,
                    color: '#333',
                    flex: 1,
                  }}>
                    {item.label}
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#555',
                    marginRight: 10,
                  }}>
                    {item.value.toLocaleString()}
                  </Text>
                  {showPercentage && (
                    <Text style={{
                      fontSize: 12,
                      color: '#888',
                      backgroundColor: '#e9ecef',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}>
                      {percentage}%
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}; 