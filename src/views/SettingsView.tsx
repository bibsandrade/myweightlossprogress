import React, { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  Plus,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/db';
import {
  ActivityLevel,
  PrimaryGoal,
  UserProfile,
  GoalMilestone,
  BackupData,
} from '../types';
import { getTodayDateString } from '../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    profile,
    preferences,
    milestones,
    updateProfile,
    updatePreferences,
    saveMilestone,
    deleteMilestone,
    importData,
    clearAllData,
  } = useApp();

  // Profile Edit State
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ? String(profile.heightCm) : '');
  const [goalWeightKg, setGoalWeightKg] = useState(
    profile?.goalWeightKg ? String(profile.goalWeightKg) : ''
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel || 'moderately_active'
  );
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(
    profile?.primaryGoal || 'weight_loss'
  );
  const [notes, setNotes] = useState(profile?.notes || '');

  const [profileSaved, setProfileSaved] = useState(false);

  // New Milestone State
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneTarget, setMilestoneTarget] = useState('');
  const [milestoneUnit, setMilestoneUnit] = useState('kg');

  // Quick water amounts state
  const [waterAmounts, setWaterAmounts] = useState<string>(
    (preferences.quickWaterAmounts || [150, 250, 330, 500]).join(', ')
  );

  // Backup / Import State
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  // Delete All State
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      id: profile?.id || 'user_profile',
      name: name.trim() || 'Utilizadora',
      age: age ? parseInt(age, 10) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      initialWeightKg: profile?.initialWeightKg,
      goalWeightKg: goalWeightKg ? parseFloat(goalWeightKg) : undefined,
      startDate: profile?.startDate || getTodayDateString(),
      activityLevel,
      primaryGoal,
      notes: notes.trim() || undefined,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateProfile(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneName.trim() || !milestoneTarget) return;

    const newMilestone: GoalMilestone = {
      id: 'milestone_' + Date.now(),
      name: milestoneName.trim(),
      targetType: milestoneUnit === 'kg' ? 'weight' : milestoneUnit === 'cm' ? 'waist' : 'custom',
      targetValue: parseFloat(milestoneTarget),
      unit: milestoneUnit,
      createdAt: new Date().toISOString(),
    };

    await saveMilestone(newMilestone);
    setMilestoneName('');
    setMilestoneTarget('');
  };

  const handleUpdateWaterAmounts = async () => {
    const parsed = waterAmounts
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (parsed.length > 0) {
      await updatePreferences({ quickWaterAmounts: parsed });
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await dbService.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-progress-backup-${getTodayDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar cópia de segurança:', err);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsed: BackupData;
      try {
        parsed = JSON.parse(text);
      } catch {
        setImportError('O ficheiro selecionado não contém um formato JSON válido.');
        return;
      }

      if (!parsed || typeof parsed !== 'object' || (!parsed.assessments && !parsed.profile && !parsed.dailyEntries)) {
        setImportError('Estrutura de dados não reconhecida. Por favor seleciona um ficheiro exportado pelo My Progress.');
        return;
      }

      const res = await importData(parsed, importMode);
      setImportStatus(
        `Importação concluída com sucesso! (${res.importedAssessments} avaliações, ${res.importedEntries} diários restaurados)`
      );
    } catch (err: any) {
      setImportError(`Erro ao importar dados: ${err.message || 'Falha inesperada'}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleClearEverything = async () => {
    await clearAllData();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#39313A] dark:text-[#F7EFF5]">
          Definições & Personalização
        </h1>
        <p className="text-xs text-[#817782] dark:text-[#A69AA8] mt-0.5">
          Configura o teu perfil, objetivos, tema visual e gere as tuas cópias de segurança
        </p>
      </div>

      {/* 1. TEMA VISUAL */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#C86D93]" />
          <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Aparência & Tema
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
          <button
            type="button"
            onClick={() => updatePreferences({ theme: 'light' })}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer text-center ${
              preferences.theme === 'light'
                ? 'border-[#C86D93] bg-[#F8DCE8]/50 dark:bg-[#2D1E2B] shadow-xs'
                : 'border-[#F2BFD3]/40 dark:border-[#362A36] hover:bg-[#FFF8FB] dark:hover:bg-[#140F15]'
            }`}
          >
            <Sun className={`w-5 h-5 ${preferences.theme === 'light' ? 'text-[#C86D93]' : 'text-[#817782]'}`} />
            <div>
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">Claro</span>
              <span className="text-[10px] text-[#817782] dark:text-[#A69AA8]">Tons suaves de rosa & branco</span>
            </div>
            {preferences.theme === 'light' && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E99AB9] text-white font-semibold">Ativo</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updatePreferences({ theme: 'dark' })}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer text-center ${
              preferences.theme === 'dark'
                ? 'border-[#C86D93] bg-[#F8DCE8]/50 dark:bg-[#2D1E2B] shadow-xs'
                : 'border-[#F2BFD3]/40 dark:border-[#362A36] hover:bg-[#FFF8FB] dark:hover:bg-[#140F15]'
            }`}
          >
            <Moon className={`w-5 h-5 ${preferences.theme === 'dark' ? 'text-[#C86D93]' : 'text-[#817782]'}`} />
            <div>
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">Escuro</span>
              <span className="text-[10px] text-[#817782] dark:text-[#A69AA8]">Fundo escuro e confortável</span>
            </div>
            {preferences.theme === 'dark' && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E99AB9] text-white font-semibold">Ativo</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updatePreferences({ theme: 'system' })}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer text-center ${
              preferences.theme === 'system'
                ? 'border-[#C86D93] bg-[#F8DCE8]/50 dark:bg-[#2D1E2B] shadow-xs'
                : 'border-[#F2BFD3]/40 dark:border-[#362A36] hover:bg-[#FFF8FB] dark:hover:bg-[#140F15]'
            }`}
          >
            <Laptop className={`w-5 h-5 ${preferences.theme === 'system' ? 'text-[#C86D93]' : 'text-[#817782]'}`} />
            <div>
              <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">Sistema</span>
              <span className="text-[10px] text-[#817782] dark:text-[#A69AA8]">Segue o dispositivo</span>
            </div>
            {preferences.theme === 'system' && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E99AB9] text-white font-semibold">Ativo</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. PERFIL PESSOAL & OBJETIVOS */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#C86D93]" />
          <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Perfil Pessoal & Metas
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Nome de apresentação
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Idade (anos)
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                min="100"
                max="250"
                step="0.5"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Peso Objetivo (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                value={goalWeightKg}
                onChange={(e) => setGoalWeightKg(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Objetivo Principal
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as PrimaryGoal)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              >
                <option value="weight_loss">Perda de peso</option>
                <option value="weight_maintenance">Manutenção do peso</option>
                <option value="weight_gain">Aumento de peso / massa</option>
                <option value="measurements">Acompanhamento de medidas</option>
                <option value="body_composition">Composição corporal</option>
                <option value="habits_fitness">Hábitos e condição física</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
              Nível de Atividade Física
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
            >
              <option value="sedentary">Sedentário</option>
              <option value="lightly_active">Ligeiramente ativo</option>
              <option value="moderately_active">Moderadamente ativo</option>
              <option value="very_active">Muito ativo</option>
              <option value="extremely_active">Extremamente ativo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
              Notas e Motivação
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSaved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Perfil guardado com sucesso!
              </span>
            ) : (
              <div />
            )}
            <button
              type="submit"
              className="rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2 text-xs font-semibold shadow-xs transition"
            >
              Guardar Perfil
            </button>
          </div>
        </form>
      </div>

      {/* 3. METAS INTERMÉDIAS */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5] mb-2">
          Metas Intermédias Configuráveis
        </h2>
        <p className="text-xs text-[#817782] dark:text-[#A69AA8] mb-4">
          Define pequenas metas que pretendes alcançar ao longo do caminho (ex: "Chegar aos 65 kg", "Cintura a 75 cm").
        </p>

        {milestones.length > 0 && (
          <div className="space-y-2 mb-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/30 text-xs"
              >
                <div>
                  <span className="font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                    {m.name}
                  </span>
                  <span className="text-[#817782] ml-2">
                    ({m.targetValue} {m.unit})
                  </span>
                </div>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  className="text-gray-400 hover:text-rose-500"
                  title="Eliminar meta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddMilestone} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Nome da meta (Ex: Primeira vitória 65kg)"
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Valor"
            value={milestoneTarget}
            onChange={(e) => setMilestoneTarget(e.target.value)}
            className="w-24 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs"
          />
          <select
            value={milestoneUnit}
            onChange={(e) => setMilestoneUnit(e.target.value)}
            className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs"
          >
            <option value="kg">kg</option>
            <option value="cm">cm</option>
            <option value="%">%</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-4 py-2 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Meta</span>
          </button>
        </form>
      </div>

      {/* 4. PREFERÊNCIAS DO DIÁRIO */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5] mb-2">
          Preferências do Diário & Água
        </h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
              Botões de registo rápido de água (em ml, separados por vírgula)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={waterAmounts}
                onChange={(e) => setWaterAmounts(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3.5 py-2 text-xs"
              />
              <button
                type="button"
                onClick={handleUpdateWaterAmounts}
                className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2 text-xs font-semibold hover:bg-[#F8DCE8]/30 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CÓPIA DE SEGURANÇA E RESTAURO (BACKUP & RESTORE) */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-[#C86D93]" />
          <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Cópias de Segurança & Restauro (JSON)
          </h2>
        </div>
        <p className="text-xs text-[#817782] dark:text-[#A69AA8] mb-4 leading-relaxed">
          Os teus dados são guardados de forma segura e privada na base de dados IndexedDB do teu navegador. Faz cópias de segurança regulares para transferir dados entre computadores ou prevenir perdas ao limpar a cache do navegador.
        </p>

        {importStatus && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200">
            {importStatus}
          </div>
        )}

        {importError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-800 dark:text-rose-200">
            {importError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Cópia de Segurança (.json)</span>
          </button>

          <div className="flex items-center gap-2">
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
              className="rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs"
            >
              <option value="merge">Mesclar com existentes</option>
              <option value="replace">Substituir todos os dados</option>
            </select>

            <label className="flex items-center justify-center gap-2 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-4 py-2 text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/30 transition cursor-pointer">
              <Upload className="w-4 h-4 text-[#C86D93]" />
              <span>Restaurar Ficheiro JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 6. PRIVACIDADE & SEGURANÇA */}
      <div className="rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-xs border border-[#F2BFD3]/40 dark:border-[#362A36]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-[#39313A] dark:text-[#F7EFF5]">
            Privacidade & Segurança dos Teus Dados
          </h2>
        </div>
        <div className="text-xs text-[#817782] dark:text-[#A69AA8] space-y-2 leading-relaxed">
          <p>
            • <strong>100% Local:</strong> A aplicação funciona localmente através de IndexedDB. Nenhum registo de peso, medidas corporais, alimentação ou notas pessoais é enviado para servidores externos.
          </p>
          <p>
            • <strong>Sem autenticação obrigatória:</strong> Não precisas de criar conta ou ceder email para utilizar a aplicação com todas as funcionalidades.
          </p>
          <p>
            • <strong>Aviso Importante:</strong> Se limpares todos os dados do navegador ou desinstalares a aplicação sem uma cópia de segurança descarregada, os dados locais podem ser apagados pelo sistema operativo. Lembra-te de exportar uma cópia JSON periodicamente.
          </p>
        </div>
      </div>

      {/* 7. ZONA DE PERIGO */}
      <div className="rounded-3xl bg-rose-50/50 dark:bg-rose-950/10 p-6 border border-rose-200 dark:border-rose-900/40">
        <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-bold">Zona de Perigo</h2>
        </div>
        <p className="text-xs text-[#817782] dark:text-[#A69AA8] mb-4">
          Elimina permanentemente todo o histórico de pesagens, avaliações, diários e definições desta aplicação.
        </p>

        {showClearConfirm ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1F1721] border border-rose-300 space-y-3">
            <span className="text-xs font-bold text-rose-600 block">
              Tens a certeza absoluta? Esta ação é irreversível se não tiveres uma cópia de segurança!
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearEverything}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition"
              >
                Sim, apagar tudo
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 px-4 py-2 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/40 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Todos os Dados</span>
          </button>
        )}
      </div>
    </div>
  );
};
