import React, { useState } from 'react';
import { useScreenTime } from '../hooks/useScreenTime';
import { Avatar } from '../components/Avatar';
import { ParentPinModal } from '../components/ParentPinModal';
import { Settings, Shield, Sparkles, RefreshCw, Trophy, X, Check } from 'lucide-react';

interface ProfileSelectionProps {
  onNavigate: (page: 'child-mode' | 'parent-dashboard') => void;
}

export const ProfileSelection: React.FC<ProfileSelectionProps> = ({ onNavigate }) => {
  const { perfis, selecionarPerfil, resetarSimulador } = useScreenTime();
  const [pinOpen, setPinOpen] = useState<boolean>(false);
  const [rankingOpen, setRankingOpen] = useState<boolean>(false);
  const [showResetToast, setShowResetToast] = useState<boolean>(false);

  const handleSelectProfile = (id: string) => {
    selecionarPerfil(id);
    onNavigate('child-mode');
  };

  const handleParentAccess = () => {
    setPinOpen(true);
  };

  const handlePinSuccess = () => {
    onNavigate('parent-dashboard');
  };

  const handleReset = () => {
    resetarSimulador();
    setShowResetToast(true);
    setTimeout(() => setShowResetToast(false), 2000);
  };

  return (
    <div className="min-height-100vh flex flex-col justify-between p-6 max-w-4xl mx-auto font-kids animate-pop">
      {/* Toast de Reset */}
      {showResetToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-pastel-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg border-2 border-white animate-bounce z-50 text-sm flex items-center gap-2">
          <Sparkles size={16} className="animate-spin" />
          Dados reiniciados com sucesso!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pastel-green-500 to-pastel-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md rotate-3">
            E
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
              Equilibra<span className="text-pastel-green-500">Kids</span>
            </h1>
            <span className="text-[10px] text-slate-400 block font-parents font-semibold uppercase tracking-wider">Tempo de Tela Saudável</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Ranking de Missões */}
          <button
            onClick={() => setRankingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pastel-yellow-400 to-pastel-yellow-500 hover:from-pastel-yellow-500 hover:to-pastel-yellow-600 text-white font-black text-xs rounded-2xl transition-all shadow-sm active:scale-95 font-parents"
            title="Ver Ranking de Missões Saudáveis"
          >
            <Trophy size={14} className="animate-wiggle" />
            Ranking 🏆
          </button>

          <button
            onClick={handleParentAccess}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-pastel-purple-50 text-pastel-purple-600 font-bold text-xs rounded-2xl border-2 border-pastel-purple-200 transition-all shadow-sm active:scale-95 font-parents"
          >
            <Settings size={14} className="animate-spin-slow" />
            Área dos Pais 🔒
          </button>
        </div>
      </div>

      {/* Main Selector */}
      <div className="my-auto py-10 text-center">
        <div className="inline-flex p-3 bg-pastel-yellow-100 rounded-3xl text-pastel-yellow-500 mb-4 animate-float">
          <Sparkles size={32} className="fill-pastel-yellow-200" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-slate-700 tracking-tight mb-2">
          Quem vai brincar hoje?
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto mb-10 font-parents font-semibold">
          Escolha seu perfil para começar a se divertir e acumular estrelas de equilíbrio digital!
        </p>

        {/* Perfis */}
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto px-4">
          {perfis.map((perfil) => {
            // Estilos específicos para cada bichinho
            const themeConfig = {
              cat: 'from-pastel-pink-50 to-pastel-pink-100 border-pastel-pink-200 hover:shadow-pastel-pink-200 text-pastel-pink-600',
              lion: 'from-pastel-yellow-50 to-pastel-yellow-100 border-pastel-yellow-200 hover:shadow-pastel-yellow-200 text-pastel-yellow-600',
              owl: 'from-pastel-purple-50 to-pastel-purple-100 border-pastel-purple-200 hover:shadow-pastel-purple-200 text-pastel-purple-600',
              bear: 'from-pastel-blue-50 to-pastel-blue-100 border-pastel-blue-200 hover:shadow-pastel-blue-200 text-pastel-blue-600'
            };

            const conf = themeConfig[perfil.avatar] || themeConfig.bear;
            const limiteMinutos = perfil.limiteDiario;
            const restanteSegundos = Math.max(0, (perfil.limiteDiario * 60) - perfil.tempoUsadoHoje);
            const restanteMinutos = Math.ceil(restanteSegundos / 60);

            return (
              <button
                key={perfil.id}
                onClick={() => handleSelectProfile(perfil.id)}
                className={`p-6 bg-gradient-to-b ${conf} rounded-[36px] border-2 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all active:scale-95 group flex flex-col items-center`}
              >
                <div className="relative mb-3">
                  <Avatar type={perfil.avatar} className="w-24 h-24 group-hover:rotate-6 transition-transform duration-300" animate={false} />
                  
                  {perfil.status === 'bloqueado' && (
                    <div className="absolute -top-1 -right-1 bg-pastel-pink-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border-2 border-white shadow-md font-parents">
                      Dormindo
                    </div>
                  )}
                  {perfil.status === 'online' && (
                    <div className="absolute -top-1 -right-1 bg-pastel-green-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border-2 border-white shadow-md font-parents animate-pulse">
                      Online
                    </div>
                  )}
                </div>

                <span className="text-lg font-black text-slate-800">{perfil.nome}</span>
                
                <div className="mt-3.5 bg-white/70 border border-white/95 rounded-2xl px-3 py-1 text-slate-600 text-xs font-bold font-parents flex flex-col items-center">
                  <span>Limite: {limiteMinutos} min</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {perfil.status === 'bloqueado' ? 'Tempo esgotado 💤' : `Restam ${restanteMinutos} min`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Reset do Simulador */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 gap-4 font-parents text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold">
          <Shield size={14} className="text-slate-400" />
          <span>EquilibraKids promove autonomia, equilíbrio e hábitos saudáveis.</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors font-bold"
          title="Reiniciar perfis e históricos de demonstração"
        >
          <RefreshCw size={13} />
          Reiniciar Simulador
        </button>
      </div>

      {/* Modal PIN de Acesso */}
      <ParentPinModal
        isOpen={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Modal de Ranking de Missões */}
      {rankingOpen && (
        <div className="fixed inset-0 z-40 bg-soft-dark-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-kids">
          <div className="w-full max-w-md bg-white p-6 rounded-[32px] border-4 border-pastel-yellow-200 shadow-2xl animate-pop relative flex flex-col gap-4">
            
            {/* Botão Fechar */}
            <button
              onClick={() => setRankingOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors active:scale-95"
            >
              <X size={16} />
            </button>

            {/* Cabeçalho */}
            <div className="text-center mb-2">
              <div className="inline-flex p-3 bg-pastel-yellow-100 rounded-2xl text-pastel-yellow-500 mb-2 animate-float">
                <Trophy size={32} className="fill-pastel-yellow-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Super Campeões de Missões! 🏆</h3>
              <p className="text-xs text-slate-400 mt-1 font-parents font-semibold">
                Quem completou mais missões offline e conquistou estrelas saudáveis?
              </p>
            </div>

            {/* Leaderboard */}
            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
              {[...perfis]
                .sort((a, b) => b.estrelasAcumuladas - a.estrelasAcumuladas)
                .map((perfil, index) => {
                  const positions = [
                    'bg-pastel-yellow-500 text-white border-pastel-yellow-400',
                    'bg-slate-300 text-slate-700 border-slate-200',
                    'bg-amber-600 text-white border-amber-500',
                  ];
                  
                  const themeConfig = {
                    cat: 'border-pastel-pink-100 hover:border-pastel-pink-200',
                    lion: 'border-pastel-yellow-100 hover:border-pastel-yellow-200',
                    owl: 'border-pastel-purple-100 hover:border-pastel-purple-200',
                    bear: 'border-pastel-blue-100 hover:border-pastel-blue-200'
                  };
                  const cardBorder = themeConfig[perfil.avatar] || themeConfig.bear;

                  return (
                    <div
                      key={perfil.id}
                      className={`flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border-2 transition-all active:scale-99 ${cardBorder}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Posição */}
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border shadow-xs ${
                          index < 3 ? positions[index] : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {index + 1}
                        </span>

                        <Avatar type={perfil.avatar} className="w-10 h-10 shrink-0" />
                        
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-black text-slate-800 text-sm">{perfil.nome}</span>
                            {index === 0 && <span className="text-xs">👑</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold font-parents">Mascote Oficial</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Missões */}
                        <div className="flex items-center gap-1 bg-pastel-green-100 text-pastel-green-700 px-2.5 py-1 rounded-full font-black text-[10px]">
                          <Check size={10} className="stroke-[3]" />
                          <span>{perfil.missoesCumpridas}</span>
                        </div>

                        {/* Estrelas */}
                        <div className="flex items-center gap-0.5 text-pastel-yellow-500 font-black text-xs">
                          <span>★</span>
                          <span className="text-slate-700 font-bold">{perfil.estrelasAcumuladas}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Frase Motivacional */}
            <div className="text-center bg-pastel-purple-50 border border-pastel-purple-100 p-3 rounded-2xl font-parents mt-1">
              <p className="text-[10px] text-slate-500 font-black leading-relaxed">
                🚀 Faça atividades divertidas no mundo real e ganhe estrelas para subir no ranking!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
