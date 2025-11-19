import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadDoctor();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadDoctor = async () => {
    try {
      const response = await api.get('/doctors/profile');
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error('Failed to load doctor:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/doctors/login', { email, password });
    const { token: newToken, doctor: doctorData } = response.data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setDoctor(doctorData);
    
    return doctorData;
  };

  const logout = async () => {
    try {
      await api.post('/doctors/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setDoctor(null);
    }
  };

  const updateStatus = async (status) => {
    await api.put('/doctors/status', { status });
    setDoctor({ ...doctor, status });
  };

  const value = {
    doctor,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    updateStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
