'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SECURITY NOTE: Using localStorage for JWT is acceptable for MVP but carries XSS risks.
    // RECOMMENDATION: Move to httpOnly cookies for professional production environments.
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            const response = await axios.get('/api/auth/verify');
            if (response.data.success) {
              setUser(response.data.user);
              setToken(storedToken);
            } else {
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Anmeldung fehlgeschlagen'
      };
    }
  };

  const register = async (email, password, confirmPassword) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        confirmPassword
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registrierung fehlgeschlagen'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Profilaktualisierung fehlgeschlagen'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Passwortänderung fehlgeschlagen'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    plan: user?.plan || 'free',
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
