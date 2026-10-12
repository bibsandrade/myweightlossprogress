import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { BodyAssessment, DailyEntry } from '../types';
import {
  filterAssessmentsByDays,
  filterDailyEntriesByDays,
  calculateDailyMealTotals,
} from '../services/calculations';
import { formatDatePt, formatNumber } from '../utils/formatters';

interface Props {
  assessments: BodyAssessment[];
  dailyEntries: DailyEntry[];
}

type PeriodFilter = 7 | 30 | 90 | 365 | 'all';

export const InteractiveCharts: React.FC<Props> = ({
  assessments,
  dailyEntries,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>(30);
  const [activeTab, setActiveTab] = useState<'weight' | 'measurements' | 'composition' | 'journal'>('weight');

  const filteredAssessments = filterAssessmentsByDays(assessments, period);
  const filteredDaily = filterDailyEntriesByDays(dailyEntries, period);

  // Toggle series for measurements
  const [showWaist, setShowWaist] = useState(true);
  const [showAbdomen, setShowAbdomen] = useState(true);
  const [showHip, setShowHip] = useState(true);

  // Toggle series for composition
  const [showFat, setShowFat] = useState(true);
  const [showMuscle, setShowMuscle] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showBoneMass, setShowBoneMass] = useState(true);

  // Weight chart data
  const weightData = filteredAssessments
    .filter((a) => a.weightKg !== undefined && a.weightKg > 0)
    .map((a) => ({
      date: a.date,
      formattedDate: formatDatePt(a.date),
      weight: a.weightKg,
    }));

  // Measurements chart data
  const measurementsData = filteredAssessments
    .filter(
      (a) =>
        (a.waistCm !== undefined && a.waistCm > 0) ||
        (a.abdomenCm !== undefined && a.abdomenCm > 0) ||
        (a.hipCm !== undefined && a.hipCm > 0)
    )
    .map((a) => ({
      date: a.date,
      formattedDate: formatDatePt(a.date),
      waist: a.waistCm ?? null,
      abdomen: a.abdomenCm ?? null,
      hip: a.hipCm ?? null,
    }));

  // Composition chart data
  const compData = filteredAssessments
    .filter(
      (a) =>
        (a.bodyFatPercent !== undefined && a.bodyFatPercent > 0) ||
        (a.musclePercent !== undefined && a.musclePercent > 0) ||
        (a.waterPercent !== undefined && a.waterPercent > 0) ||
        (a.boneMassKg !== undefined && a.boneMassKg > 0)
    )
    .map((a) => ({
      date: a.date,
      formattedDate: formatDatePt(a.date),
      fat: a.bodyFatPercent ?? null,
      muscle: a.musclePercent ?? null,
      water: a.waterPercent ?? null,
      boneMass: a.boneMassKg ?? null,
    }));

  // Daily Journal data (Calories, Protein, Water)
  const journalData = filteredDaily.map((d) => {
    const mealTotals = calculateDailyMealTotals(d.meals || []);
    return {
      date: d.date,
      formattedDate: formatDatePt(d.date),
      calories: mealTotals.totalCalories > 0 ? mealTotals.totalCalories : null,
      protein: mealTotals.totalProtein > 0 ? mealTotals.totalProtein : null,
      waterL: d.waterMl > 0 ? Math.round((d.waterMl / 1000) * 100) / 100 : null,
    };
  });

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-6 shadow-sm border border-[#F2BFD3]/40 dark:border-[#362A36]">
      {/* Header with Period Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Evolução Visual & Gráficos
          </h3>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
            Tendências precisas baseadas nos teus registos reais
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#FFF8FB] dark:bg-[#140F15] rounded-xl border border-[#F2BFD3]/30 dark:border-[#362A36] text-xs self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { label: '7D', value: 7 as PeriodFilter },
            { label: '30D', value: 30 as PeriodFilter },
            { label: '90D', value: 90 as PeriodFilter },
            { label: '1 Ano', value: 365 as PeriodFilter },
            { label: 'Tudo', value: 'all' as PeriodFilter },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setPeriod(item.value)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                period === item.value
                  ? 'bg-white dark:bg-[#1F1721] text-[#C86D93] shadow-xs'
                  : 'text-[#817782] dark:text-[#A69AA8] hover:text-[#39313A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tabs: Weight, Measurements, Composition, Journal */}
      <div className="flex items-center gap-2 border-b border-[#F2BFD3]/30 dark:border-[#362A36] pb-3 mb-5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('weight')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeTab === 'weight'
              ? 'bg-[#E99AB9] text-white shadow-xs'
              : 'text-[#817782] dark:text-[#A69AA8] hover:bg-[#F8DCE8]/30'
          }`}
        >
          Peso Corporal
        </button>
        <button
          onClick={() => setActiveTab('measurements')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeTab === 'measurements'
              ? 'bg-[#E99AB9] text-white shadow-xs'
              : 'text-[#817782] dark:text-[#A69AA8] hover:bg-[#F8DCE8]/30'
          }`}
        >
          Medidas (cm)
        </button>
        <button
          onClick={() => setActiveTab('composition')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeTab === 'composition'
              ? 'bg-[#E99AB9] text-white shadow-xs'
              : 'text-[#817782] dark:text-[#A69AA8] hover:bg-[#F8DCE8]/30'
          }`}
        >
          Composição (%)
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeTab === 'journal'
              ? 'bg-[#E99AB9] text-white shadow-xs'
              : 'text-[#817782] dark:text-[#A69AA8] hover:bg-[#F8DCE8]/30'
          }`}
        >
          Diário & Calorias
        </button>
      </div>

      {/* CHART TAB CONTENT */}
      {activeTab === 'weight' && (
        <div>
          {weightData.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
              Ainda não existem registos de peso para o período selecionado.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2BFD3" opacity={0.3} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: '#817782' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fontSize: 11, fill: '#817782' }}
                    tickLine={false}
                    unit=" kg"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #F2BFD3',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown) => [
                      `${formatNumber(typeof val === 'number' ? val : Number(val))} kg`,
                      'Peso',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#C86D93"
                    strokeWidth={2.5}
                    dot={{ fill: '#C86D93', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'measurements' && (
        <div>
          {/* Series toggles */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showWaist}
                onChange={(e) => setShowWaist(e.target.checked)}
                className="rounded-sm accent-[#C86D93]"
              />
              <span className="text-[#C86D93] font-medium">Cintura</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showAbdomen}
                onChange={(e) => setShowAbdomen(e.target.checked)}
                className="rounded-sm accent-[#E99AB9]"
              />
              <span className="text-[#E99AB9] font-medium">Abdómen</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showHip}
                onChange={(e) => setShowHip(e.target.checked)}
                className="rounded-sm accent-[#9333EA]"
              />
              <span className="text-purple-600 font-medium">Anca / Glúteos</span>
            </label>
          </div>

          {measurementsData.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
              Ainda não existem registos de medidas para o período selecionado.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={measurementsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2BFD3" opacity={0.3} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: '#817782' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 11, fill: '#817782' }}
                    tickLine={false}
                    unit=" cm"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #F2BFD3',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown) => [
                      `${formatNumber(typeof val === 'number' ? val : Number(val))} cm`,
                    ]}
                  />
                  <Legend />
                  {showWaist && (
                    <Line
                      type="monotone"
                      name="Cintura"
                      dataKey="waist"
                      stroke="#C86D93"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                  {showAbdomen && (
                    <Line
                      type="monotone"
                      name="Abdómen"
                      dataKey="abdomen"
                      stroke="#E99AB9"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                  {showHip && (
                    <Line
                      type="monotone"
                      name="Anca"
                      dataKey="hip"
                      stroke="#9333EA"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'composition' && (
        <div>
          {/* Series toggles */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showFat}
                onChange={(e) => setShowFat(e.target.checked)}
                className="rounded-sm accent-[#E11D48]"
              />
              <span className="text-rose-600 font-medium">Gordura %</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showMuscle}
                onChange={(e) => setShowMuscle(e.target.checked)}
                className="rounded-sm accent-[#059669]"
              />
              <span className="text-emerald-600 font-medium">Massa Muscular %</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showWater}
                onChange={(e) => setShowWater(e.target.checked)}
                className="rounded-sm accent-[#0284C7]"
              />
              <span className="text-sky-600 font-medium">Água %</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBoneMass}
                onChange={(e) => setShowBoneMass(e.target.checked)}
                className="rounded-sm accent-[#D97706]"
              />
              <span className="text-amber-600 font-medium">Massa Óssea (kg)</span>
            </label>
          </div>

          {compData.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
              Ainda não existem registos de composição corporal para o período selecionado.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2BFD3" opacity={0.3} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: '#817782' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fontSize: 11, fill: '#817782' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #F2BFD3',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [
                      String(name || '').includes('kg')
                        ? `${formatNumber(typeof val === 'number' ? val : Number(val), 2)} kg`
                        : `${formatNumber(typeof val === 'number' ? val : Number(val))}%`,
                      String(name || ''),
                    ]}
                  />
                  <Legend />
                  {showFat && (
                    <Line
                      type="monotone"
                      name="Gordura"
                      dataKey="fat"
                      stroke="#E11D48"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                  {showMuscle && (
                    <Line
                      type="monotone"
                      name="Músculo"
                      dataKey="muscle"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                  {showWater && (
                    <Line
                      type="monotone"
                      name="Água"
                      dataKey="water"
                      stroke="#0284C7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                  {showBoneMass && (
                    <Line
                      type="monotone"
                      name="Massa Óssea (kg)"
                      dataKey="boneMass"
                      stroke="#D97706"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-2">
              Ingestão Calórica (kcal/dia)
            </h4>
            {journalData.filter((d) => d.calories !== null).length === 0 ? (
              <div className="py-8 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
                Sem dados de calorias diárias registadas.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={journalData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2BFD3" opacity={0.3} />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#817782' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#817782' }} unit=" kcal" />
                    <Tooltip
                      formatter={(val: unknown) => [
                        `${Math.round(typeof val === 'number' ? val : Number(val))} kcal`,
                        'Calorias',
                      ]}
                    />
                    <Bar dataKey="calories" fill="#E99AB9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-2">
              Consumo de Água (Litros/dia)
            </h4>
            {journalData.filter((d) => d.waterL !== null).length === 0 ? (
              <div className="py-8 text-center text-xs text-[#817782] dark:text-[#A69AA8]">
                Sem dados de água diária registada.
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={journalData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2BFD3" opacity={0.3} />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#817782' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#817782' }} unit=" L" />
                    <Tooltip
                      formatter={(val: unknown) => [
                        `${typeof val === 'number' ? val : Number(val)} L`,
                        'Água',
                      ]}
                    />
                    <Bar dataKey="waterL" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
