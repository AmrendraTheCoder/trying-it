import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ClientService,
  ProjectService,
  TaskService,
  TimeTrackingService,
} from '../../src/services';
import { Client, Project, Task, TimeEntry } from '../../src/types';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalSpent: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalTimeEntries: number;
  totalHoursLogged: number;
  billableHours: number;
  timeRevenue: number;
}

export default function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    totalSpent: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    totalTimeEntries: 0,
    totalHoursLogged: 0,
    billableHours: 0,
    timeRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reload data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Initialize services
      await Promise.all([
        ClientService.initializeClients(),
        ProjectService.initializeProjects(),
        TaskService.initializeTasks(),
        TimeTrackingService.initializeTimeEntries(),
      ]);

      // Get all data
      const [clients, projects, tasks, timeEntries] = await Promise.all([
        ClientService.getAllClients(),
        ProjectService.getAllProjects(),
        TaskService.getAllTasks(),
        TimeTrackingService.getAllTimeEntries(),
      ]);

      // Calculate client stats
      const activeClients = clients.filter(
        (c: Client) => c.status === 'active'
      ).length;

      // Calculate project stats
      const activeProjects = projects.filter(
        (p: Project) => p.status === 'active'
      ).length;
      const completedProjects = projects.filter(
        (p: Project) => p.status === 'completed'
      ).length;
      const totalRevenue = projects.reduce(
        (sum: number, p: Project) => sum + (p.budget || 0),
        0
      );
      const totalSpent = projects.reduce(
        (sum: number, p: Project) => sum + (p.totalSpent || 0),
        0
      );

      // Calculate task stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (t: Task) => t.status === 'completed'
      ).length;
      const inProgressTasks = tasks.filter(
        (t: Task) => t.status === 'in_progress'
      ).length;
      const pendingTasks = tasks.filter(
        (t: Task) => t.status === 'todo'
      ).length;
      const overdueTasks = tasks.filter(
        (t: Task) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== 'completed' &&
          t.status !== 'cancelled'
      ).length;

      // Calculate time tracking stats
      const totalTimeEntries = timeEntries.length;
      const totalHoursLogged =
        Math.round(
          (timeEntries.reduce(
            (sum: number, entry: TimeEntry) => sum + entry.duration,
            0
          ) /
            60) *
            100
        ) / 100;
      const billableEntries = timeEntries.filter(
        (entry: TimeEntry) => entry.billable
      );
      const billableHours =
        Math.round(
          (billableEntries.reduce(
            (sum: number, entry: TimeEntry) => sum + entry.duration,
            0
          ) /
            60) *
            100
        ) / 100;
      const timeRevenue =
        Math.round(
          billableEntries.reduce(
            (sum: number, entry: TimeEntry) =>
              sum + (entry.duration / 60) * (entry.hourlyRate || 0),
            0
          ) * 100
        ) / 100;

      setStats({
        totalClients: clients.length,
        activeClients,
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalRevenue,
        totalSpent,
        totalTasks,
        pendingTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        totalTimeEntries,
        totalHoursLogged,
        billableHours,
        timeRevenue,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }> = ({ title, value, subtitle, color = '#007AFF', onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, onPress && styles.statCardPressable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const QuickAction: React.FC<{
    title: string;
    description: string;
    onPress: () => void;
    color?: string;
  }> = ({ title, description, onPress, color = '#007AFF' }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Text style={styles.actionIconText}>+</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          refreshing ? (
            <View style={styles.refreshContainer}>
              <ActivityIndicator color='#007AFF' />
            </View>
          ) : undefined
        }
        onScroll={() => {
          if (!refreshing) {
            handleRefresh();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back! Here&apos;s your business overview.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title='Total Clients'
            value={stats.totalClients}
            subtitle={`${stats.activeClients} active`}
            onPress={() => router.push('/clients')}
          />
          <StatCard
            title='Total Projects'
            value={stats.totalProjects}
            subtitle={`${stats.activeProjects} active`}
            onPress={() => router.push('/projects')}
            color='#34C759'
          />
          <StatCard
            title='Total Budget'
            value={`$${stats.totalRevenue.toLocaleString()}`}
            subtitle={`$${stats.totalSpent.toLocaleString()} spent`}
            color='#FF9500'
          />
          <StatCard
            title='Pending Tasks'
            value={stats.pendingTasks}
            subtitle='Across all projects'
            color='#FF3B30'
            onPress={() => router.push('/tasks')}
          />
        </View>

        {/* Time Tracking Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Tracking</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title='Hours Logged'
              value={`${stats.totalHoursLogged}h`}
              subtitle={`${stats.totalTimeEntries} entries`}
              color='#5856D6'
            />
            <StatCard
              title='Billable Hours'
              value={`${stats.billableHours}h`}
              subtitle={`$${stats.timeRevenue.toFixed(0)} revenue`}
              color='#32D74B'
            />
          </View>
        </View>

        {/* Project Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Completed</Text>
              <Text style={[styles.progressValue, { color: '#34C759' }]}>
                {stats.completedProjects}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>In Progress</Text>
              <Text style={[styles.progressValue, { color: '#007AFF' }]}>
                {stats.activeProjects}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Total</Text>
              <Text style={styles.progressValue}>{stats.totalProjects}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickAction
            title='Add New Client'
            description='Register a new client for your business'
            onPress={() => router.push('/clients')}
            color='#34C759'
          />
          <QuickAction
            title='Create Project'
            description='Start a new project for an existing client'
            onPress={() => router.push('/projects')}
            color='#007AFF'
          />
          <QuickAction
            title='Manage Tasks'
            description='View and manage all tasks across projects'
            onPress={() => router.push('/tasks')}
            color='#FF9500'
          />
        </View>

        {/* Business Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Revenue Overview</Text>
            <Text style={styles.insightText}>
              You have ${stats.totalRevenue.toLocaleString()} in total project
              budgets, with ${stats.totalSpent.toLocaleString()} already earned.
            </Text>
            {stats.totalRevenue > 0 && (
              <Text style={styles.insightPercentage}>
                {Math.round((stats.totalSpent / stats.totalRevenue) * 100)}%
                complete
              </Text>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  refreshContainer: {
    padding: 20,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: (width - 44) / 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statCardPressable: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  insightCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bottomPadding: {
    height: 20,
  },
});
