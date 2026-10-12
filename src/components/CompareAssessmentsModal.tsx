import React, { useState } from 'react';
import { X, ArrowRight, ArrowDownRight, ArrowUpRight, Minus, Scale } from 'lucide-react';
import { BodyAssessment } from '../types';
import { formatDatePt, formatWeight, formatCm, formatPercent, formatNumber } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assessments: BodyAssessment[];
}

export const CompareAssessmentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  assessments,
}) => {
  const sorted = [...assessments].sort((a, b) => a.date.localeCompare(b.date));

  const [firstId, setFirstId] = useState<string>(
    sorted.length > 0 ? sorted[0].id : ''
  );
  const [secondId, setSecondId] = useState<string>(
    sorted.length > 1 ? sorted[sorted.length - 1].id : sorted[0]?.id || ''
  );

  if (!isOpen) return null;

  const itemA = sorted.find((a) => a.id === firstId);
  const itemB = sorted.find((a) => a.id === secondId);

  const renderDiff = (
    valA?: number,
    valB?: number,
    formatter: (n: number) => string = (n) => String(n),
    unit: string = ''
  ) => {
    if (valA === undefined || valB === undefined) {
      return <span className="text-[#817782] text-xs">—</span>;
    }

    const diff = Math.round((valB - valA) * 10) / 10;
    const isZero = Math.abs(diff) < 0.05;
    const isDown = diff < -0.05;

    return (
      <div className="flex items-center gap-1 text-xs font-semibold">
        {isZero ? (
          <span className="text-gray-400 flex items-center">
            <Minus className="w-3.5 h-3.5" /> 0 {unit}
          </span>
        ) : isDown ? (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {formatter(Math.abs(diff))} {unit}
          </span>
        ) : (
          <span className="text-rose-500 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{formatter(diff)} {unit}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-8 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-6 animate-in fade-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
                Comparar Avaliações Corporais
              </h2>
              <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
                Compara lado a lado a evolução entre duas datas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sorted.length < 2 ? (
          <div className="p-8 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
            Precisas de ter pelo menos 2 avaliações corporais registadas para poder comparar.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <label className="block text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                  Avaliação A (Base)
                </label>
                <select
                  value={firstId}
                  onChange={(e) => setFirstId(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5]"
                >
                  {sorted.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatDatePt(a.date)} {a.weightKg ? `— ${a.weightKg} kg` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <label className="block text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                  Avaliação B (Comparação)
                </label>
                <select
                  value={secondId}
                  onChange={(e) => setSecondId(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5]"
                >
                  {sorted.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatDatePt(a.date)} {a.weightKg ? `— ${a.weightKg} kg` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            {itemA && itemB && (
              <div className="overflow-hidden rounded-2xl border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF8FB] dark:bg-[#140F15] border-b border-[#F2BFD3]/30 dark:border-[#362A36]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-[#817782] dark:text-[#A69AA8]">
                        Indicador
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                        {formatDatePt(itemA.date)}
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                        {formatDatePt(itemB.date)}
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-[#C86D93]">
                        Diferença
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2BFD3]/20 dark:divide-[#362A36]">
                    <tr>
                      <td className="py-2 px-4 font-medium">Peso Corporal</td>
                      <td className="py-2 px-4">{formatWeight(itemA.weightKg)}</td>
                      <td className="py-2 px-4">{formatWeight(itemB.weightKg)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.weightKg, itemB.weightKg, (n) => formatNumber(n, 1), 'kg')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">IMC</td>
                      <td className="py-2 px-4">{itemA.bmi ?? '—'}</td>
                      <td className="py-2 px-4">{itemB.bmi ?? '—'}</td>
                      <td className="py-2 px-4">{renderDiff(itemA.bmi, itemB.bmi)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Cintura</td>
                      <td className="py-2 px-4">{formatCm(itemA.waistCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.waistCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.waistCm, itemB.waistCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Abdómen</td>
                      <td className="py-2 px-4">{formatCm(itemA.abdomenCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.abdomenCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.abdomenCm, itemB.abdomenCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Anca / Glúteos</td>
                      <td className="py-2 px-4">{formatCm(itemA.hipCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.hipCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.hipCm, itemB.hipCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Peito</td>
                      <td className="py-2 px-4">{formatCm(itemA.chestCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.chestCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.chestCm, itemB.chestCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Coxa</td>
                      <td className="py-2 px-4">{formatCm(itemA.thighCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.thighCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.thighCm, itemB.thighCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Braço</td>
                      <td className="py-2 px-4">{formatCm(itemA.armCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.armCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.armCm, itemB.armCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Perna / Gémeos</td>
                      <td className="py-2 px-4">{formatCm(itemA.legCm)}</td>
                      <td className="py-2 px-4">{formatCm(itemB.legCm)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.legCm, itemB.legCm, (n) => formatNumber(n, 1), 'cm')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Gordura Corporal</td>
                      <td className="py-2 px-4">{formatPercent(itemA.bodyFatPercent)}</td>
                      <td className="py-2 px-4">{formatPercent(itemB.bodyFatPercent)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.bodyFatPercent, itemB.bodyFatPercent, (n) => formatNumber(n, 1), '%')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Massa Muscular</td>
                      <td className="py-2 px-4">{formatPercent(itemA.musclePercent)}</td>
                      <td className="py-2 px-4">{formatPercent(itemB.musclePercent)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.musclePercent, itemB.musclePercent, (n) => formatNumber(n, 1), '%')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Água Corporal</td>
                      <td className="py-2 px-4">{formatPercent(itemA.waterPercent)}</td>
                      <td className="py-2 px-4">{formatPercent(itemB.waterPercent)}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.waterPercent, itemB.waterPercent, (n) => formatNumber(n, 1), '%')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Massa Óssea</td>
                      <td className="py-2 px-4">{itemA.boneMassKg !== undefined ? `${formatNumber(itemA.boneMassKg, 2)} kg` : '—'}</td>
                      <td className="py-2 px-4">{itemB.boneMassKg !== undefined ? `${formatNumber(itemB.boneMassKg, 2)} kg` : '—'}</td>
                      <td className="py-2 px-4">
                        {renderDiff(itemA.boneMassKg, itemB.boneMassKg, (n) => formatNumber(n, 2), 'kg')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2 text-xs font-semibold shadow-xs transition"
              >
                Fechar Comparação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
