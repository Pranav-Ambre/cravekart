import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRestaurantOwner: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cravekart_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cravekart_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        localStorage.setItem('cravekart_user', JSON.stringify(response.data.data));
      }
    } catch (err) {
      console.warn('Session expired or invalid, logging out');
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cravekart_token', newToken);
    localStorage.setItem('cravekart_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cravekart_token');
    localStorage.removeItem('cravekart_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('cravekart_user', JSON.stringify(updated));
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isRestaurantOwner = user?.role === 'RESTAURANT_OWNER' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isRestaurantOwner,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
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
