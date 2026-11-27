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
  ExternalLink,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'security' | 'appearance'>('profile');

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState(user?.role || 'Developer');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

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
      showToast('Gemini API key saved.', 'success');
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
        setKeyStatus('Enter a key to verify before saving.');
        return;
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiApiKey.trim())}`
      );
      if (res.ok) {
        setKeyStatus('Connection verified. Google Gemini API is ready.');
      } else {
        setKeyStatus('Invalid key or network error. Verify in Google AI Studio.');
      }
    } catch {
      setKeyStatus('Connection error. Check network or key permissions.');
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
    <div className="max-w-4xl space-y-6">
      <div className="pb-2 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
          Settings
        </h1>
        <p className="text-sm text-[#85858b] mt-1">
          Profile, Gemini API integration, password security, and IDE preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-3 text-xs font-medium overflow-x-auto no-scrollbar">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'api', label: 'Gemini API key', icon: Key },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'appearance', label: 'IDE preferences', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 h-8 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#222225] text-[#ededed] border border-white/[0.1]'
                  : 'text-[#85858b] hover:text-[#ededed]'
              }`}
            >
              <Icon strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-6">
          <div className="flex items-center gap-4 pb-5 border-b border-white/[0.08]">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user?.full_name || 'User'}
              className="w-14 h-14 rounded-xl object-cover border border-white/[0.1]"
            />
            <div>
              <h2 className="text-base font-medium text-[#ededed]">{user?.full_name}</h2>
              <p className="text-xs text-[#85858b]">{user?.email}</p>
              <span className="text-xs font-mono text-[#a1a1a6] mt-1 inline-block">
                Level: {user?.experience || 'Intermediate'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
            >
              <Save strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'api' && (
        <div className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-6 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[#ededed] mb-1">Google Gemini API key</h2>
              <p className="text-[#85858b]">
                Connect your Google AI Studio key for live Gemini challenge synthesis, copilot chat, and reviews.
              </p>
            </div>
            {user?.has_gemini_api_key && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141415] border border-white/[0.08] text-[#4cc38a] font-mono">
                <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Saved: {user.gemini_api_key_preview}</span>
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-[#e5484d] hover:opacity-80 ml-1"
                  title="Remove stored API key"
                >
                  <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block font-medium text-[#a1a1a6]">
              {user?.has_gemini_api_key ? 'Replace Gemini API key' : 'Gemini API key'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="flex-1 h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] font-mono focus:outline-none focus:border-[#e5a00d]"
              />
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={testingKey}
                className="px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] font-medium border border-white/[0.08] transition-colors"
              >
                {testingKey ? 'Testing' : 'Test connection'}
              </button>
            </div>

            {keyStatus && (
              <p className={`text-xs font-mono ${keyStatus.includes('verified') ? 'text-[#4cc38a]' : 'text-[#e5a00d]'}`}>
                {keyStatus}
              </p>
            )}

            <div className="p-4 rounded-lg bg-[#141415] border border-white/[0.08] space-y-2">
              <p className="font-medium text-[#ededed]">Offline fallback active</p>
              <p className="text-[#85858b] leading-relaxed">
                Even without a Gemini API key, procedural problem generation and static AST code analysis remain available.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#a1a1a6] hover:text-[#ededed] font-medium"
              >
                <span>Get key from Google AI Studio</span>
                <ExternalLink strokeWidth={1.5} className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex justify-end">
            <button
              type="button"
              onClick={handleSaveApiKey}
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
            >
              <Save strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Save configuration</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-5 text-xs">
          <div>
            <h2 className="text-base font-medium text-[#ededed]">Change password</h2>
            <p className="text-[#85858b] mt-1">
              Requires 10+ characters with uppercase, lowercase, digit, and symbol. Re-hashed with 100k PBKDF2 rounds.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Current password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="10+ chars, Aa, 0-9, symbol"
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Confirm new password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={updatingPw}
            className="px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium transition-colors"
          >
            {updatingPw ? 'Updating' : 'Update password'}
          </button>
        </form>
      )}

      {activeTab === 'appearance' && (
        <div className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-[#ededed]">Monaco IDE preferences</h2>
              <p className="text-[#85858b] mt-1">Applied immediately in the coding workspace.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetPreferences();
                showToast('IDE preferences reset.', 'info');
              }}
              className="text-[#a1a1a6] hover:text-[#ededed] font-medium"
            >
              Reset defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Editor theme</label>
              <select
                value={preferences.editorTheme}
                onChange={(e) => {
                  updatePreferences({ editorTheme: e.target.value as EditorThemeOption });
                  showToast('Editor theme updated.', 'success');
                }}
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              >
                <option value="midnight-obsidian">Graphite Dark (Default)</option>
                <option value="vs-dark">VS Code Dark+</option>
                <option value="hc-black">High Contrast Dark</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Font size</label>
              <select
                value={preferences.fontSize}
                onChange={(e) => {
                  updatePreferences({ fontSize: Number(e.target.value) });
                  showToast('Font size saved.', 'success');
                }}
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              >
                <option value={12}>12px (Compact)</option>
                <option value={13}>13px (Default)</option>
                <option value={14}>14px (Comfortable)</option>
                <option value={16}>16px (Large)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Tab size</label>
              <select
                value={preferences.tabSize}
                onChange={(e) => updatePreferences({ tabSize: Number(e.target.value) })}
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces (PEP8)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#a1a1a6] mb-1.5">Word wrap</label>
              <select
                value={preferences.wordWrap}
                onChange={(e) => updatePreferences({ wordWrap: e.target.value as 'on' | 'off' })}
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
              >
                <option value="on">Enabled</option>
                <option value="off">Disabled</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.minimap}
              onChange={(e) => updatePreferences({ minimap: e.target.checked })}
              className="rounded border-white/20 bg-[#19191b] accent-[#e5a00d]"
            />
            <div>
              <p className="font-medium text-[#ededed]">Show code minimap</p>
              <p className="text-[11px] text-[#85858b]">Display overview minimap inside Monaco Editor</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};
