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
import {
  ProfessionalCard,
  StatCard,
  ProfessionalHeader,
  ActionButton,
  EnhancedThemedText,
} from '../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
} from '../../constants/Colors';
import { useThemeColor } from '../../hooks/useThemeColor';

const { width } = Dimensions.get('window');
const cardWidth = (width - Spacing.md * 3) / 2;

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
  const surfaceColor = useThemeColor(
    { light: Colors.light.surface, dark: Colors.dark.surface },
    'background'
  );

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

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    onPress: () => void;
    color?: string;
    icon?: string;
  }> = ({
    title,
    description,
    onPress,
    color = Colors.light.primary,
    icon = '→',
  }) => (
    <ProfessionalCard
      onPress={onPress}
      style={[styles.quickActionCard, { width: cardWidth }]}
    >
      <View style={styles.quickActionContent}>
        <View
          style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}
        >
          <EnhancedThemedText type='heading3' style={{ color }}>
            {icon}
          </EnhancedThemedText>
        </View>
        <EnhancedThemedText type='bodyMedium' style={styles.quickActionTitle}>
          {title}
        </EnhancedThemedText>
        <EnhancedThemedText
          type='caption'
          color='secondary'
          style={styles.quickActionDescription}
        >
          {description}
        </EnhancedThemedText>
      </View>
    </ProfessionalCard>
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

      <ProfessionalHeader
        title='Dashboard'
        subtitle='Overview of your business'
      />

      <ScrollView
        style={styles.scrollView}
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
        {/* Business Overview */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Business Overview
          </EnhancedThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              title='Total Revenue'
              value={formatCurrency(stats.totalRevenue)}
              subtitle={`${stats.totalProjects} projects`}
              color={Colors.light.success}
              onPress={() => router.push('/projects')}
            />
            <StatCard
              title='Active Clients'
              value={stats.activeClients}
              subtitle={`${stats.totalClients} total`}
              color={Colors.light.primary}
              onPress={() => router.push('/clients')}
            />
          </View>
        </View>

        {/* Project Stats */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Project Status
          </EnhancedThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              title='Active Projects'
              value={stats.activeProjects}
              subtitle='In progress'
              color={Colors.light.info}
              onPress={() => router.push('/projects')}
            />
            <StatCard
              title='Completed'
              value={stats.completedProjects}
              subtitle='This month'
              color={Colors.light.success}
              onPress={() => router.push('/projects')}
            />
          </View>
        </View>

        {/* Task Management */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Task Management
          </EnhancedThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              title='Pending Tasks'
              value={stats.pendingTasks}
              subtitle={`${stats.totalTasks} total`}
              color={Colors.light.warning}
              onPress={() => router.push('/tasks')}
            />
            <StatCard
              title='Overdue'
              value={stats.overdueTasks}
              subtitle='Need attention'
              color={Colors.light.error}
              onPress={() => router.push('/tasks')}
            />
          </View>
        </View>

        {/* Time Tracking */}
        <View style={styles.section}>
          <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
            Time & Billing
          </EnhancedThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              title='Billable Hours'
              value={`${stats.billableHours}h`}
              subtitle={`${stats.totalHoursLogged}h total`}
              color={Colors.light.accent}
            />
            <StatCard
              title='Time Revenue'
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
            <QuickActionCard
              title='New Client'
              description='Add a new client'
              icon='👥'
              color={Colors.light.primary}
              onPress={() => router.push('/clients')}
            />
            <QuickActionCard
              title='New Project'
              description='Start a project'
              icon='📁'
              color={Colors.light.secondary}
              onPress={() => router.push('/projects')}
            />
            <QuickActionCard
              title='Add Task'
              description='Create a task'
              icon='✅'
              color={Colors.light.accent}
              onPress={() => router.push('/tasks')}
            />
            <QuickActionCard
              title='Analytics'
              description='View reports'
              icon='📊'
              color={Colors.light.warning}
              onPress={() => {
                Alert.alert('Analytics', 'Advanced analytics coming soon!');
              }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  quickActionCard: {
    marginBottom: 0,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xs / 2,
  },
  quickActionDescription: {
    textAlign: 'center',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
