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
import { TimeEntryCard } from './TimeEntryCard';
import { TimeEntry, Task, Project } from '../../types';

interface TimeLogListProps {
  timeEntries: TimeEntry[];
  tasks: Task[];
  projects: Project[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onEditEntry?: (timeEntry: TimeEntry) => void;
  onDeleteEntry?: (timeEntryId: string) => void;
  projectId?: string; // Filter by project
  taskId?: string; // Filter by task
  showProjectInfo?: boolean;
  showTaskInfo?: boolean;
}

type SortOption = 'date' | 'duration' | 'project' | 'task';
type FilterOption =
  | 'all'
  | 'billable'
  | 'non-billable'
  | 'today'
  | 'week'
  | 'month';

export const TimeLogList: React.FC<TimeLogListProps> = ({
  timeEntries,
  tasks,
  projects,
  onRefresh,
  refreshing = false,
  onEditEntry,
  onDeleteEntry,
  projectId,
  taskId,
  showProjectInfo = true,
  showTaskInfo = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Get task and project maps for quick lookup
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach(task => map.set(task.id, task));
    return map;
  }, [tasks]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach(project => map.set(project.id, project));
    return map;
  }, [projects]);

  // Filter and sort time entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...timeEntries];

    // Filter by project/task if specified
    if (projectId) {
      filtered = filtered.filter(entry => entry.projectId === projectId);
    }
    if (taskId) {
      filtered = filtered.filter(entry => entry.taskId === taskId);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => {
        const task = taskMap.get(entry.taskId);
        const project = projectMap.get(entry.projectId);

        return (
          entry.description?.toLowerCase().includes(query) ||
          task?.title.toLowerCase().includes(query) ||
          project?.title.toLowerCase().includes(query) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    // Filter by type/date
    if (filterBy !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.startTime);

        switch (filterBy) {
          case 'billable':
            return entry.billable;
          case 'non-billable':
            return !entry.billable;
          case 'today':
            return entryDate >= today;
          case 'week':
            return entryDate >= weekAgo;
          case 'month':
            return entryDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
        case 'duration':
          return b.duration - a.duration;
        case 'project':
          const projectA = projectMap.get(a.projectId)?.title || '';
          const projectB = projectMap.get(b.projectId)?.title || '';
          return projectA.localeCompare(projectB);
        case 'task':
          const taskA = taskMap.get(a.taskId)?.title || '';
          const taskB = taskMap.get(b.taskId)?.title || '';
          return taskA.localeCompare(taskB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    timeEntries,
    searchQuery,
    sortBy,
    filterBy,
    projectId,
    taskId,
    taskMap,
    projectMap,
  ]);

  // Calculate total time and revenue for filtered entries
  const totalStats = useMemo(() => {
    const totalMinutes = filteredAndSortedEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    const totalRevenue = filteredAndSortedEntries
      .filter(entry => entry.billable)
      .reduce(
        (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
        0
      );

    return {
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      entryCount: filteredAndSortedEntries.length,
    };
  }, [filteredAndSortedEntries]);

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => {
    const task = taskMap.get(item.taskId);
    const project = projectMap.get(item.projectId);

    return (
      <TimeEntryCard
        timeEntry={item}
        taskTitle={task?.title}
        projectTitle={project?.title}
        onEdit={onEditEntry}
        onDelete={onDeleteEntry}
        showProject={showProjectInfo}
        showTask={showTaskInfo}
      />
    );
  };

  const renderFilterButton = (option: FilterOption, label: string) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.filterButton,
        filterBy === option && styles.activeFilterButton,
      ]}
      onPress={() => setFilterBy(option)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filterBy === option && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      key={option}
      style={[styles.sortButton, sortBy === option && styles.activeSortButton]}
      onPress={() => setSortBy(option)}
    >
      <Text
        style={[
          styles.sortButtonText,
          sortBy === option && styles.activeSortButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search time entries, tasks, or projects...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode='while-editing'
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Filter:</Text>
        <View style={styles.filterButtons}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('today', 'Today')}
          {renderFilterButton('week', 'Week')}
          {renderFilterButton('billable', 'Billable')}
        </View>
      </View>

      {/* Sort Buttons */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Sort:</Text>
        <View style={styles.filterButtons}>
          {renderSortButton('date', 'Date')}
          {renderSortButton('duration', 'Duration')}
          {renderSortButton('project', 'Project')}
          {renderSortButton('task', 'Task')}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalStats.entryCount}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalStats.totalHours}h</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${totalStats.totalRevenue.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Time Entries List */}
      <FlatList
        data={filteredAndSortedEntries}
        renderItem={renderTimeEntry}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No time entries found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start tracking time to see entries here'}
            </Text>
          </View>
        }
        contentContainerStyle={
          filteredAndSortedEntries.length === 0 && styles.emptyListContainer
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  sortButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeSortButton: {
    backgroundColor: '#6366f1',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  activeSortButtonText: {
    color: '#ffffff',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
