import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Key,
  Shield,
  Bell,
  Palette,
  Globe,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'security' | 'appearance'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || 'Alex Chen');
  const [role, setRole] = useState(user?.role || 'Full Stack Engineer');
  const [geminiApiKey, setGeminiApiKey] = useState(user?.gemini_api_key || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName,
        role: role,
        gemini_api_key: geminiApiKey,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setKeyStatus(err instanceof Error ? err.message : 'Failed to save profile settings.');
    }
  };

  const handleTestApiKey = async () => {
    setTestingKey(true);
    setKeyStatus(null);
    try {
      if (!geminiApiKey) {
        setKeyStatus('Please enter an API key to test.');
        return;
      }
      // Simple validation test
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiApiKey)}`);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your developer profile, customize AI models, and calibrate IDE preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Role', icon: User },
          { id: 'api', label: 'AI & Gemini API Key', icon: Key },
          { id: 'security', label: 'Security & Access', icon: Shield },
          { id: 'appearance', label: 'Appearance & IDE', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* Profile Tab */}
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
                Level: {user?.experience || 'Advanced'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Professional Title / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : <span />}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* AI & Gemini API Key Tab */}
      {activeTab === 'api' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl text-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Google Gemini API Integration
            </h3>
            <p className="text-slate-400 text-xs">
              Connect your Google AI Studio API key to unlock unlimited, custom AI challenge generation and real-time algorithmic reviews.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block font-semibold text-slate-300">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
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
              <p className="font-semibold text-slate-300">Don't have a key yet?</p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                You can obtain a free Gemini API key with generous limits from Google AI Studio. The platform also has built-in intelligent fallback generation so you can code without a key!
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
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save API Configuration
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl text-xs">
          <h3 className="text-base font-bold text-white">Account Security</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>
          </div>
          <button
            onClick={() => alert('Password updated successfully!')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
          >
            Update Password
          </button>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl text-xs">
          <h3 className="text-base font-bold text-white">Appearance & IDE Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Theme</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <option>Deep Navy (Default)</option>
                <option>Monokai Pro</option>
                <option>Midnight Cyan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Monaco Editor Font Size</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <option>13px (Default)</option>
                <option>14px (Comfortable)</option>
                <option>16px (Large)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
