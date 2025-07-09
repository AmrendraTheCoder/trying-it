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
import { KPICard } from '../components';
import { analyticsService } from '../services/analyticsService';
import { BusinessAnalytics, AnalyticsFilter } from '../types';

export const AnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const filter: AnalyticsFilter = {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          end: new Date().toISOString().split('T')[0],
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

  const analyticsModules = [
    {
      id: 'time',
      title: 'Time Analytics',
      description: 'Track time usage and productivity',
      icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
      color: '#2196F3',
      screen: 'TimeAnalytics',
    },
    {
      id: 'projects',
      title: 'Project Performance',
      description: 'Analyze project profitability',
      icon: 'rocket-outline' as keyof typeof Ionicons.glyphMap,
      color: '#4CAF50',
      screen: 'ProjectPerformance',
    },
    {
      id: 'reports',
      title: 'Advanced Reports',
      description: 'Comprehensive business insights',
      icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
      color: '#FF9800',
      screen: 'AdvancedReporting',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name='settings-outline' size={24} color='#666' />
        </TouchableOpacity>
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
            {/* Key Metrics Overview */}
            {analytics && (
              <View style={styles.overviewSection}>
                <Text style={styles.sectionTitle}>
                  📊 Overview (Last 30 Days)
                </Text>

                <View style={styles.kpiGrid}>
                  <View style={styles.kpiRow}>
                    <View style={styles.kpiHalf}>
                      <KPICard
                        title='Total Revenue'
                        value={analytics.overview.totalRevenue}
                        subtitle='Last 30 days'
                        trend={{
                          value: analytics.revenue.monthlyGrowth,
                          isPositive: analytics.revenue.monthlyGrowth >= 0,
                        }}
                        icon='cash-outline'
                        color='#4CAF50'
                        prefix='$'
                      />
                    </View>
                    <View style={styles.kpiHalf}>
                      <KPICard
                        title='Active Projects'
                        value={analytics.overview.activeProjects}
                        subtitle={`${analytics.projects.onTimeDelivery.toFixed(0)}% on-time delivery`}
                        icon='rocket-outline'
                        color='#2196F3'
                      />
                    </View>
                  </View>

                  <View style={styles.kpiRow}>
                    <View style={styles.kpiHalf}>
                      <KPICard
                        title='Team Utilization'
                        value={analytics.overview.teamUtilization.toFixed(1)}
                        subtitle='Current utilization rate'
                        icon='people-outline'
                        color='#9C27B0'
                        suffix='%'
                      />
                    </View>
                    <View style={styles.kpiHalf}>
                      <KPICard
                        title='Client Satisfaction'
                        value={analytics.clients.averageSatisfaction.toFixed(1)}
                        subtitle='Average rating'
                        icon='star-outline'
                        color='#FF9800'
                        suffix='/10'
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Quick Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Quick Insights</Text>

              {analytics && (
                <>
                  <View style={styles.insightCard}>
                    <Ionicons
                      name={
                        analytics.revenue.monthlyGrowth >= 0
                          ? 'trending-up'
                          : 'trending-down'
                      }
                      size={20}
                      color={
                        analytics.revenue.monthlyGrowth >= 0
                          ? '#4CAF50'
                          : '#F44336'
                      }
                    />
                    <Text style={styles.insightText}>
                      Revenue is{' '}
                      {analytics.revenue.monthlyGrowth >= 0
                        ? 'growing'
                        : 'declining'}{' '}
                      by{' '}
                      <Text style={styles.insightBold}>
                        {Math.abs(analytics.revenue.monthlyGrowth).toFixed(1)}%
                      </Text>{' '}
                      this month
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name='checkmark-circle'
                      size={20}
                      color={
                        analytics.productivity.taskCompletionRate >= 80
                          ? '#4CAF50'
                          : '#FF9800'
                      }
                    />
                    <Text style={styles.insightText}>
                      Task completion rate is{' '}
                      <Text style={styles.insightBold}>
                        {analytics.productivity.taskCompletionRate.toFixed(1)}%
                      </Text>{' '}
                      {analytics.productivity.taskCompletionRate >= 80
                        ? '(Excellent)'
                        : '(Needs improvement)'}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name='time'
                      size={20}
                      color={
                        analytics.projects.onTimeDelivery >= 90
                          ? '#4CAF50'
                          : analytics.projects.onTimeDelivery >= 70
                            ? '#FF9800'
                            : '#F44336'
                      }
                    />
                    <Text style={styles.insightText}>
                      <Text style={styles.insightBold}>
                        {analytics.projects.onTimeDelivery.toFixed(1)}%
                      </Text>{' '}
                      of projects delivered on time
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Analytics Modules */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Analytics Modules</Text>

              {analyticsModules.map(module => (
                <TouchableOpacity
                  key={module.id}
                  style={styles.moduleCard}
                  onPress={() => {
                    // TODO: Navigate to specific analytics screen
                    console.log(`Navigate to ${module.screen}`);
                  }}
                >
                  <View
                    style={[
                      styles.moduleIcon,
                      { backgroundColor: `${module.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={module.icon}
                      size={24}
                      color={module.color}
                    />
                  </View>

                  <View style={styles.moduleContent}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>
                      {module.description}
                    </Text>
                  </View>

                  <Ionicons name='chevron-forward' size={20} color='#ccc' />
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Recent Activity</Text>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name='document-text' size={16} color='#2196F3' />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    Analytics report generated
                  </Text>
                  <Text style={styles.activityTime}>2 minutes ago</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name='trending-up' size={16} color='#4CAF50' />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    Revenue milestone reached
                  </Text>
                  <Text style={styles.activityTime}>1 hour ago</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name='checkmark-circle' size={16} color='#FF9800' />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    Project completed on time
                  </Text>
                  <Text style={styles.activityTime}>3 hours ago</Text>
                </View>
              </View>
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
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
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
  overviewSection: {
    marginTop: 20,
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
  kpiGrid: {
    marginTop: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  kpiHalf: {
    flex: 1,
    marginHorizontal: 5,
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
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  moduleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
});
