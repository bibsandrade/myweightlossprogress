import {
  UserProfile,
  BodyAssessment,
  DailyEntry,
  GoalMilestone,
  AppPreferences,
  BackupData,
  MounjaroInjection,
} from '../types';

const DB_NAME = 'MyProgressDB';
const DB_VERSION = 2;

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'light',
  unitSystem: 'metric',
  quickWaterAmounts: [150, 250, 330, 500],
  visibleMeasurements: {
    waist: true,
    abdomen: true,
    hip: true,
    chest: true,
    thigh: true,
    arm: true,
    leg: true,
  },
  visibleComposition: {
    bodyFat: true,
    muscle: true,
    water: true,
    visceralFat: true,
    boneMass: true,
    bmr: true,
    bmi: true,
  },
  dashboardCharts: {
    weight: true,
    waist: true,
    abdomen: false,
    hip: true,
    bodyFat: true,
    muscle: true,
    calories: true,
    water: true,
  },
  reminders: {
    weightWeekly: true,
    measurementsMonthly: true,
    dailyJournal: true,
    waterReminder: false,
    waterFrequencyHours: 2,
    mounjaroWeekly: true,
  },
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB não é suportado neste navegador.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('assessments')) {
        const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id' });
        assessmentStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('daily_entries')) {
        const dailyStore = db.createObjectStore('daily_entries', { keyPath: 'id' });
        dailyStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('milestones')) {
        db.createObjectStore('milestones', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('mounjaro_injections')) {
        const injStore = db.createObjectStore('mounjaro_injections', { keyPath: 'id' });
        injStore.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  return openDatabase().then((db) => {
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      let req: IDBRequest<T> | void;
      try {
        req = callback(store);
      } catch (err) {
        reject(err);
        return;
      }

      transaction.oncomplete = () => {
        if (req && 'result' in req) {
          resolve(req.result);
        } else {
          resolve(undefined as unknown as T);
        }
      };

      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  });
}

export const dbService = {
  // PROFILE
  async getProfile(): Promise<UserProfile | null> {
    return runTransaction<UserProfile[]>('profile', 'readonly', (store) => store.getAll()).then(
      (results) => (results && results.length > 0 ? results[0] : null)
    );
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await runTransaction('profile', 'readwrite', (store) => store.put(updated));
  },

  // ASSESSMENTS
  async getAssessments(): Promise<BodyAssessment[]> {
    return runTransaction<BodyAssessment[]>('assessments', 'readonly', (store) =>
      store.getAll()
    ).then((items) => {
      return (items || []).sort((a, b) => {
        const dateA = a.date + (a.time ? `T${a.time}` : 'T00:00');
        const dateB = b.date + (b.time ? `T${b.time}` : 'T00:00');
        return dateA.localeCompare(dateB);
      });
    });
  },

  async getAssessment(id: string): Promise<BodyAssessment | null> {
    return runTransaction<BodyAssessment>('assessments', 'readonly', (store) => store.get(id)).then(
      (item) => item || null
    );
  },

  async saveAssessment(assessment: BodyAssessment): Promise<void> {
    const item = {
      ...assessment,
      updatedAt: new Date().toISOString(),
    };
    await runTransaction('assessments', 'readwrite', (store) => store.put(item));
  },

  async deleteAssessment(id: string): Promise<void> {
    await runTransaction('assessments', 'readwrite', (store) => store.delete(id));
  },

  // DAILY ENTRIES
  async getDailyEntries(): Promise<DailyEntry[]> {
    return runTransaction<DailyEntry[]>('daily_entries', 'readonly', (store) =>
      store.getAll()
    ).then((items) => {
      return (items || []).sort((a, b) => a.date.localeCompare(b.date));
    });
  },

  async getDailyEntryByDate(date: string): Promise<DailyEntry | null> {
    return openDatabase().then((db) => {
      return new Promise<DailyEntry | null>((resolve, reject) => {
        const transaction = db.transaction('daily_entries', 'readonly');
        const store = transaction.objectStore('daily_entries');
        const index = store.index('date');
        const request = index.getAll(date);

        request.onsuccess = () => {
          const results = request.result;
          resolve(results && results.length > 0 ? results[0] : null);
        };
        request.onerror = () => reject(request.error);
      });
    });
  },

  async saveDailyEntry(entry: DailyEntry): Promise<void> {
    const item = {
      ...entry,
      updatedAt: new Date().toISOString(),
    };
    await runTransaction('daily_entries', 'readwrite', (store) => store.put(item));
  },

  async deleteDailyEntry(id: string): Promise<void> {
    await runTransaction('daily_entries', 'readwrite', (store) => store.delete(id));
  },

  // MOUNJARO INJECTIONS
  async getMounjaroInjections(): Promise<MounjaroInjection[]> {
    return runTransaction<MounjaroInjection[]>('mounjaro_injections', 'readonly', (store) =>
      store.getAll()
    ).then((items) => {
      return (items || []).sort((a, b) => {
        const dateA = a.date + (a.time ? `T${a.time}` : 'T00:00');
        const dateB = b.date + (b.time ? `T${b.time}` : 'T00:00');
        return dateB.localeCompare(dateA); // most recent first
      });
    });
  },

  async saveMounjaroInjection(injection: MounjaroInjection): Promise<void> {
    await runTransaction('mounjaro_injections', 'readwrite', (store) => store.put(injection));
  },

  async deleteMounjaroInjection(id: string): Promise<void> {
    await runTransaction('mounjaro_injections', 'readwrite', (store) => store.delete(id));
  },

  // MILESTONES
  async getMilestones(): Promise<GoalMilestone[]> {
    return runTransaction<GoalMilestone[]>('milestones', 'readonly', (store) =>
      store.getAll()
    ).then((items) => items || []);
  },

  async saveMilestone(milestone: GoalMilestone): Promise<void> {
    await runTransaction('milestones', 'readwrite', (store) => store.put(milestone));
  },

  async deleteMilestone(id: string): Promise<void> {
    await runTransaction('milestones', 'readwrite', (store) => store.delete(id));
  },

  // PREFERENCES
  async getPreferences(): Promise<AppPreferences> {
    return runTransaction<{ id: string; data: AppPreferences }[]>(
      'preferences',
      'readonly',
      (store) => store.getAll()
    ).then((results) => {
      if (results && results.length > 0 && results[0].data) {
        return { ...DEFAULT_PREFERENCES, ...results[0].data };
      }
      return DEFAULT_PREFERENCES;
    });
  },

  async savePreferences(preferences: AppPreferences): Promise<void> {
    await runTransaction('preferences', 'readwrite', (store) =>
      store.put({ id: 'app_prefs', data: preferences })
    );
  },

  // BACKUP & RESTORE
  async exportAllData(): Promise<BackupData> {
    const [profile, assessments, dailyEntries, milestones, preferences, mounjaroInjections] =
      await Promise.all([
        this.getProfile(),
        this.getAssessments(),
        this.getDailyEntries(),
        this.getMilestones(),
        this.getPreferences(),
        this.getMounjaroInjections(),
      ]);

    return {
      version: 2,
      appName: 'My Progress',
      exportedAt: new Date().toISOString(),
      profile,
      assessments,
      dailyEntries,
      milestones,
      mounjaroInjections,
      preferences,
    };
  },

  async importData(
    data: BackupData,
    mode: 'merge' | 'replace'
  ): Promise<{
    importedAssessments: number;
    importedEntries: number;
    importedMilestones: number;
    importedMounjaro: number;
  }> {
    if (!data || typeof data !== 'object') {
      throw new Error('Ficheiro de cópia de segurança inválido.');
    }

    if (mode === 'replace') {
      await this.clearAllData();
    }

    let importedAssessments = 0;
    let importedEntries = 0;
    let importedMilestones = 0;
    let importedMounjaro = 0;

    if (data.profile) {
      await this.saveProfile(data.profile);
    }

    if (Array.isArray(data.assessments)) {
      for (const item of data.assessments) {
        if (item && item.id && item.date) {
          await this.saveAssessment(item);
          importedAssessments++;
        }
      }
    }

    if (Array.isArray(data.dailyEntries)) {
      for (const item of data.dailyEntries) {
        if (item && item.id && item.date) {
          await this.saveDailyEntry(item);
          importedEntries++;
        }
      }
    }

    if (Array.isArray(data.milestones)) {
      for (const item of data.milestones) {
        if (item && item.id && item.name) {
          await this.saveMilestone(item);
          importedMilestones++;
        }
      }
    }

    if (Array.isArray(data.mounjaroInjections)) {
      for (const item of data.mounjaroInjections) {
        if (item && item.id && item.date) {
          await this.saveMounjaroInjection(item);
          importedMounjaro++;
        }
      }
    }

    if (data.preferences) {
      await this.savePreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
    }

    return {
      importedAssessments,
      importedEntries,
      importedMilestones,
      importedMounjaro,
    };
  },

  async clearAllData(): Promise<void> {
    const db = await openDatabase();
    const stores = [
      'profile',
      'assessments',
      'daily_entries',
      'milestones',
      'preferences',
      'mounjaro_injections',
    ];

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(stores, 'readwrite');
      stores.forEach((s) => {
        if (db.objectStoreNames.contains(s)) {
          transaction.objectStore(s).clear();
        }
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};
