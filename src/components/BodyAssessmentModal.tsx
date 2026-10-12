import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  Info,
  Scale,
  Calendar,
  Clock,
  Activity,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BodyAssessment, AssessmentSource } from '../types';
import { calculateBmi, getBmiCategory } from '../services/calculations';
import {
  getTodayDateString,
  formatDatePt,
  formatDateLongPt,
  getSourceLabel,
  formatWeight,
  formatCm,
  formatPercent,
  formatNumber,
} from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assessmentToEdit?: BodyAssessment | null;
}

export const BodyAssessmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  assessmentToEdit,
}) => {
  const { profile, saveAssessment, deleteAssessment } = useApp();

  // Step state: 1 = Data e Origem; 2 = Pesos, Medidas e Composição; 3 = Rever e Guardar
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Data, Hora e Origem
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('08:00');
  const [source, setSource] = useState<AssessmentSource>('manual');

  // Step 2: Pesos e Medidas (string state for smooth typing on mobile)
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [abdomenCm, setAbdomenCm] = useState('');
  const [hipCm, setHipCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [thighCm, setThighCm] = useState('');
  const [armCm, setArmCm] = useState('');
  const [legCm, setLegCm] = useState('');

  // Step 2: Composição Corporal
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [musclePercent, setMusclePercent] = useState('');
  const [waterPercent, setWaterPercent] = useState('');
  const [visceralFatValue, setVisceralFatValue] = useState('');
  const [boneMassKg, setBoneMassKg] = useState('');
  const [basalMetabolicRateKcal, setBasalMetabolicRateKcal] = useState('');

  // Step 2/3: Notas
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (assessmentToEdit) {
      setDate(assessmentToEdit.date || getTodayDateString());
      setTime(assessmentToEdit.time || '08:00');
      setSource(assessmentToEdit.source || 'manual');
      setWeightKg(assessmentToEdit.weightKg !== undefined ? String(assessmentToEdit.weightKg) : '');
      setWaistCm(assessmentToEdit.waistCm !== undefined ? String(assessmentToEdit.waistCm) : '');
      setAbdomenCm(assessmentToEdit.abdomenCm !== undefined ? String(assessmentToEdit.abdomenCm) : '');
      setHipCm(assessmentToEdit.hipCm !== undefined ? String(assessmentToEdit.hipCm) : '');
      setChestCm(assessmentToEdit.chestCm !== undefined ? String(assessmentToEdit.chestCm) : '');
      setThighCm(assessmentToEdit.thighCm !== undefined ? String(assessmentToEdit.thighCm) : '');
      setArmCm(assessmentToEdit.armCm !== undefined ? String(assessmentToEdit.armCm) : '');
      setLegCm(assessmentToEdit.legCm !== undefined ? String(assessmentToEdit.legCm) : '');

      setBodyFatPercent(
        assessmentToEdit.bodyFatPercent !== undefined ? String(assessmentToEdit.bodyFatPercent) : ''
      );
      setMusclePercent(
        assessmentToEdit.musclePercent !== undefined ? String(assessmentToEdit.musclePercent) : ''
      );
      setWaterPercent(
        assessmentToEdit.waterPercent !== undefined ? String(assessmentToEdit.waterPercent) : ''
      );
      setVisceralFatValue(
        assessmentToEdit.visceralFatValue !== undefined ? String(assessmentToEdit.visceralFatValue) : ''
      );
      setBoneMassKg(
        assessmentToEdit.boneMassKg !== undefined ? String(assessmentToEdit.boneMassKg) : ''
      );
      setBasalMetabolicRateKcal(
        assessmentToEdit.basalMetabolicRateKcal !== undefined
          ? String(assessmentToEdit.basalMetabolicRateKcal)
          : ''
      );
      setNotes(assessmentToEdit.notes || '');
    } else {
      // Reset form
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      setDate(getTodayDateString());
      setTime(`${currentHours}:${currentMinutes}`);
      setSource('manual');
      setWeightKg('');
      setWaistCm('');
      setAbdomenCm('');
      setHipCm('');
      setChestCm('');
      setThighCm('');
      setArmCm('');
      setLegCm('');
      setBodyFatPercent('');
      setMusclePercent('');
      setWaterPercent('');
      setVisceralFatValue('');
      setBoneMassKg('');
      setBasalMetabolicRateKcal('');
      setNotes('');
    }
    setCurrentStep(1);
    setError(null);
    setConfirmDelete(false);
  }, [assessmentToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time BMI calculation
  const parsedWeight = weightKg ? parseFloat(weightKg.replace(',', '.')) : undefined;
  const liveBmi =
    parsedWeight && profile?.heightCm ? calculateBmi(parsedWeight, profile.heightCm) : null;
  const bmiInfo = liveBmi ? getBmiCategory(liveBmi) : null;

  const parseOptionalNumber = (val: string): number | undefined => {
    if (!val || val.trim() === '') return undefined;
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? undefined : num;
  };

  const validateStep1 = (): boolean => {
    setError(null);
    if (!date) {
      setError('Por favor indica a data do registo.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setError(null);
    const numWeight = parseOptionalNumber(weightKg);
    if (numWeight !== undefined && (numWeight <= 0 || numWeight > 400)) {
      setError('Por favor indica um peso válido entre 20 kg e 400 kg.');
      return false;
    }

    const numFat = parseOptionalNumber(bodyFatPercent);
    if (numFat !== undefined && (numFat < 2 || numFat > 75)) {
      setError('A percentagem de gordura corporal deve estar entre 2% e 75%.');
      return false;
    }

    const numMuscle = parseOptionalNumber(musclePercent);
    if (numMuscle !== undefined && (numMuscle < 5 || numMuscle > 85)) {
      setError('A percentagem de massa muscular deve estar entre 5% e 85%.');
      return false;
    }

    const numWater = parseOptionalNumber(waterPercent);
    if (numWater !== undefined && (numWater < 20 || numWater > 85)) {
      setError('A percentagem de água corporal deve estar entre 20% e 85%.');
      return false;
    }

    const hasAnyMeasurement =
      numWeight !== undefined ||
      parseOptionalNumber(waistCm) !== undefined ||
      parseOptionalNumber(abdomenCm) !== undefined ||
      parseOptionalNumber(hipCm) !== undefined ||
      parseOptionalNumber(chestCm) !== undefined ||
      parseOptionalNumber(thighCm) !== undefined ||
      parseOptionalNumber(armCm) !== undefined ||
      parseOptionalNumber(legCm) !== undefined ||
      numFat !== undefined ||
      numMuscle !== undefined ||
      numWater !== undefined ||
      parseOptionalNumber(visceralFatValue) !== undefined ||
      parseOptionalNumber(boneMassKg) !== undefined ||
      parseOptionalNumber(basalMetabolicRateKcal) !== undefined;

    if (!hasAnyMeasurement && !notes.trim()) {
      setError('Por favor preenche pelo menos um valor (peso, medida ou nota).');
      return false;
    }

    return true;
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const goToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    const numWeight = parseOptionalNumber(weightKg);
    const numWaist = parseOptionalNumber(waistCm);
    const numAbdomen = parseOptionalNumber(abdomenCm);
    const numHip = parseOptionalNumber(hipCm);
    const numChest = parseOptionalNumber(chestCm);
    const numThigh = parseOptionalNumber(thighCm);
    const numArm = parseOptionalNumber(armCm);
    const numLeg = parseOptionalNumber(legCm);

    const numFat = parseOptionalNumber(bodyFatPercent);
    const numMuscle = parseOptionalNumber(musclePercent);
    const numWater = parseOptionalNumber(waterPercent);
    const numVisceral = parseOptionalNumber(visceralFatValue);
    const numBone = parseOptionalNumber(boneMassKg);
    const numBmr = parseOptionalNumber(basalMetabolicRateKcal);

    const calculatedBmi =
      numWeight !== undefined && profile?.heightCm
        ? calculateBmi(numWeight, profile.heightCm) ?? undefined
        : undefined;

    const assessment: BodyAssessment = {
      id: assessmentToEdit?.id || 'assessment_' + Date.now(),
      date,
      time,
      weightKg: numWeight,
      waistCm: numWaist,
      abdomenCm: numAbdomen,
      hipCm: numHip,
      chestCm: numChest,
      thighCm: numThigh,
      armCm: numArm,
      legCm: numLeg,
      bodyFatPercent: numFat,
      musclePercent: numMuscle,
      waterPercent: numWater,
      visceralFatValue: numVisceral,
      visceralFatUnit: numVisceral !== undefined ? 'índice' : undefined,
      boneMassKg: numBone,
      basalMetabolicRateKcal: numBmr,
      bmi: calculatedBmi,
      source,
      notes: notes.trim() || undefined,
      createdAt: assessmentToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveAssessment(assessment);
    onClose();
  };

  const handleDelete = async () => {
    if (!assessmentToEdit) return;
    await deleteAssessment(assessmentToEdit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#1F1721] p-5 sm:p-7 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-4 max-h-[94vh] flex flex-col animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start pb-3 border-b border-[#F2BFD3]/30 dark:border-[#362A36] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {assessmentToEdit ? 'Editar Avaliação Corporal' : 'Nova Avaliação Corporal'}
              </h2>
              <p className="text-[11px] text-[#817782] dark:text-[#A69AA8]">
                Passo {currentStep} de 3:{' '}
                {currentStep === 1
                  ? 'Data, Hora e Origem'
                  : currentStep === 2
                  ? 'Pesos, Medidas e Composição'
                  : 'Rever e Confirmar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="py-3 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition text-left ${
                currentStep === 1
                  ? 'bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] dark:text-[#E99AB9] border border-[#C86D93]/30'
                  : currentStep > 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40'
                  : 'bg-gray-100 dark:bg-[#140F15] text-[#817782] opacity-60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#1F1721] flex items-center justify-center text-[11px] font-bold shrink-0">
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className="truncate">Data & Origem</span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition text-left ${
                currentStep === 2
                  ? 'bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] dark:text-[#E99AB9] border border-[#C86D93]/30'
                  : currentStep > 2
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40'
                  : 'bg-gray-100 dark:bg-[#140F15] text-[#817782] opacity-60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#1F1721] flex items-center justify-center text-[11px] font-bold shrink-0">
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className="truncate">Pesos & Medidas</span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1() && validateStep2()) setCurrentStep(3);
              }}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition text-left ${
                currentStep === 3
                  ? 'bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93] dark:text-[#E99AB9] border border-[#C86D93]/30'
                  : 'bg-gray-100 dark:bg-[#140F15] text-[#817782] opacity-60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#1F1721] flex items-center justify-center text-[11px] font-bold shrink-0">
                3
              </span>
              <span className="truncate">Rever & Guardar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 shrink-0">
            {error}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">

          {/* ======================================================== */}
          {/* PÁGINA 1: DATA, HORA E ORIGEM */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <form onSubmit={goToStep2} id="assessment-step-1" className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] space-y-4">
                
                {/* Data do Registo */}
                <div>
                  <label className="block text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#C86D93]" />
                      Data do Registo *
                    </span>
                    {date && (
                      <span className="text-[11px] font-semibold text-[#C86D93]">
                        {formatDatePt(date)}
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2.5 text-sm font-semibold text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                  />
                  {date && (
                    <span className="block mt-1 text-[11px] text-[#817782] dark:text-[#A69AA8]">
                      Registo datado para: <strong>{formatDateLongPt(date)}</strong>
                    </span>
                  )}
                </div>

                {/* Hora da Medição */}
                <div>
                  <label className="block text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#C86D93]" />
                    Hora da Medição
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2.5 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                  />
                </div>

                {/* Origem da Medição */}
                <div>
                  <label className="block text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#C86D93]" />
                    Origem da Medição
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as AssessmentSource)}
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3.5 py-2.5 text-sm text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                  >
                    <option value="manual">Manual / Balança convencional</option>
                    <option value="bioimpedance">Balança de bioimpedância inteligente</option>
                    <option value="professional">Consulta profissional / nutricionista</option>
                    <option value="smart_device">Outro dispositivo conectado</option>
                  </select>
                </div>
              </div>

              {/* Dica de consistência */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] text-[11px] text-[#817782] dark:text-[#A69AA8]">
                <Info className="w-4 h-4 text-[#C86D93] shrink-0 mt-0.5" />
                <span>
                  <strong>Dica:</strong> Para obter comparações fiáveis, mede-te de preferência de manhã, em jejum e com a mesma balança e fita métrica.
                </span>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 2: PESOS, MEDIDAS E COMPOSIÇÃO CORPORAL */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <form onSubmit={goToStep3} id="assessment-step-2" className="space-y-4">
              
              {/* Peso Corporal & IMC */}
              <div className="p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                    Peso Corporal
                  </span>
                  {liveBmi && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#817782] dark:text-[#A69AA8]">IMC:</span>
                      <strong className="text-[#39313A] dark:text-[#F7EFF5]">{liveBmi}</strong>
                      <span className={`text-[11px] font-semibold ${bmiInfo?.color}`}>
                        ({bmiInfo?.label})
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="20"
                    max="350"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Ex: 64.2"
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] pl-3.5 pr-12 py-2.5 text-base font-bold text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-[#817782]">
                    kg
                  </span>
                </div>
              </div>

              {/* Medidas Corporais (Fita Métrica em cm) */}
              <div className="p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <span className="block text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
                  Medidas Corporais (cm)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Cintura (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="200"
                      value={waistCm}
                      onChange={(e) => setWaistCm(e.target.value)}
                      placeholder="Ex: 72.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Abdómen (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="200"
                      value={abdomenCm}
                      onChange={(e) => setAbdomenCm(e.target.value)}
                      placeholder="Ex: 78.5"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Anca / Glúteos (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="40"
                      max="220"
                      value={hipCm}
                      onChange={(e) => setHipCm(e.target.value)}
                      placeholder="Ex: 98.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Peito (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="40"
                      max="200"
                      value={chestCm}
                      onChange={(e) => setChestCm(e.target.value)}
                      placeholder="Ex: 88.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Coxa (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="20"
                      max="120"
                      value={thighCm}
                      onChange={(e) => setThighCm(e.target.value)}
                      placeholder="Ex: 56.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Braço (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="15"
                      max="80"
                      value={armCm}
                      onChange={(e) => setArmCm(e.target.value)}
                      placeholder="Ex: 27.5"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Perna / Gémeos (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="15"
                      max="80"
                      value={legCm}
                      onChange={(e) => setLegCm(e.target.value)}
                      placeholder="Ex: 36.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>
                </div>
              </div>

              {/* Composição Corporal (Opcional) */}
              <div className="p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36]">
                <span className="block text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
                  Composição Corporal (Opcional)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Gordura (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="3"
                      max="70"
                      value={bodyFatPercent}
                      onChange={(e) => setBodyFatPercent(e.target.value)}
                      placeholder="Ex: 24.5"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Músculo (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="80"
                      value={musclePercent}
                      onChange={(e) => setMusclePercent(e.target.value)}
                      placeholder="Ex: 31.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Água (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="20"
                      max="80"
                      value={waterPercent}
                      onChange={(e) => setWaterPercent(e.target.value)}
                      placeholder="Ex: 52.0"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Gordura Visceral (1-20)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="30"
                      value={visceralFatValue}
                      onChange={(e) => setVisceralFatValue(e.target.value)}
                      placeholder="Ex: 4"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Massa Óssea (kg)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="15"
                      value={boneMassKg}
                      onChange={(e) => setBoneMassKg(e.target.value)}
                      placeholder="Ex: 2.55"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                      Metabolismo (kcal)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="500"
                      max="4000"
                      value={basalMetabolicRateKcal}
                      onChange={(e) => setBasalMetabolicRateKcal(e.target.value)}
                      placeholder="Ex: 1420"
                      className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-white dark:bg-[#1F1721] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-semibold text-[#817782] dark:text-[#A69AA8] mb-1">
                  Notas ou observações (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Após treino leve; medido de manhã em jejum..."
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                />
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 3: REVER E GUARDAR / CANCELAR */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2BFD3]/30 dark:border-[#362A36]">
                  <Eye className="w-4 h-4 text-[#C86D93]" />
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                    Resumo da Avaliação
                  </span>
                </div>

                {/* Resumo da Data e Hora */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-[#817782] block">Data:</span>
                    <strong className="text-[#39313A] dark:text-[#F7EFF5]">
                      {formatDatePt(date)} ({formatDateLongPt(date)})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#817782] block">Hora & Origem:</span>
                    <strong className="text-[#39313A] dark:text-[#F7EFF5]">
                      {time} · {getSourceLabel(source)}
                    </strong>
                  </div>
                </div>

                {/* Resumo do Peso */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/40 dark:border-[#362A36] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#817782] block">Peso Corporal</span>
                    <span className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
                      {weightKg ? `${weightKg} kg` : 'Não indicado'}
                    </span>
                  </div>
                  {liveBmi && (
                    <div className="text-right">
                      <span className="text-[11px] text-[#817782] block">IMC Estimado</span>
                      <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5]">
                        {liveBmi}{' '}
                        <span className={`text-[11px] font-semibold ${bmiInfo?.color}`}>
                          ({bmiInfo?.label})
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Resumo das Medidas */}
                <div>
                  <span className="text-[11px] font-semibold text-[#817782] block mb-1.5">
                    Medidas em Centímetros:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                      <span className="text-[10px] text-[#817782] block">Cintura</span>
                      <strong>{waistCm ? `${waistCm} cm` : '—'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                      <span className="text-[10px] text-[#817782] block">Abdómen</span>
                      <strong>{abdomenCm ? `${abdomenCm} cm` : '—'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                      <span className="text-[10px] text-[#817782] block">Anca</span>
                      <strong>{hipCm ? `${hipCm} cm` : '—'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                      <span className="text-[10px] text-[#817782] block">Peito</span>
                      <strong>{chestCm ? `${chestCm} cm` : '—'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                      <span className="text-[10px] text-[#817782] block">Coxa</span>
                      <strong>{thighCm ? `${thighCm} cm` : '—'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                      <span className="text-[10px] text-[#817782] block">Braço</span>
                      <strong>{armCm ? `${armCm} cm` : '—'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20 col-span-2">
                      <span className="text-[10px] text-[#817782] block">Perna / Gémeos</span>
                      <strong>{legCm ? `${legCm} cm` : '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Resumo da Composição */}
                {(bodyFatPercent || musclePercent || waterPercent || visceralFatValue || boneMassKg || basalMetabolicRateKcal) && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#817782] block mb-1.5">
                      Composição Corporal:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {bodyFatPercent && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                          <span className="text-[10px] text-[#817782] block">Gordura</span>
                          <strong>{bodyFatPercent}%</strong>
                        </div>
                      )}
                      {musclePercent && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                          <span className="text-[10px] text-[#817782] block">Músculo</span>
                          <strong>{musclePercent}%</strong>
                        </div>
                      )}
                      {waterPercent && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                          <span className="text-[10px] text-[#817782] block">Água</span>
                          <strong>{waterPercent}%</strong>
                        </div>
                      )}
                      {visceralFatValue && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                          <span className="text-[10px] text-[#817782] block">Gordura Visceral</span>
                          <strong>Nível {visceralFatValue}</strong>
                        </div>
                      )}
                      {boneMassKg && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                          <span className="text-[10px] text-[#817782] block">Massa Óssea</span>
                          <strong>{boneMassKg} kg</strong>
                        </div>
                      )}
                      {basalMetabolicRateKcal && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20">
                          <span className="text-[10px] text-[#817782] block">TMB</span>
                          <strong>{basalMetabolicRateKcal} kcal</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1F1721] border border-[#F2BFD3]/20 text-xs">
                    <span className="text-[10px] text-[#817782] block">Notas:</span>
                    <span className="italic text-[#39313A] dark:text-[#F7EFF5]">"{notes}"</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-[#F2BFD3]/30 dark:border-[#362A36] shrink-0 mt-3">
          
          {/* PASSO 1 CONTROLS */}
          {currentStep === 1 && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2.5 text-xs font-semibold text-[#817782] hover:text-[#39313A] dark:hover:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={(e) => goToStep2(e)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-6 py-2.5 text-xs font-bold shadow-xs transition"
              >
                <span>Seguinte (Pesos & Medidas)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASSO 2 CONTROLS */}
          {currentStep === 2 && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2.5 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior (Data & Origem)</span>
              </button>
              <button
                type="button"
                onClick={(e) => goToStep3(e)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-6 py-2.5 text-xs font-bold shadow-xs transition"
              >
                <span>Seguinte (Rever Resumo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASSO 3 CONTROLS (REVER E GUARDAR / CANCELAR) */}
          {currentStep === 3 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-3.5 py-2.5 text-xs font-semibold text-[#817782] hover:text-[#39313A] dark:hover:text-[#F7EFF5] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar a Editar</span>
                </button>

                {assessmentToEdit && (
                  confirmDelete ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-xl bg-rose-600 text-white px-3 py-2 text-xs font-bold"
                      >
                        Confirmar eliminação
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs text-gray-500 hover:underline px-1.5"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                      title="Eliminar esta avaliação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2.5 text-xs font-semibold text-[#817782] hover:text-[#39313A] dark:hover:text-[#F7EFF5] transition text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave(e)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Avaliação</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
