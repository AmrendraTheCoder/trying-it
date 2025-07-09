import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectList, ProjectForm } from '../../components';
import { Project, Client } from '../../types';
import { ProjectService, ClientService } from '../../services';
import { EnhancedThemedText } from '../../../components/ui';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../constants/Colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

export const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(
    undefined
  );
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        ProjectService.initializeProjects(),
        ClientService.initializeClients(),
      ]);
      const [projectData, clientData] = await Promise.all([
        ProjectService.getAllProjects(),
        ClientService.getAllClients(),
      ]);
      setProjects(projectData);
      setClients(clientData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddProject = () => {
    setEditingProject(undefined);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProjectService.deleteProject(project.id);
              await loadData();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert(
                'Error',
                'Failed to delete project. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleProjectPress = (project: Project) => {
    // Handle project selection/navigation
    console.log('Selected project:', project);
  };

  const handleViewProjectDetails = (project: Project) => {
    // Handle viewing project details
    console.log('View project details:', project);
  };

  const handleFormSubmit = async (projectData: any) => {
    try {
      if (editingProject) {
        await ProjectService.updateProject(editingProject.id, projectData);
      } else {
        await ProjectService.addProject(projectData);
      }
      setShowForm(false);
      setEditingProject(undefined);
      await loadData();
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(
    p => p.status === 'completed'
  ).length;
  const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Metric Card Component
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, subtitle, color = Colors.light.primary }) => (
    <View style={[styles.metricCard]}>
      <View style={styles.metricContent}>
        <EnhancedThemedText
          type='caption'
          color='secondary'
          style={styles.metricTitle}
        >
          {title}
        </EnhancedThemedText>
        <EnhancedThemedText
          type='heading3'
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
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle='dark-content' backgroundColor={backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <EnhancedThemedText type='heading1' style={styles.title}>
            Projects
          </EnhancedThemedText>
          <EnhancedThemedText
            type='body'
            color='secondary'
            style={styles.subtitle}
          >
            Manage your project portfolio
          </EnhancedThemedText>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
          <EnhancedThemedText type='bodySemiBold' style={styles.addButtonText}>
            + New Project
          </EnhancedThemedText>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      {projects.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <MetricCard
              title='Total Budget'
              value={formatCurrency(totalBudget)}
              subtitle={`${formatCurrency(totalSpent)} spent`}
              color={Colors.light.success}
            />
            <MetricCard
              title='Active Projects'
              value={activeProjects}
              subtitle={`${projects.length} total`}
              color={Colors.light.primary}
            />
          </View>

          <View style={styles.statsGrid}>
            <MetricCard
              title='Completed'
              value={completedProjects}
              subtitle='Finished'
              color={Colors.light.accent}
            />
            <MetricCard
              title='On Hold'
              value={onHoldProjects}
              subtitle='Paused'
              color={Colors.light.warning}
            />
          </View>
        </View>
      )}

      {/* Project List */}
      <View style={styles.content}>
        <ProjectList
          projects={projects}
          onProjectPress={handleProjectPress}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onViewDetails={handleViewProjectDetails}
          onAddProject={handleAddProject}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {/* Project List Header */}
        {projects.length > 0 && (
          <View style={styles.listHeader}>
            <EnhancedThemedText type='heading4'>
              All Projects ({projects.length})
            </EnhancedThemedText>
            <EnhancedThemedText type='caption' color='secondary'>
              {activeProjects} active • {completedProjects} completed •{' '}
              {onHoldProjects} on hold
            </EnhancedThemedText>
          </View>
        )}
      </View>

      {/* Project Form Modal */}
      <Modal
        visible={showForm}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <ProjectForm
          project={editingProject}
          clients={clients}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  addButtonText: {
    color: Colors.light.textInverse,
  },
  statsSection: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    flex: 1,
    ...Shadows.sm,
  },
  metricContent: {
    padding: Spacing.cardPadding,
    minHeight: 70,
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
  content: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
    gap: Spacing.xs / 2,
  },
});
