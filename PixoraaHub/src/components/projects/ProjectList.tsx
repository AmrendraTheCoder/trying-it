import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Project } from '../../types';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  onProjectPress: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onAddProject?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  showClient?: boolean;
}

type SortOption =
  | 'title'
  | 'status'
  | 'priority'
  | 'startDate'
  | 'deadline'
  | 'budget';

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectPress,
  onEditProject,
  onDeleteProject,
  onViewDetails,
  onAddProject,
  loading: _loading,
  refreshing = false,
  onRefresh,
  showClient = true,
}) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<
    Project['priority'] | 'all'
  >('all');
  const [sortBy, setSortBy] = useState<SortOption>('startDate');
  const [sortAscending, setSortAscending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        project => project.priority === priorityFilter
      );
    }

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(search) ||
          (project.description &&
            project.description.toLowerCase().includes(search)) ||
          (project.clientName &&
            project.clientName.toLowerCase().includes(search))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder: { [key in Project['priority']]: number } = {
            low: 1,
            medium: 2,
            high: 3,
            urgent: 4,
          };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate).getTime() : 0;
          bValue = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortAscending ? -1 : 1;
      if (aValue > bValue) return sortAscending ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    projects,
    searchText,
    statusFilter,
    priorityFilter,
    sortBy,
    sortAscending,
  ]);

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteProject?.(project),
        },
      ]
    );
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(option);
      setSortAscending(true);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={onProjectPress}
      onEdit={onEditProject}
      onDelete={handleDeleteProject}
      onViewDetails={onViewDetails}
      showClient={showClient}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {searchText || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'No projects found'
          : 'No projects yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Create your first project to get started'}
      </Text>
      {onAddProject &&
        !searchText &&
        statusFilter === 'all' &&
        priorityFilter === 'all' && (
          <TouchableOpacity style={styles.addButton} onPress={onAddProject}>
            <Text style={styles.addButtonText}>Add Project</Text>
          </TouchableOpacity>
        )}
    </View>
  );

  const getFilterCounts = () => {
    const statusCounts = {
      all: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      on_hold: projects.filter(p => p.status === 'on_hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
    };

    const priorityCounts = {
      all: projects.length,
      high: projects.filter(p => p.priority === 'high').length,
      medium: projects.filter(p => p.priority === 'medium').length,
      low: projects.filter(p => p.priority === 'low').length,
    };

    return { statusCounts, priorityCounts };
  };

  const { statusCounts, priorityCounts } = getFilterCounts();

  const hasActiveFilters =
    searchText || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search projects...'
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize='none'
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
          {hasActiveFilters && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'startDate', label: 'Date' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
            { key: 'title', label: 'Name' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.sortButton,
                sortBy === key && styles.sortButtonActive,
              ]}
              onPress={() => handleSort(key as SortOption)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === key && styles.sortButtonTextActive,
                ]}
              >
                {label}
                {sortBy === key && (sortAscending ? ' ↑' : ' ↓')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filteredAndSortedProjects.length} of {projects.length} projects
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
          >
            <Text style={styles.clearFilters}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Project List */}
      <FlatList
        data={filteredAndSortedProjects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredAndSortedProjects.length === 0
            ? styles.emptyContainer
            : undefined
        }
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType='fade'
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Projects</Text>

            {/* Status Filter */}
            <Text style={styles.filterSectionTitle}>Status</Text>
            {(
              ['all', 'active', 'completed', 'on_hold', 'cancelled'] as const
            ).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  statusFilter === status && styles.filterOptionSelected,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    statusFilter === status && styles.filterOptionTextSelected,
                  ]}
                >
                  {status === 'all'
                    ? 'All'
                    : status
                        .replace('_', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}{' '}
                  ({statusCounts[status]})
                </Text>
              </TouchableOpacity>
            ))}

            {/* Priority Filter */}
            <Text style={styles.filterSectionTitle}>Priority</Text>
            {(['all', 'high', 'medium', 'low'] as const).map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterOption,
                  priorityFilter === priority && styles.filterOptionSelected,
                ]}
                onPress={() => setPriorityFilter(priority)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    priorityFilter === priority &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {priority === 'all'
                    ? 'All'
                    : priority.charAt(0).toUpperCase() + priority.slice(1)}{' '}
                  ({priorityCounts[priority]})
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filterButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    fontWeight: '500',
  },
  sortButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  clearFilters: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#2196F3',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
