import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// 1. Configured Axios instance to globally pass credentials (cookies)
export const api = axios.create({
  baseURL: 'http://localhost:5050/api',
  withCredentials: true 
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 2. Swapped token state for an authentication flag
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 3. Updated initialization effect to hit /auth/me on app mount
  useEffect(() => {
    api.get('/auth/me')
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.user);
          setAuthenticated(true);
        }
      })
      .catch((error) => {
        console.log('No active session found:', error.message);
        setUser(null);
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 4. Refactored session reset helper (8. Dropped localStorage)
  const handleSessionExpiry = () => {
    setUser(null);
    setAuthenticated(false);
  };

  // 5. Updated login logic to rely on the backend setting the cookie
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        setAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify your credentials.'
      };
    }
  };

  // 6. Updated registration logic to rely on the backend setting the cookie
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        setUser(response.data.user);
        setAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.'
      };
    }
  };

  // 7. Clears cookie via backend endpoint before running cleanup
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
    // 9. Provided authenticated flag instead of the legacy token string
    <AuthContext.Provider value={{ user, authenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};