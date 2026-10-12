import React, { useState } from 'react';
import {
  Syringe,
  Activity,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MounjaroInjection, InjectionSite } from '../types';
import {
  formatDatePt,
  formatDateLongPt,
  getTodayDateString,
  formatNumber,
} from '../utils/formatters';

interface Props {
  onOpenInjectionModal: (injection?: MounjaroInjection) => void;
  onOpenSymptomsModal: (date?: string) => void;
}

export const MounjaroView: React.FC<Props> = ({
  onOpenInjectionModal,
  onOpenSymptomsModal,
}) => {
  const { mounjaroInjections, dailyEntries, deleteMounjaroInjection } = useApp();

  const [filterPeriod, setFilterPeriod] = useState<'current' | 'all'>('current');

  const latestInjection = mounjaroInjections.length > 0 ? mounjaroInjections[0] : null;

  // Calculate days since latest injection
  let daysSinceInjection: number | null = null;
  let nextInjectionDate: string | null = null;
  let cycleDay = 1;

  if (latestInjection) {
    const todayStr = getTodayDateString();
    const d1 = new Date(latestInjection.date + 'T00:00:00');
    const d2 = new Date(todayStr + 'T00:00:00');
    const diffTime = d2.getTime() - d1.getTime();
    daysSinceInjection = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    cycleDay = daysSinceInjection >= 0 ? (daysSinceInjection % 7) + 1 : 1;

    // Next dose: 7 days after injection
    const nextDateObj = new Date(d1);
    nextDateObj.setDate(nextDateObj.getDate() + 7);
    const ny = nextDateObj.getFullYear();
    const nm = String(nextDateObj.getMonth() + 1).padStart(2, '0');
    const nd = String(nextDateObj.getDate()).padStart(2, '0');
    nextInjectionDate = `${ny}-${nm}-${nd}`;
  }

  const siteLabels: Record<InjectionSite, string> = {
    abdomen_direito: 'Abdómen Direito',
    abdomen_esquerdo: 'Abdómen Esquerdo',
    coxa_direita: 'Coxa Direita',
    coxa_esquerda: 'Coxa Esquerda',
    braco_direito: 'Braço Direito',
    braco_esquerdo: 'Braço Esquerdo',
    outro: 'Outro local',
  };

  // Recommended next injection rotation
  const getNextRotationSuggestion = (currentSite?: InjectionSite): string => {
    switch (currentSite) {
      case 'abdomen_direito':
        return 'Abdómen Esquerdo ou Coxa Direita';
      case 'abdomen_esquerdo':
        return 'Abdómen Direito ou Coxa Esquerda';
      case 'coxa_direita':
        return 'Coxa Esquerda ou Abdómen';
      case 'coxa_esquerda':
        return 'Coxa Direita ou Abdómen';
      case 'braco_direito':
        return 'Braço Esquerdo ou Abdómen';
      case 'braco_esquerdo':
        return 'Braço Direito ou Abdómen';
      default:
        return 'Alternar para outro quadrante';
    }
  };

  // Build the current 7-day cycle dates (starting from latestInjection.date)
  const currentWeekDays: { dateStr: string; dayIndex: number; formatted: string }[] = [];
  if (latestInjection) {
    const startDate = new Date(latestInjection.date + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dy = d.getFullYear();
      const dm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${dy}-${dm}-${dd}`;
      currentWeekDays.push({
        dateStr,
        dayIndex: i + 1,
        formatted: formatDatePt(dateStr),
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5] flex items-center gap-2">
            <span>Tratamento Mounjaro</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] font-semibold">
              Tirzepatida
            </span>
          </h1>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
            Acompanhamento semanal da dose, locais de injeção e classificação de sintomas
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenSymptomsModal()}
            className="flex items-center gap-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition"
          >
            <Activity className="w-3.5 h-3.5 text-[#C86D93]" />
            <span>+ Sintomas de Hoje</span>
          </button>

          <button
            onClick={() => onOpenInjectionModal()}
            className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>+ Registar Injeção</span>
          </button>
        </div>
      </div>

      {/* SUMMARY OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Dose Atual */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Dose Ativa
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Syringe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {latestInjection ? `${latestInjection.doseMg} mg` : '—'}
          </div>
          <div className="mt-2 text-[10px] text-[#817782] dark:text-[#A69AA8]">
            {latestInjection ? `Injetada a ${formatDatePt(latestInjection.date)}` : 'Sem dose registada'}
          </div>
        </div>

        {/* Card 2: Dia do Ciclo Semanal */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Ciclo Semanal
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {daysSinceInjection !== null
              ? daysSinceInjection === 0
                ? 'Dia da Dose'
                : `Dia ${daysSinceInjection + 1} de 7`
              : '—'}
          </div>
          <div className="mt-2 text-[10px] text-[#817782] dark:text-[#A69AA8]">
            {daysSinceInjection !== null
              ? daysSinceInjection < 7
                ? `${7 - daysSinceInjection} dias até à próxima`
                : 'Ciclo completo (dose devida)'
              : 'Regista a tua primeira dose'}
          </div>
        </div>

        {/* Card 3: Local da Injeção */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Última Aplicação
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#39313A] dark:text-[#F7EFF5] truncate">
            {latestInjection ? siteLabels[latestInjection.site] : '—'}
          </div>
          <div className="mt-2 text-[10px] text-[#817782] dark:text-[#A69AA8] truncate">
            Próxima rotação: {getNextRotationSuggestion(latestInjection?.site)}
          </div>
        </div>

        {/* Card 4: Próxima Injeção */}
        <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#817782] dark:text-[#A69AA8]">
              Próxima Dose
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#39313A] dark:text-[#F7EFF5]">
            {nextInjectionDate ? formatDatePt(nextInjectionDate) : '—'}
          </div>
          <div className="mt-2 text-[10px] text-[#817782] dark:text-[#A69AA8]">
            {daysSinceInjection !== null && daysSinceInjection >= 7 ? (
              <span className="text-rose-500 font-semibold">Dose recomendada hoje!</span>
            ) : (
              'Intervalo de 7 dias entre canetas'
            )}
          </div>
        </div>
      </div>

      {/* SINTOMAS DA SEMANA ATUAL (ACOMPANHAMENTO DIA A DIA) */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C86D93]" />
              <span>Acompanhamento de Sintomas durante a Semana</span>
            </h2>
            <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
              Classifica como te sentes em cada dia após a injeção para identificar padrões de adaptação
            </p>
          </div>

          <button
            onClick={() => onOpenSymptomsModal()}
            className="text-xs font-semibold text-[#C86D93] hover:underline self-start sm:self-auto"
          >
            + Avaliar dia de hoje
          </button>
        </div>

        {currentWeekDays.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
            Regista a tua primeira injeção de Mounjaro para iniciar o mapa semanal de sintomas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            {currentWeekDays.map((day) => {
              const entry = dailyEntries.find((d) => d.date === day.dateStr);
              const symptoms = entry?.mounjaro?.symptoms;
              const hasData = !!symptoms;
              const isToday = day.dateStr === getTodayDateString();

              // Calculate overall severity if symptoms exist
              let maxSeverity = 0;
              let symptomHighlights: string[] = [];

              if (symptoms) {
                const keys: (keyof typeof symptoms)[] = [
                  'nausea',
                  'earlySatiety',
                  'fatigue',
                  'acidReflux',
                  'constipation',
                  'diarrhea',
                  'headache',
                  'abdominalPain',
                  'siteReaction',
                  'burping',
                ];
                keys.forEach((k) => {
                  const val = symptoms[k] as number | undefined;
                  if (typeof val === 'number') {
                    if (val > maxSeverity) maxSeverity = val;
                    if (val >= 2) {
                      if (k === 'nausea') symptomHighlights.push('Náuseas');
                      if (k === 'earlySatiety') symptomHighlights.push('Saciedade');
                      if (k === 'fatigue') symptomHighlights.push('Fadiga');
                      if (k === 'acidReflux') symptomHighlights.push('Azia');
                      if (k === 'constipation') symptomHighlights.push('Obstipação');
                      if (k === 'diarrhea') symptomHighlights.push('Diarreia');
                      if (k === 'headache') symptomHighlights.push('Cefaleia');
                      if (k === 'burping') symptomHighlights.push('Arrotos');
                    }
                  }
                });
              }

              return (
                <div
                  key={day.dateStr}
                  onClick={() => onOpenSymptomsModal(day.dateStr)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between min-h-[120px] ${
                    isToday
                      ? 'border-[#C86D93] bg-[#F8DCE8]/30 dark:bg-[#2D1E2B]/50'
                      : hasData
                      ? 'border-[#F2BFD3]/50 dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] hover:border-[#E99AB9]'
                      : 'border-[#F2BFD3]/30 dark:border-[#362A36] bg-white dark:bg-[#1F1721] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#39313A] dark:text-[#F7EFF5]">
                        Dia {day.dayIndex}
                      </span>
                      {day.dayIndex === 1 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#C86D93] text-white">
                          Dose
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#817782] block">{day.formatted}</span>

                    {hasData ? (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              maxSeverity === 0
                                ? 'bg-gray-300'
                                : maxSeverity <= 2
                                ? 'bg-emerald-500'
                                : maxSeverity === 3
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span>
                            {maxSeverity === 0
                              ? 'Sem sintomas'
                              : maxSeverity <= 2
                              ? 'Leve'
                              : maxSeverity === 3
                              ? 'Moderado'
                              : 'Intenso'}
                          </span>
                        </div>
                        {symptomHighlights.length > 0 && (
                          <div className="text-[9px] text-[#817782] line-clamp-2">
                            {symptomHighlights.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 text-[10px] text-[#817782]">
                        + Registar
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#F2BFD3]/20 flex justify-end">
                    <span className="text-[9px] text-[#C86D93] hover:underline font-medium">
                      Editar
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HISTÓRICO DE INJEÇÕES / DOSES */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Syringe className="w-4 h-4 text-[#C86D93]" />
            <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
              Histórico de Doses Administradas
            </h2>
          </div>
          <span className="text-xs text-[#817782]">
            Total: <strong>{mounjaroInjections.length}</strong> injeções
          </span>
        </div>

        {mounjaroInjections.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
            Ainda não registaste nenhuma dose de Mounjaro. Clica no botão acima para começar.
          </div>
        ) : (
          <div className="space-y-2.5">
            {mounjaroInjections.map((inj, idx) => (
              <div
                key={inj.id}
                className="p-3.5 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 dark:border-[#362A36] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] font-bold">
                    #{mounjaroInjections.length - idx}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#39313A] dark:text-[#F7EFF5]">
                        {inj.doseMg} mg
                      </span>
                      <span className="text-[#817782]">· {formatDatePt(inj.date)}</span>
                      {inj.time && <span className="text-[10px] text-[#817782]">({inj.time})</span>}
                    </div>
                    <div className="text-[11px] text-[#817782] dark:text-[#A69AA8] mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C86D93]" />
                        {siteLabels[inj.site]}
                      </span>
                      {inj.notes && <span>· "{inj.notes}"</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => onOpenInjectionModal(inj)}
                    className="p-1.5 rounded-lg border border-[#F2BFD3] text-gray-500 hover:text-[#C86D93]"
                    title="Editar injeção"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMounjaroInjection(inj.id)}
                    className="p-1.5 rounded-lg border border-[#F2BFD3] text-gray-500 hover:text-rose-500"
                    title="Eliminar registo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DICAS & RECOMENDAÇÕES PARA O TRATAMENTO */}
      <div className="p-5 rounded-3xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] text-xs text-[#817782] dark:text-[#A69AA8] space-y-2">
        <h3 className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C86D93]" />
          <span>Dicas de Bem-Estar com Mounjaro</span>
        </h3>
        <p>
          • <strong>Hidratação reforçada:</strong> Bebe pelo menos 2 a 2.5 litros de água diariamente, especialmente nos primeiros 3 dias após a dose, para aliviar dores de cabeça e náuseas.
        </p>
        <p>
          • <strong>Refeições menores e frequentes:</strong> Para gerir a saciedade e evitar refluxo, prioriza porções moderadas e ricas em proteína magra, mastigando devagar.
        </p>
        <p>
          • <strong>Rotação dos locais de injeção:</strong> Alternar entre os quadrantes do abdómen e as coxas melhora a absorção e evita desconforto local.
        </p>
      </div>
    </div>
  );
};
