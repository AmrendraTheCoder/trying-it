import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientList, ClientForm } from '../../components';
import { Client } from '../../types';
import { ClientService } from '../../services';
import {
  ProfessionalHeader,
  EnhancedThemedText,
  StatCard,
} from '../../../components/ui';
import { Colors, Spacing } from '../../../constants/Colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

export const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  // Load initial data when component mounts
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      await ClientService.initializeClients(); // Ensure default clients exist
      const clientData = await ClientService.getAllClients();
      setClients(clientData);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientPress = (client: Client) => {
    Alert.alert(
      client.name,
      `Email: ${client.email}\nStatus: ${client.status}\nProjects: ${client.projectCount || 0}`,
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

  const handleViewClientDetails = (client: Client) => {
    Alert.alert(
      `${client.name} - Details`,
      `Email: ${client.email}\nCompany: ${client.company || 'N/A'}\nPhone: ${client.phone || 'N/A'}\nStatus: ${client.status}\nProjects: ${client.projectCount || 0}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditClient(client) },
        {
          text: 'View Files',
          onPress: () => {
            // TODO: Navigate to file management screen
            Alert.alert(
              'File Management',
              'File management feature coming soon!'
            );
          },
        },
      ]
    );
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
          onPress: async () => {
            try {
              setLoading(true);
              const success = await ClientService.deleteClient(client.id);
              if (success) {
                setClients(prev => prev.filter(c => c.id !== client.id));
                Alert.alert('Success', 'Client deleted successfully.');
              } else {
                Alert.alert('Error', 'Client not found.');
              }
            } catch (error) {
              console.error('Error deleting client:', error);
              Alert.alert(
                'Error',
                'Failed to delete client. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setLoading(true);

      if (editingClient) {
        // Update existing client
        const updatedClient = await ClientService.updateClient(
          editingClient.id,
          clientData
        );
        if (updatedClient) {
          setClients(prev =>
            prev.map(c => (c.id === editingClient.id ? updatedClient : c))
          );
          Alert.alert('Success', 'Client updated successfully.');
        }
      } else {
        // Add new client
        const newClient = await ClientService.addClient(clientData);
        setClients(prev => [newClient, ...prev]);
        Alert.alert('Success', 'Client added successfully.');
      }

      setShowForm(false);
      setEditingClient(undefined);
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Error', 'Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const clientData = await ClientService.getAllClients();
      setClients(clientData);
    } catch (error) {
      console.error('Error refreshing clients:', error);
      Alert.alert('Error', 'Failed to refresh clients. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate client statistics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const inactiveClients = clients.filter(c => c.status === 'inactive').length;
  const totalProjects = clients.reduce(
    (sum, c) => sum + (c.projectCount || 0),
    0
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle='dark-content' backgroundColor={backgroundColor} />

      <ProfessionalHeader
        title='Clients'
        subtitle={`${clients.length} clients in your portfolio`}
        rightButton={{
          title: '+ Add Client',
          onPress: handleAddClient,
          variant: 'primary',
        }}
      />

      <View style={styles.container}>
        {/* Client Statistics */}
        {clients.length > 0 && (
          <View style={styles.statsSection}>
            <EnhancedThemedText type='heading4' style={styles.sectionTitle}>
              Overview
            </EnhancedThemedText>
            <View style={styles.statsGrid}>
              <StatCard
                title='Active Clients'
                value={activeClients}
                subtitle={`${clients.length} total`}
                color={Colors.light.success}
              />
              <StatCard
                title='Total Projects'
                value={totalProjects}
                subtitle='Across all clients'
                color={Colors.light.primary}
              />
            </View>
          </View>
        )}

        {/* Client List Header */}
        <View style={styles.listHeader}>
          <EnhancedThemedText type='heading4'>All Clients</EnhancedThemedText>
          {clients.length > 0 && (
            <EnhancedThemedText type='caption' color='secondary'>
              {activeClients} active • {inactiveClients} inactive
            </EnhancedThemedText>
          )}
        </View>

        <View style={styles.listContainer}>
          <ClientList
            clients={clients}
            onClientPress={handleClientPress}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onViewDetails={handleViewClientDetails}
            onAddClient={handleAddClient}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </View>
      </View>

      {/* Client Form Modal */}
      <Modal
        visible={showForm}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <ClientForm
          client={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  listContainer: {
    flex: 1,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
