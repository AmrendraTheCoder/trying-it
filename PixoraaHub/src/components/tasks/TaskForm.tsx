import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { Task, TaskStatus, Priority, Project } from '../../types';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
  task?: Task; // If provided, form is in edit mode
  projects: Project[];
  initialProjectId?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  dueDate?: string;
  startDate?: string;
  tags: string[];
  dependencies: string[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onClose,
  onSubmit,
  task,
  projects,
  initialProjectId,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    projectId: initialProjectId || (projects.length > 0 ? projects[0].id : ''),
    assignedTo: [],
    status: 'todo',
    priority: 'medium',
    estimatedHours: 0,
    dueDate: '',
    startDate: '',
    tags: [],
    dependencies: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormData, string>>
  >({});
  const [tagInput, setTagInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'due' | null>(
    null
  );

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        dueDate: task.dueDate?.split('T')[0] || '', // Convert to YYYY-MM-DD format
        startDate: task.startDate?.split('T')[0] || '',
        tags: task.tags,
        dependencies: task.dependencies,
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        projectId:
          initialProjectId || (projects.length > 0 ? projects[0].id : ''),
        assignedTo: [],
        status: 'todo',
        priority: 'medium',
        estimatedHours: 0,
        dueDate: '',
        startDate: '',
        tags: [],
        dependencies: [],
      });
    }
    setErrors({});
    setTagInput('');
  }, [task, initialProjectId, projects, visible]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours must be positive';
    }

    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);
      if (startDate > dueDate) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors before submitting.'
      );
      return;
    }

    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Extract YYYY-MM-DD part
  };

  const renderStatusPicker = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        {[
          { value: 'todo', label: 'To Do' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'review', label: 'Review' },
          { value: 'completed', label: 'Completed' },
          { value: 'blocked', label: 'Blocked' },
          { value: 'cancelled', label: 'Cancelled' },
        ].map(status => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.pickerOption,
              formData.status === status.value && styles.pickerOptionSelected,
            ]}
            onPress={() =>
              setFormData(prev => ({
                ...prev,
                status: status.value as TaskStatus,
              }))
            }
          >
            <Text
              style={[
                styles.pickerOptionText,
                formData.status === status.value &&
                  styles.pickerOptionTextSelected,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPriorityPicker = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Priority</Text>
      <View style={styles.pickerContainer}>
        {[
          { value: 'low', label: 'Low', color: '#10b981' },
          { value: 'medium', label: 'Medium', color: '#f59e0b' },
          { value: 'high', label: 'High', color: '#ef4444' },
          { value: 'urgent', label: 'Urgent', color: '#dc2626' },
        ].map(priority => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityOption,
              formData.priority === priority.value &&
                styles.priorityOptionSelected,
              { borderColor: priority.color },
            ]}
            onPress={() =>
              setFormData(prev => ({
                ...prev,
                priority: priority.value as Priority,
              }))
            }
          >
            <Text
              style={[
                styles.priorityOptionText,
                formData.priority === priority.value && {
                  color: priority.color,
                },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProjectPicker = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Project *</Text>
      <View style={styles.pickerContainer}>
        {projects.map(project => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.pickerOption,
              formData.projectId === project.id && styles.pickerOptionSelected,
            ]}
            onPress={() =>
              setFormData(prev => ({ ...prev, projectId: project.id }))
            }
          >
            <Text
              style={[
                styles.pickerOptionText,
                formData.projectId === project.id &&
                  styles.pickerOptionTextSelected,
              ]}
            >
              {project.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.projectId && (
        <Text style={styles.errorText}>{errors.projectId}</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{task ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, title: text }))
              }
              placeholder='Enter task title...'
              maxLength={100}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, description: text }))
              }
              placeholder='Enter task description...'
              multiline
              numberOfLines={4}
              textAlignVertical='top'
            />
          </View>

          {/* Project */}
          {renderProjectPicker()}

          {/* Status */}
          {renderStatusPicker()}

          {/* Priority */}
          {renderPriorityPicker()}

          {/* Estimated Hours */}
          <View style={styles.section}>
            <Text style={styles.label}>Estimated Hours</Text>
            <TextInput
              style={[styles.input, errors.estimatedHours && styles.inputError]}
              value={formData.estimatedHours.toString()}
              onChangeText={text => {
                const hours = parseFloat(text) || 0;
                setFormData(prev => ({ ...prev, estimatedHours: hours }));
              }}
              placeholder='0'
              keyboardType='numeric'
            />
            {errors.estimatedHours && (
              <Text style={styles.errorText}>{errors.estimatedHours}</Text>
            )}
          </View>

          {/* Start Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, startDate: text }))
              }
              placeholder='YYYY-MM-DD'
            />
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Due Date</Text>
            <TextInput
              style={[styles.input, errors.dueDate && styles.inputError]}
              value={formData.dueDate}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, dueDate: text }))
              }
              placeholder='YYYY-MM-DD'
            />
            {errors.dueDate && (
              <Text style={styles.errorText}>{errors.dueDate}</Text>
            )}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder='Add a tag...'
                onSubmitEditing={handleAddTag}
                returnKeyType='done'
              />
              <TouchableOpacity
                onPress={handleAddTag}
                style={styles.addTagButton}
              >
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  pickerOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  priorityOptionSelected: {
    backgroundColor: '#f3f4f6',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  addTagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#10b981',
    borderRadius: 6,
    justifyContent: 'center',
  },
  addTagButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    marginRight: 4,
  },
  tagRemove: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  bottomPadding: {
    height: 50,
  },
});
