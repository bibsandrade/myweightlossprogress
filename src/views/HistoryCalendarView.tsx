import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Scale,
  Utensils,
  Eye,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BodyAssessment, DailyEntry } from '../types';
import {
  formatDatePt,
  formatDateLongPt,
  formatWeight,
  formatMonthYearPt,
  getTodayDateString,
} from '../utils/formatters';

interface Props {
  onOpenAssessmentModal: (assessment?: BodyAssessment) => void;
  onOpenDailyModalWithDate: (date: string) => void;
}

export const HistoryCalendarView: React.FC<Props> = ({
  onOpenAssessmentModal,
  onOpenDailyModalWithDate,
}) => {
  const { assessments, dailyEntries, deleteAssessment, deleteDailyEntry } = useApp();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateString());
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [typeFilter, setTypeFilter] = useState<'all' | 'assessments' | 'journal'>('all');

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  // Build calendar matrix for currentMonthDate
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday as first day of week in pt-PT (0 = Monday, ..., 6 = Sunday)
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  // Set of dates that have assessments and journal
  const assessmentDates = new Set(assessments.map((a) => a.date));
  const journalDates = new Set(dailyEntries.map((d) => d.date));

  // Calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push(formattedDate);
  }

  // Records for selectedCalendarDate
  const selectedAssessments = assessments.filter((a) => a.date === selectedCalendarDate);
  const selectedJournal = dailyEntries.find((d) => d.date === selectedCalendarDate);

  // Combined timeline items
  interface TimelineItem {
    id: string;
    date: string;
    type: 'assessment' | 'journal';
    title: string;
    details: string;
    rawAssessment?: BodyAssessment;
    rawJournal?: DailyEntry;
  }

  const timelineItems: TimelineItem[] = [];

  if (typeFilter === 'all' || typeFilter === 'assessments') {
    assessments.forEach((a) => {
      timelineItems.push({
        id: 'timeline_a_' + a.id,
        date: a.date,
        type: 'assessment',
        title: `Avaliação Corporal ${a.weightKg ? `— ${a.weightKg} kg` : ''}`,
        details: [
          a.waistCm ? `Cintura: ${a.waistCm}cm` : null,
          a.bodyFatPercent ? `Gordura: ${a.bodyFatPercent}%` : null,
          a.notes ? `Notas: "${a.notes}"` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        rawAssessment: a,
      });
    });
  }

  if (typeFilter === 'all' || typeFilter === 'journal') {
    dailyEntries.forEach((d) => {
      const mealCount = d.meals?.length || 0;
      timelineItems.push({
        id: 'timeline_j_' + d.id,
        date: d.date,
        type: 'journal',
        title: `Diário Diário ${d.waterMl > 0 ? `· ${d.waterMl}ml água` : ''}`,
        details: [
          mealCount > 0 ? `${mealCount} refeições` : null,
          d.sleep?.durationHours ? `${d.sleep.durationHours}h sono` : null,
          d.achievements ? `Vitória: "${d.achievements}"` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        rawJournal: d,
      });
    });
  }

  timelineItems.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Histórico & Calendário
          </h1>
          <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
            Consulta interativa de todos os teus registos anteriores
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-[#FFF8FB] dark:bg-[#140F15] rounded-xl border border-[#F2BFD3]/30 dark:border-[#362A36] text-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#1F1721] text-[#C86D93] shadow-xs'
                  : 'text-[#817782] dark:text-[#A69AA8]'
              }`}
            >
              Vista Calendário
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-[#1F1721] text-[#C86D93] shadow-xs'
                  : 'text-[#817782] dark:text-[#A69AA8]'
              }`}
            >
              Linha Temporal
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CALENDAR COLUMN */}
          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5] capitalize">
                {formatMonthYearPt(currentMonthDate)}
              </h2>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] hover:bg-[#F8DCE8]/30 transition"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-[#817782]" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] hover:bg-[#F8DCE8]/30 transition"
                  title="Mês seguinte"
                >
                  <ChevronRight className="w-4 h-4 text-[#817782]" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-2">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {calendarCells.map((cellDate, idx) => {
                if (!cellDate) {
                  return <div key={'empty_' + idx} className="h-14 sm:h-16" />;
                }

                const dayNum = parseInt(cellDate.split('-')[2], 10);
                const isSelected = selectedCalendarDate === cellDate;
                const isToday = cellDate === getTodayDateString();
                const hasAssessment = assessmentDates.has(cellDate);
                const hasJournal = journalDates.has(cellDate);

                return (
                  <button
                    key={cellDate}
                    onClick={() => setSelectedCalendarDate(cellDate)}
                    className={`h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-between p-1.5 transition text-xs border ${
                      isSelected
                        ? 'border-[#C86D93] bg-[#F8DCE8]/40 dark:bg-[#2D1E2B] shadow-xs'
                        : isToday
                        ? 'border-[#E99AB9] bg-white dark:bg-[#1F1721]'
                        : 'border-transparent hover:bg-[#FFF8FB] dark:hover:bg-[#140F15]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
                        isSelected
                          ? 'bg-[#C86D93] text-white'
                          : isToday
                          ? 'bg-[#E99AB9] text-white'
                          : 'text-[#39313A] dark:text-[#F7EFF5]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Indicators */}
                    <div className="flex items-center gap-1">
                      {hasAssessment && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#C86D93]"
                          title="Avaliação física"
                        />
                      )}
                      {hasJournal && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-sky-500"
                          title="Diário do dia"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-6 pt-4 border-t border-[#F2BFD3]/20 flex items-center justify-center gap-6 text-xs text-[#817782]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C86D93]" />
                <span>Avaliação Corporal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Diário Alimentar/Hábitos</span>
              </div>
            </div>
          </div>

          {/* DAY DETAILS COLUMN */}
          <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="mb-4">
              <span className="text-[11px] font-medium text-[#817782] block">
                Detalhes do dia selecionado:
              </span>
              <h3 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {formatDateLongPt(selectedCalendarDate)}
              </h3>
            </div>

            {/* Assessment Records for this day */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#C86D93]" />
                    <span>Avaliações ({selectedAssessments.length})</span>
                  </span>
                  <button
                    onClick={() => onOpenAssessmentModal()}
                    className="text-[11px] text-[#C86D93] hover:underline"
                  >
                    + Adicionar
                  </button>
                </div>

                {selectedAssessments.length === 0 ? (
                  <p className="text-xs text-[#817782] py-2">Sem avaliação neste dia.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAssessments.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                            {formatWeight(a.weightKg)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onOpenAssessmentModal(a)}
                              className="text-gray-400 hover:text-[#C86D93]"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteAssessment(a.id)}
                              className="text-gray-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {a.waistCm && <div>Cintura: {a.waistCm} cm</div>}
                        {a.bodyFatPercent && <div>Gordura: {a.bodyFatPercent}%</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Journal for this day */}
              <div className="pt-3 border-t border-[#F2BFD3]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#C86D93]" />
                    <span>Diário Diário</span>
                  </span>
                  <button
                    onClick={() => onOpenDailyModalWithDate(selectedCalendarDate)}
                    className="text-[11px] text-[#C86D93] hover:underline"
                  >
                    {selectedJournal ? 'Editar' : '+ Registar'}
                  </button>
                </div>

                {!selectedJournal ? (
                  <p className="text-xs text-[#817782] py-2">Sem diário preenchido neste dia.</p>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[#817782]">Água consumida:</span>
                      <span className="font-bold text-sky-600">{selectedJournal.waterMl} ml</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#817782]">Refeições:</span>
                      <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                        {selectedJournal.meals?.length || 0}
                      </span>
                    </div>
                    {selectedJournal.sleep?.durationHours && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#817782]">Sono:</span>
                        <span className="font-bold text-indigo-600">
                          {selectedJournal.sleep.durationHours}h
                        </span>
                      </div>
                    )}
                    {selectedJournal.achievements && (
                      <div className="pt-1 text-[11px] text-[#39313A] dark:text-[#F7EFF5]">
                        ⭐ "{selectedJournal.achievements}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-3.5 h-3.5 text-[#817782]" />
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'assessments', 'journal'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                  className={`px-3 py-1 rounded-lg transition ${
                    typeFilter === filter
                      ? 'bg-[#E99AB9] text-white font-medium shadow-xs'
                      : 'text-[#817782] hover:bg-[#F8DCE8]/30'
                  }`}
                >
                  {filter === 'all'
                    ? 'Tudo'
                    : filter === 'assessments'
                    ? 'Avaliações'
                    : 'Diário'}
                </button>
              ))}
            </div>
          </div>

          {timelineItems.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-12 text-center border border-[#F2BFD3]/40 dark:border-[#362A36]">
              <CalendarIcon className="w-10 h-10 text-[#C86D93] mx-auto mb-2 opacity-60" />
              <p className="text-xs text-[#817782]">Nenhum registo histórico encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timelineItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/30 dark:border-[#362A36] flex items-center justify-between text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        item.type === 'assessment'
                          ? 'bg-[#F8DCE8] text-[#C86D93]'
                          : 'bg-sky-50 text-sky-600'
                      }`}
                    >
                      {item.type === 'assessment' ? (
                        <Scale className="w-4 h-4" />
                      ) : (
                        <Utensils className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">
                          {formatDatePt(item.date)}
                        </span>
                        <span className="text-[#817782]">· {item.title}</span>
                      </div>
                      {item.details && (
                        <p className="text-[11px] text-[#817782] dark:text-[#A69AA8] mt-0.5">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.rawAssessment && (
                      <button
                        onClick={() => onOpenAssessmentModal(item.rawAssessment)}
                        className="p-1.5 rounded-lg border border-[#F2BFD3] text-gray-500 hover:text-[#C86D93]"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.rawJournal && (
                      <button
                        onClick={() => onOpenDailyModalWithDate(item.date)}
                        className="p-1.5 rounded-lg border border-[#F2BFD3] text-gray-500 hover:text-[#C86D93]"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
