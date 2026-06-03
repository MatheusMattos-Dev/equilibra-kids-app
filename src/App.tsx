import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScreenTimeProvider } from './hooks/useScreenTime';
import { ProfileSelection } from './pages/ProfileSelection';
import { ChildInterface } from './pages/ChildInterface';
import { ParentDashboard } from './pages/ParentDashboard';
import { AuthPage } from './pages/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ScreenTimeProvider>
      <BrowserRouter>
        <div className="w-full min-h-screen">
          <Routes>
            <Route path="/" element={<ProfileSelection />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/pais" 
              element={
                <ProtectedRoute>
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/crianca" element={<ChildInterface />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ScreenTimeProvider>
  );
}

export default App;
