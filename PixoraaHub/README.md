# PixoraaHub - Business Management App

A comprehensive React Native business management application built with Expo, designed to help freelancers and small businesses manage clients, projects, and tasks efficiently.

## 🚀 Features

### 📊 Dashboard

- **Business Overview**: Real-time statistics and key metrics
- **Quick Actions**: Fast access to main features
- **Recent Activity**: Track latest updates and changes
- **Revenue Tracking**: Monitor earnings and financial performance

### 👥 Client Management

- **Client Profiles**: Comprehensive client information
- **Contact Management**: Phone, email, and address details
- **Status Tracking**: Active, inactive, pending, and archived clients
- **Project Association**: Link clients to their projects
- **Notes & History**: Track interactions and important information

### 📁 Project Management

- **Project Overview**: Detailed project information and status
- **Budget Tracking**: Monitor spending vs budget
- **Timeline Management**: Start dates, deadlines, and milestones
- **Priority System**: Organize projects by importance (Low, Medium, High, Urgent)
- **Progress Monitoring**: Track completion status and task progress
- **Client Integration**: Direct linking to associated clients

### 🎨 User Experience

- **Modern UI**: Clean, professional interface
- **Responsive Design**: Optimized for mobile and tablet
- **Dark/Light Theme**: Adapts to system preferences
- **Haptic Feedback**: Enhanced touch interactions
- **Smooth Animations**: Polished user experience

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet
- **Date Handling**: date-fns
- **Icons**: SF Symbols (iOS) / Material Icons equivalent
- **Development**: Hot reload, Fast refresh

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── index.tsx         # Dashboard/Home
│   ├── clients.tsx       # Client Management
│   ├── projects.tsx      # Project Management
│   └── explore.tsx       # Additional Features
└── _layout.tsx           # Root Layout

src/
├── components/
│   ├── clients/          # Client-related components
│   └── projects/         # Project-related components
├── screens/
│   ├── clients/          # Client screen logic
│   └── projects/         # Project screen logic
├── types/                # TypeScript definitions
├── utils/                # Helper functions
└── constants/            # App constants
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and navigate to the project**:

   ```bash
   cd PixoraaHub
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - **iOS**: Press `i` in terminal or scan QR with Camera app
   - **Android**: Press `a` in terminal or scan QR with Expo Go app
   - **Web**: Press `w` in terminal

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when configured)

## 📋 Current Status

### ✅ Completed Features

- [x] Project structure and navigation
- [x] Client management (CRUD operations)
- [x] Project management (CRUD operations)
- [x] Dashboard with business metrics
- [x] TypeScript integration
- [x] Component library foundation
- [x] Responsive UI design
- [x] Data validation and error handling

### 🚧 In Development

- [ ] Task management system
- [ ] Time tracking
- [ ] Invoicing system
- [ ] File attachments
- [ ] Data persistence (database integration)
- [ ] Push notifications
- [ ] Export/reporting features

### 🔮 Future Enhancements

- [ ] Calendar integration
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] API integrations
- [ ] Offline support
- [ ] Multi-language support

## 🏗️ Architecture

The app follows a modular architecture with clear separation of concerns:

- **Components**: Reusable UI components for different features
- **Screens**: Business logic and state management
- **Types**: Centralized TypeScript definitions
- **Utils**: Helper functions and utilities
- **Constants**: App-wide constants and configurations

## 📊 Data Models

### Client

```typescript
interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  // ... additional fields
}
```

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  // ... additional fields
}
```

## 🤝 Contributing

This is a personal/business project. If you'd like to contribute or suggest improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is private/proprietary. All rights reserved.

## 🔧 Development Notes

### Key Dependencies

- `expo`: ~52.0.11
- `react`: 18.3.1
- `react-native`: 0.76.3
- `date-fns`: ^4.1.0
- `expo-router`: ~4.0.9

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Consistent component structure
- Comprehensive error handling

---

**Built with ❤️ for efficient business management**
