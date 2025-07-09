import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data for dashboard stats
const mockStats = {
  totalClients: 12,
  activeProjects: 8,
  completedProjects: 24,
  totalRevenue: 156800,
  monthlyRevenue: 28500,
  pendingTasks: 15,
};

const recentActivity = [
  { id: '1', type: 'client', message: 'New client John Smith added', time: '2 hours ago' },
  { id: '2', type: 'project', message: 'E-commerce Platform project updated', time: '4 hours ago' },
  { id: '3', type: 'project', message: 'Mobile App Development completed', time: '1 day ago' },
];

export default function DashboardScreen() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, color = '#4CAF50' }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ActivityItem = ({ type, message, time }: {
    type: string;
    message: string;
    time: string;
  }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: type === 'client' ? '#2196F3' : '#FF9800' }]}>
        <Text style={styles.activityIconText}>
          {type === 'client' ? 'C' : 'P'}
        </Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{message}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PixoraaHub Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back! Here's your business overview.</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Clients"
              value={mockStats.totalClients.toString()}
              subtitle="3 new this month"
              color="#2196F3"
            />
            <StatCard
              title="Active Projects"
              value={mockStats.activeProjects.toString()}
              subtitle="2 starting soon"
              color="#4CAF50"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Completed Projects"
              value={mockStats.completedProjects.toString()}
              subtitle="6 this quarter"
              color="#FF9800"
            />
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(mockStats.monthlyRevenue)}
              subtitle="↗ 12% vs last month"
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/clients')}
            >
              <Text style={styles.actionButtonText}>👥 Manage Clients</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/projects')}
            >
              <Text style={styles.actionButtonText}>📁 View Projects</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.map((activity) => (
              <ActivityItem
                key={activity.id}
                type={activity.type}
                message={activity.message}
                time={activity.time}
              />
            ))}
          </View>
        </View>

        {/* Bottom Spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 20,
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
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  bottomSpacer: {
    height: 120, // Extra space for tab bar
  },
});
