import { createContext, useContext } from 'react';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateOnboarding: (data: {
    role: string;
    experience: string;
    preferred_languages: string[];
    goals: string[];
  }) => Promise<void>;
  updateProfile: (data: Partial<User> & { gemini_api_key?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export type EditorThemeOption = 'vs-dark' | 'hc-black' | 'midnight-obsidian';

export interface IdePreferences {
  editorTheme: EditorThemeOption;
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: 'on' | 'off';
}

export const DEFAULT_IDE_PREFS: IdePreferences = {
  editorTheme: 'midnight-obsidian',
  fontSize: 13,
  tabSize: 4,
  minimap: false,
  wordWrap: 'on',
};

export interface PreferencesContextType {
  preferences: IdePreferences;
  updatePreferences: (patch: Partial<IdePreferences>) => void;
  resetPreferences: () => void;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
}
