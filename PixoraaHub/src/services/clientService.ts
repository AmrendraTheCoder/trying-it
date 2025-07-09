import { Client } from '../types';
import { StorageService } from './storage';

const CLIENTS_KEY = 'pixoraahub_clients';

// Default clients to seed the app when first installed
const defaultClients: Client[] = [
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

export class ClientService {
  // Initialize with default clients if none exist
  static async initializeClients(): Promise<void> {
    try {
      const existingClients =
        await StorageService.getItem<Client[]>(CLIENTS_KEY);
      if (!existingClients || existingClients.length === 0) {
        await StorageService.setItem(CLIENTS_KEY, defaultClients);
      }
    } catch (error) {
      console.error('Error initializing clients:', error);
      throw error;
    }
  }

  // Get all clients
  static async getAllClients(): Promise<Client[]> {
    try {
      const clients = await StorageService.getItem<Client[]>(CLIENTS_KEY);
      return clients || [];
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  }

  // Get client by ID
  static async getClientById(id: string): Promise<Client | null> {
    try {
      const clients = await this.getAllClients();
      return clients.find(client => client.id === id) || null;
    } catch (error) {
      console.error('Error getting client by ID:', error);
      return null;
    }
  }

  // Add new client
  static async addClient(
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Client> {
    try {
      const clients = await this.getAllClients();
      const newClient: Client = {
        ...clientData,
        id: Date.now().toString(),
        projectCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedClients = [newClient, ...clients];
      await StorageService.setItem(CLIENTS_KEY, updatedClients);
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  }

  // Update existing client
  static async updateClient(
    id: string,
    clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Client | null> {
    try {
      const clients = await this.getAllClients();
      const clientIndex = clients.findIndex(client => client.id === id);

      if (clientIndex === -1) {
        throw new Error('Client not found');
      }

      const updatedClient: Client = {
        ...clients[clientIndex],
        ...clientData,
        updatedAt: new Date().toISOString(),
      };

      clients[clientIndex] = updatedClient;
      await StorageService.setItem(CLIENTS_KEY, clients);
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Delete client
  static async deleteClient(id: string): Promise<boolean> {
    try {
      const clients = await this.getAllClients();
      const filteredClients = clients.filter(client => client.id !== id);

      if (filteredClients.length === clients.length) {
        return false; // Client not found
      }

      await StorageService.setItem(CLIENTS_KEY, filteredClients);
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Update client project count
  static async updateClientProjectCount(
    clientId: string,
    projectCount: number
  ): Promise<void> {
    try {
      await this.updateClient(clientId, { projectCount });
    } catch (error) {
      console.error('Error updating client project count:', error);
      throw error;
    }
  }

  // Search clients
  static async searchClients(query: string): Promise<Client[]> {
    try {
      const clients = await this.getAllClients();
      if (!query.trim()) return clients;

      const lowercaseQuery = query.toLowerCase();
      return clients.filter(
        client =>
          client.name.toLowerCase().includes(lowercaseQuery) ||
          client.email.toLowerCase().includes(lowercaseQuery) ||
          (client.company &&
            client.company.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  // Get clients by status
  static async getClientsByStatus(status: Client['status']): Promise<Client[]> {
    try {
      const clients = await this.getAllClients();
      return clients.filter(client => client.status === status);
    } catch (error) {
      console.error('Error getting clients by status:', error);
      return [];
    }
  }
}
