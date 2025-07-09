import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { fileService } from '../../services/fileService';
import { FileAttachment, AttachmentType, FilePickerOptions } from '../../types';

interface FilePickerProps {
  entityId: string;
  entityType: AttachmentType;
  onFileUploaded?: (attachment: FileAttachment) => void;
  onError?: (error: string) => void;
  options?: FilePickerOptions;
  disabled?: boolean;
  style?: any;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  entityId,
  entityType,
  onFileUploaded,
  onError,
  options = {},
  disabled = false,
  style,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default

  const handleDocumentPick = async () => {
    try {
      setIsUploading(true);
      setShowSourceModal(false);

      const result = await DocumentPicker.getDocumentAsync({
        type: options.fileTypes || '*/*',
        multiple: options.allowMultiple || false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check file size
        if (asset.size && asset.size > maxFileSize) {
          const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
          onError?.(`File size exceeds ${maxSizeMB}MB limit`);
          return;
        }

        await uploadFile(asset.uri, asset.name, asset.size || 0);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      onError?.('Failed to pick document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePick = async (useCamera: boolean = false) => {
    try {
      setIsUploading(true);
      setShowSourceModal(false);

      // Request permissions
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          onError?.('Camera permission required');
          return;
        }
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          onError?.('Media library permission required');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            allowsMultipleSelection: options.allowMultiple || false,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;

        await uploadFile(asset.uri, fileName, asset.fileSize || 0);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      onError?.('Failed to pick image');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (
    uri: string,
    fileName: string,
    fileSize: number
  ) => {
    try {
      const attachment = await fileService.uploadFile(
        uri,
        fileName,
        entityId,
        entityType
      );

      onFileUploaded?.(attachment);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload file');
    }
  };

  const showSourceSelector = () => {
    setShowSourceModal(true);
  };

  const sourceOptions = [
    {
      id: 'documents',
      title: 'Documents',
      description: 'Browse files and documents',
      icon: 'document-outline',
      color: '#2196F3',
      onPress: handleDocumentPick,
    },
    {
      id: 'camera',
      title: 'Camera',
      description: 'Take a photo',
      icon: 'camera-outline',
      color: '#4CAF50',
      onPress: () => handleImagePick(true),
    },
    {
      id: 'gallery',
      title: 'Photo Gallery',
      description: 'Choose from gallery',
      icon: 'images-outline',
      color: '#FF9800',
      onPress: () => handleImagePick(false),
    },
  ];

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.disabledButton, style]}
        onPress={showSourceSelector}
        disabled={disabled || isUploading}
      >
        <View style={styles.pickerContent}>
          <Ionicons
            name={isUploading ? 'cloud-upload-outline' : 'add-circle-outline'}
            size={24}
            color={disabled ? '#ccc' : '#2196F3'}
          />
          <Text style={[styles.pickerText, disabled && styles.disabledText]}>
            {isUploading ? 'Uploading...' : 'Add File'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showSourceModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Source</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSourceModal(false)}
              >
                <Ionicons name='close' size={24} color='#666' />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {sourceOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sourceOption}
                  onPress={option.onPress}
                >
                  <View
                    style={[
                      styles.sourceIcon,
                      { backgroundColor: `${option.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={option.color}
                    />
                  </View>
                  <View style={styles.sourceContent}>
                    <Text style={styles.sourceTitle}>{option.title}</Text>
                    <Text style={styles.sourceDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons name='chevron-forward' size={20} color='#ccc' />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                Maximum file size: {fileService.formatFileSize(maxFileSize)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 2,
    borderColor: '#E3F2FD',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  pickerContent: {
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
    marginTop: 8,
  },
  disabledText: {
    color: '#ccc',
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
    maxHeight: '70%',
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
  optionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 5,
  },
  sourceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sourceContent: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});
