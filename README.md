# PixoraaHub - Client & Project Management

A modern React Native application for managing clients and projects, built with TypeScript and Expo.

## 🚀 Features

### Client Management

- **Client List**: View all clients with search and filtering capabilities
- **Client Cards**: Clean, informative cards showing client details and status
- **Client Form**: Comprehensive form for adding/editing client information
- **Status Management**: Track client status (active, inactive, pending)
- **Contact Tracking**: Monitor last contact dates and project counts

### Project Management

- **Project List**: Advanced filtering and sorting by status, priority, date, and budget
- **Project Cards**: Detailed project cards with progress tracking and budget monitoring
- **Project Form**: Full project creation/editing with client selection
- **Budget Tracking**: Real-time budget vs. spent tracking with visual indicators
- **Task Progress**: Visual progress bars for task completion
- **Status Management**: Track project lifecycle (active, completed, on hold, cancelled)
- **Priority System**: Manage project priorities (high, medium, low)

## 📁 Project Structure

```
src/
├── components/
│   ├── clients/
│   │   ├── ClientCard.tsx       # Individual client display component
│   │   ├── ClientList.tsx       # Client listing with search/filter
│   │   ├── ClientForm.tsx       # Add/edit client form
│   │   └── index.ts            # Client components exports
│   ├── projects/
│   │   ├── ProjectCard.tsx      # Individual project display component
│   │   ├── ProjectList.tsx      # Project listing with advanced filtering
│   │   ├── ProjectForm.tsx      # Add/edit project form with client selection
│   │   └── index.ts            # Project components exports
│   └── index.ts                # Main components export
├── screens/
│   ├── ClientsScreen.tsx        # Complete clients management screen
│   ├── ProjectsScreen.tsx       # Complete projects management screen
│   └── index.ts                # Screens exports
├── types/
│   └── index.ts                # TypeScript type definitions
├── constants/
│   └── index.ts                # App constants and configurations
└── utils/
    └── index.ts                # Utility functions
```

## 🛠 Component Architecture

### Client Components

#### ClientCard

- Displays individual client information
- Shows status badges with color coding
- Includes project count and last contact date
- Optional edit/delete action buttons

#### ClientList

- Manages collection of clients
- Search functionality across name, email, company, phone
- Status filtering (all, active, inactive, pending)
- Pull-to-refresh support
- Empty state handling

#### ClientForm

- Comprehensive form validation
- Real-time error feedback
- All client fields with proper input types
- Status selector with visual feedback

### Project Components

#### ProjectCard

- Rich project information display
- Budget progress tracking with visual indicators
- Task completion progress
- Status and priority badges with color coding
- Overdue and over-budget warnings
- Optional client name display

#### ProjectList

- Advanced filtering (status, priority, client)
- Multiple sorting options (date, priority, status, name, budget)
- Search across title, description, and client name
- Real-time filter counters
- Empty state with contextual messaging

#### ProjectForm

- Complete project creation/editing
- Client selection with modal picker
- Date validation and logic checking
- Numeric input validation for budget/rates
- Status and priority selectors

## 📱 Screens

### ClientsScreen

- Full client management interface
- Modal-based form presentation
- Real-time CRUD operations
- Loading states and error handling
- Pull-to-refresh functionality

### ProjectsScreen

- Complete project management dashboard
- Budget summary with totals and remaining amounts
- Project statistics in header
- Advanced filtering and sorting
- Modal-based project form

## 🎨 Design Features

### Visual Design

- Modern, clean UI with consistent spacing
- Material Design inspired color scheme
- Responsive layouts that work on all screen sizes
- Subtle shadows and rounded corners
- Color-coded status indicators

### User Experience

- Intuitive navigation and interactions
- Consistent button placement and sizing
- Clear visual hierarchy
- Helpful empty states
- Loading indicators for all async operations

### Accessibility

- Proper contrast ratios
- Semantic button labels
- Keyboard navigation support
- Screen reader friendly components

## 🔧 Usage Examples

### Using Client Components

```tsx
import { ClientList, ClientForm } from '../components/clients';

// Client List with full functionality
<ClientList
  clients={clients}
  onClientPress={handleClientPress}
  onEditClient={handleEditClient}
  onDeleteClient={handleDeleteClient}
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>

// Client Form for adding/editing
<ClientForm
  client={editingClient} // undefined for new client
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={loading}
/>
```

### Using Project Components

```tsx
import { ProjectList, ProjectForm } from '../components/projects';

// Project List with filtering and sorting
<ProjectList
  projects={projects}
  onProjectPress={handleProjectPress}
  onEditProject={handleEditProject}
  onDeleteProject={handleDeleteProject}
  showClient={true}
/>

// Project Form with client selection
<ProjectForm
  project={editingProject}
  clients={availableClients}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={loading}
/>
```

## 📋 Data Types

### Client Interface

```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  status: "active" | "inactive" | "pending";
  projectCount?: number;
  lastContactDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Project Interface

```typescript
interface Project {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  priority: "low" | "medium" | "high";
  startDate: string;
  endDate?: string;
  deadline?: string;
  budget?: number;
  totalSpent: number;
  hourlyRate?: number;
  estimatedHours?: number;
  taskCount?: number;
  completedTasks?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 Getting Started

1. **Installation**: All components are ready to use with your existing React Native/Expo setup.

2. **Import Components**: Use the main index file for easy imports:

   ```tsx
   import { ClientList, ProjectForm } from "../components";
   ```

3. **Add to Your App**: Integrate the screens into your navigation:
   ```tsx
   import { ClientsScreen, ProjectsScreen } from "../screens";
   ```

## 🔮 Future Enhancements

- Task management components
- Time tracking functionality
- Invoice generation
- File attachment support
- Calendar integration
- Reporting and analytics
- Offline data synchronization
- Real-time collaboration features

## 📝 Notes

- All components include comprehensive TypeScript types
- Mock data is provided for demonstration purposes
- Components are designed to be easily integrated with any state management solution
- Forms include robust validation and error handling
- UI follows platform-specific design guidelines

---

Built with ❤️ using React Native, TypeScript, and Expo
