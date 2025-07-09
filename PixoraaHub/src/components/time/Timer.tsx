import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { TimeTrackingService } from '../../services';
import { ActiveTimer, Task, Project } from '../../types';

interface TimerProps {
  task?: Task;
  project?: Project;
  onTimerStart?: (timer: ActiveTimer) => void;
  onTimerStop?: (timeEntry: any) => void;
  compact?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  task,
  project,
  onTimerStart,
  onTimerStop,
  compact = false,
}) => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopDescription, setStopDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load active timer on component mount
  useEffect(() => {
    loadActiveTimer();
  }, []);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeTimer) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeTimer.startTime).getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const loadActiveTimer = async () => {
    try {
      const timer = await TimeTrackingService.getActiveTimer();
      setActiveTimer(timer);
      if (timer) {
        const now = new Date().getTime();
        const start = new Date(timer.startTime).getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }
    } catch (error) {
      console.error('Error loading active timer:', error);
    }
  };

  const handleStartTimer = async () => {
    if (!task || !project) {
      Alert.alert(
        'Error',
        'Please select a task and project to start tracking time.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const timer = await TimeTrackingService.startTimer(
        task.id,
        project.id,
        '', // description will be added when stopping
        task.tags,
        true // default to billable
      );

      if (timer) {
        setActiveTimer(timer);
        onTimerStart?.(timer);
        Alert.alert(
          'Timer Started',
          `Time tracking started for "${task.title}"`
        );
      } else {
        Alert.alert('Error', 'Failed to start timer. Please try again.');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      Alert.alert('Error', 'Failed to start timer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      setStopDescription(activeTimer.description || '');
      setShowStopModal(true);
    }
  };

  const confirmStopTimer = async () => {
    try {
      setIsLoading(true);
      const timeEntry = await TimeTrackingService.stopTimer(stopDescription);

      if (timeEntry) {
        setActiveTimer(null);
        setElapsedTime(0);
        setShowStopModal(false);
        setStopDescription('');
        onTimerStop?.(timeEntry);

        const hours = Math.round((timeEntry.duration / 60) * 100) / 100;
        Alert.alert(
          'Timer Stopped',
          `Time entry saved: ${hours} hours for "${timeEntry.description || 'Time tracking'}"`
        );
      } else {
        Alert.alert('Error', 'Failed to stop timer. Please try again.');
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      Alert.alert('Error', 'Failed to stop timer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCurrentTaskTimer =
    activeTimer && task && activeTimer.taskId === task.id;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {isCurrentTaskTimer ? (
          <TouchableOpacity
            style={[styles.compactButton, styles.stopButton]}
            onPress={handleStopTimer}
            disabled={isLoading}
          >
            <Text style={styles.compactButtonText}>
              ⏹️ {formatTime(elapsedTime)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.compactButton, styles.startButton]}
            onPress={handleStartTimer}
            disabled={isLoading || !!activeTimer}
          >
            <Text style={styles.compactButtonText}>
              {activeTimer ? '⏸️ Other' : '▶️ Start'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
        {activeTimer && (
          <Text style={styles.taskText}>
            {isCurrentTaskTimer ? task?.title : 'Other task running...'}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {isCurrentTaskTimer ? (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopTimer}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>⏹️ Stop Timer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              (!task || !project || activeTimer) && styles.disabledButton,
            ]}
            onPress={handleStartTimer}
            disabled={isLoading || !task || !project || !!activeTimer}
          >
            <Text style={styles.buttonText}>
              {activeTimer ? '⏸️ Another Timer Running' : '▶️ Start Timer'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!task && (
        <Text style={styles.infoText}>
          Select a task to start time tracking
        </Text>
      )}

      {/* Stop Timer Modal */}
      <Modal
        visible={showStopModal}
        transparent
        animationType='slide'
        onRequestClose={() => setShowStopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stop Timer</Text>
            <Text style={styles.modalSubtitle}>
              Total time: {formatTime(elapsedTime)}
            </Text>

            <Text style={styles.inputLabel}>Description (optional):</Text>
            <TextInput
              style={styles.textInput}
              value={stopDescription}
              onChangeText={setStopDescription}
              placeholder='What did you work on?'
              multiline
              numberOfLines={3}
              textAlignVertical='top'
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStopModal(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmStopTimer}
                disabled={isLoading}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Saving...' : 'Stop & Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
  },
  compactContainer: {
    alignItems: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  taskText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  compactButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 20,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
