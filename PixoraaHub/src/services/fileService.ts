import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { FileAttachment, AttachmentType } from '../types';

const STORAGE_KEY = 'file_attachments';
const FILES_DIRECTORY = `${FileSystem.documentDirectory}pixoraa_files/`;

class FileService {
  private attachments: FileAttachment[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure files directory exists
      const dirInfo = await FileSystem.getInfoAsync(FILES_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FILES_DIRECTORY, {
          intermediates: true,
        });
      }

      // Load attachments from storage
      await this.loadAttachments();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize file service:', error);
      this.attachments = [];
      this.initialized = true;
    }
  }

  private async loadAttachments(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        this.attachments = JSON.parse(data);
      } else {
        this.attachments = [];
        await this.saveAttachments();
      }
    } catch (error) {
      console.error('Failed to load attachments:', error);
      this.attachments = [];
    }
  }

  private async saveAttachments(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.attachments));
    } catch (error) {
      console.error('Failed to save attachments:', error);
    }
  }

  async uploadFile(
    uri: string,
    fileName: string,
    entityId: string,
    entityType: AttachmentType,
    description?: string
  ): Promise<FileAttachment> {
    await this.initialize();

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${entityType}_${entityId}_${timestamp}.${fileExtension}`;
      const localPath = `${FILES_DIRECTORY}${uniqueFileName}`;

      // Copy file to app's directory
      await FileSystem.copyAsync({
        from: uri,
        to: localPath,
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      const attachment: FileAttachment = {
        id: `file_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        fileName,
        originalName: fileName,
        filePath: localPath,
        fileSize: fileInfo.size || 0,
        mimeType: this.getMimeType(fileName),
        entityId,
        entityType,
        description,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current_user', // TODO: Get from user context
      };

      this.attachments.push(attachment);
      await this.saveAttachments();

      return attachment;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getAttachments(
    entityId: string,
    entityType?: AttachmentType
  ): Promise<FileAttachment[]> {
    await this.initialize();

    return this.attachments.filter(attachment => {
      if (attachment.entityId !== entityId) return false;
      if (entityType && attachment.entityType !== entityType) return false;
      return true;
    });
  }

  async getAllAttachments(): Promise<FileAttachment[]> {
    await this.initialize();
    return [...this.attachments];
  }

  async getAttachmentById(id: string): Promise<FileAttachment | null> {
    await this.initialize();
    return this.attachments.find(attachment => attachment.id === id) || null;
  }

  async deleteAttachment(id: string): Promise<boolean> {
    await this.initialize();

    try {
      const attachmentIndex = this.attachments.findIndex(
        attachment => attachment.id === id
      );
      if (attachmentIndex === -1) return false;

      const attachment = this.attachments[attachmentIndex];

      // Delete file from filesystem
      const fileInfo = await FileSystem.getInfoAsync(attachment.filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(attachment.filePath);
      }

      // Remove from attachments array
      this.attachments.splice(attachmentIndex, 1);
      await this.saveAttachments();

      return true;
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      return false;
    }
  }

  async updateAttachment(
    id: string,
    updates: Partial<Pick<FileAttachment, 'description' | 'fileName'>>
  ): Promise<FileAttachment | null> {
    await this.initialize();

    const attachmentIndex = this.attachments.findIndex(
      attachment => attachment.id === id
    );
    if (attachmentIndex === -1) return null;

    this.attachments[attachmentIndex] = {
      ...this.attachments[attachmentIndex],
      ...updates,
    };

    await this.saveAttachments();
    return this.attachments[attachmentIndex];
  }

  async getFileUri(id: string): Promise<string | null> {
    const attachment = await this.getAttachmentById(id);
    if (!attachment) return null;

    const fileInfo = await FileSystem.getInfoAsync(attachment.filePath);
    if (!fileInfo.exists) return null;

    return attachment.filePath;
  }

  async shareFile(id: string): Promise<string | null> {
    const attachment = await this.getAttachmentById(id);
    if (!attachment) return null;

    const fileInfo = await FileSystem.getInfoAsync(attachment.filePath);
    if (!fileInfo.exists) return null;

    // Create a shareable copy in cache directory
    const cacheDir = FileSystem.cacheDirectory;
    const shareablePath = `${cacheDir}${attachment.fileName}`;

    await FileSystem.copyAsync({
      from: attachment.filePath,
      to: shareablePath,
    });

    return shareablePath;
  }

  async getAttachmentStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<AttachmentType, number>;
  }> {
    await this.initialize();

    const stats = {
      totalFiles: this.attachments.length,
      totalSize: 0,
      filesByType: {
        client: 0,
        project: 0,
        task: 0,
      } as Record<AttachmentType, number>,
    };

    this.attachments.forEach(attachment => {
      stats.totalSize += attachment.fileSize;
      stats.filesByType[attachment.entityType] =
        (stats.filesByType[attachment.entityType] || 0) + 1;
    });

    return stats;
  }

  async cleanupOrphanedFiles(): Promise<number> {
    await this.initialize();

    try {
      const dirInfo = await FileSystem.readDirectoryAsync(FILES_DIRECTORY);
      const attachmentPaths = this.attachments.map(a =>
        a.filePath.replace(FILES_DIRECTORY, '')
      );
      let cleanedCount = 0;

      for (const fileName of dirInfo) {
        if (!attachmentPaths.includes(fileName)) {
          await FileSystem.deleteAsync(`${FILES_DIRECTORY}${fileName}`);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup orphaned files:', error);
      return 0;
    }
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',

      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Text
      txt: 'text/plain',
      csv: 'text/csv',
      rtf: 'application/rtf',

      // Archives
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',

      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/mp4',

      // Video
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image-outline';
    if (mimeType.startsWith('video/')) return 'videocam-outline';
    if (mimeType.startsWith('audio/')) return 'musical-notes-outline';
    if (mimeType === 'application/pdf') return 'document-text-outline';
    if (mimeType.includes('word')) return 'document-outline';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return 'grid-outline';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
      return 'easel-outline';
    if (mimeType.includes('zip') || mimeType.includes('archive'))
      return 'archive-outline';

    return 'document-outline';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  isDocumentFile(mimeType: string): boolean {
    return (
      mimeType.includes('pdf') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('text')
    );
  }
}

export const fileService = new FileService();
