import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { AuthContext } from './useContexts';

function readStoredUser(): User | null {
  try {
    const saved = localStorage.getItem('ctf_user');
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    localStorage.removeItem('ctf_user');
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ctf_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ctf_token');
    localStorage.removeItem('ctf_user');
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('ctf_token');
    if (!storedToken) return;
    const freshUser = await api.getCurrentUser();
    setUser(freshUser);
    localStorage.setItem('ctf_user', JSON.stringify(freshUser));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ctf_token');
      if (storedToken) {
        try {
          const freshUser = await api.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('ctf_user', JSON.stringify(freshUser));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('ctf:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ctf:unauthorized', handleUnauthorized);
  }, [logout]);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ctf_token', newToken);
    localStorage.setItem('ctf_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      handleAuthSuccess(res.token, res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ full_name: name, email, password });
      handleAuthSuccess(res.token, res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboarding = async (data: {
    role: string;
    experience: string;
    preferred_languages: string[];
    goals: string[];
  }) => {
    const updated = await api.completeOnboarding(data);
    setUser(updated);
    localStorage.setItem('ctf_user', JSON.stringify(updated));
  };

  const updateProfile = async (data: Partial<User> & { gemini_api_key?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('ctf_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateOnboarding,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
