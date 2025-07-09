import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectList, ProjectForm } from '../../components';
import { Project, Client } from '../../types';
import { ProjectService, ClientService } from '../../services';
import {
  ProfessionalHeader,
  ActionButton,
  EnhancedThemedText,
  StatCard,
  StatusBadge,
} from '../../../components/ui';
import { Colors, Spacing } from '../../../constants/Colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

export const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  // Load initial data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Initialize and load both projects and clients
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
      Alert.alert(
        'Error',
        'Failed to load projects and clients. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProjectPress = (project: Project) => {
    const statusText = project.status.replace('_', ' ').toUpperCase();
    const priorityText = project.priority.toUpperCase();
    const budgetText = project.budget
      ? `$${project.budget.toLocaleString()}`
      : 'Not set';
    const spentText = `$${(project.totalSpent || 0).toLocaleString()}`;
    const progressText =
      (project.taskCount || 0) > 0
        ? `${project.completedTasks || 0}/${project.taskCount} tasks completed`
        : 'No tasks yet';

    Alert.alert(
      project.title,
      `Client: ${project.clientName}\nStatus: ${statusText}\nPriority: ${priorityText}\nBudget: ${budgetText}\nSpent: ${spentText}\nProgress: ${progressText}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditProject(project) },
      ]
    );
  };

  const handleAddProject = () => {
    if (clients.length === 0) {
      Alert.alert(
        'No Clients Available',
        'You need to add at least one client before creating a project.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setEditingProject(undefined);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleViewProjectDetails = (project: Project) => {
    const statusText = project.status.replace('_', ' ').toUpperCase();
    const priorityText = project.priority.toUpperCase();
    const budgetText = project.budget
      ? `$${project.budget.toLocaleString()}`
      : 'Not set';
    const spentText = `$${(project.totalSpent || 0).toLocaleString()}`;
    const progressText =
      (project.taskCount || 0) > 0
        ? `${project.completedTasks || 0}/${project.taskCount} tasks completed`
        : 'No tasks yet';

    Alert.alert(
      `${project.title} - Details`,
      `Client: ${project.clientName}\nStatus: ${statusText}\nPriority: ${priorityText}\nBudget: ${budgetText}\nSpent: ${spentText}\nProgress: ${progressText}\n\nDescription: ${project.description || 'No description'}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditProject(project) },
        {
          text: 'Manage Files',
          onPress: () => {
            // TODO: Navigate to file management screen
            Alert.alert(
              'File Management',
              'File management feature coming soon!'
            );
          },
        },
      ]
    );
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await ProjectService.deleteProject(project.id);
              if (success) {
                setProjects(prev => prev.filter(p => p.id !== project.id));
                // Refresh clients to update project counts
                const updatedClients = await ClientService.getAllClients();
                setClients(updatedClients);
                Alert.alert('Success', 'Project deleted successfully.');
              } else {
                Alert.alert('Error', 'Project not found.');
              }
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert(
                'Error',
                'Failed to delete project. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setLoading(true);

      if (editingProject) {
        // Update existing project
        const updatedProject = await ProjectService.updateProject(
          editingProject.id,
          projectData
        );
        if (updatedProject) {
          setProjects(prev =>
            prev.map(p => (p.id === editingProject.id ? updatedProject : p))
          );
          Alert.alert('Success', 'Project updated successfully.');
        }
      } else {
        // Add new project
        const newProject = await ProjectService.addProject(projectData);
        setProjects(prev => [newProject, ...prev]);
        Alert.alert('Success', 'Project added successfully.');
      }

      // Refresh clients to update project counts
      const updatedClients = await ClientService.getAllClients();
      setClients(updatedClients);

      setShowForm(false);
      setEditingProject(undefined);
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const [projectData, clientData] = await Promise.all([
        ProjectService.getAllProjects(),
        ClientService.getAllClients(),
      ]);

      setProjects(projectData);
      setClients(clientData);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate project statistics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <ProfessionalHeader
        title="Projects"
        subtitle={`${projects.length} projects in your portfolio`}
        rightButton={{
          title: '+ New Project',
          onPress: handleAddProject,
          variant: 'primary',
        }}
      />

      <View style={styles.container}>
        {/* Project Statistics */}
        {projects.length > 0 && (
          <View style={styles.statsSection}>
            <EnhancedThemedText type="heading4" style={styles.sectionTitle}>
              Overview
            </EnhancedThemedText>
            <View style={styles.statsGrid}>
              <StatCard
                title="Active Projects"
                value={activeProjects}
                subtitle={`${projects.length} total`}
                color={Colors.light.primary}
              />
              <StatCard
                title="Total Budget"
                value={formatCurrency(totalBudget)}
                subtitle={`${formatCurrency(totalSpent)} spent`}
                color={Colors.light.success}
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                title="Completed"
                value={completedProjects}
                subtitle="This period"
                color={Colors.light.accent}
              />
              <StatCard
                title="On Hold"
                value={onHoldProjects}
                subtitle="Requires attention"
                color={Colors.light.warning}
              />
            </View>
          </View>
        )}

        {/* Project Status Summary */}
        {projects.length > 0 && (
          <View style={styles.statusSection}>
            <EnhancedThemedText type="heading4" style={styles.sectionTitle}>
              Status Summary
            </EnhancedThemedText>
            <View style={styles.statusBadgesContainer}>
              <View style={styles.statusBadgeItem}>
                <StatusBadge status="active" />
                <EnhancedThemedText type="caption" color="secondary" style={styles.statusCount}>
                  {activeProjects}
                </EnhancedThemedText>
              </View>
              <View style={styles.statusBadgeItem}>
                <StatusBadge status="completed" />
                <EnhancedThemedText type="caption" color="secondary" style={styles.statusCount}>
                  {completedProjects}
                </EnhancedThemedText>
              </View>
              <View style={styles.statusBadgeItem}>
                <StatusBadge status="on_hold" />
                <EnhancedThemedText type="caption" color="secondary" style={styles.statusCount}>
                  {onHoldProjects}
                </EnhancedThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Project List Header */}
        <View style={styles.listHeader}>
          <EnhancedThemedText type="heading4">
            All Projects
          </EnhancedThemedText>
          {projects.length > 0 && (
            <EnhancedThemedText type="caption" color="secondary">
              {activeProjects} active • {completedProjects} completed
            </EnhancedThemedText>
          )}
        </View>
        
        <View style={styles.listContainer}>
          <ProjectList
            projects={projects}
            onProjectPress={handleProjectPress}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onViewDetails={handleViewProjectDetails}
            onAddProject={handleAddProject}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </View>
      </View>

      {/* Project Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ProjectForm
          project={editingProject}
          clients={clients}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
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
    marginBottom: Spacing.md,
  },
  statusSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusBadgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusBadgeItem: {
    alignItems: 'center',
  },
  statusCount: {
    marginTop: Spacing.xs / 2,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
});
