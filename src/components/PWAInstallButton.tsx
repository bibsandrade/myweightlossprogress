import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-[#E99AB9] hover:bg-[#C86D93] text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all ${className}`}
        title="Instalar My Progress no dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar Aplicação</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#F2BFD3] dark:border-[#362A36] px-3 py-1.5 text-xs font-medium text-[#39313A] dark:text-[#F7EFF5] hover:bg-[#F8DCE8]/40 transition ${className}`}
          title="Instalar no iPhone ou iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#C86D93]" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1F1721] p-6 shadow-xl border border-[#F2BFD3]/40 dark:border-[#362A36]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-[#39313A] dark:text-[#F7EFF5]">
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#817782] dark:text-[#A69AA8] leading-relaxed mb-4">
                Para ter o <strong>My Progress</strong> sempre à mão no ecrã principal:
                <br /><br />
                1. Toca no botão <strong>Partilhar</strong> (ícone de quadrado com seta para cima) no Safari.<br />
                2. Desce na lista e toca em <strong>Ecrã Principal</strong> (Add to Home Screen).<br />
                3. Toca em <strong>Adicionar</strong> no canto superior direito.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#E99AB9] py-2 text-xs font-medium text-white hover:bg-[#C86D93] transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
