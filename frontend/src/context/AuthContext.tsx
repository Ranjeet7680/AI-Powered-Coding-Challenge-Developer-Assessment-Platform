import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateOnboarding: (data: {
    role: string;
    experience: string;
    preferred_languages: string[];
    goals: string[];
  }) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ctf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ctf_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ctf_token');
      if (storedToken) {
        try {
          const freshUser = await api.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('ctf_user', JSON.stringify(freshUser));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('ctf_token');
          localStorage.removeItem('ctf_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

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

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle();
      handleAuthSuccess(res.token, res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.login({ email: 'developer@codingtaskfactory.io', password: 'demo' });
      handleAuthSuccess(res.token, res.user);
    } catch {
      // Direct fallback
      const fallbackUser: User = {
        id: 'user-demo-alex',
        email: 'developer@codingtaskfactory.io',
        full_name: 'Alex Chen',
        role: 'Full Stack Engineer',
        experience: 'Advanced',
        preferred_languages: ['Python', 'TypeScript', 'Go'],
        goals: ['Practice algorithms', 'Prepare for interviews', 'Master system design'],
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        points: 2450,
        streak: 12,
        solved_count: 28,
        has_completed_onboarding: true,
      };
      handleAuthSuccess(fallbackUser.id, fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ctf_token');
    localStorage.removeItem('ctf_user');
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

  const updateProfile = async (data: Partial<User>) => {
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
        loginWithGoogle,
        demoLogin,
        logout,
        updateOnboarding,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
