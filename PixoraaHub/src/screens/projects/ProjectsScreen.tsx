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

// Mock clients data for project creation
const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Tech Solutions Inc.',
    status: 'active',
    projectCount: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@creativestudio.com',
    company: 'Creative Studio',
    status: 'active',
    projectCount: 2,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-08',
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@startup.io',
    company: 'Innovation Startup',
    status: 'active',
    projectCount: 1,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
];

// Mock projects data
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform Redesign',
    description:
      'Complete overhaul of the existing e-commerce platform with modern UI/UX and improved performance.',
    clientId: '1',
    clientName: 'Tech Solutions Inc.',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-15',
    deadline: '2024-04-15',
    budget: 15000,
    totalSpent: 8500,
    hourlyRate: 75,
    estimatedHours: 200,
    taskCount: 12,
    completedTasks: 7,
    notes: 'Client is very responsive and provides timely feedback.',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Native iOS and Android app for creative portfolio showcase.',
    clientId: '2',
    clientName: 'Creative Studio',
    status: 'active',
    priority: 'medium',
    startDate: '2024-01-20',
    endDate: '2024-03-20',
    deadline: '2024-03-25',
    budget: 12000,
    totalSpent: 3000,
    hourlyRate: 80,
    estimatedHours: 150,
    taskCount: 8,
    completedTasks: 2,
    notes: 'First mobile project with this client.',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22',
  },
  {
    id: '3',
    title: 'Website Maintenance',
    description: 'Ongoing maintenance and updates for startup website.',
    clientId: '3',
    clientName: 'Innovation Startup',
    status: 'on_hold',
    priority: 'low',
    startDate: '2024-01-01',
    budget: 2000,
    totalSpent: 1200,
    hourlyRate: 60,
    estimatedHours: 40,
    taskCount: 5,
    completedTasks: 3,
    notes: 'On hold due to client budget constraints.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-25',
  },
  {
    id: '4',
    title: 'API Integration Project',
    description: 'Integration of third-party APIs for data synchronization.',
    clientId: '1',
    clientName: 'Tech Solutions Inc.',
    status: 'completed',
    priority: 'medium',
    startDate: '2023-12-01',
    endDate: '2024-01-10',
    budget: 5000,
    totalSpent: 4800,
    hourlyRate: 75,
    estimatedHours: 67,
    taskCount: 6,
    completedTasks: 6,
    notes: 'Successfully completed ahead of schedule.',
    createdAt: '2023-11-25',
    updatedAt: '2024-01-10',
  },
];

export const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [clients] = useState<Client[]>(mockClients);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate loading initial data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProjects(prev => prev.filter(p => p.id !== project.id));
          },
        },
      ]
    );
  };

  const handleFormSubmit = (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (editingProject) {
        // Update existing project
        setProjects(prev =>
          prev.map(p =>
            p.id === editingProject.id
              ? {
                  ...p,
                  ...projectData,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
      } else {
        // Add new project
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProjects(prev => [newProject, ...prev]);
      }

      setLoading(false);
      setShowForm(false);
      setEditingProject(undefined);
    }, 1500);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on_hold').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce(
      (sum, p) => sum + (p.totalSpent || 0),
      0
    );

    return { total, active, completed, onHold, totalBudget, totalSpent };
  };

  const stats = getProjectStats();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
      {/* Header with Add Button and Stats */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerStats}>
            {stats.active} Active • {stats.completed} Completed • {stats.onHold}{' '}
            On Hold
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
          <Text style={styles.addButtonText}>+ Add Project</Text>
        </TouchableOpacity>
      </View>

      {/* Budget Summary */}
      <View style={styles.budgetSummary}>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Total Budget</Text>
          <Text style={styles.budgetValue}>
            ${stats.totalBudget.toLocaleString()}
          </Text>
        </View>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Total Spent</Text>
          <Text
            style={[
              styles.budgetValue,
              stats.totalSpent > stats.totalBudget && styles.overBudget,
            ]}
          >
            ${stats.totalSpent.toLocaleString()}
          </Text>
        </View>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Remaining</Text>
          <Text
            style={[
              styles.budgetValue,
              stats.totalBudget - stats.totalSpent < 0 && styles.overBudget,
            ]}
          >
            ${(stats.totalBudget - stats.totalSpent).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Project List */}
      <ProjectList
        projects={projects}
        onProjectPress={handleProjectPress}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onAddProject={handleAddProject}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showClient={true}
      />

      {/* Project Form Modal */}
      <Modal
        visible={showForm}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={handleFormCancel}
      >
        <View style={styles.modalContainer}>
          <ProjectForm
            project={editingProject}
            clients={clients}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerStats: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  budgetSummary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  overBudget: {
    color: '#f44336',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
