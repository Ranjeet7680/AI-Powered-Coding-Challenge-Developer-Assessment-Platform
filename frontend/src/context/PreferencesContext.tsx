import React, { useState } from 'react';
import { DEFAULT_IDE_PREFS, IdePreferences, PreferencesContext } from './useContexts';

const STORAGE_KEY = 'ctf_ide_prefs';

function loadPreferences(): IdePreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IDE_PREFS;
    return { ...DEFAULT_IDE_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_IDE_PREFS;
  }
}

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<IdePreferences>(loadPreferences);

  const updatePreferences = (patch: Partial<IdePreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_IDE_PREFS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_IDE_PREFS));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};
