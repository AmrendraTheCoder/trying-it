import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Client, FileAttachment } from '../../types';
import { FileService } from '../../services';
import { Ionicons } from '@expo/vector-icons';

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onViewDetails?: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onPress,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [attachmentCount, setAttachmentCount] = useState(0);

  useEffect(() => {
    loadAttachmentCount();
  }, [client.id]);

  const loadAttachmentCount = async () => {
    try {
      const attachments = await FileService.getAttachments(client.id, 'client');
      setAttachmentCount(attachments.length);
    } catch (error) {
      console.error('Error loading attachment count:', error);
      setAttachmentCount(0);
    }
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

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(client)}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.email}>{client.email}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(client.status) },
          ]}
        >
          <Text style={styles.statusText}>{client.status.toUpperCase()}</Text>
        </View>
      </View>

      {client.company && <Text style={styles.company}>{client.company}</Text>}

      {client.phone && <Text style={styles.phone}>{client.phone}</Text>}

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name='folder-outline' size={14} color='#666' />
            <Text style={styles.statText}>
              {client.projectCount || 0} project
              {(client.projectCount || 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name='attach-outline' size={14} color='#666' />
            <Text style={styles.statText}>
              {attachmentCount} file{attachmentCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.lastContact}>
          Last contact:{' '}
          {client.lastContactDate
            ? new Date(client.lastContactDate).toLocaleDateString()
            : 'Never'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onViewDetails && (
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onViewDetails(client)}
          >
            <Ionicons name='eye-outline' size={14} color='#fff' />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        )}

        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(client)}
          >
            <Ionicons name='pencil-outline' size={14} color='#fff' />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(client)}
          >
            <Ionicons name='trash-outline' size={14} color='#fff' />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  company: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  lastContact: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: '#007AFF',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
