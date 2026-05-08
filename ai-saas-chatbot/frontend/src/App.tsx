import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a1a', color: '#00cec9'
      }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(0,206,201,0.2)', borderTopColor: '#00cec9', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      
      <Route path="/dashboard" element={<PrivateRoute><Dashboard view="dashboard" /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Dashboard view="reports" /></PrivateRoute>} />
      <Route path="/insights" element={<PrivateRoute><Dashboard view="insights" /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Dashboard view="settings" /></PrivateRoute>} />
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const content = (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e1e45',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: 'Space Grotesk, sans-serif',
          },
        }}
      />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  ) : content;
}

export default App;
