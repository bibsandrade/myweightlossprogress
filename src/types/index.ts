export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type PrimaryGoal =
  | 'weight_loss'
  | 'weight_maintenance'
  | 'weight_gain'
  | 'measurements'
  | 'body_composition'
  | 'habits_fitness';

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  heightCm?: number;
  initialWeightKg?: number;
  goalWeightKg?: number;
  startDate: string; // YYYY-MM-DD
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  name: string;
  targetType: 'weight' | 'waist' | 'bodyFat' | 'muscle' | 'custom';
  targetValue: number;
  unit: string;
  targetDate?: string;
  achievedAt?: string;
  createdAt: string;
}

export type AssessmentSource = 'manual' | 'bioimpedance' | 'professional' | 'smart_device';

export interface BodyAssessment {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  weightKg?: number;
  // Circumferences in cm
  waistCm?: number;
  abdomenCm?: number;
  hipCm?: number;
  chestCm?: number;
  thighCm?: number;
  armCm?: number;
  legCm?: number; // perna/gémeos
  // Composition
  bodyFatPercent?: number;
  musclePercent?: number;
  waterPercent?: number;
  visceralFatValue?: number;
  visceralFatUnit?: string;
  boneMassKg?: number; // Massa óssea em kg
  basalMetabolicRateKcal?: number;
  bmi?: number;
  source?: AssessmentSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  id: string;
  name: string;
  time?: string;
  foods?: string;
  caloriesKcal?: number;
  proteinGrams?: number;
  notes?: string;
}

export type ExerciseIntensity = 'baixa' | 'moderada' | 'alta';

export interface ExerciseEntry {
  id: string;
  type: string;
  durationMinutes: number;
  intensity?: ExerciseIntensity;
  distanceKm?: number;
  steps?: number;
  caloriesBurnedKcal?: number;
  notes?: string;
}

export interface SleepData {
  bedTime?: string;
  wakeTime?: string;
  durationHours?: number;
  quality?: number; // 1 - 5
  notes?: string;
}

export interface MenstrualData {
  isPeriodStart?: boolean;
  isPeriodEnd?: boolean;
  flow?: 'leve' | 'moderado' | 'intenso';
  waterRetentionPerceived?: boolean;
  symptoms?: string[];
  notes?: string;
}

// MOUNJARO TREATMENT TRACKING
export type InjectionSite =
  | 'abdomen_direito'
  | 'abdomen_esquerdo'
  | 'coxa_direita'
  | 'coxa_esquerda'
  | 'braco_direito'
  | 'braco_esquerdo'
  | 'outro';

export interface MounjaroInjection {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  doseMg: number; // e.g. 2.5, 5.0, 7.5, 10.0, 12.5, 15.0
  site: InjectionSite;
  notes?: string;
  createdAt: string;
}

export interface MounjaroSymptomsRating {
  nausea?: number; // 0 a 5 (0: sem sintoma, 1: muito leve, ..., 5: intenso)
  earlySatiety?: number; // 0 a 5 (saciedade rápida / perda de apetite)
  fatigue?: number; // 0 a 5 (cansaço / fadiga)
  acidReflux?: number; // 0 a 5 (azia / refluxo)
  constipation?: number; // 0 a 5 (obstipação / prisão de ventre)
  diarrhea?: number; // 0 a 5 (diarreia)
  headache?: number; // 0 a 5 (dor de cabeça)
  abdominalPain?: number; // 0 a 5 (inchaço / cólica abdominal)
  siteReaction?: number; // 0 a 5 (vermelhidão/dor na picada)
  burping?: number; // 0 a 5 (eructação / arrotos)
  customSymptom?: string;
  customSymptomRating?: number;
  notes?: string;
}

export interface MounjaroDayLog {
  tookInjection?: boolean;
  injectionId?: string;
  doseMg?: number;
  site?: InjectionSite;
  injectionDetails?: {
    doseMg: number;
    site: InjectionSite;
    time?: string;
  };
  symptoms?: MounjaroSymptomsRating;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  waterMl: number;
  meals: Meal[];
  exercises: ExerciseEntry[];
  sleep?: SleepData;
  mood?: number; // 1 - 5
  energy?: number; // 1 - 5
  hunger?: number; // 1 - 5
  satiety?: number; // 1 - 5
  stress?: number; // 1 - 5
  bingeEpisode?: boolean;
  bingeNotes?: string;
  menstrualData?: MenstrualData;
  mounjaro?: MounjaroDayLog;
  notes?: string;
  achievements?: string;
  challenges?: string;
  tomorrowGoals?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisibleMeasurementsConfig {
  waist: boolean;
  abdomen: boolean;
  hip: boolean;
  chest: boolean;
  thigh: boolean;
  arm: boolean;
  leg: boolean;
}

export interface VisibleCompositionConfig {
  bodyFat: boolean;
  muscle: boolean;
  water: boolean;
  visceralFat: boolean;
  boneMass: boolean;
  bmr: boolean;
  bmi: boolean;
}

export interface DashboardChartsConfig {
  weight: boolean;
  waist: boolean;
  abdomen: boolean;
  hip: boolean;
  bodyFat: boolean;
  muscle: boolean;
  calories: boolean;
  water: boolean;
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  unitSystem: 'metric';
  quickWaterAmounts: number[];
  visibleMeasurements: VisibleMeasurementsConfig;
  visibleComposition: VisibleCompositionConfig;
  dashboardCharts: DashboardChartsConfig;
  reminders: {
    weightWeekly: boolean;
    measurementsMonthly: boolean;
    dailyJournal: boolean;
    waterReminder: boolean;
    waterFrequencyHours: number;
    mounjaroWeekly: boolean;
  };
}

export interface BackupData {
  version: number;
  exportedAt: string;
  appName: string;
  profile?: UserProfile | null;
  assessments: BodyAssessment[];
  dailyEntries: DailyEntry[];
  milestones: GoalMilestone[];
  mounjaroInjections?: MounjaroInjection[];
  preferences?: AppPreferences;
}
