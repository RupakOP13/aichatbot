import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const appShell = (
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
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#00cec9', secondary: '#1e1e45' },
          },
          error: {
            iconTheme: { primary: '#ff6b6b', secondary: '#1e1e45' },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard view="dashboard" />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Dashboard view="reports" />
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute>
                <Dashboard view="insights" />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Dashboard view="settings" />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {appShell}
    </GoogleOAuthProvider>
  ) : appShell;
}

export default App;
