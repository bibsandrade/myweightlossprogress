import React, { useState, useEffect } from 'react';
import { X, Check, Utensils, Clock, Flame, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyEntry, Meal } from '../types';
import { getTodayDateString } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const MealEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { dailyEntries, saveDailyEntry } = useApp();

  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [mealType, setMealType] = useState('Almoço');
  const [customName, setCustomName] = useState('');
  const [time, setTime] = useState('13:00');
  const [foods, setFoods] = useState('');
  const [caloriesKcal, setCaloriesKcal] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || getTodayDateString());
      // Set sensible default time based on current hour
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour < 10) {
        setMealType('Pequeno-almoço');
        setTime('08:30');
      } else if (currentHour < 12) {
        setMealType('Lanche da manhã');
        setTime('10:30');
      } else if (currentHour < 15) {
        setMealType('Almoço');
        setTime('13:00');
      } else if (currentHour < 18) {
        setMealType('Lanche da tarde');
        setTime('16:30');
      } else if (currentHour < 22) {
        setMealType('Jantar');
        setTime('20:00');
      } else {
        setMealType('Ceia');
        setTime('22:30');
      }
      setCustomName('');
      setFoods('');
      setCaloriesKcal('');
      setProteinGrams('');
      setNotes('');
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const presetMeals = [
    { label: 'Pequeno-almoço', defaultTime: '08:30' },
    { label: 'Almoço', defaultTime: '13:00' },
    { label: 'Lanche', defaultTime: '16:30' },
    { label: 'Jantar', defaultTime: '20:00' },
    { label: 'Ceia', defaultTime: '22:30' },
    { label: 'Snack / Outro', defaultTime: '11:00' },
  ];

  const handleSelectPreset = (preset: { label: string; defaultTime: string }) => {
    setMealType(preset.label);
    setTime(preset.defaultTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalName = mealType === 'Snack / Outro' && customName.trim() ? customName.trim() : mealType;

      const newMeal: Meal = {
        id: 'meal_' + Date.now() + Math.random().toString(36).substring(2, 6),
        name: finalName,
        time: time || undefined,
        foods: foods.trim() || undefined,
        caloriesKcal: caloriesKcal ? Number(caloriesKcal) : undefined,
        proteinGrams: proteinGrams ? Number(proteinGrams) : undefined,
        notes: notes.trim() || undefined,
      };

      const existingEntry = dailyEntries.find((d) => d.date === date);

      if (existingEntry) {
        const updatedEntry: DailyEntry = {
          ...existingEntry,
          meals: [...(existingEntry.meals || []), newMeal],
          updatedAt: new Date().toISOString(),
        };
        await saveDailyEntry(updatedEntry);
      } else {
        const newEntry: DailyEntry = {
          id: 'daily_' + Date.now(),
          date,
          waterMl: 0,
          meals: [newMeal],
          exercises: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveDailyEntry(newEntry);
      }

      onClose();
    } catch (err) {
      console.error('Erro ao registar alimentação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-6 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-[#F2BFD3]/30 dark:border-[#362A36]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
                Registo de Alimentação
              </h2>
              <p className="text-[11px] text-[#817782] dark:text-[#A69AA8]">
                Adiciona refeições, alimentos consumidos e nutrientes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Data & Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Data do Registo
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                  required
                />
                <Calendar className="w-3.5 h-3.5 absolute right-3 top-3 text-[#817782] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Horário da Refeição
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
                <Clock className="w-3.5 h-3.5 absolute right-3 top-3 text-[#817782] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tipo de Refeição */}
          <div>
            <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1.5">
              Tipo de Refeição
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {presetMeals.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center truncate ${
                    mealType === preset.label
                      ? 'border-[#C86D93] bg-[#F8DCE8]/50 dark:bg-[#2D1E2B] text-[#C86D93] dark:text-[#E99AB9]'
                      : 'border-[#F2BFD3]/40 dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] text-[#817782] dark:text-[#A69AA8] hover:border-[#E99AB9]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {mealType === 'Snack / Outro' && (
              <input
                type="text"
                placeholder="Nome personalizado (ex: Fruta da tarde, Batido de proteína)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            )}
          </div>

          {/* Alimentos Consumidos */}
          <div>
            <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
              Alimentos Consumidos & Quantidades
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Peito de frango grelhado (150g), salada verde com azeite, 3 colheres de arroz integral e 1 maçã..."
              value={foods}
              onChange={(e) => setFoods(e.target.value)}
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9] resize-none"
              required
            />
          </div>

          {/* Informação Nutricional Opcional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Calorias Estimadas (kcal)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 450"
                  value={caloriesKcal}
                  onChange={(e) => setCaloriesKcal(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
                <Flame className="w-3.5 h-3.5 absolute right-3 top-3 text-[#817782] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Proteína Ingerida (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex: 35.0"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>
          </div>

          {/* Notas / Sensação */}
          <div>
            <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
              Notas & Sensação (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Saciedade rápida pelo Mounjaro; comi devagar; sem azia"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F2BFD3]/30 dark:border-[#362A36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#817782] hover:text-[#39313A] dark:hover:text-[#F7EFF5] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'A guardar...' : 'Guardar Refeição'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
