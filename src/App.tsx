import { useState } from 'react';
import { ScreenTimeProvider } from './hooks/useScreenTime';
import { ProfileSelection } from './pages/ProfileSelection';
import { ChildInterface } from './pages/ChildInterface';
import { ParentDashboard } from './pages/ParentDashboard';

type ViewType = 'profile-selection' | 'child-mode' | 'parent-dashboard';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('parent-dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'child-mode':
        return (
          <ChildInterface 
            onNavigate={(page) => setCurrentView(page)} 
          />
        );
      case 'parent-dashboard':
        return (
          <ParentDashboard 
            onNavigate={(page) => setCurrentView(page)} 
          />
        );
      case 'profile-selection':
        return (
          <ProfileSelection 
            onNavigate={(page) => setCurrentView(page)} 
          />
        );
    }
  };

  return (
    <div className="w-full min-h-screen">
      {renderView()}
    </div>
  );
}

function App() {
  return (
    <ScreenTimeProvider>
      <AppContent />
    </ScreenTimeProvider>
  );
}

export default App;
