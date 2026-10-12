import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Info, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BodyAssessment, AssessmentSource } from '../types';
import { calculateBmi, getBmiCategory } from '../services/calculations';
import { getTodayDateString } from '../utils/formatters';

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

  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('08:00');
  const [source, setSource] = useState<AssessmentSource>('manual');

  // Physical measures (string state for pristine typing)
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [abdomenCm, setAbdomenCm] = useState('');
  const [hipCm, setHipCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [thighCm, setThighCm] = useState('');
  const [armCm, setArmCm] = useState('');
  const [legCm, setLegCm] = useState('');

  // Composition
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [musclePercent, setMusclePercent] = useState('');
  const [waterPercent, setWaterPercent] = useState('');
  const [visceralFatValue, setVisceralFatValue] = useState('');
  const [boneMassKg, setBoneMassKg] = useState('');
  const [basalMetabolicRateKcal, setBasalMetabolicRateKcal] = useState('');

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
    setError(null);
    setConfirmDelete(false);
  }, [assessmentToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time BMI calculation
  const parsedWeight = weightKg ? parseFloat(weightKg) : undefined;
  const liveBmi =
    parsedWeight && profile?.heightCm ? calculateBmi(parsedWeight, profile.heightCm) : null;
  const bmiInfo = liveBmi ? getBmiCategory(liveBmi) : null;

  const parseOptionalNumber = (val: string): number | undefined => {
    if (!val || val.trim() === '') return undefined;
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? undefined : num;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('A data do registo é obrigatória.');
      return;
    }

    const numWeight = parseOptionalNumber(weightKg);
    if (numWeight !== undefined && (numWeight <= 0 || numWeight > 400)) {
      setError('Por favor indica um peso válido entre 20 kg e 400 kg.');
      return;
    }

    const numWaist = parseOptionalNumber(waistCm);
    const numAbdomen = parseOptionalNumber(abdomenCm);
    const numHip = parseOptionalNumber(hipCm);
    const numChest = parseOptionalNumber(chestCm);
    const numThigh = parseOptionalNumber(thighCm);
    const numArm = parseOptionalNumber(armCm);
    const numLeg = parseOptionalNumber(legCm);

    const numFat = parseOptionalNumber(bodyFatPercent);
    if (numFat !== undefined && (numFat < 2 || numFat > 75)) {
      setError('A percentagem de gordura corporal deve estar entre 2% e 75%.');
      return;
    }

    const numMuscle = parseOptionalNumber(musclePercent);
    if (numMuscle !== undefined && (numMuscle < 5 || numMuscle > 85)) {
      setError('A percentagem de massa muscular deve estar entre 5% e 85%.');
      return;
    }

    const numWater = parseOptionalNumber(waterPercent);
    if (numWater !== undefined && (numWater < 20 || numWater > 85)) {
      setError('A percentagem de água corporal deve estar entre 20% e 85%.');
      return;
    }

    const numVisceral = parseOptionalNumber(visceralFatValue);
    const numBone = parseOptionalNumber(boneMassKg);
    const numBmr = parseOptionalNumber(basalMetabolicRateKcal);

    // Ensure at least one value was filled
    const hasAnyMeasurement =
      numWeight !== undefined ||
      numWaist !== undefined ||
      numAbdomen !== undefined ||
      numHip !== undefined ||
      numChest !== undefined ||
      numThigh !== undefined ||
      numArm !== undefined ||
      numLeg !== undefined ||
      numFat !== undefined ||
      numMuscle !== undefined ||
      numWater !== undefined ||
      numVisceral !== undefined ||
      numBone !== undefined ||
      numBmr !== undefined;

    if (!hasAnyMeasurement && !notes.trim()) {
      setError('Por favor preenche pelo menos um valor (peso, medida ou composição).');
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-8 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-6 animate-in fade-in duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {assessmentToEdit ? 'Editar Avaliação Corporal' : 'Nova Avaliação Corporal'}
              </h2>
              <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
                Registo de peso, medidas corporais e composição física
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative measurement tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] text-[11px] text-[#817782] dark:text-[#A69AA8] mb-4">
          <Info className="w-4 h-4 text-[#C86D93] shrink-0 mt-0.5" />
          <span>
            <strong>Recomendação:</strong> Efetua as pesagens e medições em condições consistentes (de preferência em jejum, ao acordar e com a mesma fita métrica/balança) para resultados comparáveis.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata: Date, Time & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Data do registo *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Hora da medição
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                Origem da medição
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as AssessmentSource)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
              >
                <option value="manual">Manual / Balança normal</option>
                <option value="bioimpedance">Balança de bioimpedância</option>
                <option value="professional">Avaliação profissional / nutricional</option>
                <option value="smart_device">Dispositivo inteligente</option>
              </select>
            </div>
          </div>

          {/* Section: Weight & BMI */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide">
                Peso Corporal
              </span>
              {liveBmi && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#817782] dark:text-[#A69AA8]">IMC calculado:</span>
                  <span className="font-bold text-[#39313A] dark:text-[#F7EFF5]">{liveBmi}</span>
                  <span className={`text-[11px] font-medium ${bmiInfo?.color}`}>
                    ({bmiInfo?.label})
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Peso (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="20"
                    max="350"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Ex: 64.2"
                    className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] pl-3 pr-10 py-2.5 text-sm font-semibold text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-[#817782]">kg</span>
                </div>
              </div>
              <div className="flex items-center text-[11px] text-[#817782] dark:text-[#A69AA8] leading-tight">
                {profile?.heightCm ? (
                  <span>
                    Altura configurada: <strong>{profile.heightCm} cm</strong>. O IMC é atualizado automaticamente. Não constitui diagnóstico médico.
                  </span>
                ) : (
                  <span>
                    Define a tua altura nas Definições para cálculo automático do IMC.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Body Circumferences */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <span className="block text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
              Medidas Corporais (em centímetros)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
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
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>
            </div>
          </div>

          {/* Section: Body Composition */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19131B] border border-[#F2BFD3]/40 dark:border-[#362A36]">
            <span className="block text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] uppercase tracking-wide mb-3">
              Composição Corporal (Bioimpedância / Avaliação)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Gordura corporal (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="70"
                  value={bodyFatPercent}
                  onChange={(e) => setBodyFatPercent(e.target.value)}
                  placeholder="Ex: 24.5"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Massa muscular (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="80"
                  value={musclePercent}
                  onChange={(e) => setMusclePercent(e.target.value)}
                  placeholder="Ex: 31.0"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Água corporal (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="80"
                  value={waterPercent}
                  onChange={(e) => setWaterPercent(e.target.value)}
                  placeholder="Ex: 52.0"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Gordura visceral (índice 1-20)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="30"
                  value={visceralFatValue}
                  onChange={(e) => setVisceralFatValue(e.target.value)}
                  placeholder="Ex: 4"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Massa óssea (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="15"
                  value={boneMassKg}
                  onChange={(e) => setBoneMassKg(e.target.value)}
                  placeholder="Ex: 2.55"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
                  Metabolismo basal (kcal/dia)
                </label>
                <input
                  type="number"
                  step="1"
                  min="500"
                  max="4000"
                  value={basalMetabolicRateKcal}
                  onChange={(e) => setBasalMetabolicRateKcal(e.target.value)}
                  placeholder="Ex: 1420"
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#817782] dark:text-[#A69AA8] mb-1">
              Notas adicionais
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pesagem após o treino, sensação de retenção hídrica normal..."
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5] focus:outline-hidden focus:ring-2 focus:ring-[#E99AB9]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F2BFD3]/30 dark:border-[#362A36]">
            {assessmentToEdit ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 font-medium">Tem a certeza?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-xl bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-rose-700 transition"
                  >
                    Sim, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 transition py-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar registo</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2 text-xs font-semibold shadow-sm transition"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Avaliação</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
