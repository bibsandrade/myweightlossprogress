import { BodyAssessment, DailyEntry, Meal, PrimaryGoal, UserProfile } from '../types';

export interface WeightProgressResult {
  currentWeight: number | null;
  initialWeight: number | null;
  goalWeight: number | null;
  weightDiffKg: number | null; // current - initial
  weightChangeType: 'lost' | 'gained' | 'none' | 'unknown';
  weightLostPercent: number | null;
  goalProgressPercent: number | null; // can exceed 100 or be negative
  visualGoalProgressPercent: number; // clamped 0 to 100 for progress bar
  remainingWeightKg: number | null;
  hasReachedGoal: boolean;
  lastWeightDate: string | null;
}

export function isValidNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
}

export function calculateBmi(weightKg?: number, heightCm?: number): number | null {
  if (!isValidNumber(weightKg) || !isValidNumber(heightCm)) return null;
  if (weightKg <= 0 || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!isFinite(bmi) || bmi <= 0) return null;

  return Math.round(bmi * 10) / 10;
}

export function getBmiCategory(bmi: number): {
  label: string;
  description: string;
  color: string;
} {
  if (bmi < 18.5) {
    return {
      label: 'Abaixo do peso',
      description: 'Indicador geral. Recomenda-se acompanhamento nutricional.',
      color: 'text-amber-500',
    };
  }
  if (bmi < 25) {
    return {
      label: 'Peso normal',
      description: 'Intervalo considerado saudável pela OMS.',
      color: 'text-emerald-500',
    };
  }
  if (bmi < 30) {
    return {
      label: 'Excesso de peso',
      description: 'Indicador de pré-obesidade geral.',
      color: 'text-rose-400',
    };
  }
  return {
    label: 'Obesidade',
    description: 'Indicador orientativo. Não substitui avaliação profissional.',
    color: 'text-rose-600',
  };
}

export function calculateSleepDuration(bedTime?: string, wakeTime?: string): number | null {
  if (!bedTime || !wakeTime) return null;

  const [bedH, bedM] = bedTime.split(':').map(Number);
  const [wakeH, wakeM] = wakeTime.split(':').map(Number);

  if (isNaN(bedH) || isNaN(bedM) || isNaN(wakeH) || isNaN(wakeM)) return null;

  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;

  // Crosses midnight
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  const durationMin = wakeMinutes - bedMinutes;
  if (durationMin <= 0 || durationMin > 24 * 60) return null;

  const hours = durationMin / 60;
  return Math.round(hours * 10) / 10;
}

export function getLatestWeight(
  assessments: BodyAssessment[],
  dailyEntries: DailyEntry[] = []
): { weight: number | null; date: string | null } {
  // Sort assessments by date descending
  const validAssessments = assessments
    .filter((a) => isValidNumber(a.weightKg) && a.weightKg > 0)
    .map((a) => ({ weight: a.weightKg!, date: a.date, time: a.time || '00:00' }))
    .sort((a, b) => (b.date + 'T' + b.time).localeCompare(a.date + 'T' + a.time));

  // Also check dailyEntries if user logged weight in daily entry
  const validJournal = dailyEntries
    .filter((d) => isValidNumber(d.weightKg) && d.weightKg > 0)
    .map((d) => ({ weight: d.weightKg!, date: d.date, time: '12:00' }))
    .sort((a, b) => (b.date + 'T' + b.time).localeCompare(a.date + 'T' + a.time));

  const all = [...validAssessments, ...validJournal].sort((a, b) =>
    (b.date + 'T' + b.time).localeCompare(a.date + 'T' + a.time)
  );

  if (all.length === 0) {
    return { weight: null, date: null };
  }

  return { weight: all[0].weight, date: all[0].date };
}

export function calculateWeightProgress(
  profile: UserProfile | null,
  assessments: BodyAssessment[],
  dailyEntries: DailyEntry[] = []
): WeightProgressResult {
  const initialWeight =
    profile && isValidNumber(profile.initialWeightKg) && profile.initialWeightKg > 0
      ? profile.initialWeightKg
      : null;

  const goalWeight =
    profile && isValidNumber(profile.goalWeightKg) && profile.goalWeightKg > 0
      ? profile.goalWeightKg
      : null;

  const latest = getLatestWeight(assessments, dailyEntries);
  const currentWeight = latest.weight ?? initialWeight;
  const lastWeightDate = latest.date ?? (profile?.startDate || null);

  if (!initialWeight || !currentWeight) {
    return {
      currentWeight,
      initialWeight,
      goalWeight,
      weightDiffKg: null,
      weightChangeType: 'unknown',
      weightLostPercent: null,
      goalProgressPercent: null,
      visualGoalProgressPercent: 0,
      remainingWeightKg: null,
      hasReachedGoal: false,
      lastWeightDate,
    };
  }

  // Weight variation = current - initial
  const weightDiffKg = Math.round((currentWeight - initialWeight) * 100) / 100;
  let weightChangeType: 'lost' | 'gained' | 'none' = 'none';

  if (weightDiffKg < -0.05) {
    weightChangeType = 'lost';
  } else if (weightDiffKg > 0.05) {
    weightChangeType = 'gained';
  }

  // Weight lost percent = (initial - current) / initial * 100
  const weightLostPercent =
    initialWeight > 0
      ? Math.round(((initialWeight - currentWeight) / initialWeight) * 1000) / 10
      : null;

  // Goal progress
  let goalProgressPercent: number | null = null;
  let visualGoalProgressPercent = 0;
  let remainingWeightKg: number | null = null;
  let hasReachedGoal = false;

  if (goalWeight) {
    remainingWeightKg = Math.round(Math.abs(currentWeight - goalWeight) * 100) / 100;

    const primaryGoal: PrimaryGoal = profile?.primaryGoal || 'weight_loss';

    if (primaryGoal === 'weight_loss' && initialWeight > goalWeight) {
      const totalDelta = initialWeight - goalWeight;
      const progressDelta = initialWeight - currentWeight;
      goalProgressPercent = Math.round((progressDelta / totalDelta) * 1000) / 10;
      visualGoalProgressPercent = Math.max(0, Math.min(100, goalProgressPercent));
      hasReachedGoal = currentWeight <= goalWeight;
    } else if (primaryGoal === 'weight_gain' && initialWeight < goalWeight) {
      const totalDelta = goalWeight - initialWeight;
      const progressDelta = currentWeight - initialWeight;
      goalProgressPercent = Math.round((progressDelta / totalDelta) * 1000) / 10;
      visualGoalProgressPercent = Math.max(0, Math.min(100, goalProgressPercent));
      hasReachedGoal = currentWeight >= goalWeight;
    } else if (primaryGoal === 'weight_maintenance') {
      const diffFromTarget = Math.abs(currentWeight - goalWeight);
      if (diffFromTarget <= 1.0) {
        goalProgressPercent = 100;
        visualGoalProgressPercent = 100;
        hasReachedGoal = true;
      } else {
        const score = Math.max(0, 100 - diffFromTarget * 10);
        goalProgressPercent = Math.round(score * 10) / 10;
        visualGoalProgressPercent = goalProgressPercent;
        hasReachedGoal = false;
      }
    } else {
      // General target
      if (Math.abs(initialWeight - goalWeight) > 0.1) {
        const totalDelta = Math.abs(initialWeight - goalWeight);
        const achieved = totalDelta - Math.abs(currentWeight - goalWeight);
        goalProgressPercent = Math.round((achieved / totalDelta) * 1000) / 10;
        visualGoalProgressPercent = Math.max(0, Math.min(100, goalProgressPercent));
      }
      hasReachedGoal = Math.abs(currentWeight - goalWeight) <= 0.2;
    }
  }

  return {
    currentWeight,
    initialWeight,
    goalWeight,
    weightDiffKg,
    weightChangeType,
    weightLostPercent,
    goalProgressPercent,
    visualGoalProgressPercent,
    remainingWeightKg,
    hasReachedGoal,
    lastWeightDate,
  };
}

export interface MeasurementDiffResult {
  initialValue: number | null;
  currentValue: number | null;
  diff: number | null; // current - initial
  diffPercent: number | null;
  firstDate: string | null;
  lastDate: string | null;
  hasData: boolean;
}

export function calculateMeasurementEvolution(
  assessments: BodyAssessment[],
  field: keyof BodyAssessment
): MeasurementDiffResult {
  const valid = assessments
    .filter((a) => isValidNumber(a[field]) && (a[field] as number) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (valid.length === 0) {
    return {
      initialValue: null,
      currentValue: null,
      diff: null,
      diffPercent: null,
      firstDate: null,
      lastDate: null,
      hasData: false,
    };
  }

  const firstEntry = valid[0];
  const lastEntry = valid[valid.length - 1];

  const initialVal = firstEntry[field] as number;
  const currentVal = lastEntry[field] as number;

  const diff = Math.round((currentVal - initialVal) * 10) / 10;
  const diffPercent =
    initialVal > 0 ? Math.round(((currentVal - initialVal) / initialVal) * 1000) / 10 : null;

  return {
    initialValue: initialVal,
    currentValue: currentVal,
    diff,
    diffPercent,
    firstDate: firstEntry.date,
    lastDate: lastEntry.date,
    hasData: true,
  };
}

export function calculateDailyMealTotals(meals: Meal[]): {
  totalCalories: number;
  totalProtein: number;
} {
  let totalCalories = 0;
  let totalProtein = 0;

  for (const m of meals) {
    if (isValidNumber(m.caloriesKcal) && m.caloriesKcal > 0) {
      totalCalories += m.caloriesKcal;
    }
    if (isValidNumber(m.proteinGrams) && m.proteinGrams > 0) {
      totalProtein += m.proteinGrams;
    }
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
  };
}

export function filterAssessmentsByDays(
  assessments: BodyAssessment[],
  days: number | 'all'
): BodyAssessment[] {
  if (days === 'all') return assessments;

  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return assessments.filter((a) => a.date >= cutoffStr);
}

export function filterDailyEntriesByDays(
  entries: DailyEntry[],
  days: number | 'all'
): DailyEntry[] {
  if (days === 'all') return entries;

  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return entries.filter((e) => e.date >= cutoffStr);
}
