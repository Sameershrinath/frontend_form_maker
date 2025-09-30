import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import CreateEditForm from './pages/CreateEditForm';
import FormView from './pages/FormView';
import ResponsesView from './pages/ResponsesView';
import FormPreview from './pages/FormPreview';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, login, loading } = useAuth();

  const handleLogin = (success: boolean) => {
    if (success) {
      login();
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Login route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        {/* Protected Admin routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateEditForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit/:id" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateEditForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/responses/:id" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ResponsesView />
            </ProtectedRoute>
          } 
        />
        
        {/* Public form route - no authentication required */}
        <Route path="/form/:id" element={<FormView />} />
        
        {/* Protected Preview route */}
        <Route 
          path="/preview" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <FormPreview />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
