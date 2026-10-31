import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    college?: string;
    year?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: User }>('/auth/login', { email, password });
    setUser(data.user);
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    college?: string;
    year?: string;
  }) => {
    const data = await api.post<{ user: User }>('/auth/register', formData);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType;
export function useAuth(optional: true): AuthContextType | null;
export function useAuth(optional = false) {
  const context = useContext(AuthContext);
  if (!context && !optional) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context ?? null;
}
