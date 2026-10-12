import React, { useState } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { BodyAssessment, DailyEntry } from '../types';
import {
  calculateWeightProgress,
  calculateMeasurementEvolution,
  calculateBmi,
} from '../services/calculations';
import {
  formatDatePt,
  formatWeight,
  formatCm,
  formatPercent,
  formatNumber,
  getTodayDateString,
  getGoalLabel,
  getActivityLabel,
} from '../utils/formatters';

export const ReportsView: React.FC<Props> = () => {
  const { profile, assessments, dailyEntries } = useApp();

  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | '365' | 'all'>('30');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Filter assessments based on range
  const getFilteredData = () => {
    if (dateRange === 'all') {
      return {
        filteredAssessments: assessments,
        filteredDaily: dailyEntries,
      };
    }
    const days = parseInt(dateRange, 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      filteredAssessments: assessments.filter((a) => a.date >= cutoff),
      filteredDaily: dailyEntries.filter((d) => d.date >= cutoff),
    };
  };

  const { filteredAssessments, filteredDaily } = getFilteredData();
  const weightProgress = calculateWeightProgress(profile, filteredAssessments, filteredDaily);

  // Evolutions
  const waistEvol = calculateMeasurementEvolution(filteredAssessments, 'waistCm');
  const abdomenEvol = calculateMeasurementEvolution(filteredAssessments, 'abdomenCm');
  const hipEvol = calculateMeasurementEvolution(filteredAssessments, 'hipCm');
  const chestEvol = calculateMeasurementEvolution(filteredAssessments, 'chestCm');
  const thighEvol = calculateMeasurementEvolution(filteredAssessments, 'thighCm');
  const armEvol = calculateMeasurementEvolution(filteredAssessments, 'armCm');
  const legEvol = calculateMeasurementEvolution(filteredAssessments, 'legCm');

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Generate PDF with jsPDF
  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(200, 109, 147); // Rose dark #C86D93
      doc.text('MY PROGRESS — Relatório de Evolução', 14, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Data de Emissão: ${formatDatePt(getTodayDateString())}`, 14, y);
      y += 5;
      doc.text(`Utilizadora: ${profile?.name || 'Utilizadora'} | Objetivo: ${profile ? getGoalLabel(profile.primaryGoal) : 'Acompanhamento'}`, 14, y);
      y += 10;

      // Divider
      doc.setDrawColor(242, 191, 211);
      doc.line(14, y, 196, y);
      y += 8;

      // Resumo de peso
      doc.setFontSize(14);
      doc.setTextColor(57, 49, 58);
      doc.text('1. Resumo do Peso & Metas', 14, y);
      y += 7;

      doc.setFontSize(10);
      doc.text(`Peso Inicial: ${formatWeight(weightProgress.initialWeight)}`, 14, y);
      doc.text(`Peso Atual: ${formatWeight(weightProgress.currentWeight)}`, 80, y);
      doc.text(`Variação: ${weightProgress.weightDiffKg !== null ? `${formatNumber(weightProgress.weightDiffKg, 1)} kg` : '—'}`, 140, y);
      y += 6;

      doc.text(`Peso Objetivo: ${formatWeight(weightProgress.goalWeight)}`, 14, y);
      doc.text(`Progresso da Meta: ${weightProgress.goalProgressPercent !== null ? `${formatNumber(weightProgress.goalProgressPercent, 1)}%` : '—'}`, 80, y);
      y += 10;

      // Tabela de Medidas
      doc.setFontSize(14);
      doc.text('2. Evolução das Medidas Corporais', 14, y);
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Medida', 14, y);
      doc.text('Inicial', 70, y);
      doc.text('Atual', 110, y);
      doc.text('Variação', 150, y);
      y += 5;
      doc.line(14, y, 196, y);
      y += 5;

      doc.setTextColor(50, 50, 50);
      const rows = [
        ['Cintura', waistEvol],
        ['Abdómen', abdomenEvol],
        ['Anca / Glúteos', hipEvol],
        ['Peito', chestEvol],
        ['Coxa', thighEvol],
        ['Braço', armEvol],
        ['Perna / Gémeos', legEvol],
      ] as const;

      rows.forEach(([name, evol]) => {
        doc.text(name, 14, y);
        doc.text(formatCm(evol.initialValue), 70, y);
        doc.text(formatCm(evol.currentValue), 110, y);
        const diffStr = evol.diff !== null ? `${evol.diff > 0 ? '+' : ''}${formatNumber(evol.diff, 1)} cm` : '—';
        doc.text(diffStr, 150, y);
        y += 6;
      });

      y += 6;
      doc.line(14, y, 196, y);
      y += 8;

      // Diário e Hábitos
      doc.setFontSize(14);
      doc.setTextColor(57, 49, 58);
      doc.text('3. Registos do Período', 14, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Total de avaliações corporais no período: ${filteredAssessments.length}`, 14, y);
      y += 5;
      doc.text(`Total de dias com diário registado: ${filteredDaily.length}`, 14, y);
      y += 12;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Gerado local e privadamente por My Progress — Os dados permanecem sempre no teu dispositivo.', 14, y);

      doc.save(`relatorio-my-progress-${getTodayDateString()}.pdf`);
      setExportSuccess('Relatório PDF descarregado com sucesso!');
      setTimeout(() => setExportSuccess(null), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  // Export CSV with UTF-8 BOM for Excel
  const handleExportCsv = () => {
    try {
      const headers = [
        'Data',
        'Hora',
        'Peso (kg)',
        'IMC',
        'Cintura (cm)',
        'Abdómen (cm)',
        'Anca (cm)',
        'Peito (cm)',
        'Coxa (cm)',
        'Braço (cm)',
        'Perna (cm)',
        'Gordura (%)',
        'Músculo (%)',
        'Água (%)',
        'Gordura Visceral',
        'Massa Óssea (kg)',
        'Notas',
      ];

      const csvRows = [headers.join(';')];

      filteredAssessments.forEach((a) => {
        const row = [
          a.date,
          a.time || '',
          a.weightKg ?? '',
          a.bmi ?? '',
          a.waistCm ?? '',
          a.abdomenCm ?? '',
          a.hipCm ?? '',
          a.chestCm ?? '',
          a.thighCm ?? '',
          a.armCm ?? '',
          a.legCm ?? '',
          a.bodyFatPercent ?? '',
          a.musclePercent ?? '',
          a.waterPercent ?? '',
          a.visceralFatValue ?? '',
          a.boneMassKg ?? '',
          `"${(a.notes || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(';'));
      });

      // UTF-8 BOM
      const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-progress-avaliacoes-${getTodayDateString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setExportSuccess('Ficheiro CSV exportado com sucesso!');
      setTimeout(() => setExportSuccess(null), 4000);
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
    }
  };

  // Export Excel XLSX
  const handleExportXlsx = () => {
    try {
      const assessmentData = filteredAssessments.map((a) => ({
        Data: a.date,
        Hora: a.time || '',
        'Peso (kg)': a.weightKg ?? '',
        IMC: a.bmi ?? '',
        'Cintura (cm)': a.waistCm ?? '',
        'Abdómen (cm)': a.abdomenCm ?? '',
        'Anca (cm)': a.hipCm ?? '',
        'Peito (cm)': a.chestCm ?? '',
        'Coxa (cm)': a.thighCm ?? '',
        'Braço (cm)': a.armCm ?? '',
        'Perna (cm)': a.legCm ?? '',
        'Gordura (%)': a.bodyFatPercent ?? '',
        'Massa Muscular (%)': a.musclePercent ?? '',
        'Água (%)': a.waterPercent ?? '',
        'Gordura Visceral': a.visceralFatValue ?? '',
        'Massa Óssea (kg)': a.boneMassKg ?? '',
        Notas: a.notes || '',
      }));

      const dailyData = filteredDaily.map((d) => ({
        Data: d.date,
        'Água (ml)': d.waterMl || 0,
        'Nº Refeições': d.meals?.length || 0,
        'Horas Sono': d.sleep?.durationHours ?? '',
        'Qualidade Sono': d.sleep?.quality ?? '',
        Humor: d.mood ?? '',
        Energia: d.energy ?? '',
        Fome: d.hunger ?? '',
        Vitórias: d.achievements || '',
        Objetivos: d.tomorrowGoals || '',
      }));

      const wb = XLSX.utils.book_new();
      const wsAssessments = XLSX.utils.json_to_sheet(assessmentData);
      const wsDaily = XLSX.utils.json_to_sheet(dailyData);

      XLSX.utils.book_append_sheet(wb, wsAssessments, 'Avaliações Corporais');
      XLSX.utils.book_append_sheet(wb, wsDaily, 'Diário e Hábitos');

      XLSX.writeFile(wb, `my-progress-${getTodayDateString()}.xlsx`);

      setExportSuccess('Folha de cálculo Excel (.xlsx) descarregada com sucesso!');
      setTimeout(() => setExportSuccess(null), 4000);
    } catch (err) {
      console.error('Erro ao exportar Excel:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Relatórios & Exportações
          </h1>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
            Gera relatórios organizados, imprime ou exporta os teus dados para PDF, CSV e Excel
          </p>
        </div>

        {/* Filter Period */}
        <div className="flex items-center gap-1 p-1 bg-[#FFF8FB] dark:bg-[#140F15] rounded-xl border border-[#F2BFD3]/30 dark:border-[#362A36] text-xs">
          {[
            { label: '7D', value: '7' },
            { label: '30D', value: '30' },
            { label: '90D', value: '90' },
            { label: '1 Ano', value: '365' },
            { label: 'Tudo', value: 'all' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setDateRange(item.value as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                dateRange === item.value
                  ? 'bg-white dark:bg-[#1F1721] text-[#C86D93] shadow-xs'
                  : 'text-[#817782] dark:text-[#A69AA8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {exportSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* EXPORT ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3] dark:border-[#362A36] p-4 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition shadow-xs"
        >
          <Printer className="w-4 h-4 text-[#C86D93]" />
          <span>Imprimir Relatório</span>
        </button>

        <button
          onClick={handleExportPdf}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#E99AB9] hover:bg-[#C86D93] text-white p-4 text-xs font-semibold transition shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Descarregar PDF</span>
        </button>

        <button
          onClick={handleExportXlsx}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3] dark:border-[#362A36] p-4 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exportar Excel (XLSX)</span>
        </button>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3] dark:border-[#362A36] p-4 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition shadow-xs"
        >
          <Download className="w-4 h-4 text-sky-600" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* PRINTABLE REPORT PREVIEW CONTAINER */}
      <div className="print-page rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-10 shadow-sm border border-[#F2BFD3]/40 dark:border-[#362A36] space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F2BFD3]/40 dark:border-[#362A36] gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#C86D93]">
              Relatório Pessoal de Evolução Física
            </span>
            <h2 className="text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5] mt-1">
              My Progress
            </h2>
            <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
              {profile?.name ? `Utilizadora: ${profile.name}` : 'Acompanhamento Pessoal'}
            </p>
          </div>

          <div className="text-xs text-right text-[#817782] dark:text-[#A69AA8]">
            <div>Emissão: <strong>{formatDatePt(getTodayDateString())}</strong></div>
            <div>Período: <strong>{dateRange === 'all' ? 'Todo o histórico' : `Últimos ${dateRange} dias`}</strong></div>
          </div>
        </div>

        {/* Section 1: Perfil & Metas */}
        <div>
          <h3 className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
            1. Perfil & Metas Atuais
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Objetivo:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {profile ? getGoalLabel(profile.primaryGoal) : 'Perda de peso'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Peso Inicial:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {formatWeight(weightProgress.initialWeight)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Peso Atual:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {formatWeight(weightProgress.currentWeight)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Peso Objetivo:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {formatWeight(weightProgress.goalWeight)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Resumo da Variação */}
        <div>
          <h3 className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
            2. Variação de Peso no Período
          </h3>
          <div className="p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 text-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[#817782] block">Variação Líquida:</span>
              <span className="text-lg font-bold text-[#C86D93]">
                {weightProgress.weightDiffKg !== null
                  ? `${weightProgress.weightDiffKg > 0 ? '+' : ''}${formatNumber(weightProgress.weightDiffKg, 1)} kg`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#817782] block">% Peso Perdido:</span>
              <span className="text-lg font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {weightProgress.weightLostPercent !== null ? `${formatNumber(weightProgress.weightLostPercent, 1)}%` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#817782] block">Progresso da Meta:</span>
              <span className="text-lg font-bold text-emerald-600">
                {weightProgress.goalProgressPercent !== null ? `${formatNumber(weightProgress.goalProgressPercent, 1)}%` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Tabela de Medidas */}
        <div>
          <h3 className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
            3. Evolução das Medidas Corporais
          </h3>
          <div className="overflow-hidden rounded-2xl border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8FB] dark:bg-[#140F15] border-b border-[#F2BFD3]/30">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-[#817782]">Medida</th>
                  <th className="py-2.5 px-4 font-semibold text-[#817782]">Valor Inicial</th>
                  <th className="py-2.5 px-4 font-semibold text-[#817782]">Valor Atual</th>
                  <th className="py-2.5 px-4 font-semibold text-[#C86D93]">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2BFD3]/20 dark:divide-[#362A36]">
                {[
                  { label: 'Cintura', evol: waistEvol },
                  { label: 'Abdómen', evol: abdomenEvol },
                  { label: 'Anca / Glúteos', evol: hipEvol },
                  { label: 'Peito', evol: chestEvol },
                  { label: 'Coxa', evol: thighEvol },
                  { label: 'Braço', evol: armEvol },
                  { label: 'Perna / Gémeos', evol: legEvol },
                ].map((item) => (
                  <tr key={item.label}>
                    <td className="py-2.5 px-4 font-medium">{item.label}</td>
                    <td className="py-2.5 px-4">{formatCm(item.evol.initialValue)}</td>
                    <td className="py-2.5 px-4">{formatCm(item.evol.currentValue)}</td>
                    <td className="py-2.5 px-4 font-semibold">
                      {item.evol.diff !== null ? (
                        item.evol.diff < 0 ? (
                          <span className="text-emerald-600">
                            {formatNumber(item.evol.diff, 1)} cm
                          </span>
                        ) : item.evol.diff > 0 ? (
                          <span className="text-rose-500">
                            +{formatNumber(item.evol.diff, 1)} cm
                          </span>
                        ) : (
                          '0 cm'
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Estatísticas do Diário */}
        <div>
          <h3 className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
            4. Resumo de Hábitos & Diário
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Dias com diário:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {filteredDaily.length} dias
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Avaliações físicas feitas:</span>
              <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {filteredAssessments.length} avaliações
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15]">
              <span className="text-[#817782] block text-[11px]">Média de água diária:</span>
              <span className="font-bold text-sky-600">
                {filteredDaily.length > 0
                  ? `${Math.round(filteredDaily.reduce((acc, curr) => acc + (curr.waterMl || 0), 0) / filteredDaily.length)} ml`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-[#F2BFD3]/30 text-[11px] text-[#817782] text-center">
          My Progress · Aplicação Pessoal e Privada de Evolução Física · Todos os cálculos são reproduzíveis e locais.
        </div>
      </div>
    </div>
  );
};
interface Props {}
