import React, { useState, useEffect } from 'react';
import { X, Check, Activity, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MounjaroSymptomsRating } from '../types';
import { getTodayDateString, formatDateLongPt } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
}

export const MounjaroSymptomsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  date: initialDate,
}) => {
  const { dailyEntries, mounjaroInjections, saveDailyEntry } = useApp();

  const [date, setDate] = useState(initialDate || getTodayDateString());

  // Symptoms 0 - 5
  const [nausea, setNausea] = useState<number>(0);
  const [earlySatiety, setEarlySatiety] = useState<number>(0);
  const [fatigue, setFatigue] = useState<number>(0);
  const [acidReflux, setAcidReflux] = useState<number>(0);
  const [constipation, setConstipation] = useState<number>(0);
  const [diarrhea, setDiarrhea] = useState<number>(0);
  const [headache, setHeadache] = useState<number>(0);
  const [abdominalPain, setAbdominalPain] = useState<number>(0);
  const [siteReaction, setSiteReaction] = useState<number>(0);
  const [burping, setBurping] = useState<number>(0);
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [customRating, setCustomRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const targetDate = initialDate || getTodayDateString();
    setDate(targetDate);

    const existing = dailyEntries.find((d) => d.date === targetDate);
    const sym = existing?.mounjaro?.symptoms;
    if (sym) {
      setNausea(sym.nausea || 0);
      setEarlySatiety(sym.earlySatiety || 0);
      setFatigue(sym.fatigue || 0);
      setAcidReflux(sym.acidReflux || 0);
      setConstipation(sym.constipation || 0);
      setDiarrhea(sym.diarrhea || 0);
      setHeadache(sym.headache || 0);
      setAbdominalPain(sym.abdominalPain || 0);
      setSiteReaction(sym.siteReaction || 0);
      setBurping(sym.burping || 0);
      setCustomSymptom(sym.customSymptom || '');
      setCustomRating(sym.customSymptomRating || 0);
      setNotes(sym.notes || '');
    } else {
      setNausea(0);
      setEarlySatiety(0);
      setFatigue(0);
      setAcidReflux(0);
      setConstipation(0);
      setDiarrhea(0);
      setHeadache(0);
      setAbdominalPain(0);
      setSiteReaction(0);
      setBurping(0);
      setCustomSymptom('');
      setCustomRating(0);
      setNotes('');
    }
  }, [initialDate, isOpen, dailyEntries]);

  if (!isOpen) return null;

  // Calculate day of cycle relative to latest injection on or prior to this date
  const pastInjections = mounjaroInjections.filter((inj) => inj.date <= date);
  const latestInjection = pastInjections.length > 0 ? pastInjections[0] : null;

  let daysSinceInjection: number | null = null;
  if (latestInjection) {
    const d1 = new Date(latestInjection.date + 'T00:00:00');
    const d2 = new Date(date + 'T00:00:00');
    const diffTime = d2.getTime() - d1.getTime();
    daysSinceInjection = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const symptomsRating: MounjaroSymptomsRating = {
      nausea,
      earlySatiety,
      fatigue,
      acidReflux,
      constipation,
      diarrhea,
      headache,
      abdominalPain,
      siteReaction,
      burping,
      customSymptom: customSymptom.trim() || undefined,
      customSymptomRating: customSymptom.trim() ? customRating : undefined,
      notes: notes.trim() || undefined,
    };

    const existing = dailyEntries.find((d) => d.date === date);

    if (existing) {
      await saveDailyEntry({
        ...existing,
        mounjaro: {
          ...(existing.mounjaro || {}),
          symptoms: symptomsRating,
        },
      });
    } else {
      await saveDailyEntry({
        id: 'daily_' + Date.now(),
        date,
        waterMl: 0,
        meals: [],
        exercises: [],
        mounjaro: {
          symptoms: symptomsRating,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    onClose();
  };

  const symptomList = [
    { label: 'Náuseas', val: nausea, set: setNausea },
    { label: 'Saciedade rápida / Sem apetite', val: earlySatiety, set: setEarlySatiety },
    { label: 'Fadiga / Cansaço', val: fatigue, set: setFatigue },
    { label: 'Azia / Refluxo gástrico', val: acidReflux, set: setAcidReflux },
    { label: 'Obstipação / Prisão de ventre', val: constipation, set: setConstipation },
    { label: 'Diarreia', val: diarrhea, set: setDiarrhea },
    { label: 'Dor de cabeça', val: headache, set: setHeadache },
    { label: 'Desconforto / Cólica abdominal', val: abdominalPain, set: setAbdominalPain },
    { label: 'Reação no local da injeção', val: siteReaction, set: setSiteReaction },
    { label: 'Eructação / Arrotos', val: burping, set: setBurping },
  ];

  const getRatingLabel = (num: number) => {
    switch (num) {
      case 0:
        return 'Nenhum';
      case 1:
        return 'Muito leve';
      case 2:
        return 'Leve';
      case 3:
        return 'Moderado';
      case 4:
        return 'Intenso';
      case 5:
        return 'Severo';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-8 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-6 max-h-[92vh] overflow-y-auto animate-in fade-in duration-150">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#39313A] dark:text-[#F7EFF5]">
                Classificar Sintomas do Mounjaro
              </h2>
              <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
                Acompanhamento dos efeitos secundários e adaptação ao tratamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date & Cycle Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] mb-5 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C86D93]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden"
            />
          </div>

          <div className="text-xs font-medium text-[#817782] dark:text-[#A69AA8]">
            {latestInjection ? (
              <span>
                Última dose ({latestInjection.doseMg}mg):{' '}
                <strong className="text-[#C86D93]">
                  {daysSinceInjection === 0
                    ? 'Dia da injeção'
                    : `Dia ${daysSinceInjection} após injeção`}
                </strong>
              </span>
            ) : (
              <span>Sem injeções anteriores registadas</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Symptoms grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {symptomList.map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36]"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                    {item.label}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      item.val === 0
                        ? 'text-gray-400'
                        : item.val <= 2
                        ? 'text-emerald-600'
                        : item.val === 3
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {getRatingLabel(item.val)} ({item.val}/5)
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => item.set(level)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        item.val === level
                          ? level === 0
                            ? 'bg-gray-200 dark:bg-gray-700 text-[#39313A] dark:text-white shadow-xs'
                            : level <= 2
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : level === 3
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1F1721] text-[#817782] border border-[#F2BFD3]/50 dark:border-[#362A36]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Symptom */}
          <div className="p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36]">
            <span className="text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] block mb-2">
              Outro sintoma específico (opcional)
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Ex: Tonturas ligeiras, sonolência..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                className="flex-1 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-1.5 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCustomRating(lvl)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                      customRating === lvl
                        ? 'bg-[#E99AB9] text-white shadow-xs'
                        : 'bg-white dark:bg-[#1F1721] text-[#817782] border border-[#F2BFD3]/50 dark:border-[#362A36]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
              Notas adicionais sobre como te sentiste hoje
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: No segundo dia a saciedade foi muito forte, consegui tolerar bem a refeição com bastante água..."
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#F2BFD3]/30 dark:border-[#362A36]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2 text-xs font-semibold shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Sintomas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
