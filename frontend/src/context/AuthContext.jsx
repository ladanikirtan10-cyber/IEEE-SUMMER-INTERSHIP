import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create base API client
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on startup
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Session restoration failed:", error);
          // Token expired or invalid
          logout();
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data; // May contain {two_factor_required: true, temp_token: ...}
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const verify2FA = async (username, code) => {
    try {
      const response = await api.post('/auth/verify-2fa', { username, code });
      const { access_token, user: loggedUser } = response.data;
      
      localStorage.setItem('jwt_token', access_token);
      setToken(access_token);
      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Verification failed';
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/worker/profile', profileData);
      // Update local profile state
      if (user && user.role === 'worker') {
        setUser(prev => ({
          ...prev,
          profile: response.data.worker || response.data
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      verify2FA,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
