import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus, Priority, Project } from '../../types';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onTaskPress?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  showProjectName?: boolean;
  projectId?: string; // If provided, shows tasks only for this project
}

type SortOption = 'dueDate' | 'priority' | 'status' | 'title' | 'created';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onTaskPress,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  refreshing = false,
  onRefresh,
  showProjectName = true,
  projectId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get project name by ID
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by project if specified
    if (projectId) {
      filtered = filtered.filter(task => task.projectId === projectId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query)) ||
          getProjectName(task.projectId).toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          const statusOrder = {
            todo: 1,
            in_progress: 2,
            review: 3,
            completed: 4,
            blocked: 5,
            cancelled: 6,
          };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    tasks,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    sortOrder,
    projectId,
    projects,
  ]);

  // Get filter counts
  const getFilterCounts = () => {
    const counts = {
      all: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  const renderFilterButton = (
    status: TaskStatus | 'all',
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.filterButton,
        statusFilter === status && styles.filterButtonActive,
      ]}
      onPress={() => setStatusFilter(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          statusFilter === status && styles.filterButtonTextActive,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      key={option}
      style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
      onPress={() => handleSort(option)}
    >
      <Text
        style={[
          styles.sortButtonText,
          sortBy === option && styles.sortButtonTextActive,
        ]}
      >
        {label} {sortBy === option && (sortOrder === 'asc' ? '↑' : '↓')}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'No tasks match your filters'
          : 'No tasks yet'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'Try adjusting your search or filters'
          : projectId
            ? 'Tasks will appear here when you add them to this project'
            : 'Tasks will appear here when you create them'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search tasks...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode='while-editing'
        />
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Status:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { status: 'all' as const, label: 'All', count: filterCounts.all },
            {
              status: 'todo' as const,
              label: 'To Do',
              count: filterCounts.todo,
            },
            {
              status: 'in_progress' as const,
              label: 'In Progress',
              count: filterCounts.in_progress,
            },
            {
              status: 'review' as const,
              label: 'Review',
              count: filterCounts.review,
            },
            {
              status: 'completed' as const,
              label: 'Completed',
              count: filterCounts.completed,
            },
            {
              status: 'blocked' as const,
              label: 'Blocked',
              count: filterCounts.blocked,
            },
          ]}
          renderItem={({ item }) =>
            renderFilterButton(item.status, item.label, item.count)
          }
          keyExtractor={item => item.status}
          style={styles.filtersList}
        />
      </View>

      {/* Priority Filter */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Priority:</Text>
        <View style={styles.priorityFilters}>
          {[
            { priority: 'all' as const, label: 'All' },
            { priority: 'urgent' as const, label: 'Urgent' },
            { priority: 'high' as const, label: 'High' },
            { priority: 'medium' as const, label: 'Medium' },
            { priority: 'low' as const, label: 'Low' },
          ].map(({ priority, label }) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityButton,
                priorityFilter === priority && styles.priorityButtonActive,
              ]}
              onPress={() => setPriorityFilter(priority)}
            >
              <Text
                style={[
                  styles.priorityButtonText,
                  priorityFilter === priority &&
                    styles.priorityButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Sort by:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { option: 'dueDate' as const, label: 'Due Date' },
            { option: 'priority' as const, label: 'Priority' },
            { option: 'status' as const, label: 'Status' },
            { option: 'title' as const, label: 'Title' },
            { option: 'created' as const, label: 'Created' },
          ]}
          renderItem={({ item }) => renderSortButton(item.option, item.label)}
          keyExtractor={item => item.option}
          style={styles.filtersList}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredAndSortedTasks.length} of {tasks.length} tasks
        </Text>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredAndSortedTasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={onTaskPress}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onStatusChange={onTaskStatusChange}
            projectName={
              showProjectName ? getProjectName(item.projectId) : undefined
            }
          />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredAndSortedTasks.length === 0 ? styles.emptyContainer : {}
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filtersList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  priorityFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  priorityButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: '#ffffff',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#ffffff',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
