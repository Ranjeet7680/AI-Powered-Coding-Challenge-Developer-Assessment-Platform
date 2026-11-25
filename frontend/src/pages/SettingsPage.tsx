import React, { useState } from 'react';
import { useAuth, useToast, usePreferences, EditorThemeOption } from '../context/useContexts';
import { api } from '../services/api';
import {
  User,
  Key,
  Shield,
  Palette,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'security' | 'appearance'>('profile');

  // Profile & API states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState(user?.role || 'Developer');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPw, setUpdatingPw] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ full_name: fullName, role });
      showToast('Profile settings saved.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile.';
      showToast(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!geminiApiKey.trim()) {
      showToast('Enter a Gemini API key first.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ gemini_api_key: geminiApiKey.trim() });
      setGeminiApiKey('');
      showToast('Gemini API key saved securely.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save API key.';
      showToast(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleClearApiKey = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ gemini_api_key: '' });
      setKeyStatus(null);
      showToast('Stored Gemini API key removed.', 'info');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestApiKey = async () => {
    setTestingKey(true);
    setKeyStatus(null);
    try {
      if (!geminiApiKey.trim()) {
        setKeyStatus('Please enter a key to verify before saving.');
        return;
      }
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiApiKey.trim())}`);
      if (res.ok) {
        setKeyStatus('Connection verified! Google Gemini API is ready.');
      } else {
        setKeyStatus('Invalid key or network error. Please verify in Google AI Studio.');
      }
    } catch {
      setKeyStatus('Connection error. Please check your network or key permissions.');
    } finally {
      setTestingKey(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }
    setUpdatingPw(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      showToast(msg, 'error');
    } finally {
      setUpdatingPw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your developer profile, Gemini API integration, account security, and Monaco IDE defaults.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Role', icon: User },
          { id: 'api', label: 'AI & Gemini API Key', icon: Key },
          { id: 'security', label: 'Security & Password', icon: Shield },
          { id: 'appearance', label: 'IDE Preferences', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user?.full_name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/50"
            />
            <div>
              <h3 className="text-base font-bold text-white">{user?.full_name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1 inline-block">
                Level: {user?.experience || 'Intermediate'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Professional Title / Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'api' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Google Gemini API Integration
              </h3>
              <p className="text-slate-400 text-xs">
                Connect your Google AI Studio key for live Gemini challenge synthesis, AI Copilot, and code reviews.
              </p>
            </div>
            {user?.has_gemini_api_key && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved: {user.gemini_api_key_preview}</span>
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-rose-400 hover:text-rose-300 ml-1"
                  title="Remove stored API key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block font-semibold text-slate-300">
              {user?.has_gemini_api_key ? 'Replace Gemini API Key' : 'Gemini API Key'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={testingKey}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
              >
                {testingKey ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {keyStatus && (
              <p className={`text-[11px] font-mono ${keyStatus.includes('verified') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {keyStatus}
              </p>
            )}

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-semibold text-slate-300">Zero-Config Fallback Included</p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Even without a Gemini API key, our procedural task engine and heuristic code analyzer let you generate problems, chat with Copilot, and run full test suites immediately.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px]"
              >
                Get a free key from Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSaveApiKey}
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save API Configuration
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl text-xs">
          <div>
            <h3 className="text-base font-bold text-white">Change Account Password</h3>
            <p className="text-slate-400 mt-1">
              Passwords require 10+ characters with uppercase, lowercase, digit, and symbol. Re-hashed with 100k PBKDF2 rounds.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">New Strong Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 10 chars, Aa, 123, !@#"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={updatingPw}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
          >
            {updatingPw ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      )}

      {activeTab === 'appearance' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Monaco IDE Preferences</h3>
              <p className="text-slate-400 mt-1">
                Changes apply immediately to your Coding Workspace editor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetPreferences();
                showToast('IDE preferences reset to defaults.', 'info');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Editor Color Theme</label>
              <select
                value={preferences.editorTheme}
                onChange={(e) => {
                  updatePreferences({ editorTheme: e.target.value as EditorThemeOption });
                  showToast('Editor theme updated.', 'success');
                }}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="midnight-obsidian">Midnight Obsidian (Default)</option>
                <option value="vs-dark">VS Code Dark+</option>
                <option value="hc-black">High Contrast Dark</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Editor Font Size</label>
              <select
                value={preferences.fontSize}
                onChange={(e) => {
                  updatePreferences({ fontSize: Number(e.target.value) });
                  showToast('Font size saved.', 'success');
                }}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={12}>12px (Compact)</option>
                <option value={13}>13px (Default)</option>
                <option value={14}>14px (Comfortable)</option>
                <option value={16}>16px (Large)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Tab Indentation Size</label>
              <select
                value={preferences.tabSize}
                onChange={(e) => updatePreferences({ tabSize: Number(e.target.value) })}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces (PEP8)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Word Wrap</label>
              <select
                value={preferences.wordWrap}
                onChange={(e) => updatePreferences({ wordWrap: e.target.value as 'on' | 'off' })}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="on">Enabled (Wrap long lines)</option>
                <option value="off">Disabled (Horizontal scroll)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.minimap}
              onChange={(e) => updatePreferences({ minimap: e.target.checked })}
              className="rounded border-slate-700 text-indigo-600 bg-slate-900"
            />
            <div>
              <p className="font-semibold text-white">Show Code Minimap</p>
              <p className="text-[11px] text-slate-400">Display overview minimap on the right side of Monaco Editor.</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};
