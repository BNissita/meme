import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Pre-configured Axios instance for backend communications
export const api = axios.create({
  baseURL: 'http://localhost:5050/api'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and load user profile if available
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Load current user profile from DB
      api.get('/auth/me')
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            // Token invalid or expired
            handleSessionExpiry();
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Profile fetch failed:', error);
          handleSessionExpiry();
          setLoading(false);
        });
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const handleSessionExpiry = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify your credentials.'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout response error (non-blocking):', e);
    } finally {
      handleSessionExpiry();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
