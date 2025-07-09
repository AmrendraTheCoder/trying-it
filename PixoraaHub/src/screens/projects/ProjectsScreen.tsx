import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectList, ProjectForm } from '../../components';
import { Project, Client } from '../../types';
import { ProjectService, ClientService } from '../../services';

export const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getProjectStats = () => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(
      p => p.status === 'completed'
    ).length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce(
      (sum, p) => sum + (p.totalSpent || 0),
      0
    );

    return {
      total: projects.length,
      active: activeProjects,
      completed: completedProjects,
      totalBudget,
      totalSpent,
    };
  };

  const stats = getProjectStats();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
      {/* Header with Stats and Add Button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Projects</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
          <Text style={styles.addButtonText}>+ Add Project</Text>
        </TouchableOpacity>
      </View>

      {/* Project List */}
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
          loading={loading}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
