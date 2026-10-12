import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserProfile,
  BodyAssessment,
  DailyEntry,
  GoalMilestone,
  AppPreferences,
  BackupData,
  MounjaroInjection,
} from '../types';
import { dbService, DEFAULT_PREFERENCES } from '../services/db';

interface AppContextType {
  profile: UserProfile | null;
  assessments: BodyAssessment[];
  dailyEntries: DailyEntry[];
  milestones: GoalMilestone[];
  mounjaroInjections: MounjaroInjection[];
  preferences: AppPreferences;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  saveAssessment: (assessment: BodyAssessment) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  saveDailyEntry: (entry: DailyEntry) => Promise<void>;
  deleteDailyEntry: (id: string) => Promise<void>;
  saveMounjaroInjection: (injection: MounjaroInjection) => Promise<void>;
  deleteMounjaroInjection: (id: string) => Promise<void>;
  saveMilestone: (milestone: GoalMilestone) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<AppPreferences>) => Promise<void>;
  importData: (data: BackupData, mode: 'merge' | 'replace') => Promise<{
    importedAssessments: number;
    importedEntries: number;
    importedMilestones: number;
    importedMounjaro: number;
  }>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [mounjaroInjections, setMounjaroInjections] = useState<MounjaroInjection[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const cachedTheme = localStorage.getItem('my_progress_theme') as 'light' | 'dark' | 'system' | null;
    return cachedTheme ? { ...DEFAULT_PREFERENCES, theme: cachedTheme } : DEFAULT_PREFERENCES;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to document
  const applyTheme = useCallback((themeMode: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    const body = document.body;
    const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = themeMode === 'dark' || (themeMode === 'system' && isSystemDark);

    if (isDark) {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('my_progress_theme', themeMode);
    } catch {
      // Safe fallback
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [prof, assessList, dailyList, miles, prefs, injList] = await Promise.all([
        dbService.getProfile(),
        dbService.getAssessments(),
        dbService.getDailyEntries(),
        dbService.getMilestones(),
        dbService.getPreferences(),
        dbService.getMounjaroInjections(),
      ]);

      setProfile(prof);
      setAssessments(assessList);
      setDailyEntries(dailyList);
      setMilestones(miles);
      setPreferences(prefs);
      setMounjaroInjections(injList);

      const cached = localStorage.getItem('my_progress_theme') as 'light' | 'dark' | 'system' | null;
      applyTheme(cached || prefs.theme || 'light');
    } catch (err) {
      console.error('Erro ao carregar dados do IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  useEffect(() => {
    // Apply cached theme immediately
    const cached = localStorage.getItem('my_progress_theme') as 'light' | 'dark' | 'system' | null;
    applyTheme(cached || 'light');
    refreshData();
  }, [refreshData, applyTheme]);

  useEffect(() => {
    // Listen to system theme changes if set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      const currentTheme = (localStorage.getItem('my_progress_theme') as any) || preferences.theme;
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [preferences.theme, applyTheme]);

  const updateProfile = async (newProfile: UserProfile) => {
    await dbService.saveProfile(newProfile);
    setProfile(newProfile);
  };

  const saveAssessment = async (assessment: BodyAssessment) => {
    await dbService.saveAssessment(assessment);
    const updated = await dbService.getAssessments();
    setAssessments(updated);
  };

  const deleteAssessment = async (id: string) => {
    await dbService.deleteAssessment(id);
    const updated = await dbService.getAssessments();
    setAssessments(updated);
  };

  const saveDailyEntry = async (entry: DailyEntry) => {
    await dbService.saveDailyEntry(entry);
    const updated = await dbService.getDailyEntries();
    setDailyEntries(updated);
  };

  const deleteDailyEntry = async (id: string) => {
    await dbService.deleteDailyEntry(id);
    const updated = await dbService.getDailyEntries();
    setDailyEntries(updated);
  };

  const saveMounjaroInjection = async (injection: MounjaroInjection) => {
    await dbService.saveMounjaroInjection(injection);
    const updated = await dbService.getMounjaroInjections();
    setMounjaroInjections(updated);
  };

  const deleteMounjaroInjection = async (id: string) => {
    await dbService.deleteMounjaroInjection(id);
    const updated = await dbService.getMounjaroInjections();
    setMounjaroInjections(updated);
  };

  const saveMilestone = async (milestone: GoalMilestone) => {
    await dbService.saveMilestone(milestone);
    const updated = await dbService.getMilestones();
    setMilestones(updated);
  };

  const deleteMilestone = async (id: string) => {
    await dbService.deleteMilestone(id);
    const updated = await dbService.getMilestones();
    setMilestones(updated);
  };

  const updatePreferences = async (newPrefs: Partial<AppPreferences>) => {
    const merged = { ...preferences, ...newPrefs };
    await dbService.savePreferences(merged);
    setPreferences(merged);
    if (newPrefs.theme) {
      applyTheme(newPrefs.theme);
    }
  };

  const importData = async (data: BackupData, mode: 'merge' | 'replace') => {
    const result = await dbService.importData(data, mode);
    await refreshData();
    return result;
  };

  const clearAllData = async () => {
    await dbService.clearAllData();
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        assessments,
        dailyEntries,
        milestones,
        mounjaroInjections,
        preferences,
        isLoading,
        refreshData,
        updateProfile,
        saveAssessment,
        deleteAssessment,
        saveDailyEntry,
        deleteDailyEntry,
        saveMounjaroInjection,
        deleteMounjaroInjection,
        saveMilestone,
        deleteMilestone,
        updatePreferences,
        importData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
