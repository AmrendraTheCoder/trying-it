import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { FileAttachment } from '../../types';
import { FileService } from '../../services';

interface FileViewerProps {
  visible: boolean;
  fileId: string | null;
  onClose: () => void;
  onEdit?: (
    fileId: string,
    updates: { fileName?: string; description?: string }
  ) => void;
  onDelete?: (fileId: string) => void;
  onShare?: (fileId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FileViewer: React.FC<FileViewerProps> = ({
  visible,
  fileId,
  onClose,
  onEdit,
  onDelete,
  onShare,
}) => {
  const [file, setFile] = useState<FileAttachment | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedFileName, setEditedFileName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && fileId) {
      loadFile();
    } else {
      resetState();
    }
  }, [visible, fileId]);

  const resetState = () => {
    setFile(null);
    setLoading(false);
    setEditing(false);
    setEditedFileName('');
    setEditedDescription('');
    setFileContent(null);
    setError(null);
  };

  const loadFile = async () => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const fileData = await FileService.getAttachmentById(fileId);
      if (!fileData) {
        setError('File not found');
        return;
      }

      setFile(fileData);
      setEditedFileName(fileData.fileName);
      setEditedDescription(fileData.description || '');

      // Load file content for text files
      if (
        FileService.isDocumentFile(fileData.mimeType) &&
        fileData.mimeType.startsWith('text/')
      ) {
        const content = await FileSystem.readAsStringAsync(fileData.filePath);
        setFileContent(content);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!file) return;

    try {
      const updates: { fileName?: string; description?: string } = {};

      if (editedFileName !== file.fileName) {
        updates.fileName = editedFileName;
      }

      if (editedDescription !== file.description) {
        updates.description = editedDescription;
      }

      if (Object.keys(updates).length > 0) {
        const updatedFile = await FileService.updateAttachment(
          file.id,
          updates
        );
        if (updatedFile) {
          setFile(updatedFile);
          onEdit?.(file.id, updates);
        }
      }

      setEditing(false);
    } catch (error) {
      console.error('Error updating file:', error);
      Alert.alert('Error', 'Failed to update file information');
    }
  };

  const handleCancelEdit = () => {
    if (file) {
      setEditedFileName(file.fileName);
      setEditedDescription(file.description || '');
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (!file) return;

    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.fileName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await FileService.deleteAttachment(file.id);
            if (success) {
              onDelete?.(file.id);
              onClose();
            } else {
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!file) return;

    try {
      const shareablePath = await FileService.shareFile(file.id);
      if (shareablePath) {
        await Sharing.shareAsync(shareablePath, {
          mimeType: file.mimeType,
          dialogTitle: `Share ${file.fileName}`,
        });
        onShare?.(file.id);
      } else {
        Alert.alert('Error', 'Failed to prepare file for sharing');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const renderFileContent = () => {
    if (!file) return null;

    if (FileService.isImageFile(file.mimeType)) {
      return (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.imageContainer}
          minimumZoomScale={1}
          maximumZoomScale={3}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri: file.filePath }}
            style={styles.fullscreenImage}
            contentFit='contain'
            placeholder='Image loading...'
          />
        </ScrollView>
      );
    }

    if (FileService.isVideoFile(file.mimeType)) {
      return (
        <View style={styles.contentContainer}>
          <Video
            source={{ uri: file.filePath }}
            style={styles.video}
            useNativeControls
            resizeMode='contain'
            shouldPlay={false}
          />
        </View>
      );
    }

    if (file.mimeType === 'application/pdf') {
      return (
        <WebView
          source={{ uri: file.filePath }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#3b82f6' />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          )}
        />
      );
    }

    if (fileContent && file.mimeType.startsWith('text/')) {
      return (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.textContent}>{fileContent}</Text>
        </ScrollView>
      );
    }

    // Fallback for unsupported file types
    return (
      <View style={styles.unsupportedContainer}>
        <Ionicons
          name={FileService.getFileIcon(file.mimeType) as any}
          size={64}
          color='#6b7280'
        />
        <Text style={styles.unsupportedTitle}>Preview not available</Text>
        <Text style={styles.unsupportedText}>
          This file type cannot be previewed in the app.
        </Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name='share-outline' size={20} color='#3b82f6' />
          <Text style={styles.shareButtonText}>Share to open externally</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name='close' size={24} color='#ffffff' />
      </TouchableOpacity>

      <View style={styles.headerTitle}>
        {editing ? (
          <TextInput
            style={styles.editTitleInput}
            value={editedFileName}
            onChangeText={setEditedFileName}
            placeholder='File name'
            autoFocus
          />
        ) : (
          <Text style={styles.titleText} numberOfLines={1}>
            {file?.fileName || 'File'}
          </Text>
        )}
      </View>

      <View style={styles.headerActions}>
        {editing ? (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCancelEdit}
            >
              <Ionicons name='close' size={20} color='#ffffff' />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveEdit}
            >
              <Ionicons name='checkmark' size={20} color='#ffffff' />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Ionicons name='pencil' size={20} color='#ffffff' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name='share-outline' size={20} color='#ffffff' />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name='trash-outline' size={20} color='#ffffff' />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderFileInfo = () => (
    <View style={styles.fileInfo}>
      <Text style={styles.fileInfoLabel}>Description:</Text>
      {editing ? (
        <TextInput
          style={styles.editDescriptionInput}
          value={editedDescription}
          onChangeText={setEditedDescription}
          placeholder='Add a description...'
          multiline
          numberOfLines={3}
        />
      ) : (
        <Text style={styles.fileInfoText}>
          {file?.description || 'No description'}
        </Text>
      )}

      <Text style={styles.fileInfoLabel}>Size:</Text>
      <Text style={styles.fileInfoText}>
        {file ? FileService.formatFileSize(file.fileSize) : 'Unknown'}
      </Text>

      <Text style={styles.fileInfoLabel}>Type:</Text>
      <Text style={styles.fileInfoText}>{file?.mimeType || 'Unknown'}</Text>

      <Text style={styles.fileInfoLabel}>Created:</Text>
      <Text style={styles.fileInfoText}>
        {file ? new Date(file.createdAt).toLocaleString() : 'Unknown'}
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType='fade'
      presentationStyle='fullScreen'
      statusBarHidden
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#3b82f6' />
            <Text style={styles.loadingText}>Loading file...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name='alert-circle-outline' size={64} color='#ef4444' />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {renderFileContent()}
            {file && renderFileInfo()}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 16,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  editTitleInput: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
    paddingVertical: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
  },
  textContent: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    padding: 16,
    fontFamily: 'monospace',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unsupportedTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  unsupportedText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  shareButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  fileInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  fileInfoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  fileInfoText: {
    color: '#ffffff',
    fontSize: 14,
  },
  editDescriptionInput: {
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 4,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
