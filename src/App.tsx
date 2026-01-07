import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // if (isLoading) return <div style={{ color: 'white', padding: '2rem' }}>Cargando...</div>;
  if (!user && !isLoading) return <Navigate to="/login" />;
  if (!user && isLoading) return <div style={{ color: 'white', padding: '2rem' }}>Cargando...</div>;
  // Wait, the user asked to "botar inmediatamente" on reload.
  // If I reload, user is null initially. 
  // If I want to force login on reload, I should NOT wait for loading if user is null.
  // But strictly, if I return <Navigate> immediately, it will redirect even if it IS just loading validly.
  // However, usually with Firebase, onAuthStateChanged fires pretty quick. 
  // If the user REALLY wants to kick out on reload, we can just say:
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
