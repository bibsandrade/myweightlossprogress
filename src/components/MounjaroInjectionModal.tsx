import React, { useState } from 'react';
import { X, Check, Syringe, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MounjaroInjection, InjectionSite } from '../types';
import { getTodayDateString } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  injectionToEdit?: MounjaroInjection | null;
}

export const MounjaroInjectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  injectionToEdit,
}) => {
  const { saveMounjaroInjection, deleteMounjaroInjection } = useApp();

  const [date, setDate] = useState(injectionToEdit?.date || getTodayDateString());
  const [time, setTime] = useState(injectionToEdit?.time || '09:00');
  const [doseMg, setDoseMg] = useState<number>(injectionToEdit?.doseMg || 2.5);
  const [customDose, setCustomDose] = useState<string>('');
  const [site, setSite] = useState<InjectionSite>(
    injectionToEdit?.site || 'abdomen_direito'
  );
  const [notes, setNotes] = useState(injectionToEdit?.notes || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const standardDoses = [2.5, 5.0, 7.5, 10.0, 12.5, 15.0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDose = customDose ? parseFloat(customDose.replace(',', '.')) : doseMg;

    const injection: MounjaroInjection = {
      id: injectionToEdit?.id || 'inj_' + Date.now(),
      date,
      time,
      doseMg: finalDose,
      site,
      notes: notes.trim() || undefined,
      createdAt: injectionToEdit?.createdAt || new Date().toISOString(),
    };

    await saveMounjaroInjection(injection);
    onClose();
  };

  const handleDelete = async () => {
    if (!injectionToEdit) return;
    await deleteMounjaroInjection(injectionToEdit.id);
    onClose();
  };

  const siteLabels: Record<InjectionSite, string> = {
    abdomen_direito: 'Abdómen Direito',
    abdomen_esquerdo: 'Abdómen Esquerdo',
    coxa_direita: 'Coxa Direita',
    coxa_esquerda: 'Coxa Esquerda',
    braco_direito: 'Braço Direito',
    braco_esquerdo: 'Braço Esquerdo',
    outro: 'Outro local',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1F1721] p-6 sm:p-8 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] my-6 animate-in fade-in duration-150">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#39313A] dark:text-[#F7EFF5]">
                {injectionToEdit ? 'Editar Injeção de Mounjaro' : 'Registar Dose de Mounjaro'}
              </h2>
              <p className="text-xs text-[#817782] dark:text-[#A69AA8]">
                Registo semanal da dose e local de aplicação
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

        <form onSubmit={handleSave} className="space-y-5">
          {/* Dose Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-2">
              Dose administrada (mg)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {standardDoses.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setDoseMg(d);
                    setCustomDose('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    doseMg === d && !customDose
                      ? 'bg-[#E99AB9] border-[#C86D93] text-white shadow-xs'
                      : 'border-[#F2BFD3]/60 dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] text-[#39313A] dark:text-[#F7EFF5] hover:border-[#E99AB9]'
                  }`}
                >
                  {d} mg
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-[#817782]">Ou dose personalizada:</span>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                placeholder="Ex: 3.75"
                value={customDose}
                onChange={(e) => setCustomDose(e.target.value)}
                className="w-24 rounded-lg border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-2 py-1 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
              <span className="text-xs text-[#817782]">mg</span>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Data da injeção
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
                Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
              />
            </div>
          </div>

          {/* Injection Site */}
          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C86D93]" />
              <span>Local da aplicação (Rotação recomendada)</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(siteLabels) as InjectionSite[]).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSite(s)}
                  className={`p-2 rounded-xl text-left border transition ${
                    site === s
                      ? 'border-[#C86D93] bg-[#F8DCE8]/50 dark:bg-[#2D1E2B] font-bold text-[#C86D93]'
                      : 'border-[#F2BFD3]/40 dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] text-[#817782] dark:text-[#A69AA8]'
                  }`}
                >
                  {siteLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#39313A] dark:text-[#F7EFF5] mb-1">
              Notas ou observações da injeção
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Aplicação indolor, primeira dose de 5mg, etc."
              className="w-full rounded-xl border border-[#F2BFD3] dark:border-[#362A36] bg-[#FFF8FB] dark:bg-[#140F15] px-3 py-2 text-xs text-[#39313A] dark:text-[#F7EFF5]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-[#F2BFD3]/30 dark:border-[#362A36]">
            {injectionToEdit ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 font-semibold">Confirmar?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-xl bg-rose-600 text-white px-3 py-1.5 text-xs font-bold"
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                <span>Guardar Injeção</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
