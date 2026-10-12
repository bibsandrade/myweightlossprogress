import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Scale,
  Calendar,
  FileText,
  Settings,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  Droplet,
  Utensils,
  Syringe,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAssessmentModal: () => void;
  onOpenDailyModal: () => void;
  onOpenInjectionModal: () => void;
  onOpenMealModal?: () => void;
  onOpenSymptomsModal?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenAssessmentModal,
  onOpenDailyModal,
  onOpenInjectionModal,
  onOpenMealModal,
  onOpenSymptomsModal,
  children,
}) => {
  const { profile, preferences, updatePreferences } = useApp();
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Diário', icon: BookOpen },
    { id: 'mounjaro', label: 'Mounjaro', icon: Syringe },
    { id: 'assessments', label: 'Peso & Medidas', icon: Scale },
    { id: 'history', label: 'Histórico', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Definições', icon: Settings },
  ];

  const isDarkMode = typeof document !== 'undefined'
    ? document.documentElement.classList.contains('dark')
    : preferences.theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
  };

  return (
    <div className="min-h-screen bg-[#FFF8FB] dark:bg-[#140F15] text-[#39313A] dark:text-[#F7EFF5] flex flex-col md:flex-row transition-colors">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-[#1F1721] border-r border-[#F2BFD3]/40 dark:border-[#362A36] p-5 h-screen sticky top-0 justify-between no-print">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#F2BFD3] to-[#C86D93] flex items-center justify-center text-white shadow-xs font-bold text-base">
              🌸
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#39313A] dark:text-[#F7EFF5] block leading-tight">
                My Progress
              </span>
              <span className="text-[10px] text-[#817782] dark:text-[#A69AA8] font-medium tracking-wide">
                Acompanhamento Pessoal
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setShowQuickActionModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#E99AB9] hover:bg-[#C86D93] text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Registo</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#F8DCE8]/50 dark:bg-[#2D1E2B] text-[#C86D93] dark:text-[#E99AB9] font-bold shadow-xs'
                      : 'text-[#817782] dark:text-[#A69AA8] hover:bg-[#FFF8FB] dark:hover:bg-[#140F15] hover:text-[#39313A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Widget */}
        <div className="space-y-3 pt-4 border-t border-[#F2BFD3]/30 dark:border-[#362A36]">
          <PWAInstallButton className="w-full justify-center" />

          <div className="flex items-center justify-between px-2 pt-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#F2BFD3]/40 dark:border-[#362A36] text-[#817782] hover:text-[#C86D93] transition flex items-center gap-2 text-xs"
              title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-medium text-[#F7EFF5]">Tema Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#817782]" />
                  <span className="text-[11px] font-medium text-[#39313A]">Tema Escuro</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-[#817782] truncate max-w-[100px]">
              {profile?.name || 'My Progress'}
            </span>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1F1721] border-b border-[#F2BFD3]/40 dark:border-[#362A36] sticky top-0 z-40 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F2BFD3] to-[#C86D93] flex items-center justify-center text-white text-sm">
            🌸
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#39313A] dark:text-[#F7EFF5] block leading-tight">
              My Progress
            </span>
            <span className="text-[9px] text-[#817782]">Evolução Pessoal</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick theme toggle on mobile */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-[#F2BFD3]/40 dark:border-[#362A36] text-[#817782] hover:text-[#C86D93]"
            title={isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#817782]" />
            )}
          </button>

          <PWAInstallButton />

          <button
            onClick={() => setShowQuickActionModal(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E99AB9] text-white shadow-xs"
            title="Novo registo"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-[#F2BFD3]/40 text-[#817782]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-black/40 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-[#1F1721] p-5 border-b border-[#F2BFD3]/40 shadow-xl space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#F8DCE8]/60 dark:bg-[#2D1E2B] text-[#C86D93] font-bold'
                      : 'text-[#817782]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 flex justify-between items-center border-t border-[#F2BFD3]/20">
              <span className="text-xs text-[#817782]">Tema Visual:</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 p-1.5 px-3 rounded-xl border border-[#F2BFD3]/40 text-xs font-semibold"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mudar para Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#817782]" />
                    <span>Mudar para Escuro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1F1721]/95 backdrop-blur-md border-t border-[#F2BFD3]/40 dark:border-[#362A36] px-2 py-1.5 flex items-center justify-around no-print">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] transition ${
                isActive
                  ? 'text-[#C86D93] font-bold'
                  : 'text-[#817782] dark:text-[#A69AA8]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] transition ${
            currentTab === 'settings'
              ? 'text-[#C86D93] font-bold'
              : 'text-[#817782] dark:text-[#A69AA8]'
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Definições</span>
        </button>
      </nav>

      {/* QUICK ACTION SELECTION MODAL */}
      {showQuickActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1F1721] p-6 shadow-2xl border border-[#F2BFD3]/50 dark:border-[#362A36] animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#39313A] dark:text-[#F7EFF5]">
                O que pretendes registar?
              </h3>
              <button
                onClick={() => setShowQuickActionModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* 1. Alimentação */}
              <button
                onClick={() => {
                  setShowQuickActionModal(false);
                  if (onOpenMealModal) onOpenMealModal();
                  else onOpenDailyModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] hover:border-[#E99AB9] transition text-left"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">
                    Registo de Alimentação
                  </span>
                  <span className="text-[10px] text-[#817782]">
                    Refeição, alimentos, calorias e proteína
                  </span>
                </div>
              </button>

              {/* 2. Mounjaro Dose */}
              <button
                onClick={() => {
                  setShowQuickActionModal(false);
                  onOpenInjectionModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] hover:border-[#E99AB9] transition text-left"
              >
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">
                    Dose de Mounjaro
                  </span>
                  <span className="text-[10px] text-[#817782]">
                    Registar injeção semanal e local de aplicação
                  </span>
                </div>
              </button>

              {/* 3. Sintomas de Mounjaro */}
              {onOpenSymptomsModal && (
                <button
                  onClick={() => {
                    setShowQuickActionModal(false);
                    onOpenSymptomsModal();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] hover:border-[#E99AB9] transition text-left"
                >
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">
                      Sintomas do Mounjaro
                    </span>
                    <span className="text-[10px] text-[#817782]">
                      Classificar náuseas, saciedade, refluxo, etc.
                    </span>
                  </div>
                </button>
              )}

              {/* 4. Avaliação Corporal */}
              <button
                onClick={() => {
                  setShowQuickActionModal(false);
                  onOpenAssessmentModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] hover:border-[#E99AB9] transition text-left"
              >
                <div className="p-2.5 rounded-xl bg-[#F8DCE8] dark:bg-[#2D1E2B] text-[#C86D93]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">
                    Avaliação Corporal
                  </span>
                  <span className="text-[10px] text-[#817782]">
                    Peso, medidas de fita ou bioimpedância
                  </span>
                </div>
              </button>

              {/* 5. Diário de Hoje */}
              <button
                onClick={() => {
                  setShowQuickActionModal(false);
                  onOpenDailyModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8FB] dark:bg-[#140F15] border border-[#F2BFD3]/40 dark:border-[#362A36] hover:border-[#E99AB9] transition text-left"
              >
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#39313A] dark:text-[#F7EFF5] block">
                    Diário Completo de Hoje
                  </span>
                  <span className="text-[10px] text-[#817782]">
                    Água, sono, treino e bem-estar geral
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
