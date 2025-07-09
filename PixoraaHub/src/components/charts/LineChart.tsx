import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { LineChartData } from '../../types';

interface LineChartProps {
  data: LineChartData;
  title?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  color?: string;
}

const screenWidth = Dimensions.get('window').width;

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 220,
  showGrid = true,
  animated = true,
  color = '#1f77b4',
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(31, 119, 180, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid grid lines
      stroke: '#e0e0e0',
      strokeWidth: 1,
    },
    fillShadowGradient: color,
    fillShadowGradientOpacity: 0.3,
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      data: dataset.data,
      color: (opacity = 1) => dataset.color || `rgba(31, 119, 180, ${opacity})`,
      strokeWidth: 2,
    })),
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {title && (
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 10,
            textAlign: 'center',
            color: '#333',
          }}
        >
          {title}
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <RNLineChart
          data={chartData}
          width={Math.max(screenWidth - 40, data.labels.length * 50)}
          height={height}
          chartConfig={chartConfig}
          bezier={animated}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withDots={true}
          withShadow={true}
          withScrollableDot={false}
          withInnerLines={showGrid}
          withOuterLines={true}
          yAxisLabel='$'
          yAxisSuffix=''
          formatYLabel={value => {
            const num = parseFloat(value);
            if (num >= 1000000) {
              return `${(num / 1000000).toFixed(1)}M`;
            } else if (num >= 1000) {
              return `${(num / 1000).toFixed(1)}K`;
            }
            return num.toFixed(0);
          }}
        />
      </ScrollView>

      {/* Legend */}
      {data.datasets.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 10,
          }}
        >
          {data.datasets.map((dataset, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                marginVertical: 5,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: dataset.color,
                  borderRadius: 6,
                  marginRight: 5,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: '#666',
                }}
              >
                {dataset.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
