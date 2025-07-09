import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DateRange {
  start: string;
  end: string;
  label: string;
}

interface DateRangePickerProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  disabled?: boolean;
}

const predefinedRanges: DateRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Last 7 Days',
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Last 30 Days',
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Last 3 Months',
  },
  {
    start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Last 6 Months',
  },
  {
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Year to Date',
  },
  {
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split('T')[0],
    end: new Date(new Date().getFullYear() - 1, 11, 31)
      .toISOString()
      .split('T')[0],
    label: 'Last Year',
  },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  onRangeChange,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleRangeSelect = (range: DateRange) => {
    onRangeChange(range);
    setModalVisible(false);
  };

  const formatDateRange = (range: DateRange): string => {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year:
        startDate.getFullYear() !== endDate.getFullYear()
          ? 'numeric'
          : undefined,
    };

    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.pickerContent}>
          <View>
            <Text style={styles.pickerLabel}>Date Range</Text>
            <Text style={styles.pickerValue}>
              {selectedRange.label || formatDateRange(selectedRange)}
            </Text>
          </View>
          <Ionicons
            name='calendar-outline'
            size={20}
            color={disabled ? '#ccc' : '#2196F3'}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name='close' size={24} color='#666' />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.rangeList}>
              {predefinedRanges.map((range, index) => {
                const isSelected =
                  selectedRange.start === range.start &&
                  selectedRange.end === range.end;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.rangeOption,
                      isSelected && styles.rangeOptionSelected,
                    ]}
                    onPress={() => handleRangeSelect(range)}
                  >
                    <View style={styles.rangeOptionContent}>
                      <Text
                        style={[
                          styles.rangeOptionLabel,
                          isSelected && styles.rangeOptionLabelSelected,
                        ]}
                      >
                        {range.label}
                      </Text>
                      <Text
                        style={[
                          styles.rangeOptionDates,
                          isSelected && styles.rangeOptionDatesSelected,
                        ]}
                      >
                        {formatDateRange(range)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name='checkmark' size={20} color='#2196F3' />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.customRangeButton}
                onPress={() => {
                  // TODO: Implement custom date picker
                  setModalVisible(false);
                }}
              >
                <Ionicons name='calendar' size={16} color='#2196F3' />
                <Text style={styles.customRangeText}>Custom Range</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  pickerButtonDisabled: {
    opacity: 0.6,
  },
  pickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  rangeList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  rangeOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  rangeOptionContent: {
    flex: 1,
  },
  rangeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rangeOptionLabelSelected: {
    color: '#2196F3',
  },
  rangeOptionDates: {
    fontSize: 14,
    color: '#666',
  },
  rangeOptionDatesSelected: {
    color: '#1976D2',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  customRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  customRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
});
