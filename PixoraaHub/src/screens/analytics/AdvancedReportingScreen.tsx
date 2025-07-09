import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  LineChart,
  BarChart,
  PieChart,
  KPICard,
  ProgressChart,
} from '../../components';
import { DateRangePicker } from '../../components/analytics';
import { analyticsService } from '../../services/analyticsService';
import {
  BusinessAnalytics,
  AnalyticsFilter,
  LineChartData,
  BarChartData,
  PieChartData,
} from '../../types';

interface DateRange {
  start: string;
  end: string;
  label: string;
}

type ReportSection =
  | 'overview'
  | 'revenue'
  | 'productivity'
  | 'projects'
  | 'time'
  | 'insights';

interface ReportConfig {
  sections: ReportSection[];
  format: 'summary' | 'detailed';
  includeCharts: boolean;
}

export const AdvancedReportingScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Last 3 Months',
  });
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    sections: ['overview', 'revenue', 'productivity', 'projects', 'time'],
    format: 'summary',
    includeCharts: true,
  });

  useEffect(() => {
    loadAnalytics();
  }, [selectedDateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const filter: AnalyticsFilter = {
        dateRange: {
          start: selectedDateRange.start,
          end: selectedDateRange.end,
        },
        includeArchived: false,
      };
      const businessAnalytics =
        await analyticsService.getBusinessAnalytics(filter);
      setAnalytics(businessAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const generateReport = (): string => {
    if (!analytics) return '';

    const reportDate = new Date().toLocaleDateString();
    const dateRange = `${selectedDateRange.start} to ${selectedDateRange.end}`;

    let report = `📊 PixoraaHub Business Analytics Report\n`;
    report += `Generated on: ${reportDate}\n`;
    report += `Period: ${dateRange}\n\n`;

    // Overview Section
    if (reportConfig.sections.includes('overview')) {
      report += `📈 BUSINESS OVERVIEW\n`;
      report += `${'='.repeat(30)}\n`;
      report += `• Total Revenue: $${analytics.overview.totalRevenue.toLocaleString()}\n`;
      report += `• Active Projects: ${analytics.overview.activeProjects}\n`;
      report += `• Total Clients: ${analytics.overview.totalClients}\n`;
      report += `• Team Utilization: ${analytics.overview.teamUtilization.toFixed(1)}%\n\n`;
    }

    // Revenue Section
    if (reportConfig.sections.includes('revenue')) {
      report += `💰 REVENUE ANALYSIS\n`;
      report += `${'='.repeat(30)}\n`;
      report += `• Monthly Growth: ${analytics.revenue.monthlyGrowth.toFixed(1)}%\n`;
      report += `• Average Monthly: $${analytics.revenue.averageMonthlyRevenue.toLocaleString()}\n`;
      if (analytics.revenue.topClients.length > 0) {
        report += `• Top Client: ${analytics.revenue.topClients[0].clientName} ($${analytics.revenue.topClients[0].revenue.toLocaleString()})\n`;
      }
      report += `\n`;
    }

    // Productivity Section
    if (reportConfig.sections.includes('productivity')) {
      report += `⚡ PRODUCTIVITY METRICS\n`;
      report += `${'='.repeat(30)}\n`;
      report += `• Task Completion Rate: ${analytics.productivity.taskCompletionRate.toFixed(1)}%\n`;
      report += `• On-Time Delivery: ${analytics.productivity.onTimeDeliveryRate.toFixed(1)}%\n`;
      report += `• Team Efficiency: ${analytics.productivity.teamEfficiency.overallScore.toFixed(1)}/10\n`;
      report += `\n`;
    }

    // Projects Section
    if (reportConfig.sections.includes('projects')) {
      report += `🚀 PROJECT PERFORMANCE\n`;
      report += `${'='.repeat(30)}\n`;
      report += `• On-Time Delivery: ${analytics.projects.onTimeDelivery.toFixed(1)}%\n`;
      report += `• Budget Adherence: ${analytics.projects.budgetAdherence.toFixed(1)}%\n`;

      if (analytics.projects.profitabilityAnalysis.length > 0) {
        const avgProfitMargin =
          analytics.projects.profitabilityAnalysis.reduce(
            (sum, p) => sum + p.profitMargin,
            0
          ) / analytics.projects.profitabilityAnalysis.length;
        report += `• Average Profit Margin: ${avgProfitMargin.toFixed(1)}%\n`;

        const topProject = analytics.projects.profitabilityAnalysis.sort(
          (a, b) => b.profit - a.profit
        )[0];
        if (topProject) {
          report += `• Most Profitable: ${topProject.projectTitle} (${topProject.profitMargin.toFixed(1)}%)\n`;
        }
      }
      report += `\n`;
    }

    // Time Tracking Section
    if (reportConfig.sections.includes('time')) {
      report += `⏰ TIME TRACKING\n`;
      report += `${'='.repeat(30)}\n`;
      const totalHours = analytics.timeTracking.dailyHours.reduce(
        (sum, day) => sum + day.totalHours,
        0
      );
      const billableHours = analytics.timeTracking.dailyHours.reduce(
        (sum, day) => sum + day.billableHours,
        0
      );
      const utilization =
        totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

      report += `• Total Hours Logged: ${totalHours.toFixed(1)}\n`;
      report += `• Billable Hours: ${billableHours.toFixed(1)}\n`;
      report += `• Utilization Rate: ${utilization.toFixed(1)}%\n`;
      report += `• Overtime Hours: ${analytics.timeTracking.overtimeAnalysis.totalOvertimeHours.toFixed(1)}\n`;
      report += `\n`;
    }

    // Key Insights
    report += `💡 KEY INSIGHTS & RECOMMENDATIONS\n`;
    report += `${'='.repeat(40)}\n`;

    if (analytics.overview.teamUtilization < 70) {
      report += `• ⚠️ Team utilization is below optimal (${analytics.overview.teamUtilization.toFixed(1)}%). Consider reallocating resources.\n`;
    } else if (analytics.overview.teamUtilization > 90) {
      report += `• ⚠️ Team utilization is very high (${analytics.overview.teamUtilization.toFixed(1)}%). Risk of burnout.\n`;
    } else {
      report += `• ✅ Team utilization is healthy (${analytics.overview.teamUtilization.toFixed(1)}%).\n`;
    }

    if (analytics.revenue.monthlyGrowth > 10) {
      report += `• 🚀 Excellent revenue growth (${analytics.revenue.monthlyGrowth.toFixed(1)}%). Maintain current strategy.\n`;
    } else if (analytics.revenue.monthlyGrowth < 0) {
      report += `• 📉 Revenue decline detected (${analytics.revenue.monthlyGrowth.toFixed(1)}%). Review sales strategy.\n`;
    }

    if (analytics.productivity.onTimeDeliveryRate < 80) {
      report += `• ⏱️ On-time delivery needs improvement (${analytics.productivity.onTimeDeliveryRate.toFixed(1)}%). Review project planning.\n`;
    }

    if (analytics.projects.budgetAdherence < 85) {
      report += `• 💰 Budget adherence could be improved (${analytics.projects.budgetAdherence.toFixed(1)}%). Review cost estimation.\n`;
    }

    report += `\n---\nReport generated by PixoraaHub Analytics\n`;

    return report;
  };

  const exportReport = async () => {
    if (!analytics) {
      Alert.alert('Error', 'No data available to export');
      return;
    }

    try {
      setExporting(true);
      const reportText = generateReport();

      await Share.share({
        message: reportText,
        title: `PixoraaHub Analytics Report - ${selectedDateRange.label}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert(
        'Export Failed',
        'Could not export the report. Please try again.'
      );
    } finally {
      setExporting(false);
    }
  };

  const getRevenueChartData = (): LineChartData => {
    if (!analytics?.revenue.monthlyRevenue) {
      return { labels: [], datasets: [] };
    }

    const last6Months = analytics.revenue.monthlyRevenue.slice(-6);

    return {
      labels: last6Months.map(item =>
        new Date(item.month + '-01').toLocaleDateString('en-US', {
          month: 'short',
        })
      ),
      datasets: [
        {
          label: 'Revenue',
          data: last6Months.map(item => item.revenue),
          color: '#4CAF50',
        },
      ],
    };
  };

  const getProjectRevenueData = (): BarChartData => {
    if (!analytics?.revenue.projectRevenue) {
      return { labels: [], datasets: [] };
    }

    const topProjects = analytics.revenue.projectRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return {
      labels: topProjects.map(p =>
        p.projectName.length > 8
          ? p.projectName.substring(0, 8) + '...'
          : p.projectName
      ),
      datasets: [
        {
          label: 'Revenue',
          data: topProjects.map(p => p.revenue),
          color: '#2196F3',
        },
      ],
    };
  };

  const getTaskStatusData = (): PieChartData => {
    if (!analytics?.productivity.taskStatusDistribution) {
      return { data: [] };
    }

    return {
      data: analytics.productivity.taskStatusDistribution.map(status => ({
        label: status.status.charAt(0).toUpperCase() + status.status.slice(1),
        value: status.count,
        color: getTaskStatusColor(status.status),
      })),
    };
  };

  const getTaskStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const revenueData = getRevenueChartData();
  const projectRevenueData = getProjectRevenueData();
  const taskStatusData = getTaskStatusData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Reports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Implement report configuration modal
              Alert.alert('Report Config', 'Report configuration coming soon!');
            }}
          >
            <Ionicons name='settings-outline' size={20} color='#666' />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={exportReport}
            disabled={exporting || !analytics}
          >
            <Ionicons
              name={exporting ? 'hourglass-outline' : 'download-outline'}
              size={20}
              color='#2196F3'
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterSection}>
        <DateRangePicker
          selectedRange={selectedDateRange}
          onRangeChange={setSelectedDateRange}
          disabled={loading}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>
              Generating comprehensive report...
            </Text>
          </View>
        ) : (
          <>
            {/* Executive Summary */}
            {analytics && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Executive Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Revenue</Text>
                    <Text style={styles.summaryValue}>
                      ${analytics.overview.totalRevenue.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.summaryChange,
                        {
                          color:
                            analytics.revenue.monthlyGrowth >= 0
                              ? '#4CAF50'
                              : '#F44336',
                        },
                      ]}
                    >
                      {analytics.revenue.monthlyGrowth >= 0 ? '+' : ''}
                      {analytics.revenue.monthlyGrowth.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Active Projects</Text>
                    <Text style={styles.summaryValue}>
                      {analytics.overview.activeProjects}
                    </Text>
                    <Text style={styles.summaryChange}>
                      {analytics.projects.onTimeDelivery.toFixed(0)}% on-time
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Team Utilization</Text>
                    <Text style={styles.summaryValue}>
                      {analytics.overview.teamUtilization.toFixed(1)}%
                    </Text>
                    <Text
                      style={[
                        styles.summaryChange,
                        {
                          color:
                            analytics.overview.teamUtilization > 85
                              ? '#F44336'
                              : analytics.overview.teamUtilization > 70
                                ? '#4CAF50'
                                : '#FF9800',
                        },
                      ]}
                    >
                      {analytics.overview.teamUtilization > 85
                        ? 'High'
                        : analytics.overview.teamUtilization > 70
                          ? 'Optimal'
                          : 'Low'}
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Client Satisfaction</Text>
                    <Text style={styles.summaryValue}>
                      {analytics.clients.averageSatisfaction.toFixed(1)}
                    </Text>
                    <Text style={styles.summaryChange}>/ 10</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Key Performance Indicators */}
            {analytics && (
              <View style={styles.kpiGrid}>
                <View style={styles.kpiRow}>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Monthly Revenue'
                      value={analytics.revenue.averageMonthlyRevenue}
                      subtitle='Average per month'
                      trend={{
                        value: analytics.revenue.monthlyGrowth,
                        isPositive: analytics.revenue.monthlyGrowth >= 0,
                      }}
                      icon='trending-up-outline'
                      color='#4CAF50'
                      prefix='$'
                    />
                  </View>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Task Completion'
                      value={analytics.productivity.taskCompletionRate.toFixed(
                        1
                      )}
                      subtitle='Overall completion rate'
                      icon='checkmark-circle-outline'
                      color='#2196F3'
                      suffix='%'
                    />
                  </View>
                </View>

                <View style={styles.kpiRow}>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Client Retention'
                      value={analytics.clients.retentionRate.toFixed(1)}
                      subtitle='12-month retention'
                      icon='people-outline'
                      color='#9C27B0'
                      suffix='%'
                    />
                  </View>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title='Avg Project Margin'
                      value={
                        analytics.projects.profitabilityAnalysis.length > 0
                          ? (
                              analytics.projects.profitabilityAnalysis.reduce(
                                (sum, p) => sum + p.profitMargin,
                                0
                              ) /
                              analytics.projects.profitabilityAnalysis.length
                            ).toFixed(1)
                          : '0'
                      }
                      subtitle='Across all projects'
                      icon='stats-chart-outline'
                      color='#FF9800'
                      suffix='%'
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Revenue Trends */}
            <LineChart
              data={revenueData}
              title='Revenue Trend (6 Months)'
              height={200}
              animated={true}
              color='#4CAF50'
            />

            {/* Project Revenue Breakdown */}
            <BarChart
              data={projectRevenueData}
              title='Top Projects by Revenue'
              height={200}
              color='#2196F3'
            />

            {/* Task Status Distribution */}
            <PieChart
              data={taskStatusData}
              title='Task Status Distribution'
              size={200}
              showLegend={false}
              hasLegend={false}
            />

            {/* Detailed Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Detailed Analysis</Text>

              <View style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Ionicons name='cash' size={24} color='#4CAF50' />
                  <Text style={styles.analysisTitle}>Revenue Performance</Text>
                </View>
                <Text style={styles.analysisText}>
                  Your monthly revenue growth of{' '}
                  {analytics?.revenue.monthlyGrowth.toFixed(1)}%
                  {analytics && analytics.revenue.monthlyGrowth > 5
                    ? ' indicates strong business momentum. Continue focusing on high-value clients and projects.'
                    : analytics && analytics.revenue.monthlyGrowth < 0
                      ? ' suggests a need to review your sales strategy and client acquisition efforts.'
                      : ' shows steady business growth. Consider strategies to accelerate expansion.'}
                </Text>
              </View>

              <View style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Ionicons name='people' size={24} color='#2196F3' />
                  <Text style={styles.analysisTitle}>Team Performance</Text>
                </View>
                <Text style={styles.analysisText}>
                  Team utilization at{' '}
                  {analytics?.overview.teamUtilization.toFixed(1)}%
                  {analytics && analytics.overview.teamUtilization > 85
                    ? ' is quite high. Monitor for burnout and consider hiring or redistributing workload.'
                    : analytics && analytics.overview.teamUtilization < 70
                      ? ' suggests room for improvement. Look for additional projects or optimize resource allocation.'
                      : ' is in the optimal range. Your team is well-balanced and productive.'}
                </Text>
              </View>

              <View style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Ionicons name='rocket' size={24} color='#FF9800' />
                  <Text style={styles.analysisTitle}>Project Delivery</Text>
                </View>
                <Text style={styles.analysisText}>
                  On-time delivery rate of{' '}
                  {analytics?.projects.onTimeDelivery.toFixed(1)}%
                  {analytics && analytics.projects.onTimeDelivery > 90
                    ? ' is excellent. Your project management processes are working well.'
                    : analytics && analytics.projects.onTimeDelivery < 70
                      ? ' needs improvement. Review project planning and resource allocation.'
                      : ' is good but has room for improvement. Consider refining your estimation process.'}
                </Text>
              </View>
            </View>

            {/* Action Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Recommended Actions</Text>

              {analytics && analytics.revenue.monthlyGrowth < 0 && (
                <View style={styles.actionItem}>
                  <Ionicons name='alert-circle' size={20} color='#F44336' />
                  <Text style={styles.actionText}>
                    Address revenue decline by reviewing sales processes and
                    client satisfaction
                  </Text>
                </View>
              )}

              {analytics && analytics.overview.teamUtilization > 90 && (
                <View style={styles.actionItem}>
                  <Ionicons name='warning' size={20} color='#FF9800' />
                  <Text style={styles.actionText}>
                    High team utilization detected - consider hiring or
                    redistributing workload
                  </Text>
                </View>
              )}

              {analytics && analytics.projects.onTimeDelivery < 80 && (
                <View style={styles.actionItem}>
                  <Ionicons name='time' size={20} color='#2196F3' />
                  <Text style={styles.actionText}>
                    Improve project delivery by reviewing estimation and
                    planning processes
                  </Text>
                </View>
              )}

              {analytics && analytics.projects.budgetAdherence < 85 && (
                <View style={styles.actionItem}>
                  <Ionicons name='calculator' size={20} color='#9C27B0' />
                  <Text style={styles.actionText}>
                    Enhance budget control by improving cost estimation and
                    tracking
                  </Text>
                </View>
              )}

              {analytics && analytics.clients.retentionRate < 90 && (
                <View style={styles.actionItem}>
                  <Ionicons name='heart' size={20} color='#E91E63' />
                  <Text style={styles.actionText}>
                    Focus on client satisfaction to improve retention rates
                  </Text>
                </View>
              )}
            </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginLeft: 8,
  },
  exportButton: {
    backgroundColor: '#f0f8ff',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  summaryChange: {
    fontSize: 12,
    fontWeight: '600',
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
  analysisCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  analysisText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});
