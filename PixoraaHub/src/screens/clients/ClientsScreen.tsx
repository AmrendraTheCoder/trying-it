import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientList, ClientForm } from '../../components';
import { Client } from '../../types';
import { ClientService } from '../../services';
import { EnhancedThemedText } from '../../../components/ui';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../constants/Colors';
import { useThemeColor } from '../../../hooks/useThemeColor';

const { width } = Dimensions.get('window');

export const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(
    undefined
  );
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      await ClientService.initializeClients();
      const clientData = await ClientService.getAllClients();
      setClients(clientData);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
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
      `Are you sure you want to delete "${client.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClientService.deleteClient(client.id);
              await loadClients();
            } catch (error) {
              console.error('Error deleting client:', error);
              Alert.alert(
                'Error',
                'Failed to delete client. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleClientPress = (client: Client) => {
    // Handle client selection/navigation
    console.log('Selected client:', client);
  };

  const handleViewClientDetails = (client: Client) => {
    // Handle viewing client details
    console.log('View client details:', client);
  };

  const handleFormSubmit = async (clientData: any) => {
    try {
      if (editingClient) {
        await ClientService.updateClient(editingClient.id, clientData);
      } else {
        await ClientService.createClient(clientData);
      }
      setShowForm(false);
      setEditingClient(undefined);
      await loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Error', 'Failed to save client. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  // Calculate stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const inactiveClients = clients.length - activeClients;

  // Metric Card Component
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, subtitle, color = Colors.light.primary }) => (
    <View style={[styles.metricCard]}>
      <View style={styles.metricContent}>
        <EnhancedThemedText
          type='caption'
          color='secondary'
          style={styles.metricTitle}
        >
          {title}
        </EnhancedThemedText>
        <EnhancedThemedText
          type='heading3'
          style={[styles.metricValue, { color }]}
        >
          {value}
        </EnhancedThemedText>
        {subtitle && (
          <EnhancedThemedText
            type='small'
            color='muted'
            style={styles.metricSubtitle}
          >
            {subtitle}
          </EnhancedThemedText>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle='dark-content' backgroundColor={backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <EnhancedThemedText type='heading1' style={styles.title}>
            Clients
          </EnhancedThemedText>
          <EnhancedThemedText
            type='body'
            color='secondary'
            style={styles.subtitle}
          >
            Manage your client portfolio
          </EnhancedThemedText>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <EnhancedThemedText type='bodySemiBold' style={styles.addButtonText}>
            + Add Client
          </EnhancedThemedText>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      {clients.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <MetricCard
              title='Active Clients'
              value={activeClients}
              subtitle={`${clients.length} total`}
              color={Colors.light.success}
            />
            <MetricCard
              title='Inactive'
              value={inactiveClients}
              subtitle='Need attention'
              color={Colors.light.warning}
            />
          </View>
        </View>
      )}

      {/* Client List */}
      <View style={styles.content}>
        <ClientList
          clients={clients}
          onClientPress={handleClientPress}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
          onViewDetails={handleViewClientDetails}
          onAddClient={handleAddClient}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          HeaderComponent={() =>
            clients.length > 0 ? (
              <View style={styles.listHeader}>
                <EnhancedThemedText type='heading4'>
                  All Clients ({clients.length})
                </EnhancedThemedText>
                <EnhancedThemedText type='caption' color='secondary'>
                  {activeClients} active • {inactiveClients} inactive
                </EnhancedThemedText>
              </View>
            ) : null
          }
        />
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
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  addButtonText: {
    color: Colors.light.textInverse,
  },
  statsSection: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    flex: 1,
    ...Shadows.sm,
  },
  metricContent: {
    padding: Spacing.cardPadding,
    minHeight: 70,
    justifyContent: 'center',
  },
  metricTitle: {
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    marginBottom: Spacing.xs / 2,
  },
  metricSubtitle: {
    lineHeight: 14,
  },
  content: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
    gap: Spacing.xs / 2,
  },
});
