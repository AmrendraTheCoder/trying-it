import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Client } from '../../types';
import { ClientCard } from './ClientCard';

interface ClientListProps {
  clients: Client[];
  onClientPress: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
  onAddClient?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onClientPress,
  onEditClient,
  onDeleteClient,
  onAddClient,
  loading: _loading,
  refreshing = false,
  onRefresh,
}) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<Client['status'] | 'all'>(
    'all'
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        client =>
          client.name.toLowerCase().includes(search) ||
          client.email.toLowerCase().includes(search) ||
          (client.company && client.company.toLowerCase().includes(search)) ||
          (client.phone && client.phone.toLowerCase().includes(search))
      );
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, searchText, statusFilter]);

  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteClient?.(client),
        },
      ]
    );
  };

  const renderClient = ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      onPress={onClientPress}
      onEdit={onEditClient}
      onDelete={handleDeleteClient}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {searchText || statusFilter !== 'all'
          ? 'No clients found'
          : 'No clients yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText || statusFilter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Add your first client to get started'}
      </Text>
      {onAddClient && !searchText && statusFilter === 'all' && (
        <TouchableOpacity style={styles.addButton} onPress={onAddClient}>
          <Text style={styles.addButtonText}>Add Client</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getStatusCounts = () => {
    const counts = {
      all: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
      pending: clients.filter(c => c.status === 'pending').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search clients...'
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize='none'
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
          {statusFilter !== 'all' && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Results Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filteredClients.length} of {clients.length} clients
        </Text>
        {(searchText || statusFilter !== 'all') && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              setStatusFilter('all');
            }}
          >
            <Text style={styles.clearFilters}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Client List */}
      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredClients.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType='fade'
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>

            {(['all', 'active', 'inactive', 'pending'] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  statusFilter === status && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setStatusFilter(status);
                  setShowFilters(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    statusFilter === status && styles.filterOptionTextSelected,
                  ]}
                >
                  {status === 'all'
                    ? 'All'
                    : status.charAt(0).toUpperCase() + status.slice(1)}{' '}
                  ({statusCounts[status]})
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filterButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  clearFilters: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#2196F3',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});
