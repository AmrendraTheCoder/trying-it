import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Client, FileAttachment } from '../../types';
import { ClientService, FileService } from '../../services';
import { FilePicker, FileList, FilePreview } from '../../components';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  ClientDetail: { clientId: string };
};

type ClientDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ClientDetail'
>;
type ClientDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ClientDetailScreenProps {}

export const ClientDetailScreen: React.FC<ClientDetailScreenProps> = () => {
  const route = useRoute<ClientDetailScreenRouteProp>();
  const navigation = useNavigation<ClientDetailScreenNavigationProp>();
  const { clientId } = route.params;

  const [client, setClient] = useState<Client | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<FileAttachment | null>(null);

  useEffect(() => {
    loadClientDetails();
    loadAttachments();
  }, [clientId]);

  const loadClientDetails = async () => {
    try {
      const clientData = await ClientService.getClientById(clientId);
      setClient(clientData);
    } catch (error) {
      console.error('Error loading client details:', error);
      Alert.alert('Error', 'Failed to load client details.');
      navigation.goBack();
    }
  };

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const attachmentData = await FileService.getAttachments(
        clientId,
        'client'
      );
      setAttachments(attachmentData);
    } catch (error) {
      console.error('Error loading attachments:', error);
      Alert.alert('Error', 'Failed to load attachments.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileUri: string, fileName: string) => {
    try {
      const attachment = await FileService.uploadFile(
        fileUri,
        fileName,
        clientId,
        'client',
        `Attachment for ${client?.name}`
      );

      setAttachments(prev => [attachment, ...prev]);
      setShowFilePicker(false);
      Alert.alert('Success', 'File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file.');
    }
  };

  const handleFilePreview = (attachment: FileAttachment) => {
    setSelectedAttachment(attachment);
    setShowFilePreview(true);
  };

  const handleFileDelete = async (attachmentId: string) => {
    Alert.alert('Delete File', 'Are you sure you want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await FileService.deleteAttachment(attachmentId);
            if (success) {
              setAttachments(prev =>
                prev.filter(att => att.id !== attachmentId)
              );
              Alert.alert('Success', 'File deleted successfully.');
            } else {
              Alert.alert('Error', 'Failed to delete file.');
            }
          } catch (error) {
            console.error('Error deleting file:', error);
            Alert.alert('Error', 'Failed to delete file.');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#9E9E9E';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>Loading client details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back' size={24} color='#333' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Details</Text>
        <TouchableOpacity onPress={() => setShowFilePicker(true)}>
          <Ionicons name='attach' size={24} color='#007AFF' />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Client Information */}
        <View style={styles.clientInfoSection}>
          <View style={styles.clientHeader}>
            <View>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientEmail}>{client.email}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(client.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {client.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {client.company && (
            <View style={styles.infoRow}>
              <Ionicons name='business-outline' size={20} color='#666' />
              <Text style={styles.infoText}>{client.company}</Text>
            </View>
          )}

          {client.phone && (
            <View style={styles.infoRow}>
              <Ionicons name='call-outline' size={20} color='#666' />
              <Text style={styles.infoText}>{client.phone}</Text>
            </View>
          )}

          {client.address && (
            <View style={styles.infoRow}>
              <Ionicons name='location-outline' size={20} color='#666' />
              <Text style={styles.infoText}>{client.address}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name='folder-outline' size={20} color='#666' />
            <Text style={styles.infoText}>
              {client.projectCount || 0} project
              {(client.projectCount || 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name='time-outline' size={20} color='#666' />
            <Text style={styles.infoText}>
              Last contact:{' '}
              {client.lastContactDate
                ? new Date(client.lastContactDate).toLocaleDateString()
                : 'Never'}
            </Text>
          </View>

          {client.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{client.notes}</Text>
            </View>
          )}
        </View>

        {/* File Attachments Section */}
        <View style={styles.attachmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>File Attachments</Text>
            <Text style={styles.attachmentCount}>
              {attachments.length} file{attachments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color='#007AFF' />
              <Text style={styles.loadingText}>Loading attachments...</Text>
            </View>
          ) : (
            <FileList
              files={attachments}
              onFilePress={handleFilePreview}
              onFileDelete={handleFileDelete}
              showEntityInfo={false}
              emptyMessage='No files attached to this client yet.'
            />
          )}
        </View>
      </ScrollView>

      {/* File Picker Modal */}
      <Modal
        visible={showFilePicker}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <FilePicker
          onFilesSelected={files => {
            files.forEach(file => handleFileUpload(file.uri, file.name));
          }}
          onCancel={() => setShowFilePicker(false)}
          options={{
            allowMultiple: true,
            maxFileSize: 50 * 1024 * 1024, // 50MB
          }}
        />
      </Modal>

      {/* File Preview Modal */}
      <Modal
        visible={showFilePreview}
        animationType='slide'
        presentationStyle='fullScreen'
      >
        {selectedAttachment && (
          <FilePreview
            attachment={selectedAttachment}
            onClose={() => {
              setShowFilePreview(false);
              setSelectedAttachment(null);
            }}
            onDelete={() => {
              setShowFilePreview(false);
              setSelectedAttachment(null);
              if (selectedAttachment) {
                handleFileDelete(selectedAttachment.id);
              }
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  clientInfoSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  clientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#444',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  attachmentsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  attachmentCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
