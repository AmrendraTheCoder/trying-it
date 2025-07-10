import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import {
  ClientService,
  ProjectService,
  TaskService,
  TimeTrackingService,
} from '../../src/services';
import { Client, Project, Task, TimeEntry } from '../../src/types';
import { EnhancedThemedText } from '../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../../constants/Colors';
import { useThemeColor } from '../../hooks/useThemeColor';

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

  const backgroundColor = useThemeColor({}, 'background');

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

      // Calculate stats
      const activeClients = clients.filter(
        (c: Client) => c.status === 'active'
      ).length;
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
        totalTasks: tasks.length,
        pendingTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        totalTimeEntries: timeEntries.length,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Clean Card Component for mobile
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }> = ({ title, value, subtitle, color = Colors.light.primary, onPress }) => (
    <TouchableOpacity
      style={[styles.metricCard, onPress && styles.metricCardTouchable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.metricContent}>
        <EnhancedThemedText
          type='caption'
          color='secondary'
          style={styles.metricTitle}
        >
          {title}
        </EnhancedThemedText>
        <EnhancedThemedText
          type='heading2'
          style={[styles.metricValue, { color }]}
        >
          {value}
        </EnhancedThemedText>
        {subtitle && (
          <EnhancedThemedText
            type='small'
            color='muted'
            style={styles.metricSubtitle}
          >
            {subtitle}
          </EnhancedThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  // Quick Action Button Component
  const QuickAction: React.FC<{
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }> = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.quickAction, { borderColor: color }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <EnhancedThemedText type='heading3' style={styles.quickActionEmoji}>
          {icon}
        </EnhancedThemedText>
      </View>
      <EnhancedThemedText
        type='caption'
        color='secondary'
        style={styles.quickActionTitle}
      >
        {title}
      </EnhancedThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle='dark-content' backgroundColor={backgroundColor} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors.light.primary} />
          <EnhancedThemedText
            type='body'
            color='secondary'
            style={styles.loadingText}
          >
            Loading dashboard...
          </EnhancedThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle='dark-content' backgroundColor={backgroundColor} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <EnhancedThemedText type='heading1' style={styles.title}>
            Dashboard
          </EnhancedThemedText>
          <EnhancedThemedText
            type='body'
            color='secondary'
            style={styles.subtitle}
          >
            Welcome back! Here's your business overview.
          </EnhancedThemedText>
        </View>

        {/* Main Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title='Total Revenue'
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`${stats.totalProjects} projects`}
            color={Colors.light.success}
            onPress={() => router.push('/(tabs)/projects')}
          />
          <MetricCard
            title='Active Clients'
            value={stats.activeClients}
            subtitle={`${stats.totalClients} total`}
            color={Colors.light.primary}
            onPress={() => router.push('/(tabs)/clients')}
          />
          <MetricCard
            title='Pending Tasks'
            value={stats.pendingTasks}
            subtitle={`${stats.totalTasks} total`}
            color={Colors.light.warning}
            onPress={() => router.push('/(tabs)/tasks')}
          />
          <MetricCard
            title='Overdue'
            value={stats.overdueTasks}
            subtitle='Need attention'
            color={Colors.light.error}
            onPress={() => router.push('/(tabs)/tasks')}
          />
        </View>

        {/* Project Status */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Project Status
          </EnhancedThemedText>
          <View style={styles.statusRow}>
            <MetricCard
              title='Active'
              value={stats.activeProjects}
              color={Colors.light.info}
            />
            <MetricCard
              title='Completed'
              value={stats.completedProjects}
              color={Colors.light.success}
            />
          </View>
        </View>

        {/* Time Tracking */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Time & Billing
          </EnhancedThemedText>
          <View style={styles.statusRow}>
            <MetricCard
              title='Billable Hours'
              value={`${stats.billableHours}h`}
              subtitle={`${stats.totalHoursLogged}h total`}
              color={Colors.light.accent}
            />
            <MetricCard
              title='Revenue'
              value={formatCurrency(stats.timeRevenue)}
              subtitle={`${stats.totalTimeEntries} entries`}
              color={Colors.light.success}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Quick Actions
          </EnhancedThemedText>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title='New Client'
              icon='👥'
              color={Colors.light.primary}
              onPress={() => router.push('/(tabs)/clients')}
            />
            <QuickAction
              title='New Project'
              icon='📁'
              color={Colors.light.secondary}
              onPress={() => router.push('/(tabs)/projects')}
            />
            <QuickAction
              title='Add Task'
              icon='✅'
              color={Colors.light.accent}
              onPress={() => router.push('/(tabs)/tasks')}
            />
            <QuickAction
              title='Analytics'
              icon='📊'
              color={Colors.light.warning}
              onPress={() =>
                Alert.alert('Analytics', 'Advanced analytics coming soon!')
              }
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  metricCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    width: (width - Spacing.screenPadding * 2 - Spacing.sm) / 2,
    ...Shadows.sm,
  },
  metricCardTouchable: {
    // Add subtle press effect for touchable cards
  },
  metricContent: {
    padding: Spacing.cardPadding,
    minHeight: 80,
    justifyContent: 'center',
  },
  metricTitle: {
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    marginBottom: Spacing.xs / 2,
  },
  metricSubtitle: {
    lineHeight: 14,
  },
  section: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    alignItems: 'center',
    width: (width - Spacing.screenPadding * 2 - Spacing.md) / 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionEmoji: {
    color: Colors.light.textInverse,
  },
  quickActionTitle: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
