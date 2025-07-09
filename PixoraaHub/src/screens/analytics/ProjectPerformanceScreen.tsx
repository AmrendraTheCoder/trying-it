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
import { 
  BarChart, 
  PieChart, 
  KPICard,
  ProgressChart
} from '../../components';
import { DateRangePicker } from '../../components/analytics';
import { analyticsService } from '../../services/analyticsService';
import { 
  ProjectPerformanceAnalytics, 
  AnalyticsFilter, 
  BarChartData, 
  PieChartData 
} from '../../types';

interface DateRange {
  start: string;
  end: string;
  label: string;
}

export const ProjectPerformanceScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<ProjectPerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Last 3 Months',
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
      const businessAnalytics = await analyticsService.getBusinessAnalytics(filter);
      setAnalytics(businessAnalytics.projects);
    } catch (error) {
      console.error('Failed to load project performance analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const getProfitabilityChartData = (): BarChartData => {
    if (!analytics?.profitabilityAnalysis) {
      return { labels: [], datasets: [] };
    }

    const topProjects = analytics.profitabilityAnalysis
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 8);

    return {
      labels: topProjects.map(p => p.projectTitle.length > 10 
        ? p.projectTitle.substring(0, 10) + '...' 
        : p.projectTitle
      ),
      datasets: [
        {
          label: 'Profit Margin %',
          data: topProjects.map(p => p.profitMargin),
          color: '#4CAF50',
        },
      ],
    };
  };

  const getStatusDistributionData = (): PieChartData => {
    if (!analytics?.projectStatusDistribution) {
      return { data: [] };
    }

    return {
      data: analytics.projectStatusDistribution.map(status => ({
        label: status.status.charAt(0).toUpperCase() + status.status.slice(1),
        value: status.count,
        color: getStatusColor(status.status),
      })),
    };
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'on_hold': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getResourceUtilizationData = () => {
    if (!analytics?.resourceUtilization) {
      return { labels: [], data: [] };
    }

    return {
      labels: analytics.resourceUtilization.map(r => r.name),
      data: analytics.resourceUtilization.map(r => r.utilization / 100),
    };
  };

  const getTopPerformingProjects = () => {
    if (!analytics?.profitabilityAnalysis) return [];
    
    return analytics.profitabilityAnalysis
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  };

  const getBottomPerformingProjects = () => {
    if (!analytics?.profitabilityAnalysis) return [];
    
    return analytics.profitabilityAnalysis
      .sort((a, b) => a.profitMargin - b.profitMargin)
      .slice(0, 5);
  };

  const profitabilityData = getProfitabilityChartData();
  const statusData = getStatusDistributionData();
  const resourceData = getResourceUtilizationData();
  const topProjects = getTopPerformingProjects();
  const bottomProjects = getBottomPerformingProjects();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Project Performance</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
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
            <Text style={styles.loadingText}>Loading performance metrics...</Text>
          </View>
        ) : (
          <>
            {/* Key Performance Indicators */}
            {analytics && (
              <View style={styles.kpiGrid}>
                <View style={styles.kpiRow}>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title="On-Time Delivery"
                      value={analytics.onTimeDelivery.toFixed(1)}
                      subtitle="Projects delivered on schedule"
                      icon="checkmark-circle-outline"
                      color="#4CAF50"
                      suffix="%"
                    />
                  </View>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title="Budget Adherence"
                      value={analytics.budgetAdherence.toFixed(1)}
                      subtitle="Projects within budget"
                      icon="trending-up-outline"
                      color="#2196F3"
                      suffix="%"
                    />
                  </View>
                </View>
                
                <View style={styles.kpiRow}>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title="Avg Profit Margin"
                      value={analytics.profitabilityAnalysis.length > 0 
                        ? (analytics.profitabilityAnalysis.reduce((sum, p) => sum + p.profitMargin, 0) / analytics.profitabilityAnalysis.length).toFixed(1)
                        : '0'
                      }
                      subtitle="Average across all projects"
                      icon="stats-chart-outline"
                      color="#FF9800"
                      suffix="%"
                    />
                  </View>
                  <View style={styles.kpiHalf}>
                    <KPICard
                      title="Total Revenue"
                      value={analytics.profitabilityAnalysis.reduce((sum, p) => sum + p.revenue, 0)}
                      subtitle="From completed projects"
                      icon="cash-outline"
                      color="#4CAF50"
                      prefix="$"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Resource Utilization */}
            <ProgressChart
              data={resourceData}
              title="Resource Utilization"
              size={180}
              strokeWidth={12}
              colors={['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']}
            />

            {/* Project Status Distribution */}
            <PieChart
              data={statusData}
              title="Project Status Distribution"
              size={220}
              showLegend={false}
              hasLegend={false}
            />

            {/* Profitability Analysis */}
            <BarChart
              data={profitabilityData}
              title="Top Projects by Profit Margin"
              height={200}
              color="#4CAF50"
            />

            {/* Top Performing Projects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Top Performing Projects</Text>
              {topProjects.map((project, index) => (
                <View key={project.projectId} style={styles.projectItem}>
                  <View style={styles.projectRank}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.projectTitle}</Text>
                    <Text style={styles.projectDetails}>
                      Revenue: ${project.revenue.toLocaleString()} | 
                      Profit: ${project.profit.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.profitMarginContainer}>
                    <Text style={[
                      styles.profitMarginText,
                      { color: project.profitMargin >= 20 ? '#4CAF50' : project.profitMargin >= 10 ? '#FF9800' : '#F44336' }
                    ]}>
                      {project.profitMargin.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Projects Needing Attention */}
            {bottomProjects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Projects Needing Attention</Text>
                {bottomProjects.map((project, index) => (
                  <View key={project.projectId} style={[styles.projectItem, styles.attentionItem]}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectTitle}>{project.projectTitle}</Text>
                      <Text style={styles.projectDetails}>
                        Revenue: ${project.revenue.toLocaleString()} | 
                        Loss: ${Math.abs(project.profit).toLocaleString()}
                      </Text>
                      <Text style={styles.recommendationText}>
                        {project.profitMargin < 0 ? 'Operating at a loss' : 'Low profit margin'}
                      </Text>
                    </View>
                    <View style={styles.alertIconContainer}>
                      <Ionicons name="alert-circle" size={24} color="#F44336" />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Performance Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Performance Insights</Text>
              
              <View style={styles.insightCard}>
                <Ionicons name="trending-up" size={20} color="#4CAF50" />
                <Text style={styles.insightText}>
                  <Text style={styles.insightBold}>
                    {analytics?.onTimeDelivery.toFixed(0)}%
                  </Text> of projects are delivered on time
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Ionicons name="wallet" size={20} color="#2196F3" />
                <Text style={styles.insightText}>
                  <Text style={styles.insightBold}>
                    {analytics?.budgetAdherence.toFixed(0)}%
                  </Text> of projects stay within budget
                </Text>
              </View>

              {analytics && analytics.profitabilityAnalysis.length > 0 && (
                <View style={styles.insightCard}>
                  <Ionicons name="stats-chart" size={20} color="#FF9800" />
                  <Text style={styles.insightText}>
                    Average profit margin is{' '}
                    <Text style={styles.insightBold}>
                      {(analytics.profitabilityAnalysis.reduce((sum, p) => sum + p.profitMargin, 0) / analytics.profitabilityAnalysis.length).toFixed(1)}%
                    </Text>
                  </Text>
                </View>
              )}

              {resourceData.data.length > 0 && (
                <View style={styles.insightCard}>
                  <Ionicons name="people" size={20} color="#9C27B0" />
                  <Text style={styles.insightText}>
                    Team utilization averages{' '}
                    <Text style={styles.insightBold}>
                      {(resourceData.data.reduce((sum, util) => sum + util, 0) / resourceData.data.length * 100).toFixed(0)}%
                    </Text>
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
  exportButton: {
    padding: 8,
    borderRadius: 8,
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attentionItem: {
    backgroundColor: '#fff8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderBottomWidth: 0,
  },
  projectRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
  },
  profitMarginContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  profitMarginText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertIconContainer: {
    marginLeft: 10,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  insightBold: {
    fontWeight: '600',
    color: '#333',
  },
}); 