import { Project } from '../types';
import { StorageService } from './storage';
import { ClientService } from './clientService';

const PROJECTS_KEY = 'pixoraahub_projects';

// Default projects to seed the app
const defaultProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX and improved performance.',
    clientId: '1',
    clientName: 'Tech Solutions Inc.',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-15',
    deadline: '2024-04-15',
    budget: 15000,
    totalSpent: 8500,
    hourlyRate: 75,
    estimatedHours: 200,
    taskCount: 12,
    completedTasks: 7,
    notes: 'Client is very responsive and provides timely feedback.',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Native iOS and Android app for creative portfolio showcase.',
    clientId: '2',
    clientName: 'Creative Studio',
    status: 'active',
    priority: 'medium',
    startDate: '2024-01-20',
    endDate: '2024-03-20',
    deadline: '2024-03-25',
    budget: 12000,
    totalSpent: 3000,
    hourlyRate: 80,
    estimatedHours: 150,
    taskCount: 8,
    completedTasks: 2,
    notes: 'First mobile project with this client.',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22',
  },
  {
    id: '3',
    title: 'Website Maintenance',
    description: 'Ongoing maintenance and updates for startup website.',
    clientId: '3',
    clientName: 'Innovation Startup',
    status: 'on_hold',
    priority: 'low',
    startDate: '2024-01-01',
    budget: 2000,
    totalSpent: 1200,
    hourlyRate: 60,
    estimatedHours: 40,
    taskCount: 5,
    completedTasks: 3,
    notes: 'On hold due to client budget constraints.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-25',
  },
  {
    id: '4',
    title: 'API Integration Project',
    description: 'Integration of third-party APIs for data synchronization.',
    clientId: '1',
    clientName: 'Tech Solutions Inc.',
    status: 'completed',
    priority: 'medium',
    startDate: '2023-12-01',
    endDate: '2024-01-10',
    budget: 5000,
    totalSpent: 4800,
    hourlyRate: 75,
    estimatedHours: 67,
    taskCount: 6,
    completedTasks: 6,
    notes: 'Successfully completed ahead of schedule.',
    createdAt: '2023-11-25',
    updatedAt: '2024-01-10',
  },
];

export class ProjectService {
  // Initialize with default projects if none exist
  static async initializeProjects(): Promise<void> {
    try {
      const existingProjects = await StorageService.getItem<Project[]>(PROJECTS_KEY);
      if (!existingProjects || existingProjects.length === 0) {
        await StorageService.setItem(PROJECTS_KEY, defaultProjects);
      }
    } catch (error) {
      console.error('Error initializing projects:', error);
      throw error;
    }
  }

  // Get all projects
  static async getAllProjects(): Promise<Project[]> {
    try {
      const projects = await StorageService.getItem<Project[]>(PROJECTS_KEY);
      return projects || [];
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const projects = await this.getAllProjects();
      return projects.find(project => project.id === id) || null;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      return null;
    }
  }

  // Get projects by client ID
  static async getProjectsByClientId(clientId: string): Promise<Project[]> {
    try {
      const projects = await this.getAllProjects();
      return projects.filter(project => project.clientId === clientId);
    } catch (error) {
      console.error('Error getting projects by client ID:', error);
      return [];
    }
  }

  // Add new project
  static async addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const projects = await this.getAllProjects();
      
      // Get client name if not provided
      let clientName = projectData.clientName;
      if (!clientName) {
        const client = await ClientService.getClientById(projectData.clientId);
        clientName = client?.name || 'Unknown Client';
      }

      const newProject: Project = {
        ...projectData,
        clientName,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedProjects = [newProject, ...projects];
      await StorageService.setItem(PROJECTS_KEY, updatedProjects);
      
      // Update client project count
      await this.updateClientProjectCounts(projectData.clientId);
      
      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  // Update existing project
  static async updateProject(id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null> {
    try {
      const projects = await this.getAllProjects();
      const projectIndex = projects.findIndex(project => project.id === id);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const oldProject = projects[projectIndex];
      const updatedProject: Project = {
        ...oldProject,
        ...projectData,
        updatedAt: new Date().toISOString(),
      };

      projects[projectIndex] = updatedProject;
      await StorageService.setItem(PROJECTS_KEY, projects);
      
      // Update client project counts if client changed
      if (projectData.clientId && projectData.clientId !== oldProject.clientId) {
        await this.updateClientProjectCounts(oldProject.clientId);
        await this.updateClientProjectCounts(projectData.clientId);
      }
      
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(id: string): Promise<boolean> {
    try {
      const projects = await this.getAllProjects();
      const projectToDelete = projects.find(p => p.id === id);
      const filteredProjects = projects.filter(project => project.id !== id);
      
      if (filteredProjects.length === projects.length) {
        return false; // Project not found
      }

      await StorageService.setItem(PROJECTS_KEY, filteredProjects);
      
      // Update client project count
      if (projectToDelete) {
        await this.updateClientProjectCounts(projectToDelete.clientId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Update client project counts
  private static async updateClientProjectCounts(clientId: string): Promise<void> {
    try {
      const clientProjects = await this.getProjectsByClientId(clientId);
      await ClientService.updateClientProjectCount(clientId, clientProjects.length);
    } catch (error) {
      console.error('Error updating client project counts:', error);
    }
  }

  // Get projects by status
  static async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    try {
      const projects = await this.getAllProjects();
      return projects.filter(project => project.status === status);
    } catch (error) {
      console.error('Error getting projects by status:', error);
      return [];
    }
  }

  // Search projects
  static async searchProjects(query: string): Promise<Project[]> {
    try {
      const projects = await this.getAllProjects();
      if (!query.trim()) return projects;

      const lowercaseQuery = query.toLowerCase();
      return projects.filter(project => 
        project.title.toLowerCase().includes(lowercaseQuery) ||
        (project.description && project.description.toLowerCase().includes(lowercaseQuery)) ||
        (project.clientName && project.clientName.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  // Get project statistics
  static async getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    cancelled: number;
    totalBudget: number;
    totalSpent: number;
  }> {
    try {
      const projects = await this.getAllProjects();
      
      return {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalSpent: projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0),
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0,
        totalBudget: 0,
        totalSpent: 0,
      };
    }
  }
} 