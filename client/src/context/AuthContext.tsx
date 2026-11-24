import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, org?: string) => Promise<void>;
  loginDemoUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dm_token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('dm_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('dm_token', res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, org?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(name, email, pass, org);
      localStorage.setItem('dm_token', res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoUser = async () => {
    return login('alex.morgan@documind.io', 'demo12345');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('dm_token');
    setUser(null);
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginDemoUser,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
