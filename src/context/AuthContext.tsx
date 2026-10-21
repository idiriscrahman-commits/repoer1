import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '../types/index.ts';
import { api, getAuthToken, setAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.admin);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setAuthToken(res.token);
    setUser(res.admin);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.admin);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
