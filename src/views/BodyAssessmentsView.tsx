import React, { useState } from 'react';
import {
  Scale,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BodyAssessment } from '../types';
import {
  calculateMeasurementEvolution,
  calculateWeightProgress,
} from '../services/calculations';
import {
  formatDatePt,
  formatWeight,
  formatCm,
  formatPercent,
  formatNumber,
  getSourceLabel,
} from '../utils/formatters';

interface Props {
  onOpenAssessmentModal: (assessment?: BodyAssessment) => void;
  onOpenCompareModal: () => void;
}

export const BodyAssessmentsView: React.FC<Props> = ({
  onOpenAssessmentModal,
  onOpenCompareModal,
}) => {
  const { profile, assessments, deleteAssessment } = useApp();
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedAssessments = [...assessments].sort((a, b) => {
    const dateA = a.date + (a.time ? `T${a.time}` : 'T00:00');
    const dateB = b.date + (b.time ? `T${b.time}` : 'T00:00');
    return dateB.localeCompare(dateA); // newest first
  });

  const filtered = sortedAssessments.filter((a) => {
    if (!filterQuery) return true;
    return a.date.includes(filterQuery) || (a.notes && a.notes.toLowerCase().includes(filterQuery.toLowerCase()));
  });

  // Calculate evolutions
  const waistEvol = calculateMeasurementEvolution(assessments, 'waistCm');
  const abdomenEvol = calculateMeasurementEvolution(assessments, 'abdomenCm');
  const hipEvol = calculateMeasurementEvolution(assessments, 'hipCm');
  const chestEvol = calculateMeasurementEvolution(assessments, 'chestCm');
  const thighEvol = calculateMeasurementEvolution(assessments, 'thighCm');
  const armEvol = calculateMeasurementEvolution(assessments, 'armCm');
  const legEvol = calculateMeasurementEvolution(assessments, 'legCm');

  const measurementsList = [
    { label: 'Cintura', evol: waistEvol },
    { label: 'Abdómen', evol: abdomenEvol },
    { label: 'Anca / Glúteos', evol: hipEvol },
    { label: 'Peito', evol: chestEvol },
    { label: 'Coxa', evol: thighEvol },
    { label: 'Braço', evol: armEvol },
    { label: 'Perna / Gémeos', evol: legEvol },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Peso, Medidas & Composição
          </h1>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
            Histórico completo de avaliações físicas e evolução em centímetros
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {assessments.length >= 2 && (
            <button
              onClick={onOpenCompareModal}
              className="flex items-center gap-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C86D93]" />
              <span>Comparar 2 Datas</span>
            </button>
          )}
          <button
            onClick={() => onOpenAssessmentModal()}
            className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Avaliação</span>
          </button>
        </div>
      </div>

      {/* Measurement Evolutions Overview */}
      <div className="rounded-2xl bg-white dark:bg-[#1F1721] p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
            Evolução de Medidas Corporais (Primeiro vs Último Registo)
          </span>
          <span className="text-[11px] text-[#817782]">
            Valores em centímetros
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {measurementsList.map((m) => (
            <div
              key={m.label}
              className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/20 dark:border-[#362A36]"
            >
              <span className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] truncate">
                {m.label}
              </span>
              <span className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5] block mt-0.5">
                {formatCm(m.evol.currentValue)}
              </span>
              <div className="mt-1 text-[10px]">
                {m.evol.hasData && m.evol.diff !== null ? (
                  m.evol.diff < 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatNumber(m.evol.diff, 1)} cm
                    </span>
                  ) : m.evol.diff > 0 ? (
                    <span className="text-rose-500 font-semibold">
                      +{formatNumber(m.evol.diff, 1)} cm
                    </span>
                  ) : (
                    <span className="text-gray-400">0 cm</span>
                  )
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filtrar por data (ex: 2026-10) ou nota..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="max-w-xs w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
        />
        <span className="text-xs text-[#817782]">
          Total: <strong>{filtered.length}</strong> avaliações
        </span>
      </div>

      {/* Assessments List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-12 text-center border border-[#F2BFD3]/40 dark:border-[#362A36]">
          <Scale className="w-10 h-10 text-[#C86D93] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5] mb-1">
            Nenhuma avaliação encontrada
          </h3>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] max-w-sm mx-auto mb-5">
            Adiciona uma avaliação física com peso, medidas da fita métrica ou bioimpedância.
          </p>
          <button
            onClick={() => onOpenAssessmentModal()}
            className="rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition"
          >
            + Adicionar Avaliação
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-[#1F1721] p-4 sm:p-5 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5]">
                          {formatDatePt(item.date)}
                        </span>
                        {item.time && (
                          <span className="text-xs text-[#817782]">({item.time})</span>
                        )}
                        <span className="text-[10px] text-[#817782] bg-[#FFF8FB] dark:bg-[#140F15] px-2 py-0.5 rounded-md border border-[#F2BFD3]/30">
                          {getSourceLabel(item.source)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                        {item.weightKg !== undefined && (
                          <span className="font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                            Peso: {formatWeight(item.weightKg)}
                          </span>
                        )}
                        {item.bmi !== undefined && (
                          <span className="text-[#817782]">IMC: {item.bmi}</span>
                        )}
                        {item.waistCm !== undefined && (
                          <span className="text-[#817782]">Cintura: {item.waistCm} cm</span>
                        )}
                        {item.bodyFatPercent !== undefined && (
                          <span className="text-[#817782]">Gordura: {item.bodyFatPercent}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] text-xs font-medium text-[#817782] hover:text-[#39313A] flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Recolher' : 'Detalhes'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onOpenAssessmentModal(item)}
                      className="p-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] text-gray-500 hover:text-[#C86D93] transition"
                      title="Editar avaliação"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#F2BFD3]/20 dark:border-[#362A36] space-y-3 text-xs">
                    {/* Circumferences */}
                    <div>
                      <span className="font-semibold text-[#817782] block mb-1.5">
                        Medidas Corporais:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <span>Cintura: <strong>{formatCm(item.waistCm)}</strong></span>
                        <span>Abdómen: <strong>{formatCm(item.abdomenCm)}</strong></span>
                        <span>Anca / Glúteos: <strong>{formatCm(item.hipCm)}</strong></span>
                        <span>Peito: <strong>{formatCm(item.chestCm)}</strong></span>
                        <span>Coxa: <strong>{formatCm(item.thighCm)}</strong></span>
                        <span>Braço: <strong>{formatCm(item.armCm)}</strong></span>
                        <span>Perna / Gémeos: <strong>{formatCm(item.legCm)}</strong></span>
                      </div>
                    </div>

                    {/* Composition */}
                    <div>
                      <span className="font-semibold text-[#817782] block mb-1.5">
                        Composição Corporal:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <span>Gordura corporal: <strong>{formatPercent(item.bodyFatPercent)}</strong></span>
                        <span>Massa muscular: <strong>{formatPercent(item.musclePercent)}</strong></span>
                        <span>Água corporal: <strong>{formatPercent(item.waterPercent)}</strong></span>
                        <span>Gordura visceral: <strong>{item.visceralFatValue ?? '—'}</strong></span>
                        <span>Massa óssea: <strong>{item.boneMassKg !== undefined ? `${formatNumber(item.boneMassKg, 2)} kg` : '—'}</strong></span>
                        <span>Metabolismo basal: <strong>{item.basalMetabolicRateKcal ? `${item.basalMetabolicRateKcal} kcal` : '—'}</strong></span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="p-2.5 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] text-[11px] text-[#39313A] dark:text-[#F7EFF5]">
                        <span className="font-semibold text-[#817782] block">Notas:</span>
                        {item.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
