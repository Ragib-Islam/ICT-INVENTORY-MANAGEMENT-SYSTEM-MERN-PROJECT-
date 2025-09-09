import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        const normalized = { ...parsed, _id: parsed._id || parsed.id };
        setUser(normalized);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Intentionally remove cross-tab storage syncing so each tab keeps its own session

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      const { token, user: userData } = response.data;
      const normalized = { ...userData, _id: userData._id || userData.id };
      
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(normalized));
      setUser(normalized);
      setIsAuthenticated(true);
      
      return { success: true, user: normalized };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Allow role to be sent for registration, backend will validate
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token, user: newUser } = response.data;
      const normalized = { ...newUser, _id: newUser._id || newUser.id };
      
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(normalized));
      setUser(normalized);
      setIsAuthenticated(true);
      
      return { success: true, user: normalized };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};