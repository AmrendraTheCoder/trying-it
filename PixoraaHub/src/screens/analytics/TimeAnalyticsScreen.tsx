import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, KPICard, ProgressChart } from '../../components';
import { analyticsService } from '../../services/analyticsService';
import {
  TimeAnalytics,
  AnalyticsFilter,
  LineChartData,
  BarChartData,
} from '../../types';

type TimeRange = 'daily' | 'weekly' | 'monthly';

export const TimeAnalyticsScreen: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('weekly');
  const [analytics, setAnalytics] = useState<TimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const filter = getFilterForRange(selectedRange);
      const businessAnalytics =
        await analyticsService.getBusinessAnalytics(filter);
      setAnalytics(businessAnalytics.timeTracking);
    } catch (error) {
      console.error('Failed to load time analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const getFilterForRange = (range: TimeRange): AnalyticsFilter => {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 84); // Last 12 weeks
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
        break;
    }

    return {
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      includeArchived: false,
    };
  };

  const getChartDataForRange = (): {
    revenue: LineChartData;
    hours: BarChartData;
  } => {
    if (!analytics) {
      return {
        revenue: { labels: [], datasets: [] },
        hours: { labels: [], datasets: [] },
      };
    }

    let data: Array<{ period: string; hours: number; revenue: number }> = [];

    switch (selectedRange) {
      case 'daily':
        data = analytics.dailyHours.map(item => ({
          period: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          hours: item.totalHours,
          revenue: item.totalHours * 75, // Estimated revenue
        }));
        break;
      case 'weekly':
        data = analytics.weeklyTrends.map(item => ({
          period: `Week ${item.week.split('-W')[1]}`,
          hours: item.totalHours,
          revenue: item.revenue,
        }));
        break;
      case 'monthly':
        data = analytics.monthlyBreakdown.map(item => ({
          period: new Date(item.month + '-01').toLocaleDateString('en-US', {
            month: 'short',
          }),
          hours: item.totalHours,
          revenue: item.totalHours * 75, // Estimated revenue
        }));
        break;
    }

    return {
      revenue: {
        labels: data.map(d => d.period),
        datasets: [
          {
            label: 'Revenue',
            data: data.map(d => d.revenue),
            color: '#4CAF50',
          },
        ],
      },
      hours: {
        labels: data.map(d => d.period),
        datasets: [
          {
            label: 'Total Hours',
            data: data.map(d => d.hours),
            color: '#2196F3',
          },
        ],
      },
    };
  };

  const getKPIData = () => {
    if (!analytics) return null;

    const totalHours = analytics.dailyHours.reduce(
      (sum, day) => sum + day.totalHours,
      0
    );
    const totalBillableHours = analytics.dailyHours.reduce(
      (sum, day) => sum + day.billableHours,
      0
    );
    const utilization =
      totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;
    const averageDailyHours =
      analytics.monthlyBreakdown.length > 0
        ? analytics.monthlyBreakdown[0]?.averageDailyHours || 0
        : 0;

    return {
      totalHours,
      billableHours: totalBillableHours,
      utilization,
      averageDailyHours,
      overtimeHours: analytics.overtimeAnalysis.totalOvertimeHours,
      overtimePercentage: analytics.overtimeAnalysis.overtimePercentage,
    };
  };

  const getProgressData = () => {
    const kpiData = getKPIData();
    if (!kpiData) return { labels: [], data: [] };

    return {
      labels: ['Utilization', 'Target Hours', 'Efficiency'],
      data: [
        kpiData.utilization / 100,
        Math.min(kpiData.averageDailyHours / 8, 1), // Target 8 hours per day
        Math.min(kpiData.billableHours / (kpiData.totalHours || 1), 1),
      ],
    };
  };

  const chartData = getChartDataForRange();
  const kpiData = getKPIData();
  const progressData = getProgressData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name='download-outline' size={20} color='#2196F3' />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        {(['daily', 'weekly', 'monthly'] as TimeRange[]).map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              selectedRange === range && styles.rangeButtonActive,
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.rangeButtonText,
                selectedRange === range && styles.rangeButtonTextActive,
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            {/* KPI Cards */}
            {kpiData && (
              <View style={styles.kpiGrid}>
                <View style={styles.kpiRow}>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Total Hours'
                      value={kpiData.totalHours}
                      subtitle={`${selectedRange} view`}
                      icon='time-outline'
                      color='#2196F3'
                      suffix=' hrs'
                    />
                  </View>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Billable Hours'
                      value={kpiData.billableHours}
                      subtitle={`${kpiData.utilization.toFixed(1)}% utilization`}
                      icon='cash-outline'
                      color='#4CAF50'
                      suffix=' hrs'
                    />
                  </View>
                </View>

                <View style={styles.kpiRow}>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Average Daily'
                      value={kpiData.averageDailyHours.toFixed(1)}
                      subtitle='Hours per day'
                      icon='calendar-outline'
                      color='#FF9800'
                      suffix=' hrs'
                    />
                  </View>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Overtime'
                      value={kpiData.overtimeHours.toFixed(1)}
                      subtitle={`${kpiData.overtimePercentage.toFixed(1)}% of total`}
                      icon='alert-circle-outline'
                      color='#F44336'
                      suffix=' hrs'
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Progress Overview */}
            <ProgressChart
              data={progressData}
              title='Performance Overview'
              size={180}
              strokeWidth={12}
              colors={['#4CAF50', '#2196F3', '#FF9800']}
            />

            {/* Revenue Trend */}
            <LineChart
              data={chartData.revenue}
              title={`Revenue Trend (${selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)})`}
              height={200}
              animated={true}
              color='#4CAF50'
            />

            {/* Hours Breakdown */}
            <BarChart
              data={chartData.hours}
              title={`Hours Breakdown (${selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)})`}
              height={200}
              color='#2196F3'
            />

            {/* Project Time Allocation */}
            {analytics && analytics.projectTimeAllocation.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Project Time Allocation</Text>
                {analytics.projectTimeAllocation
                  .slice(0, 5)
                  .map((project, index) => (
                    <View key={project.projectId} style={styles.projectItem}>
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>
                          {project.projectTitle}
                        </Text>
                        <Text style={styles.projectDetails}>
                          {project.actualHours.toFixed(1)}h /{' '}
                          {project.allocatedHours.toFixed(1)}h allocated
                        </Text>
                      </View>
                      <View style={styles.varianceContainer}>
                        <Text
                          style={[
                            styles.varianceText,
                            {
                              color:
                                project.variance >= 0 ? '#F44336' : '#4CAF50',
                            },
                          ]}
                        >
                          {project.variance >= 0 ? '+' : ''}
                          {project.variance.toFixed(1)}h
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    padding: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: '#2196F3',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  rangeButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  kpiGrid: {
    marginBottom: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  kpiHalf: {
    flex: 1,
    marginHorizontal: 5,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectDetails: {
    fontSize: 14,
    color: '#666',
  },
  varianceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
