import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Droplet,
  Utensils,
  Dumbbell,
  Moon,
  Smile,
  Heart,
  ChevronDown,
  ChevronUp,
  Syringe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  DailyEntry,
  Meal,
  ExerciseEntry,
  ExerciseIntensity,
  InjectionSite,
  MounjaroInjection,
} from '../types';
import {
  calculateSleepDuration,
  calculateDailyMealTotals,
} from '../services/calculations';
import { getTodayDateString } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dateToEdit?: string;
}

export const DailyEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  dateToEdit,
}) => {
  const {
    dailyEntries,
    preferences,
    saveDailyEntry,
    deleteDailyEntry,
    saveMounjaroInjection,
  } = useApp();

  const [date, setDate] = useState(dateToEdit || getTodayDateString());
  const [weightKg, setWeightKg] = useState('');
  const [waterMl, setWaterMl] = useState(0);

  // Meals
  const [meals, setMeals] = useState<Meal[]>([]);
  // Exercise
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  // Sleep
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:30');
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [sleepNotes, setSleepNotes] = useState('');

  // Scales 1 - 5
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [hunger, setHunger] = useState<number>(3);
  const [satiety, setSatiety] = useState<number>(3);
  const [stress, setStress] = useState<number>(2);

  // Mounjaro Treatment
  const [showMounjaro, setShowMounjaro] = useState(false);
  const [tookMounjaroToday, setTookMounjaroToday] = useState(false);
  const [mounjaroDose, setMounjaroDose] = useState<number>(2.5);
  const [mounjaroSite, setMounjaroSite] = useState<InjectionSite>('abdomen_direito');
  const [mounjaroNausea, setMounjaroNausea] = useState<number>(0);
  const [mounjaroEarlySatiety, setMounjaroEarlySatiety] = useState<number>(0);
  const [mounjaroFatigue, setMounjaroFatigue] = useState<number>(0);
  const [mounjaroReflux, setMounjaroReflux] = useState<number>(0);
  const [mounjaroConstipation, setMounjaroConstipation] = useState<number>(0);
  const [mounjaroNotes, setMounjaroNotes] = useState<string>('');

  // Binge / loss of control (private, non-judgmental)
  const [bingeEpisode, setBingeEpisode] = useState(false);
  const [bingeNotes, setBingeNotes] = useState('');

  // Menstrual cycle
  const [showMenstrual, setShowMenstrual] = useState(false);
  const [isPeriodStart, setIsPeriodStart] = useState(false);
  const [isPeriodEnd, setIsPeriodEnd] = useState(false);
  const [flow, setFlow] = useState<'leve' | 'moderado' | 'intenso'>('moderado');
  const [waterRetentionPerceived, setWaterRetentionPerceived] = useState(false);
  const [menstrualNotes, setMenstrualNotes] = useState('');

  // Reflection
  const [notes, setNotes] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tomorrowGoals, setTomorrowGoals] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Load existing entry for this date if present
  useEffect(() => {
    const targetDate = dateToEdit || getTodayDateString();
    setDate(targetDate);

    const found = dailyEntries.find((d) => d.date === targetDate);
    if (found) {
      setExistingId(found.id);
      setWeightKg(found.weightKg !== undefined ? String(found.weightKg) : '');
      setWaterMl(found.waterMl || 0);
      setMeals(found.meals || []);
      setExercises(found.exercises || []);
      setBedTime(found.sleep?.bedTime || '23:00');
      setWakeTime(found.sleep?.wakeTime || '07:30');
      setSleepQuality(found.sleep?.quality || 4);
      setSleepNotes(found.sleep?.notes || '');

      setMood(found.mood || 3);
      setEnergy(found.energy || 3);
      setHunger(found.hunger || 3);
      setSatiety(found.satiety || 3);
      setStress(found.stress || 2);

      // Mounjaro
      if (found.mounjaro) {
        setShowMounjaro(true);
        setTookMounjaroToday(!!found.mounjaro.tookInjection);
        if (found.mounjaro.injectionDetails) {
          setMounjaroDose(found.mounjaro.injectionDetails.doseMg || 2.5);
          setMounjaroSite(found.mounjaro.injectionDetails.site || 'abdomen_direito');
        }
        if (found.mounjaro.symptoms) {
          setMounjaroNausea(found.mounjaro.symptoms.nausea || 0);
          setMounjaroEarlySatiety(found.mounjaro.symptoms.earlySatiety || 0);
          setMounjaroFatigue(found.mounjaro.symptoms.fatigue || 0);
          setMounjaroReflux(found.mounjaro.symptoms.acidReflux || 0);
          setMounjaroConstipation(found.mounjaro.symptoms.constipation || 0);
          setMounjaroNotes(found.mounjaro.symptoms.notes || '');
        }
      } else {
        setShowMounjaro(false);
        setTookMounjaroToday(false);
        setMounjaroDose(2.5);
        setMounjaroSite('abdomen_direito');
        setMounjaroNausea(0);
        setMounjaroEarlySatiety(0);
        setMounjaroFatigue(0);
        setMounjaroReflux(0);
        setMounjaroConstipation(0);
        setMounjaroNotes('');
      }

      setBingeEpisode(!!found.bingeEpisode);
      setBingeNotes(found.bingeNotes || '');

      if (found.menstrualData) {
        setShowMenstrual(true);
        setIsPeriodStart(!!found.menstrualData.isPeriodStart);
        setIsPeriodEnd(!!found.menstrualData.isPeriodEnd);
        setFlow(found.menstrualData.flow || 'moderado');
        setWaterRetentionPerceived(!!found.menstrualData.waterRetentionPerceived);
        setMenstrualNotes(found.menstrualData.notes || '');
      } else {
        setShowMenstrual(false);
        setIsPeriodStart(false);
        setIsPeriodEnd(false);
        setFlow('moderado');
        setWaterRetentionPerceived(false);
        setMenstrualNotes('');
      }

      setNotes(found.notes || '');
      setAchievements(found.achievements || '');
      setChallenges(found.challenges || '');
      setTomorrowGoals(found.tomorrowGoals || '');
    } else {
      setExistingId(null);
      setWeightKg('');
      setWaterMl(0);
      setMeals([]);
      setExercises([]);
      setBedTime('23:00');
      setWakeTime('07:30');
      setSleepQuality(4);
      setSleepNotes('');
      setMood(3);
      setEnergy(3);
      setHunger(3);
      setSatiety(3);
      setStress(2);
      setShowMounjaro(false);
      setTookMounjaroToday(false);
      setMounjaroDose(2.5);
      setMounjaroSite('abdomen_direito');
      setMounjaroNausea(0);
      setMounjaroEarlySatiety(0);
      setMounjaroFatigue(0);
      setMounjaroReflux(0);
      setMounjaroConstipation(0);
      setMounjaroNotes('');
      setBingeEpisode(false);
      setBingeNotes('');
      setShowMenstrual(false);
      setNotes('');
      setAchievements('');
      setChallenges('');
      setTomorrowGoals('');
    }

    setError(null);
    setConfirmDelete(false);
  }, [dateToEdit, isOpen, dailyEntries]);

  if (!isOpen) return null;

  const quickWater = preferences.quickWaterAmounts || [150, 250, 330, 500];
  const mealTotals = calculateDailyMealTotals(meals);
  const sleepHours = calculateSleepDuration(bedTime, wakeTime);

  // Meal management
  const addMealWithName = (name: string, defaultTime: string = '12:30') => {
    const newMeal: Meal = {
      id: 'meal_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name,
      time: defaultTime,
      foods: '',
      caloriesKcal: undefined,
      proteinGrams: undefined,
    };
    setMeals((prev) => [...prev, newMeal]);
  };

  const addMeal = () => {
    const mealNames = ['Pequeno-almoço', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];
    const nextName = mealNames[meals.length % mealNames.length] || 'Refeição';
    addMealWithName(nextName);
  };

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  // Exercise management
  const addExercise = () => {
    const newEx: ExerciseEntry = {
      id: 'ex_' + Date.now() + Math.random().toString(36).substring(2, 6),
      type: 'Caminhada',
      durationMinutes: 30,
      intensity: 'moderada',
    };
    setExercises([...exercises, newEx]);
  };

  const updateExercise = (id: string, updates: Partial<ExerciseEntry>) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Por favor indica a data do diário.');
      return;
    }

    let parsedWeight: number | undefined = undefined;
    if (weightKg && weightKg.trim() !== '') {
      parsedWeight = parseFloat(weightKg.replace(',', '.'));
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        setError('O peso do dia deve ser um número válido.');
        return;
      }
    }

    const mounjaroLog =
      showMounjaro ||
      tookMounjaroToday ||
      mounjaroNausea > 0 ||
      mounjaroEarlySatiety > 0 ||
      mounjaroFatigue > 0 ||
      mounjaroReflux > 0 ||
      mounjaroConstipation > 0
        ? {
            tookInjection: tookMounjaroToday,
            injectionDetails: tookMounjaroToday
              ? {
                  doseMg: mounjaroDose,
                  site: mounjaroSite,
                }
              : undefined,
            symptoms: {
              nausea: mounjaroNausea,
              earlySatiety: mounjaroEarlySatiety,
              fatigue: mounjaroFatigue,
              acidReflux: mounjaroReflux,
              constipation: mounjaroConstipation,
              notes: mounjaroNotes.trim() || undefined,
            },
          }
        : undefined;

    const entry: DailyEntry = {
      id: existingId || 'daily_' + Date.now(),
      date,
      weightKg: parsedWeight,
      waterMl: Math.max(0, waterMl),
      meals,
      exercises,
      sleep: {
        bedTime,
        wakeTime,
        durationHours: sleepHours ?? undefined,
        quality: sleepQuality,
        notes: sleepNotes.trim() || undefined,
      },
      mood,
      energy,
      hunger,
      satiety,
      stress,
      bingeEpisode,
      bingeNotes: bingeEpisode ? bingeNotes.trim() || undefined : undefined,
      menstrualData: showMenstrual
        ? {
            isPeriodStart,
            isPeriodEnd,
            flow,
            waterRetentionPerceived,
            notes: menstrualNotes.trim() || undefined,
          }
        : undefined,
      mounjaro: mounjaroLog,
      notes: notes.trim() || undefined,
      achievements: achievements.trim() || undefined,
      challenges: challenges.trim() || undefined,
      tomorrowGoals: tomorrowGoals.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveDailyEntry(entry);

    if (tookMounjaroToday) {
      await saveMounjaroInjection({
        id: 'inj_' + Date.now(),
        date,
        doseMg: mounjaroDose,
        site: mounjaroSite,
        notes: mounjaroNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!existingId) return;
    await deleteDailyEntry(existingId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-8 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-6 max-h-[92vh] overflow-y-auto animate-in fade-in duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {existingId ? 'Editar Diário Diário' : 'Novo Registo no Diário'}
              </h2>
              <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
                Alimentação, água, sono, exercício e bem-estar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Header Row: Date & Optional Weight of day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Data do diário *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Peso do dia (kg, opcional)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ex: 63.8"
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>
          </div>

          {/* WATER TRACKER */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Consumo de Água
                </span>
              </div>
              <span className="text-sm font-bold text-[#C86D93] dark:text-[#E99AB9]">
                {waterMl >= 1000 ? `${(waterMl / 1000).toFixed(2)} L` : `${waterMl} ml`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {quickWater.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  onClick={() => setWaterMl((prev) => prev + amount)}
                  className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-1.5 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8] dark:hover:bg-[#2D1E2B] transition"
                >
                  +{amount} ml
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWaterMl(0)}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto"
              >
                Limpar água
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={waterMl}
                onChange={(e) => setWaterMl(Number(e.target.value))}
                className="w-full accent-[#E99AB9]"
              />
            </div>
          </div>

          {/* MEALS SECTION */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#C86D93]" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Alimentação & Refeições
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#817782] dark:text-[#A69AA8]">
                  Total: <strong className="text-[#39313A] dark:text-[#F7EFF5]">{mealTotals.totalCalories} kcal</strong>
                </span>
                <span className="text-[#817782] dark:text-[#A69AA8]">
                  Proteína: <strong className="text-[#39313A] dark:text-[#F7EFF5]">{mealTotals.totalProtein} g</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[11px] text-[#817782] dark:text-[#A69AA8]">Refeições rápidas:</span>
              {[
                { label: 'Pequeno-almoço', time: '08:00' },
                { label: 'Almoço', time: '13:00' },
                { label: 'Lanche', time: '16:30' },
                { label: 'Jantar', time: '20:00' },
                { label: 'Ceia', time: '22:30' },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => addMealWithName(preset.label, preset.time)}
                  className="px-2.5 py-1 rounded-xl border border-[#F2BFD3]/60 dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] text-[11px] font-medium text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/40 transition"
                >
                  + {preset.label}
                </button>
              ))}
            </div>

            {meals.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
                Nenhuma refeição adicionada hoje. Clica abaixo para registar.
              </div>
            ) : (
              <div className="space-y-3 mb-3">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36]"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nome (Ex: Almoço)"
                        value={meal.name}
                        onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                        className="rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                      />
                      <input
                        type="time"
                        value={meal.time || ''}
                        onChange={(e) => updateMeal(meal.id, { time: e.target.value })}
                        className="rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Calorias (kcal)"
                        value={meal.caloriesKcal ?? ''}
                        onChange={(e) =>
                          updateMeal(meal.id, {
                            caloriesKcal: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Proteína (g)"
                          value={meal.proteinGrams ?? ''}
                          onChange={(e) =>
                            updateMeal(meal.id, {
                              proteinGrams: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                        />
                        <button
                          type="button"
                          onClick={() => removeMeal(meal.id)}
                          className="p-1 text-gray-400 hover:text-rose-500"
                          title="Remover refeição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Alimentos consumidos (opcional: Ex: Peito de frango grelhado, salada e arroz basmati)"
                      value={meal.foods || ''}
                      onChange={(e) => updateMeal(meal.id, { foods: e.target.value })}
                      className="w-full rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addMeal}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#F2BFD3] dark:border-[#362A36] px-3 py-1.5 text-xs font-medium text-[#C86D93] hover:bg-[#F8DCE8]/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Refeição</span>
            </button>
          </div>

          {/* EXERCISE SECTION */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Atividade Física
                </span>
              </div>
            </div>

            {exercises.length === 0 ? (
              <div className="py-3 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
                Sem exercícios registados para este dia.
              </div>
            ) : (
              <div className="space-y-3 mb-3">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36]"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Atividade (Ex: Pilates)"
                        value={ex.type}
                        onChange={(e) => updateExercise(ex.id, { type: e.target.value })}
                        className="rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Duração (min)"
                        value={ex.durationMinutes}
                        onChange={(e) =>
                          updateExercise(ex.id, { durationMinutes: Number(e.target.value) || 0 })
                        }
                        className="rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                      />
                      <select
                        value={ex.intensity || 'moderada'}
                        onChange={(e) =>
                          updateExercise(ex.id, { intensity: e.target.value as ExerciseIntensity })
                        }
                        className="rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                      >
                        <option value="baixa">Intensidade baixa</option>
                        <option value="moderada">Intensidade moderada</option>
                        <option value="alta">Intensidade alta</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Passos (opcional)"
                          value={ex.steps ?? ''}
                          onChange={(e) =>
                            updateExercise(ex.id, {
                              steps: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-2.5 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                        />
                        <button
                          type="button"
                          onClick={() => removeExercise(ex.id)}
                          className="p-1 text-gray-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addExercise}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#F2BFD3] dark:border-[#362A36] px-3 py-1.5 text-xs font-medium text-[#C86D93] hover:bg-[#F8DCE8]/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Exercício</span>
            </button>
          </div>

          {/* SLEEP SECTION */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Sono & Descanso
                </span>
              </div>
              {sleepHours !== null && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Duração calculada: {sleepHours} horas
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Hora de deitar
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Hora de acordar
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Qualidade do sono (1 a 5)
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        sleepQuality >= star
                          ? 'bg-[#E99AB9] text-white shadow-xs'
                          : 'bg-[#FFF8FB] dark:bg-[#140F15] text-[#817782] border border-[#F2BFD3] dark:border-[#362A36]'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MOOD & BODY SCALES (1-5) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-[#C86D93]" />
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                Sensações e Bem-Estar Diário (Escala 1 a 5)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Humor', val: mood, setVal: setMood, minTxt: 'Em baixo', maxTxt: 'Radiante' },
                { label: 'Energia', val: energy, setVal: setEnergy, minTxt: 'Exausta', maxTxt: 'Com vitalidade' },
                { label: 'Fome', val: hunger, setVal: setHunger, minTxt: 'Pouca fome', maxTxt: 'Muita fome' },
                { label: 'Saciedade', val: satiety, setVal: setSatiety, minTxt: 'Insatisfeita', maxTxt: 'Saciada' },
                { label: 'Stress', val: stress, setVal: setStress, minTxt: 'Tranquila', maxTxt: 'Elevado' },
              ].map((item) => (
                <div key={item.label} className="p-2.5 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
                  <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                    <span>{item.label}</span>
                    <span className="text-[#C86D93] font-bold">{item.val} / 5</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => item.setVal(lvl)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                          item.val === lvl
                            ? 'bg-[#E99AB9] text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-[#1F1721] text-[#817782] border border-[#F2BFD3]/60 dark:border-[#362A36]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#817782]">
                    <span>{item.minTxt}</span>
                    <span>{item.maxTxt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Non-judgmental eating reflection */}
            <div className="mt-4 pt-3 border-t border-[#F2BFD3]/20 dark:border-[#362A36]">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#817782] dark:text-[#A69AA8]">
                <input
                  type="checkbox"
                  checked={bingeEpisode}
                  onChange={(e) => setBingeEpisode(e.target.checked)}
                  className="rounded-sm text-[#E99AB9] focus:ring-[#E99AB9]"
                />
                <span>Houve algum momento de descontrolo alimentar? (Registo gentil para autoconhecimento)</span>
              </label>

              {bingeEpisode && (
                <div className="mt-2 pl-5">
                  <input
                    type="text"
                    value={bingeNotes}
                    onChange={(e) => setBingeNotes(e.target.value)}
                    placeholder="O que sentiste ou desencadeou o episódio? (Ex: cansaço no trabalho, restrição anterior...)"
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* MENSTRUAL CYCLE (OPTIONAL) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <button
              type="button"
              onClick={() => setShowMenstrual(!showMenstrual)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#E99AB9]" />
                <span>Ciclo Menstrual (Privado & Opcional)</span>
              </div>
              {showMenstrual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMenstrual && (
              <div className="mt-3 space-y-3 pt-2 border-t border-[#F2BFD3]/20 dark:border-[#362A36]">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPeriodStart}
                      onChange={(e) => setIsPeriodStart(e.target.checked)}
                      className="rounded-sm text-[#E99AB9]"
                    />
                    <span>Início do período</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPeriodEnd}
                      onChange={(e) => setIsPeriodEnd(e.target.checked)}
                      className="rounded-sm text-[#E99AB9]"
                    />
                    <span>Fim do período</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waterRetentionPerceived}
                      onChange={(e) => setWaterRetentionPerceived(e.target.checked)}
                      className="rounded-sm text-[#E99AB9]"
                    />
                    <span>Retenção hídrica percetível</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#817782] mb-1">
                      Intensidade do fluxo
                    </label>
                    <select
                      value={flow}
                      onChange={(e) => setFlow(e.target.value as 'leve' | 'moderado' | 'intenso')}
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-1.5 text-xs"
                    >
                      <option value="leve">Leve</option>
                      <option value="moderado">Moderado</option>
                      <option value="intenso">Intenso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#817782] mb-1">
                      Sintomas ou observações
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: ligeiro inchaço abdominal, dores de cabeça..."
                      value={menstrualNotes}
                      onChange={(e) => setMenstrualNotes(e.target.value)}
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MOUNJARO TREATMENT TRACKING (OPTIONAL) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <button
              type="button"
              onClick={() => setShowMounjaro(!showMounjaro)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide"
            >
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-[#C86D93]" />
                <span>Tratamento Mounjaro (Dose & Sintomas)</span>
              </div>
              {showMounjaro ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMounjaro && (
              <div className="mt-3 space-y-4 pt-2 border-t border-[#F2BFD3]/20 dark:border-[#362A36]">
                {/* Took injection today? */}
                <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                    <input
                      type="checkbox"
                      checked={tookMounjaroToday}
                      onChange={(e) => setTookMounjaroToday(e.target.checked)}
                      className="rounded-sm text-[#E99AB9]"
                    />
                    <span>Tomei a injeção semanal de Mounjaro hoje! 💉</span>
                  </label>

                  {tookMounjaroToday && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2 border-t border-[#F2BFD3]/20">
                      <div>
                        <label className="block text-[11px] font-medium text-[#817782] mb-1">
                          Dose administrada
                        </label>
                        <select
                          value={mounjaroDose}
                          onChange={(e) => setMounjaroDose(parseFloat(e.target.value))}
                          className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                        >
                          <option value="2.5">2.5 mg</option>
                          <option value="5">5.0 mg</option>
                          <option value="7.5">7.5 mg</option>
                          <option value="10">10.0 mg</option>
                          <option value="12.5">12.5 mg</option>
                          <option value="15">15.0 mg</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#817782] mb-1">
                          Local da aplicação
                        </label>
                        <select
                          value={mounjaroSite}
                          onChange={(e) => setMounjaroSite(e.target.value as InjectionSite)}
                          className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                        >
                          <option value="abdomen_direito">Abdómen Direito</option>
                          <option value="abdomen_esquerdo">Abdómen Esquerdo</option>
                          <option value="coxa_direita">Coxa Direita</option>
                          <option value="coxa_esquerda">Coxa Esquerda</option>
                          <option value="braco_direito">Braço Direito</option>
                          <option value="braco_esquerdo">Braço Esquerdo</option>
                          <option value="outro">Outro local</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating main symptoms today */}
                <div>
                  <span className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-2">
                    Classificar sintomas sentidos hoje (0 a 5)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { label: 'Náuseas', val: mounjaroNausea, set: setMounjaroNausea },
                      { label: 'Saciedade / Falta de fome', val: mounjaroEarlySatiety, set: setMounjaroEarlySatiety },
                      { label: 'Fadiga', val: mounjaroFatigue, set: setMounjaroFatigue },
                      { label: 'Azia / Refluxo', val: mounjaroReflux, set: setMounjaroReflux },
                      { label: 'Obstipação', val: mounjaroConstipation, set: setMounjaroConstipation },
                    ].map((item) => (
                      <div key={item.label} className="p-2 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-semibold">
                          <span className="truncate">{item.label}</span>
                          <span className="text-[#C86D93]">{item.val}/5</span>
                        </div>
                        <div className="flex items-center justify-between gap-0.5">
                          {[0, 1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => item.set(lvl)}
                              className={`w-5 h-5 rounded-md text-[10px] font-medium ${
                                item.val === lvl
                                  ? 'bg-[#E99AB9] text-white font-bold'
                                  : 'bg-white dark:bg-[#1F1721] text-[#817782] border border-[#F2BFD3]/50 dark:border-[#362A36]'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#817782] mb-1">
                    Notas sobre o Mounjaro hoje
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Muita saciedade na hora do almoço, bebi 2.5L de água e sem náuseas..."
                    value={mounjaroNotes}
                    onChange={(e) => setMounjaroNotes(e.target.value)}
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* REFLECTIONS, ACHIEVEMENTS & NOTES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Pequenas vitórias do dia ⭐
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Ex: Consegui beber 2L de água e fiz a caminhada..."
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Objetivos para amanhã 🎯
              </label>
              <textarea
                rows={2}
                value={tomorrowGoals}
                onChange={(e) => setTomorrowGoals(e.target.value)}
                placeholder="Ex: Preparar lanche saudável com antecedência..."
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F2BFD3]/30 dark:border-[#362A36]">
            {existingId ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 font-medium">Eliminar diário deste dia?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-xl bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-rose-700 transition"
                  >
                    Sim, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 transition py-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar diário</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2 text-xs font-semibold shadow-sm transition"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Diário</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
