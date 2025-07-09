import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientList, ClientForm } from '../../components';
import { Client } from '../../types';

// Mock data for demonstration
const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    address: '123 Main St, New York, NY 10001',
    status: 'active',
    projectCount: 3,
    lastContactDate: '2024-01-10',
    notes: 'Great client, always pays on time.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@creativestudio.com',
    phone: '+1 (555) 987-6543',
    company: 'Creative Studio',
    status: 'active',
    projectCount: 2,
    lastContactDate: '2024-01-08',
    notes: 'Needs regular updates on project progress.',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-08',
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@startup.io',
    company: 'Innovation Startup',
    status: 'pending',
    projectCount: 0,
    notes: 'Potential new client, waiting for contract.',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: '4',
    name: 'Lisa Davis',
    email: 'lisa@freelancer.com',
    status: 'inactive',
    projectCount: 1,
    lastContactDate: '2023-12-15',
    notes: 'Project completed, maintaining relationship.',
    createdAt: '2023-11-01',
    updatedAt: '2023-12-15',
  },
];

export const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate loading initial data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClientPress = (client: Client) => {
    Alert.alert(
      client.name,
      `Email: ${client.email}\nStatus: ${client.status}\nProjects: ${client.projectCount}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditClient(client) },
      ]
    );
  };

  const handleAddClient = () => {
    setEditingClient(undefined);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setClients(prev => prev.filter(c => c.id !== client.id));
          },
        },
      ]
    );
  };

  const handleFormSubmit = (
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (editingClient) {
        // Update existing client
        setClients(prev =>
          prev.map(c =>
            c.id === editingClient.id
              ? {
                  ...c,
                  ...clientData,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      } else {
        // Add new client
        const newClient: Client = {
          ...clientData,
          id: Date.now().toString(),
          projectCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setClients(prev => [newClient, ...prev]);
      }

      setLoading(false);
      setShowForm(false);
      setEditingClient(undefined);
    }, 1500);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Text style={styles.addButtonText}>+ Add Client</Text>
        </TouchableOpacity>
      </View>

      {/* Client List */}
      <ClientList
        clients={clients}
        onClientPress={handleClientPress}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
        onAddClient={handleAddClient}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Client Form Modal */}
      <Modal
        visible={showForm}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={handleFormCancel}
      >
        <View style={styles.modalContainer}>
          <ClientForm
            client={editingClient}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
