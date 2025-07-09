import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { fileService } from '../../services/fileService';
import { FileAttachment } from '../../types';

interface FilePreviewProps {
  attachment: FileAttachment;
  onDelete?: (id: string) => void;
  onEdit?: (attachment: FileAttachment) => void;
  showActions?: boolean;
  compact?: boolean;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FilePreview: React.FC<FilePreviewProps> = ({
  attachment,
  onDelete,
  onEdit,
  showActions = true,
  compact = false,
  style,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const isImage = fileService.isImageFile(attachment.mimeType);
  const isVideo = fileService.isVideoFile(attachment.mimeType);
  const isDocument = fileService.isDocumentFile(attachment.mimeType);

  const handlePreview = async () => {
    if (isImage) {
      const uri = await fileService.getFileUri(attachment.id);
      if (uri) {
        setImageUri(uri);
        setShowImageModal(true);
      }
    } else {
      // For non-images, we could implement a document viewer
      // For now, we'll show the share dialog
      handleShare();
    }
  };

  const handleShare = async () => {
    try {
      const shareableUri = await fileService.shareFile(attachment.id);
      if (shareableUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(shareableUri, {
          mimeType: attachment.mimeType,
          dialogTitle: `Share ${attachment.fileName}`,
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${attachment.fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(attachment.id),
        },
      ]
    );
  };

  const handleEditPress = () => {
    onEdit?.(attachment);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = () => {
    return fileService.getFileIcon(attachment.mimeType);
  };

  const getFileColor = () => {
    if (isImage) return '#4CAF50';
    if (isVideo) return '#E91E63';
    if (isDocument) return '#2196F3';
    return '#666';
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={handlePreview}
      >
        <View
          style={[
            styles.compactIcon,
            { backgroundColor: `${getFileColor()}15` },
          ]}
        >
          <Ionicons
            name={getFileIcon() as any}
            size={16}
            color={getFileColor()}
          />
        </View>
        <Text style={styles.compactText} numberOfLines={1}>
          {attachment.fileName}
        </Text>
        <Text style={styles.compactSize}>
          {fileService.formatFileSize(attachment.fileSize)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <View style={[styles.container, style]}>
        <TouchableOpacity style={styles.previewArea} onPress={handlePreview}>
          {isImage ? (
            <View style={styles.imageThumbnail}>
              <Image
                source={{ uri: attachment.filePath }}
                style={styles.thumbnailImage}
                resizeMode='cover'
              />
              <View style={styles.imageOverlay}>
                <Ionicons name='eye-outline' size={20} color='white' />
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.fileIcon,
                { backgroundColor: `${getFileColor()}15` },
              ]}
            >
              <Ionicons
                name={getFileIcon() as any}
                size={32}
                color={getFileColor()}
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {attachment.fileName}
          </Text>

          <View style={styles.fileDetails}>
            <Text style={styles.fileSize}>
              {fileService.formatFileSize(attachment.fileSize)}
            </Text>
            <Text style={styles.fileDot}>•</Text>
            <Text style={styles.fileDate}>
              {formatDate(attachment.uploadedAt)}
            </Text>
          </View>

          {attachment.description && (
            <Text style={styles.fileDescription} numberOfLines={2}>
              {attachment.description}
            </Text>
          )}
        </View>

        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name='share-outline' size={20} color='#666' />
            </TouchableOpacity>

            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEditPress}
              >
                <Ionicons name='create-outline' size={20} color='#666' />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeletePress}
              >
                <Ionicons name='trash-outline' size={20} color='#F44336' />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name='close' size={30} color='white' />
          </TouchableOpacity>

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.fullscreenImage}
              resizeMode='contain'
            />
          )}

          <View style={styles.imageModalInfo}>
            <Text style={styles.imageModalTitle}>{attachment.fileName}</Text>
            <Text style={styles.imageModalDetails}>
              {fileService.formatFileSize(attachment.fileSize)} •{' '}
              {formatDate(attachment.uploadedAt)}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewArea: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  fileDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  fileDot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 5,
  },
  fileDate: {
    fontSize: 12,
    color: '#666',
  },
  fileDescription: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  compactSize: {
    fontSize: 12,
    color: '#666',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullscreenImage: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
  },
  imageModalInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 8,
  },
  imageModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  imageModalDetails: {
    fontSize: 14,
    color: '#ccc',
  },
});
