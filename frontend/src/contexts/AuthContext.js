import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await authAPI.getUser();
      if (response.authenticated) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only set to null if it's a clear authentication error
      if (error.response?.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
      }
      // For other errors (network issues), don't change auth state
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    authAPI.login();
  };

  const logout = async () => {
    try {
      // Clear user state immediately to prevent further auth checks
      setUser(null);
      setIsAuthenticated(false);
      
      // Then call the logout endpoint
      await authAPI.logout();
      
      // Force page refresh to clear any cached data
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  const setUserRole = async (role) => {
    try {
      await authAPI.setUserRole(role);
      setUser(prev => ({ ...prev, role }));
    } catch (error) {
      console.error('Role update failed:', error);
    }
  };

  const selectTier = async (tier) => {
    try {
      await authAPI.selectTier(tier);
    } catch (error) {
      console.error('Tier selection failed:', error);
    }
  };

  const upgradeToPro = async () => {
    try {
      const result = await authAPI.upgradeToPro();
      if (result.status === 'success') {
        setUser(prev => ({ ...prev, tier: 'pro' }));
        return result;
      }
      return result;
    } catch (error) {
      console.error('Upgrade failed:', error);
      throw error;
    }
  };

  const triggerAgents = async () => {
    try {
      await authAPI.triggerAgents();
    } catch (error) {
      console.error('Agent trigger failed:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    setUserRole,
    selectTier,
    upgradeToPro,
    triggerAgents,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
