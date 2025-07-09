import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Project, Client } from '../../types';

interface ProjectFormProps {
  project?: Project; // If provided, we're editing; if not, we're creating
  clients: Client[]; // Available clients for selection
  onSubmit: (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  clientId: string;
  status: Project['status'];
  priority: Project['priority'];
  startDate: string;
  endDate: string;
  deadline: string;
  budget: string;
  hourlyRate: string;
  estimatedHours: string;
  notes: string;
}

interface FormErrors {
  title?: string;
  clientId?: string;
  startDate?: string;
  deadline?: string;
  budget?: string;
  hourlyRate?: string;
  estimatedHours?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  clients,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    clientId: '',
    status: 'active',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    deadline: '',
    budget: '',
    hourlyRate: '',
    estimatedHours: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showClientPicker, setShowClientPicker] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        clientId: project.clientId,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        budget: project.budget ? project.budget.toString() : '',
        hourlyRate: project.hourlyRate ? project.hourlyRate.toString() : '',
        estimatedHours: project.estimatedHours
          ? project.estimatedHours.toString()
          : '',
        notes: project.notes || '',
      });
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Validate client selection
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // Validate budget if provided
    if (formData.budget.trim()) {
      const budget = parseFloat(formData.budget);
      if (isNaN(budget) || budget < 0) {
        newErrors.budget = 'Please enter a valid budget amount';
      }
    }

    // Validate hourly rate if provided
    if (formData.hourlyRate.trim()) {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        newErrors.hourlyRate = 'Please enter a valid hourly rate';
      }
    }

    // Validate estimated hours if provided
    if (formData.estimatedHours.trim()) {
      const hours = parseFloat(formData.estimatedHours);
      if (isNaN(hours) || hours < 0) {
        newErrors.estimatedHours = 'Please enter valid estimated hours';
      }
    }

    // Validate dates logic
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.startDate = 'End date cannot be before start date';
      }
    }

    if (formData.startDate && formData.deadline) {
      if (new Date(formData.deadline) < new Date(formData.startDate)) {
        newErrors.deadline = 'Deadline cannot be before start date';
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

    const selectedClient = clients.find(c => c.id === formData.clientId);

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      clientId: formData.clientId,
      clientName: selectedClient?.name || '',
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      deadline: formData.deadline || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      hourlyRate: formData.hourlyRate
        ? parseFloat(formData.hourlyRate)
        : undefined,
      estimatedHours: formData.estimatedHours
        ? parseFloat(formData.estimatedHours)
        : undefined,
      totalSpent: project?.totalSpent || 0,
      taskCount: project?.taskCount || 0,
      completedTasks: project?.completedTasks || 0,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const StatusSelector: React.FC = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusButtons}>
        {(['active', 'completed', 'on_hold', 'cancelled'] as const).map(
          status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                formData.status === status && styles.statusButtonSelected,
              ]}
              onPress={() => updateField('status', status)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  formData.status === status && styles.statusButtonTextSelected,
                ]}
              >
                {status
                  .replace('_', ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  const PrioritySelector: React.FC = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.label}>Priority</Text>
      <View style={styles.statusButtons}>
        {(['low', 'medium', 'high'] as const).map(priority => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.statusButton,
              formData.priority === priority && styles.statusButtonSelected,
            ]}
            onPress={() => updateField('priority', priority)}
          >
            <Text
              style={[
                styles.statusButtonText,
                formData.priority === priority &&
                  styles.statusButtonTextSelected,
              ]}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.title}>
          {project ? 'Edit Project' : 'Create New Project'}
        </Text>

        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Project Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={formData.title}
            onChangeText={value => updateField('title', value)}
            placeholder='Enter project title'
            autoCapitalize='words'
            editable={!loading}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={value => updateField('description', value)}
            placeholder='Enter project description'
            multiline
            numberOfLines={3}
            textAlignVertical='top'
            editable={!loading}
          />
        </View>

        {/* Client Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Client *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.clientSelector,
              errors.clientId && styles.inputError,
            ]}
            onPress={() => setShowClientPicker(true)}
            disabled={loading}
          >
            <Text
              style={[
                styles.clientSelectorText,
                !selectedClient && styles.placeholderText,
              ]}
            >
              {selectedClient ? selectedClient.name : 'Select a client'}
            </Text>
          </TouchableOpacity>
          {errors.clientId && (
            <Text style={styles.errorText}>{errors.clientId}</Text>
          )}
        </View>

        {/* Status Selector */}
        <StatusSelector />

        {/* Priority Selector */}
        <PrioritySelector />

        {/* Date Fields Row */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={[styles.input, errors.startDate && styles.inputError]}
              value={formData.startDate}
              onChangeText={value => updateField('startDate', value)}
              placeholder='YYYY-MM-DD'
              editable={!loading}
            />
            {errors.startDate && (
              <Text style={styles.errorText}>{errors.startDate}</Text>
            )}
          </View>

          <View style={styles.dateField}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              value={formData.endDate}
              onChangeText={value => updateField('endDate', value)}
              placeholder='YYYY-MM-DD'
              editable={!loading}
            />
          </View>
        </View>

        {/* Deadline Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Deadline</Text>
          <TextInput
            style={styles.input}
            value={formData.deadline}
            onChangeText={value => updateField('deadline', value)}
            placeholder='YYYY-MM-DD'
            editable={!loading}
          />
        </View>

        {/* Budget and Rate Fields Row */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.label}>Budget ($)</Text>
            <TextInput
              style={[styles.input, errors.budget && styles.inputError]}
              value={formData.budget}
              onChangeText={value => updateField('budget', value)}
              placeholder='0.00'
              keyboardType='decimal-pad'
              editable={!loading}
            />
            {errors.budget && (
              <Text style={styles.errorText}>{errors.budget}</Text>
            )}
          </View>

          <View style={styles.dateField}>
            <Text style={styles.label}>Hourly Rate ($)</Text>
            <TextInput
              style={[styles.input, errors.hourlyRate && styles.inputError]}
              value={formData.hourlyRate}
              onChangeText={value => updateField('hourlyRate', value)}
              placeholder='0.00'
              keyboardType='decimal-pad'
              editable={!loading}
            />
            {errors.hourlyRate && (
              <Text style={styles.errorText}>{errors.hourlyRate}</Text>
            )}
          </View>
        </View>

        {/* Estimated Hours Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Estimated Hours</Text>
          <TextInput
            style={[styles.input, errors.estimatedHours && styles.inputError]}
            value={formData.estimatedHours}
            onChangeText={value => updateField('estimatedHours', value)}
            placeholder='0'
            keyboardType='decimal-pad'
            editable={!loading}
          />
          {errors.estimatedHours && (
            <Text style={styles.errorText}>{errors.estimatedHours}</Text>
          )}
        </View>

        {/* Notes Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={value => updateField('notes', value)}
            placeholder='Enter any additional notes...'
            multiline
            numberOfLines={4}
            textAlignVertical='top'
            editable={!loading}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Client Picker Modal */}
      <Modal
        visible={showClientPicker}
        transparent
        animationType='fade'
        onRequestClose={() => setShowClientPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Client</Text>

            <ScrollView style={styles.clientList}>
              {clients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.clientOption,
                    formData.clientId === client.id &&
                      styles.clientOptionSelected,
                  ]}
                  onPress={() => {
                    updateField('clientId', client.id);
                    setShowClientPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.clientOptionText,
                      formData.clientId === client.id &&
                        styles.clientOptionTextSelected,
                    ]}
                  >
                    {client.name}
                  </Text>
                  {client.company && (
                    <Text style={styles.clientCompany}>{client.company}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowClientPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  clientSelector: {
    justifyContent: 'center',
  },
  clientSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  statusButtonSelected: {
    backgroundColor: '#2196F3',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  clientList: {
    maxHeight: 300,
  },
  clientOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  clientOptionSelected: {
    backgroundColor: '#2196F3',
  },
  clientOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  clientOptionTextSelected: {
    color: '#fff',
  },
  clientCompany: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});
