import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityLevel, PrimaryGoal, UserProfile, BodyAssessment } from '../types';
import { getTodayDateString } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { updateProfile, saveAssessment } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [initialWeightKg, setInitialWeightKg] = useState<string>('');
  const [goalWeightKg, setGoalWeightKg] = useState<string>('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>('weight_loss');
  const [notes, setNotes] = useState('');

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor introduz o teu nome ou alcunha.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedHeight = heightCm ? parseFloat(heightCm) : undefined;
    const parsedInitialWeight = initialWeightKg ? parseFloat(initialWeightKg) : undefined;
    const parsedGoalWeight = goalWeightKg ? parseFloat(goalWeightKg) : undefined;
    const parsedAge = age ? parseInt(age, 10) : undefined;

    if (parsedInitialWeight !== undefined && (isNaN(parsedInitialWeight) || parsedInitialWeight <= 0)) {
      setError('Por favor indica um peso inicial válido superior a 0 kg.');
      return;
    }

    if (parsedHeight !== undefined && (isNaN(parsedHeight) || parsedHeight <= 0)) {
      setError('Por favor indica uma altura válida em centímetros.');
      return;
    }

    const profileId = 'user_profile';
    const profile: UserProfile = {
      id: profileId,
      name: name.trim(),
      age: parsedAge,
      heightCm: parsedHeight,
      initialWeightKg: parsedInitialWeight,
      goalWeightKg: parsedGoalWeight,
      startDate: startDate || getTodayDateString(),
      activityLevel,
      primaryGoal,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateProfile(profile);

    // If initial weight was provided, create the baseline assessment
    if (parsedInitialWeight && parsedInitialWeight > 0) {
      const initialAssessment: BodyAssessment = {
        id: 'initial_assessment_' + Date.now(),
        date: startDate || getTodayDateString(),
        weightKg: parsedInitialWeight,
        notes: 'Registo inicial do perfil',
        source: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveAssessment(initialAssessment);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-8 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-8 animate-in fade-in duration-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
              Bem-vinda ao My Progress
            </h2>
            <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
              Configuração rápida para personalizar a tua jornada
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNext} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Como gostarias de ser chamada? *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Beatriz"
                required
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2.5 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ex: 26"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="Ex: 165"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Objetivo principal
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as PrimaryGoal)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2.5 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              >
                <option value="weight_loss">Perda de peso</option>
                <option value="weight_maintenance">Manutenção do peso</option>
                <option value="weight_gain">Aumento de massa / peso</option>
                <option value="measurements">Acompanhamento de medidas</option>
                <option value="body_composition">Composição corporal</option>
                <option value="habits_fitness">Hábitos e condição física</option>
              </select>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#817782] dark:text-[#A69AA8] hover:underline"
              >
                Configurar mais tarde
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2.5 text-sm font-semibold transition"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                  Peso Inicial (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  value={initialWeightKg}
                  onChange={(e) => setInitialWeightKg(e.target.value)}
                  placeholder="Ex: 68.5"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2.5 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
                <span className="text-[11px] text-[#817782] dark:text-[#A69AA8]">
                  Servirá de referência histórica.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                  Peso Objetivo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  value={goalWeightKg}
                  onChange={(e) => setGoalWeightKg(e.target.value)}
                  placeholder="Ex: 60.0"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2.5 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
                <span className="text-[11px] text-[#817782] dark:text-[#A69AA8]">
                  Opcional, editável a qualquer altura.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Nível de Atividade
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                >
                  <option value="sedentary">Sedentário</option>
                  <option value="lightly_active">Ligeiramente ativo</option>
                  <option value="moderately_active">Moderadamente ativo</option>
                  <option value="very_active">Muito ativo</option>
                  <option value="extremely_active">Extremamente ativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Notas / Motivação Pessoal (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Quero sentir-me com mais energia, saudável e confiante..."
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#817782] dark:text-[#A69AA8] hover:underline"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-6 py-2.5 text-sm font-semibold shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>Começar Jornada</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
