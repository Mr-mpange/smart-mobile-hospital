import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UnifiedLogin from './pages/UnifiedLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ModernAdminDashboard from './pages/ModernAdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (userType !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function DoctorRoute({ children }) {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (userType !== 'doctor') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Unified Login */}
            <Route path="/login" element={<UnifiedLogin />} />
            
            {/* Doctor Routes */}
            <Route
              path="/dashboard"
              element={
                <DoctorRoute>
                  <Dashboard />
                </DoctorRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <ModernAdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/dashboard/classic"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
