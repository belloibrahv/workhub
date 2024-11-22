import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HubDetailPage from './pages/HubDetailPage';
import CheckinPage from './pages/CheckinPage';
import ToolSelectionPage from './pages/ToolSelectionPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hub/:hubId" 
              element={
                <ProtectedRoute>
                  <HubDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkin/:hubId" 
              element={
                <ProtectedRoute>
                  <CheckinPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools/:hubId" 
              element={
                <ProtectedRoute>
                  <ToolSelectionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/confirmation" 
              element={
                <ProtectedRoute>
                  <ConfirmationPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
