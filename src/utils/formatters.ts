import { ActivityLevel, PrimaryGoal, AssessmentSource } from '../types';

export function formatDatePt(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateLongPt(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatMonthYearPt(date: Date): string {
  return date.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatNumber(val?: number | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return val.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatWeight(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${formatNumber(val, 1)} kg`;
}

export function formatCm(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${formatNumber(val, 1)} cm`;
}

export function formatPercent(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${formatNumber(val, 1)}%`;
}

export function formatKcal(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${Math.round(val)} kcal`;
}

export function formatMl(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  if (val >= 1000) {
    return `${formatNumber(val / 1000, 2)} L`;
  }
  return `${Math.round(val)} ml`;
}

export function getActivityLabel(level: ActivityLevel): string {
  switch (level) {
    case 'sedentary':
      return 'Sedentário (pouco ou nenhum exercício)';
    case 'lightly_active':
      return 'Ligeiramente ativo (exercício 1-3 dias/semana)';
    case 'moderately_active':
      return 'Moderadamente ativo (exercício 3-5 dias/semana)';
    case 'very_active':
      return 'Muito ativo (exercício 6-7 dias/semana)';
    case 'extremely_active':
      return 'Extremamente ativo (treino intenso diário ou desporto)';
  }
}

export function getGoalLabel(goal: PrimaryGoal): string {
  switch (goal) {
    case 'weight_loss':
      return 'Perda de peso';
    case 'weight_maintenance':
      return 'Manutenção do peso';
    case 'weight_gain':
      return 'Aumento de peso / hipertrofia';
    case 'measurements':
      return 'Acompanhamento de medidas corporais';
    case 'body_composition':
      return 'Melhoria da composição corporal';
    case 'habits_fitness':
      return 'Hábitos saudáveis e condição física';
  }
}

export function getSourceLabel(source?: AssessmentSource): string {
  switch (source) {
    case 'bioimpedance':
      return 'Balança de bioimpedância';
    case 'professional':
      return 'Avaliação profissional';
    case 'smart_device':
      return 'Dispositivo inteligente';
    case 'manual':
    default:
      return 'Manual';
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
