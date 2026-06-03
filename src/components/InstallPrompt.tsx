import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Share } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOSDevice, setIsIOSDevice] = useState<boolean>(false);

  useEffect(() => {
    // 1. Verificar se o app já está rodando em standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    // 2. Verificar se o usuário já dispensou o prompt recentemente
    const isDismissed = localStorage.getItem('equilibrakids_install_dismissed') === 'true';
    if (isDismissed) return;

    // 3. Detectar se é dispositivo iOS
    const userAgent = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOSDevice(isIOS);

    if (isIOS) {
      // No iOS, mostramos o banner de instruções manuais
      setShowBanner(true);
    } else {
      // Em outros sistemas, escutamos o evento 'beforeinstallprompt'
      const handleBeforeInstallPrompt = (e: Event) => {
        // Impedir que o mini-infobar padrão apareça no mobile
        e.preventDefault();
        // Salvar o evento para ser acionado depois
        setDeferredPrompt(e);
        // Mostrar o banner de instalação customizado
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar o prompt de instalação nativo
    deferredPrompt.prompt();
    
    // Aguardar a resposta do usuário
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Limpar o prompt diferido (só pode ser usado uma vez)
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('equilibrakids_install_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white border-2 border-pastel-purple-200 p-4.5 rounded-3xl shadow-2xl animate-pop font-parents">
      <div className="flex items-start gap-3">
        {/* Ícone fofo animado */}
        <div className="p-2.5 bg-pastel-purple-50 text-pastel-purple-500 rounded-2xl border border-pastel-purple-100 shrink-0">
          <Download className="animate-bounce" size={20} />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 leading-none">
            Instale o EquilibraKids!
            <Sparkles size={14} className="text-pastel-yellow-500 fill-pastel-yellow-100" />
          </h4>
          <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-normal">
            {isIOSDevice ? (
              <span className="flex items-center gap-1 flex-wrap">
                Toque em <Share size={12} className="inline text-pastel-purple-500" /> Compartilhar e depois em <strong>"Adicionar à Tela de Início"</strong> para usar offline 📱
              </span>
            ) : (
              "Instale o EquilibraKids na tela inicial para usar offline e ter acesso instantâneo 📱"
            )}
          </p>

          <div className="flex items-center gap-2 mt-3.5">
            {!isIOSDevice && (
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-gradient-to-r from-pastel-purple-500 to-pastel-blue-500 hover:from-pastel-purple-600 hover:to-pastel-blue-600 text-white font-black text-xs rounded-xl shadow-md border-b-4 border-pastel-purple-700 active:scale-95 transition-all"
              >
                Instalar
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>

        {/* Botão de Fechar Rápido */}
        <button
          onClick={() => setShowBanner(false)}
          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          aria-label="Fechar aviso"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
