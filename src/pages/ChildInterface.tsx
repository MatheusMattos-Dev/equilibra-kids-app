import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScreenTime, isInsideAllowedWindow } from '../hooks/useScreenTime';
import { Avatar } from '../components/Avatar';
import { OfflineActivities } from '../components/OfflineActivities';
import { ChevronLeft, Award, Sparkles, AlertTriangle, Send, Moon, Clock } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface ChildInterfaceProps {
  className?: string;
  isCompact?: boolean;
}

export const ChildInterface: React.FC<ChildInterfaceProps> = ({ 
  className = 'min-h-screen p-4 md:p-6',
  isCompact = false
}) => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { 
    perfis, 
    activeProfileId, 
    pedirMaisTempo, 
    concluirAtividadeOffline, 
    pausarTempoRemoto,
    dataLoading
  } = useScreenTime();

  if (dataLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-radial-gradient p-6 font-kids">
        <div className="flex flex-col items-center gap-4 animate-pop">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pastel-purple-500 to-pastel-blue-500 flex items-center justify-center text-white font-black text-3xl shadow-lg rotate-6 animate-bounce">
              E
            </div>
            <div className="absolute -top-1 -right-1 bg-pastel-yellow-400 text-white p-1 rounded-full shadow-sm animate-wiggle">
              <Sparkles size={14} className="fill-pastel-yellow-200" />
            </div>
          </div>
          
          <div className="text-center mt-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Equilibra<span className="text-pastel-green-500">Kids</span>
            </h2>
            <p className="text-xs text-slate-400 font-parents font-semibold mt-1 animate-pulse">
              Carregando diversão... 🎈
            </p>
          </div>

          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200/50">
            <div className="h-full bg-pastel-purple-500 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      </div>
    );
  }
  
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
        <button onClick={() => navigate('/pais')} className="mt-4 px-4 py-2 bg-slate-200 rounded-xl">
          Voltar para o Painel
        </button>
      </div>
    );
  }

  const limiteSegundos = perfil.limiteDiario * 60;
  const restanteSegundos = Math.max(0, limiteSegundos - perfil.tempoUsadoHoje);
  const progressPercent = Math.min(100, (perfil.tempoUsadoHoje / limiteSegundos) * 100);
  const isTimeOver = restanteSegundos <= 0 || perfil.status === 'bloqueado';
  const insideAllowedWindow = isInsideAllowedWindow(perfil);

  // Formatar tempo de forma lúdica
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToProfiles = () => {
    pausarTempoRemoto(perfil.id);
    navigate('/');
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
      {!isOnline && (
        <div className="bg-pastel-yellow-100 border border-pastel-yellow-200 text-pastel-yellow-700 text-[10px] sm:text-xs font-black text-center py-2.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 mb-3.5 animate-pulse font-parents">
          <AlertTriangle size={13} className="stroke-[3]" />
          <span>Modo offline — dados sincronizarão quando a conexão voltar</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white/90 p-3.5 rounded-3xl border border-slate-100 shadow-sm">
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
          <div
            role="alert"
            aria-live="assertive"
            className={`w-full max-w-lg mx-auto bg-pastel-yellow-50 border-4 border-pastel-yellow-200 rounded-[28px] sm:rounded-[32px] text-center shadow-lg animate-bounce relative z-20 ${isCompact ? 'p-4 mb-4' : 'p-5 mb-6'}`}
          >
            <h3 className="text-pastel-yellow-600 font-black text-base sm:text-lg flex items-center justify-center gap-1.5">
              <Sparkles size={16} className="animate-wiggle" />
              Alerta de Aventura!
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-medium font-parents leading-relaxed">
              Oi <strong>{perfil.nome}</strong>! Nosso tempo de tela está quase terminando (faltam 15 minutinhos).
              Que tal começar a salvar o seu joguinho ou terminar esse vídeo para não perder nada? 🎮
            </p>
            <button
              onClick={() => { setWarn15Open(false); setHasDismissed15(true); }}
              className="mt-3 px-5 py-1.5 bg-pastel-yellow-500 hover:bg-pastel-yellow-600 text-white font-black text-xs rounded-xl sm:rounded-2xl shadow-md border-b-4 border-pastel-yellow-600 active:scale-95 transition-all"
            >
              Entendi! 👍
            </button>
          </div>
        )}

        {/* BANNER NOTIFICAÇÃO 5 MINUTOS */}
        {warn5Open && (
          <div
            role="alert"
            aria-live="assertive"
            className={`w-full max-w-lg mx-auto bg-pastel-pink-50 border-4 border-pastel-pink-200 rounded-[28px] sm:rounded-[32px] text-center shadow-lg animate-bounce relative z-20 ${isCompact ? 'p-4 mb-4' : 'p-5 mb-6'}`}
          >
            <h3 className="text-pastel-pink-500 font-black text-base sm:text-lg flex items-center justify-center gap-1.5">
              <AlertTriangle size={16} className="animate-pulse" />
              Hora do Espreguiço!
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-medium font-parents leading-relaxed">
              Nossa, como o tempo passou rápido! Faltam apenas 5 minutos.
              É hora de se espreguiçar como um gatinho preguiçoso 🐱 e pensar em qual será sua próxima brincadeira divertida fora das telas!
            </p>
            <button
              onClick={() => { setWarn5Open(false); setHasDismissed5(true); }}
              className="mt-3 px-5 py-1.5 bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white font-black text-xs rounded-xl sm:rounded-2xl shadow-md border-b-4 border-pastel-pink-600 active:scale-95 transition-all"
            >
              Vou me preparar! 🌟
            </button>
          </div>
        )}

        {!insideAllowedWindow ? (
          /* TELA DE BLOQUEIO POR JANELA DE HORÁRIO AMIGÁVEL */
          <div className="w-full min-h-[70vh] flex flex-col justify-center items-center bg-white/95 border-4 border-pastel-blue-200 p-4 sm:p-5 rounded-[32px] sm:rounded-[40px] text-center shadow-xl animate-pop relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-pastel-blue-100 rounded-full opacity-35" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pastel-yellow-100 rounded-full opacity-35" />

            <div className="inline-flex p-3 bg-pastel-blue-50 text-pastel-blue-500 rounded-2xl mb-3 border-2 border-pastel-blue-100 shrink-0">
              <Clock size={28} className="animate-pulse" />
            </div>

            <h3 className="text-pastel-blue-600 font-black text-lg sm:text-xl md:text-2xl leading-none">
              Ainda não está na hora! ⏰
            </h3>
            
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-semibold font-parents max-w-md mx-auto mt-2 leading-relaxed">
              Oi <strong>{perfil.nome}</strong>! Seus parents combinaram que o horário de usar o tablet é das <strong className="text-pastel-blue-600 font-black">{perfil.horarioInicioPermitido}</strong> às <strong className="text-pastel-blue-600 font-black">{perfil.horarioFimPermitido}</strong>.<br/>Que tal se espreguiçar ou fazer uma missão offline para ganhar estrelas? 🌟
            </p>

            {/* Quests Físicas Reais */}
            <div className="my-4 w-full bg-slate-50/50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-slate-100">
              <OfflineActivities 
                isCompact={isCompact}
                onCompleteActivity={(estrelas) => concluirAtividadeOffline(perfil.id, estrelas)} 
              />
            </div>
          </div>
        ) : !isTimeOver ? (
            /* TIMER DA CRIANÇA */
            <div className="flex flex-col items-center w-full">
              {/* Círculo Progressivo Radial */}
              <div
                role="timer"
                aria-live="polite"
                aria-label={`${Math.floor(restanteSegundos / 60)} minutos e ${restanteSegundos % 60} segundos restantes`}
                className={`relative flex items-center justify-center ${isCompact ? 'w-40 h-40' : 'w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80'}`}
              >
                <svg aria-hidden="true" className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                <div className="absolute flex flex-col items-center justify-center text-center px-4 w-full">
                  <Avatar type={perfil.avatar} className={`mb-0.5 animate-float ${isCompact ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'}`} />
                  <span className="text-slate-400 font-bold text-[8px] sm:text-[10px] md:text-xs uppercase font-parents tracking-wider">Tempo Restante</span>
                  <span className={`font-black ${theme.text} leading-none tabular-nums ${isCompact ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl'}`}>
                    {formatTime(restanteSegundos)}
                  </span>
                  <span className="text-[8px] sm:text-[10px] md:text-xs text-slate-400 font-parents font-semibold mt-0.5">Limite: {perfil.limiteDiario}m</span>
                </div>
              </div>

              {/* Mensagem Acolhedora */}
              <div className={`px-4 py-2 rounded-2xl border text-center max-w-sm ${theme.bg} shadow-xs ${isCompact ? 'mt-2' : 'mt-4'}`}>
                <p className="text-slate-700 text-[10px] sm:text-xs font-bold leading-normal">
                  {theme.message}
                </p>
                
                {perfil.status === 'pausado' && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-pastel-yellow-100 text-pastel-yellow-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-pastel-yellow-200">
                    <Clock size={10} /> Pausado pelos Pais
                  </div>
                )}
              </div>

              {/* Quests Físicas Reais Integradas na Home quando tem tempo */}
              <div className={`w-full bg-white/70 border-2 border-slate-100 rounded-3xl p-3.5 shadow-2xs ${isCompact ? 'mt-4 max-w-sm' : 'mt-6 max-w-lg'} flex flex-col gap-2.5 font-parents`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} className="text-pastel-purple-500" />
                    Missões Offline da Casa 🏡
                  </span>
                </div>
                <OfflineActivities 
                  isCompact={isCompact}
                  onCompleteActivity={(estrelas) => concluirAtividadeOffline(perfil.id, estrelas)} 
                />
              </div>
            </div>
        ) : (
          /* TELA DE BLOQUEIO AMIGÁVEL ("ESTAÇÃO DE DESCANSO") */
          <div className="w-full min-h-[70vh] flex flex-col justify-center items-center bg-white/90 border-4 border-pastel-purple-200 p-4 sm:p-6 rounded-[32px] sm:rounded-[40px] text-center shadow-xl animate-pop relative overflow-hidden">
            
            {/* Ilustração / Background Sleepy */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-pastel-purple-100 rounded-full opacity-30" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pastel-blue-100 rounded-full opacity-30" />

            <div className="inline-flex p-3 bg-pastel-purple-50 text-pastel-purple-500 rounded-2xl mb-3 border-2 border-pastel-purple-100">
              <Moon size={28} className="animate-pulse" />
            </div>

            <h3 className="text-pastel-purple-600 font-black text-lg sm:text-xl md:text-2xl">
              Hora de Descansar! 💤
            </h3>
            
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-semibold font-parents max-w-md mx-auto mt-1.5 leading-relaxed">
              Parabéns por brincar de forma equilibrada hoje! Seus olhos e seu cérebro estão muito felizes por descansar um pouquinho. O tablet está indo dormir agora... 😴
            </p>

            {/* Quests Físicas Reais */}
            <div className="my-4 sm:my-6 w-full bg-slate-50/50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-slate-100">
              <OfflineActivities 
                isCompact={isCompact}
                onCompleteActivity={(estrelas) => concluirAtividadeOffline(perfil.id, estrelas)} 
              />
            </div>

            {/* Controle de Pedidos de Tempo */}
            <div className="mt-4 sm:mt-6 w-full flex flex-col items-center px-4">
              {perfil.pediuMaisTempo ? (
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-pastel-purple-100 border border-pastel-purple-200 text-pastel-purple-700 font-bold text-[11px] sm:text-xs px-4 py-2.5 rounded-xl sm:rounded-2xl shadow-sm animate-pulse font-parents">
                  <Send size={12} className="animate-spin-slow shrink-0" />
                  <span>Pedido de +15 minutos enviado! Aguardando aprovação dos pais... 🚀</span>
                </div>
              ) : (
                <button
                  onClick={handleRequestMoreTime}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-pastel-purple-500 to-pastel-blue-500 hover:from-pastel-purple-600 hover:to-pastel-blue-600 text-white font-black text-[11px] sm:text-xs md:text-sm rounded-xl sm:rounded-2xl shadow-md border-b-4 border-pastel-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={13} />
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
    </div>
  );
};
