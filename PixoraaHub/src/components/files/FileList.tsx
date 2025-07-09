import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilePreview } from './FilePreview';
import { FilePicker } from './FilePicker';
import { fileService } from '../../services/fileService';
import { FileAttachment, AttachmentType, FilePickerOptions } from '../../types';

interface FileListProps {
  entityId: string;
  entityType: AttachmentType;
  title?: string;
  showPicker?: boolean;
  pickerOptions?: FilePickerOptions;
  compactView?: boolean;
  maxHeight?: number;
  onFilesChange?: (files: FileAttachment[]) => void;
  style?: any;
}

export const FileList: React.FC<FileListProps> = ({
  entityId,
  entityType,
  title = 'Attachments',
  showPicker = true,
  pickerOptions,
  compactView = false,
  maxHeight,
  onFilesChange,
  style,
}) => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [entityId, entityType]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const files = await fileService.getAttachments(entityId, entityType);
      setAttachments(files);
      onFilesChange?.(files);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttachments();
    setRefreshing(false);
  };

  const handleFileUploaded = (attachment: FileAttachment) => {
    setAttachments(prev => [...prev, attachment]);
    onFilesChange?.(
      attachments.map(file => (file.id === attachment.id ? attachment : file))
    );
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const success = await fileService.deleteAttachment(fileId);
      if (success) {
        const updatedAttachments = attachments.filter(
          file => file.id !== fileId
        );
        setAttachments(updatedAttachments);
        onFilesChange?.(updatedAttachments);
      } else {
        Alert.alert('Error', 'Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete file');
    }
  };

  const handleFileEdit = async (attachment: FileAttachment) => {
    Alert.prompt(
      'Edit File',
      'Enter a description for this file:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async description => {
            if (description !== undefined) {
              const updated = await fileService.updateAttachment(
                attachment.id,
                { description }
              );
              if (updated) {
                setAttachments(prev =>
                  prev.map(file => (file.id === attachment.id ? updated : file))
                );
                onFilesChange?.(
                  attachments.map(file =>
                    file.id === attachment.id ? updated : file
                  )
                );
              }
            }
          },
        },
      ],
      'plain-text',
      attachment.description || ''
    );
  };

  const handleUploadError = (error: string) => {
    Alert.alert('Upload Error', error);
  };

  const displayedFiles = showAllFiles ? attachments : attachments.slice(0, 5);
  const hasMoreFiles = attachments.length > 5 && !showAllFiles;

  const getTotalSize = () => {
    return attachments.reduce((total, file) => total + file.fileSize, 0);
  };

  const getFileTypeStats = () => {
    const stats = {
      images: 0,
      documents: 0,
      videos: 0,
      others: 0,
    };

    attachments.forEach(file => {
      if (fileService.isImageFile(file.mimeType)) {
        stats.images++;
      } else if (fileService.isDocumentFile(file.mimeType)) {
        stats.documents++;
      } else if (fileService.isVideoFile(file.mimeType)) {
        stats.videos++;
      } else {
        stats.others++;
      }
    });

    return stats;
  };

  const fileStats = getFileTypeStats();

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading attachments...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {attachments.length > 0 && (
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {attachments.length} file{attachments.length !== 1 ? 's' : ''} •{' '}
              {fileService.formatFileSize(getTotalSize())}
            </Text>
          </View>
        )}
      </View>

      {/* File Stats */}
      {attachments.length > 0 && !compactView && (
        <View style={styles.fileStats}>
          {fileStats.images > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name='image-outline' size={12} color='#4CAF50' />
              <Text style={styles.statText}>{fileStats.images}</Text>
            </View>
          )}
          {fileStats.documents > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name='document-outline' size={12} color='#2196F3' />
              <Text style={styles.statText}>{fileStats.documents}</Text>
            </View>
          )}
          {fileStats.videos > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name='videocam-outline' size={12} color='#E91E63' />
              <Text style={styles.statText}>{fileStats.videos}</Text>
            </View>
          )}
          {fileStats.others > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name='folder-outline' size={12} color='#666' />
              <Text style={styles.statText}>{fileStats.others}</Text>
            </View>
          )}
        </View>
      )}

      {/* File Picker */}
      {showPicker && (
        <FilePicker
          entityId={entityId}
          entityType={entityType}
          onFileUploaded={handleFileUploaded}
          onError={handleUploadError}
          options={pickerOptions}
          style={styles.picker}
        />
      )}

      {/* Files List */}
      {attachments.length > 0 ? (
        <ScrollView
          style={[styles.filesList, maxHeight && { maxHeight }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {compactView ? (
            // Compact view for embedded lists
            <>
              {displayedFiles.map(attachment => (
                <FilePreview
                  key={attachment.id}
                  attachment={attachment}
                  onDelete={handleFileDelete}
                  onEdit={handleFileEdit}
                  compact={true}
                  showActions={false}
                />
              ))}
              {hasMoreFiles && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllFiles(true)}
                >
                  <Text style={styles.showMoreText}>
                    Show {attachments.length - 5} more files
                  </Text>
                  <Ionicons
                    name='chevron-down-outline'
                    size={16}
                    color='#2196F3'
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Full view for dedicated file management
            <>
              {displayedFiles.map(attachment => (
                <FilePreview
                  key={attachment.id}
                  attachment={attachment}
                  onDelete={handleFileDelete}
                  onEdit={handleFileEdit}
                  showActions={true}
                />
              ))}
              {hasMoreFiles && (
                <TouchableOpacity
                  style={styles.showMoreCard}
                  onPress={() => setShowAllFiles(true)}
                >
                  <Ionicons name='add-outline' size={24} color='#2196F3' />
                  <Text style={styles.showMoreCardText}>
                    Show {attachments.length - 5} more files
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      ) : (
        !showPicker && (
          <View style={styles.emptyState}>
            <Ionicons name='folder-open-outline' size={48} color='#ccc' />
            <Text style={styles.emptyText}>No files attached</Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stats: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  fileStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  picker: {
    marginBottom: 15,
  },
  filesList: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginTop: 10,
  },
  showMoreText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginRight: 5,
  },
  showMoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginTop: 10,
  },
  showMoreCardText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginTop: 5,
  },
});
