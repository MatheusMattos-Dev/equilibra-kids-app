import React, { useState, useEffect } from 'react';
import { useScreenTime } from '../hooks/useScreenTime';
import { Avatar } from '../components/Avatar';
import { OfflineActivities } from '../components/OfflineActivities';
import { ParentPinModal } from '../components/ParentPinModal';
import { ChevronLeft, Award, Sparkles, AlertTriangle, Send, Moon, Clock } from 'lucide-react';

interface ChildInterfaceProps {
  onNavigate: (page: 'parent-dashboard') => void;
  className?: string;
}

export const ChildInterface: React.FC<ChildInterfaceProps> = ({ onNavigate, className = 'min-h-screen p-4 md:p-6' }) => {
  const { 
    perfis, 
    activeProfileId, 
    pedirMaisTempo, 
    concluirAtividadeOffline, 
    pausarTempoRemoto 
  } = useScreenTime();

  const [pinOpen, setPinOpen] = useState<boolean>(false);
  
  // Controle de alertas exibidos nesta sessão
  const [warn15Open, setWarn15Open] = useState<boolean>(false);
  const [warn5Open, setWarn5Open] = useState<boolean>(false);
  const [hasDismissed15, setHasDismissed15] = useState<boolean>(false);
  const [hasDismissed5, setHasDismissed5] = useState<boolean>(false);

  const perfil = perfis.find(p => p.id === activeProfileId);

  // Garantir que ao abrir a tela com pouco tempo, os popups corretos apareçam
  useEffect(() => {
    if (perfil) {
      const limiteSegundos = perfil.limiteDiario * 60;
      const restanteSegundos = Math.max(0, limiteSegundos - perfil.tempoUsadoHoje);
      const restanteMinutos = restanteSegundos / 60;

      // Alerta de 15 minutos
      if (restanteMinutos <= 15 && restanteMinutos > 5 && !hasDismissed15 && perfil.status === 'online') {
        setWarn15Open(true);
      } else {
        setWarn15Open(false);
      }

      // Alerta de 5 minutos
      if (restanteMinutos <= 5 && restanteMinutos > 0 && !hasDismissed5 && perfil.status === 'online') {
        setWarn5Open(true);
      } else {
        setWarn5Open(false);
      }
    }
  }, [perfil?.tempoUsadoHoje, perfil?.status, hasDismissed15, hasDismissed5]);

  if (!perfil) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500 font-parents">
        <p>Nenhum perfil de criança selecionado.</p>
        <button onClick={() => onNavigate('parent-dashboard')} className="mt-4 px-4 py-2 bg-slate-200 rounded-xl">
          Voltar para o Painel
        </button>
      </div>
    );
  }

  const limiteSegundos = perfil.limiteDiario * 60;
  const restanteSegundos = Math.max(0, limiteSegundos - perfil.tempoUsadoHoje);
  const progressPercent = Math.min(100, (perfil.tempoUsadoHoje / limiteSegundos) * 100);
  const isTimeOver = restanteSegundos <= 0 || perfil.status === 'bloqueado';

  // Formatar tempo de forma lúdica
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToProfiles = () => {
    setPinOpen(true);
  };

  const handlePinSuccess = () => {
    // Ao sair do modo criança, pausa o timer por segurança
    pausarTempoRemoto(perfil.id);
    onNavigate('parent-dashboard');
  };

  const handleRequestMoreTime = () => {
    pedirMaisTempo(perfil.id);
  };

  // Cores dinâmicas para o timer e interface com base no tempo restante
  const getTimerTheme = () => {
    const restanteMin = restanteSegundos / 60;
    if (restanteMin > 15) {
      return {
        text: 'text-pastel-green-500',
        stroke: 'stroke-pastel-green-500',
        track: 'stroke-pastel-green-100',
        bg: 'bg-pastel-green-50/50 border-pastel-green-200',
        message: 'Você está indo muito bem! Divirta-se com moderação 🚀'
      };
    } else if (restanteMin > 5) {
      return {
        text: 'text-pastel-yellow-600',
        stroke: 'stroke-pastel-yellow-500',
        track: 'stroke-pastel-yellow-100',
        bg: 'bg-pastel-yellow-50/50 border-pastel-yellow-200',
        message: 'Atenção! Restam menos de 15 minutos. Que tal salvar seu progresso? 🎮'
      };
    } else {
      return {
        text: 'text-pastel-pink-500 font-extrabold',
        stroke: 'stroke-pastel-pink-500 animate-pulse',
        track: 'stroke-pastel-pink-100',
        bg: 'bg-pastel-pink-50/60 border-pastel-pink-100',
        message: 'Quase na hora de descansar! Só mais 5 minutinhos 🐱'
      };
    }
  };

  const theme = getTimerTheme();

  return (
    <div className={`${className} bg-radial-gradient flex flex-col justify-between max-w-2xl mx-auto font-kids animate-pop`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-3.5 rounded-3xl border border-white shadow-sm">
        <button
          onClick={handleBackToProfiles}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs rounded-xl active:scale-95 transition-transform"
        >
          <ChevronLeft size={16} />
          Sair 🔒
        </button>

        <div className="flex items-center gap-2">
          <Avatar type={perfil.avatar} className="w-9 h-9" />
          <span className="font-black text-slate-800 text-sm">{perfil.nome}</span>
        </div>

        <div className="bg-gradient-to-r from-pastel-purple-100 to-pastel-blue-100 border border-pastel-purple-200 text-slate-700 font-black text-xs px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
          <Award size={14} className="text-pastel-yellow-500 fill-pastel-yellow-200" />
          <span>★ {perfil.estrelasAcumuladas}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-6 flex flex-col items-center justify-center">
        
        {/* BANNER NOTIFICAÇÃO 15 MINUTOS */}
        {warn15Open && (
          <div className="w-full bg-pastel-yellow-50 border-4 border-pastel-yellow-200 p-5 rounded-[32px] text-center mb-6 shadow-lg animate-bounce relative z-20">
            <h3 className="text-pastel-yellow-600 font-black text-lg flex items-center justify-center gap-1.5">
              <Sparkles size={20} className="animate-wiggle" />
              Alerta de Aventura!
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium font-parents leading-relaxed">
              Oi <strong>{perfil.nome}</strong>! Nosso tempo de tela está quase terminando (faltam 15 minutinhos).
              Que tal começar a salvar o seu joguinho ou terminar esse vídeo para não perder nada? 🎮
            </p>
            <button
              onClick={() => { setWarn15Open(false); setHasDismissed15(true); }}
              className="mt-4 px-6 py-2 bg-pastel-yellow-500 hover:bg-pastel-yellow-600 text-white font-black text-xs rounded-2xl shadow-md border-b-4 border-pastel-yellow-600 active:scale-95 transition-all"
            >
              Entendi! 👍
            </button>
          </div>
        )}

        {/* BANNER NOTIFICAÇÃO 5 MINUTOS */}
        {warn5Open && (
          <div className="w-full bg-pastel-pink-50 border-4 border-pastel-pink-200 p-5 rounded-[32px] text-center mb-6 shadow-lg animate-bounce relative z-20">
            <h3 className="text-pastel-pink-500 font-black text-lg flex items-center justify-center gap-1.5">
              <AlertTriangle size={20} className="animate-pulse" />
              Hora do Espreguiço!
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium font-parents leading-relaxed">
              Nossa, como o tempo passou rápido! Faltam apenas 5 minutos.
              É hora de se espreguiçar como um gatinho preguiçoso 🐱 e pensar em qual será sua próxima brincadeira divertida fora das telas!
            </p>
            <button
              onClick={() => { setWarn5Open(false); setHasDismissed5(true); }}
              className="mt-4 px-6 py-2 bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white font-black text-xs rounded-2xl shadow-md border-b-4 border-pastel-pink-600 active:scale-95 transition-all"
            >
              Vou me preparar! 🌟
            </button>
          </div>
        )}

        {!isTimeOver ? (
          /* TIMER DA CRIANÇA */
          <div className="flex flex-col items-center">
            {/* Círculo Progressivo Radial */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Trilho de fundo */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`${theme.track} fill-white/80`}
                  strokeWidth="8"
                />
                {/* Linha de progresso */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`${theme.stroke} transition-all duration-1000`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * (100 - progressPercent)) / 100}
                  strokeLinecap="round"
                />
              </svg>

              {/* Conteúdo Central */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <Avatar type={perfil.avatar} className="w-24 h-24 mb-1 animate-float" />
                <span className="text-slate-400 font-bold text-[10px] uppercase font-parents tracking-wider">Tempo Restante</span>
                <span className={`text-4xl md:text-5xl font-black ${theme.text} leading-none tabular-nums`}>
                  {formatTime(restanteSegundos)}
                </span>
                <span className="text-[10px] text-slate-400 font-parents font-semibold mt-1">Limite: {perfil.limiteDiario}m</span>
              </div>
            </div>

            {/* Mensagem Acolhedora */}
            <div className={`mt-8 px-6 py-3.5 rounded-3xl border-2 text-center max-w-sm ${theme.bg} shadow-sm`}>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                {theme.message}
              </p>
              
              {perfil.status === 'pausado' && (
                <div className="mt-2.5 inline-flex items-center gap-1 bg-pastel-yellow-100 text-pastel-yellow-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-pastel-yellow-200">
                  <Clock size={11} /> Pausado pelos Pais
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TELA DE BLOQUEIO AMIGÁVEL ("ESTAÇÃO DE DESCANSO") */
          <div className="w-full bg-white/90 border-4 border-pastel-purple-200 p-6 rounded-[40px] text-center shadow-xl animate-pop relative overflow-hidden">
            
            {/* Ilustração / Background Sleepy */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-pastel-purple-100 rounded-full opacity-30" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pastel-blue-100 rounded-full opacity-30" />

            <div className="inline-flex p-4 bg-pastel-purple-50 text-pastel-purple-500 rounded-3xl mb-4 border-2 border-pastel-purple-100">
              <Moon size={36} className="animate-pulse" />
            </div>

            <h3 className="text-pastel-purple-600 font-black text-xl md:text-2xl">
              Hora de Descansar! 💤
            </h3>
            
            <p className="text-xs md:text-sm text-slate-600 font-semibold font-parents max-w-md mx-auto mt-2 leading-relaxed">
              Parabéns por brincar de forma equilibrada hoje! Seus olhos e seu cérebro estão muito felizes por descansar um pouquinho. O tablet está indo dormir agora... 😴
            </p>

            {/* Quests Físicas Reais */}
            <div className="my-6 bg-slate-50/50 p-4 rounded-3xl border-2 border-slate-100">
              <OfflineActivities 
                onCompleteActivity={(estrelas) => concluirAtividadeOffline(perfil.id, estrelas)} 
              />
            </div>

            {/* Controle de Pedidos de Tempo */}
            <div className="mt-6 flex flex-col items-center">
              {perfil.pediuMaisTempo ? (
                <div className="inline-flex items-center gap-2 bg-pastel-purple-100 border border-pastel-purple-200 text-pastel-purple-700 font-bold text-xs px-5 py-3 rounded-2xl shadow-sm animate-pulse font-parents">
                  <Send size={14} className="animate-spin-slow" />
                  <span>Pedido de +15 minutos enviado! Aguardando aprovação dos pais... 🚀</span>
                </div>
              ) : (
                <button
                  onClick={handleRequestMoreTime}
                  className="px-6 py-3 bg-gradient-to-r from-pastel-purple-500 to-pastel-blue-500 hover:from-pastel-purple-600 hover:to-pastel-blue-600 text-white font-black text-xs md:text-sm rounded-2xl shadow-md border-b-4 border-pastel-purple-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Send size={15} />
                  Pedir mais 15 minutinhos aos pais 📨
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer lúdico */}
      <div className="text-center py-2 text-[10px] text-slate-400 font-parents font-bold">
        <span>EquilibraKids • Feito com carinho para crescer saudável 🎈</span>
      </div>

      {/* Modal PIN de segurança */}
      <ParentPinModal
        isOpen={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};
