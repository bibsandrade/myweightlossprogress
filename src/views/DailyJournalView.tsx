import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Droplet,
  Utensils,
  Dumbbell,
  Moon,
  Smile,
  Award,
  Target,
  Heart,
  Syringe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatDateLongPt,
  formatMl,
  formatWeight,
  getTodayDateString,
} from '../utils/formatters';
import { calculateDailyMealTotals } from '../services/calculations';

interface Props {
  onOpenDailyModalWithDate: (date: string) => void;
  onOpenMealModalWithDate?: (date: string) => void;
}

export const DailyJournalView: React.FC<Props> = ({
  onOpenDailyModalWithDate,
  onOpenMealModalWithDate,
}) => {
  const { dailyEntries, preferences, saveDailyEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const currentEntry = dailyEntries.find((d) => d.date === selectedDate);
  const quickWater = preferences.quickWaterAmounts || [150, 250, 330, 500];

  const changeDateBy = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);

    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleQuickAddWater = async (amount: number) => {
    const existing = currentEntry;
    if (existing) {
      await saveDailyEntry({
        ...existing,
        waterMl: (existing.waterMl || 0) + amount,
      });
    } else {
      await saveDailyEntry({
        id: 'daily_' + Date.now(),
        date: selectedDate,
        waterMl: amount,
        meals: [],
        exercises: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const mealTotals = currentEntry ? calculateDailyMealTotals(currentEntry.meals || []) : { totalCalories: 0, totalProtein: 0 };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Diário Diário
          </h1>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
            Acompanhamento diário de refeições, hidratação, hábitos e bem-estar
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-[#1F1721] p-1.5 rounded-2xl border border-[#F2BFD3]/40 dark:border-[#362A36] shadow-xs">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1.5 rounded-xl hover:bg-[#F8DCE8]/30 dark:hover:bg-[#2D1E2B] text-[#817782]"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] px-2 py-1 focus:outline-hidden"
          />
          <button
            onClick={() => setSelectedDate(getTodayDateString())}
            className="text-[11px] font-medium text-[#C86D93] hover:underline px-1"
          >
            Hoje
          </button>
          <button
            onClick={() => changeDateBy(1)}
            className="p-1.5 rounded-xl hover:bg-[#F8DCE8]/30 dark:hover:bg-[#2D1E2B] text-[#817782]"
            title="Dia seguinte"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#F8DCE8]/60 to-[#FFF8FB] dark:from-[#2D1E2B]/50 dark:to-[#1F1721] border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#1F1721] text-[#C86D93] shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#817782] dark:text-[#A69AA8] block">
              Registo de
            </span>
            <span className="text-sm sm:text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
              {formatDateLongPt(selectedDate)}
            </span>
          </div>
        </div>

        <button
          onClick={() => onOpenDailyModalWithDate(selectedDate)}
          className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
        >
          {currentEntry ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{currentEntry ? 'Editar Diário' : 'Criar Registo'}</span>
        </button>
      </div>

      {/* QUICK WATER LOG CARD */}
      <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-500">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                Hidratação do Dia
              </span>
              <span className="block text-[11px] text-[#817782]">
                Total consumido: <strong className="text-sky-600 font-bold">{formatMl(currentEntry?.waterMl || 0)}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {quickWater.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAddWater(amount)}
                className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-2.5 py-1 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8] dark:hover:bg-[#2D1E2B] transition"
              >
                +{amount}ml
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DAY CONTENT IF LOGGED, OR EMPTY STATE */}
      {!currentEntry ? (
        <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-8 sm:p-12 text-center border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <Utensils className="w-10 h-10 text-[#C86D93] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5] mb-1">
            Sem registo para este dia
          </h3>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] max-w-sm mx-auto mb-5">
            Gostarias de registar o que comeste, a atividade física, o sono e como te sentiste hoje?
          </p>
          <button
            onClick={() => onOpenDailyModalWithDate(selectedDate)}
            className="rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition"
          >
            Preencher Diário deste Dia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Weight of the day if logged */}
          {currentEntry.weightKg && (
            <div className="p-3.5 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36] flex items-center justify-between text-xs">
              <span className="text-[#817782] dark:text-[#A69AA8]">Peso registado no diário:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {formatWeight(currentEntry.weightKg)}
              </span>
            </div>
          )}

          {/* Meals summary */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#C86D93]" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Refeições ({currentEntry.meals?.length || 0})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs">
                  <span className="text-[#817782] dark:text-[#A69AA8]">
                    Total: <strong className="text-[#39313A] dark:text-[#F7EFF5]">{mealTotals.totalCalories} kcal</strong>
                  </span>
                  <span className="mx-2 text-[#817782]">·</span>
                  <span className="text-[#817782] dark:text-[#A69AA8]">
                    Proteína: <strong className="text-[#39313A] dark:text-[#F7EFF5]">{mealTotals.totalProtein} g</strong>
                  </span>
                </div>
                {onOpenMealModalWithDate && (
                  <button
                    onClick={() => onOpenMealModalWithDate(selectedDate)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white text-[11px] font-semibold transition shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Refeição</span>
                  </button>
                )}
              </div>
            </div>

            {(!currentEntry.meals || currentEntry.meals.length === 0) ? (
              <div className="py-4 text-center text-xs text-[#817782] dark:text-[#A69AA8] bg-[#FFF8FB] dark:bg-[#140F15] rounded-xl border border-dashed border-[#F2BFD3]/50 dark:border-[#362A36]">
                Nenhuma refeição detalhada para este dia.{' '}
                {onOpenMealModalWithDate && (
                  <button
                    onClick={() => onOpenMealModalWithDate(selectedDate)}
                    className="text-[#C86D93] font-semibold underline ml-1"
                  >
                    Registar alimentação
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentEntry.meals.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36]"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5]">
                        {m.name}
                      </span>
                      {m.time && <span className="text-[10px] text-[#817782]">{m.time}</span>}
                    </div>
                    {m.foods && (
                      <p className="text-xs text-[#817782] dark:text-[#A69AA8] mb-1.5">
                        {m.foods}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-[#C86D93]">
                      {m.caloriesKcal !== undefined && <span>{m.caloriesKcal} kcal</span>}
                      {m.proteinGrams !== undefined && <span>{m.proteinGrams}g prot.</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exercise & Sleep Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercises */}
            <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Atividade Física
                </span>
              </div>
              {(!currentEntry.exercises || currentEntry.exercises.length === 0) ? (
                <p className="text-xs text-[#817782]">Sem exercício registado.</p>
              ) : (
                <div className="space-y-2">
                  {currentEntry.exercises.map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#39313A] dark:text-[#F7EFF5] block">
                          {e.type}
                        </span>
                        <span className="text-[10px] text-[#817782]">
                          Intensidade: {e.intensity || 'moderada'}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {e.durationMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sleep */}
            <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Sono & Descanso
                </span>
              </div>
              {currentEntry.sleep?.durationHours !== undefined ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#817782] dark:text-[#A69AA8]">Duração calculada:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {currentEntry.sleep.durationHours} horas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#817782] dark:text-[#A69AA8]">Horário:</span>
                    <span className="font-medium text-[#39313A] dark:text-[#F7EFF5]">
                      {currentEntry.sleep.bedTime || '—'} às {currentEntry.sleep.wakeTime || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#817782] dark:text-[#A69AA8]">Qualidade:</span>
                    <span className="font-bold text-[#C86D93]">
                      {'⭐'.repeat(currentEntry.sleep.quality || 3)} ({currentEntry.sleep.quality}/5)
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#817782]">Sem dados de sono registados.</p>
              )}
            </div>
          </div>

          {/* Sensações 1-5 Grid */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-[#C86D93]" />
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                Sensações do Dia
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              {[
                { label: 'Humor', val: currentEntry.mood },
                { label: 'Energia', val: currentEntry.energy },
                { label: 'Fome', val: currentEntry.hunger },
                { label: 'Saciedade', val: currentEntry.satiety },
                { label: 'Stress', val: currentEntry.stress },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2.5 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/20"
                >
                  <span className="text-[10px] text-[#817782] dark:text-[#A69AA8] block mb-1">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-[#C86D93]">
                    {item.val ? `${item.val}/5` : '—'}
                  </span>
                </div>
              ))}
            </div>

            {currentEntry.bingeEpisode && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-semibold block mb-0.5">Momento de descontrolo alimentar registado:</span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {currentEntry.bingeNotes || 'Sem notas adicionais. Lembra-te de manter a gentileza contigo própria.'}
                </p>
              </div>
            )}
          </div>

          {/* Mounjaro treatment for this day */}
          {currentEntry.mounjaro && (
            <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                <Syringe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Tratamento Mounjaro do Dia</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#817782] dark:text-[#A69AA8]">
                {currentEntry.mounjaro.tookInjection && (
                  <div className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-300">
                    <span>💉 Dose administrada: {currentEntry.mounjaro.injectionDetails?.doseMg || '—'} mg</span>
                    <span>({currentEntry.mounjaro.injectionDetails?.site || 'local da picada'})</span>
                  </div>
                )}
                {currentEntry.mounjaro.symptoms && (
                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                    {currentEntry.mounjaro.symptoms.nausea !== undefined && currentEntry.mounjaro.symptoms.nausea > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F8DCE8] text-[#C86D93]">
                        Náuseas: {currentEntry.mounjaro.symptoms.nausea}/5
                      </span>
                    )}
                    {currentEntry.mounjaro.symptoms.earlySatiety !== undefined && currentEntry.mounjaro.symptoms.earlySatiety > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                        Saciedade: {currentEntry.mounjaro.symptoms.earlySatiety}/5
                      </span>
                    )}
                    {currentEntry.mounjaro.symptoms.fatigue !== undefined && currentEntry.mounjaro.symptoms.fatigue > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                        Fadiga: {currentEntry.mounjaro.symptoms.fatigue}/5
                      </span>
                    )}
                    {currentEntry.mounjaro.symptoms.acidReflux !== undefined && currentEntry.mounjaro.symptoms.acidReflux > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                        Azia: {currentEntry.mounjaro.symptoms.acidReflux}/5
                      </span>
                    )}
                    {currentEntry.mounjaro.symptoms.constipation !== undefined && currentEntry.mounjaro.symptoms.constipation > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                        Obstipação: {currentEntry.mounjaro.symptoms.constipation}/5
                      </span>
                    )}
                  </div>
                )}
                {currentEntry.mounjaro.symptoms?.notes && (
                  <p className="text-[11px] text-[#39313A] dark:text-[#F7EFF5] mt-1">
                    "{currentEntry.mounjaro.symptoms.notes}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Menstrual data if any */}
          {currentEntry.menstrualData && (
            <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#E99AB9]" />
                <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                  Ciclo Menstrual
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#817782] dark:text-[#A69AA8]">
                {currentEntry.menstrualData.isPeriodStart && <span>• Início do período</span>}
                {currentEntry.menstrualData.isPeriodEnd && <span>• Fim do período</span>}
                {currentEntry.menstrualData.flow && (
                  <span>• Fluxo: {currentEntry.menstrualData.flow}</span>
                )}
                {currentEntry.menstrualData.waterRetentionPerceived && (
                  <span>• Retenção hídrica percetível</span>
                )}
                {currentEntry.menstrualData.notes && (
                  <span className="w-full text-[11px] text-[#39313A] dark:text-[#F7EFF5] mt-1">
                    Notas: {currentEntry.menstrualData.notes}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Achievements & Tomorrow Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentEntry.achievements && (
              <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#C86D93]">
                  <Award className="w-4 h-4" />
                  <span>Vitórias do Dia</span>
                </div>
                <p className="text-xs text-[#39313A] dark:text-[#F7EFF5] leading-relaxed">
                  {currentEntry.achievements}
                </p>
              </div>
            )}

            {currentEntry.tomorrowGoals && (
              <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#C86D93]">
                  <Target className="w-4 h-4" />
                  <span>Metas para Amanhã</span>
                </div>
                <p className="text-xs text-[#39313A] dark:text-[#F7EFF5] leading-relaxed">
                  {currentEntry.tomorrowGoals}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
