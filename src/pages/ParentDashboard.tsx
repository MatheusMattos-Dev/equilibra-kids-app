import React, { useState } from 'react';
import { useScreenTime } from '../hooks/useScreenTime';
import { Avatar } from '../components/Avatar';
import { HealthAlertCard } from '../components/HealthAlertCard';
import { 
  Users, Activity, Bell, Settings, ArrowLeft, Play, Pause, 
  Square, ShieldAlert, Plus, Save, Clock, 
  TrendingUp, Sparkles, Check, Smartphone, ToggleLeft, ToggleRight,
  Trophy, Medal, Crown
} from 'lucide-react';
import { ChildInterface } from './ChildInterface';

interface ParentDashboardProps {
  onNavigate: (page: 'profile-selection' | 'child-mode') => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const {
    perfis,
    activeProfileId,
    turboMode,
    alertas,
    pausarTempoRemoto,
    iniciarTempoRemoto,
    bloquearRemoto,
    adicionarTempoRemoto,
    aprovarMaisTempo,
    redefinirLimite,
    adicionarNovoPerfil,
    setTurboMode,
    selecionarPerfil,
    setActiveProfileId
  } = useScreenTime();

  // Estados locais da página
  const [activeTab, setActiveTab] = useState<'monitor' | 'alerts' | 'settings' | 'ranking'>('monitor');
  const [selectedChildId, setSelectedChildId] = useState<string>(perfis[0]?.id || '');
  const [splitView, setSplitView] = useState<boolean>(true); // Split view ativa por padrão para demonstração incrível!
  const [historyFilterId, setHistoryFilterId] = useState<string>('all');
  const [hoveredBarInfo, setHoveredBarInfo] = useState<{ childId: string; dayIdx: number; val: number } | null>(null);
  
  // Estado para edição de limites
  const selectedProfile = perfis.find(p => p.id === selectedChildId);
  const [editLimit, setEditLimit] = useState<number>(selectedProfile?.limiteDiario || 60);
  const [editBedtime, setEditBedtime] = useState<string>(selectedProfile?.limiteNoturno || '21:30');

  // Estado para cadastro de novo perfil
  const [newName, setNewName] = useState<string>('');
  const [newAge, setNewAge] = useState<number>(8);
  const [newLimit, setNewLimit] = useState<number>(60);
  const [newAvatar, setNewAvatar] = useState<'lion' | 'owl' | 'cat' | 'bear'>('bear');
  const [newBedtime, setNewBedtime] = useState<string>('21:30');
  const [showNewForm, setShowNewForm] = useState<boolean>(false);

  // Sincronizar campos de edição ao mudar criança selecionada nas configurações
  React.useEffect(() => {
    if (selectedProfile) {
      setEditLimit(selectedProfile.limiteDiario);
      setEditBedtime(selectedProfile.limiteNoturno);
    }
  }, [selectedChildId, perfis]);

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChildId) {
      redefinirLimite(selectedChildId, editLimit, editBedtime);
      alert('Configurações atualizadas com sucesso! Os limites foram aplicados remotamente.');
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      adicionarNovoPerfil(newName, newAge, newLimit, newAvatar, newBedtime);
      setNewName('');
      setShowNewForm(false);
      alert(`Perfil do(a) ${newName} criado com sucesso!`);
    }
  };

  // Cálculo das estatísticas gerais dos pais
  const totalKids = perfis.length;
  const activeKids = perfis.filter(p => p.status === 'online').length;
  const totalAlerts = alertas.length;

  return (
    <div className="min-h-screen bg-slate-50 font-parents dark-mode-transition">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('profile-selection')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
            title="Voltar para Seleção de Perfis"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pastel-purple-500 to-pastel-blue-500 flex items-center justify-center text-white font-extrabold shadow-sm rotate-3">
              K
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-none">Console dos Pais</h2>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">EquilibraKids Dashboard</span>
            </div>
          </div>
        </div>

        {/* Abas Principais */}
        <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'monitor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity size={14} />
            Monitoramento
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all relative ${
              activeTab === 'alerts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell size={14} />
            Saúde & Avisos
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-pastel-pink-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings size={14} />
            Ajustar Limites
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ranking' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy size={14} className="text-pastel-yellow-500 fill-pastel-yellow-200" />
            Ranking de Missões
          </button>
        </nav>

        {/* Toggle de Modo Lado a Lado (Demonstração - Oculto em Telas Responsivas Menores) */}
        <button
          onClick={() => setSplitView(!splitView)}
          className={`hidden xl:inline-flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl border-2 transition-all shadow-sm active:scale-95 ${
            splitView 
              ? 'bg-pastel-purple-50 border-pastel-purple-300 text-pastel-purple-600' 
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone size={14} />
          {splitView ? 'Desativar Lado a Lado' : 'Simular Lado a Lado 📱'}
        </button>
      </header>

      {/* Main Flex Layout */}
      <div className={`p-6 max-w-[1600px] mx-auto flex flex-col ${splitView ? 'xl:flex-row gap-8' : 'gap-6'}`}>
        
        {/* COLUNA ESQUERDA: CONTROLE DOS PAIS (flex-1 se SplitView, total se não) */}
        <main className={`${splitView ? 'xl:flex-1' : 'w-full'} flex flex-col gap-6 animate-pop`}>
          
          {/* Card Resumo Rápido */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-pastel-blue-50 text-pastel-blue-600 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Crianças</span>
                <span className="text-xl font-extrabold text-slate-700">{totalKids}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-pastel-green-50 text-pastel-green-500 rounded-xl">
                <Activity size={20} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Ativos Agora</span>
                <span className="text-xl font-extrabold text-slate-700">{activeKids}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`p-3 rounded-xl ${totalAlerts > 0 ? 'bg-pastel-pink-50 text-pastel-pink-500 animate-wiggle' : 'bg-slate-50 text-slate-400'}`}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Padrões Alerta</span>
                <span className="text-xl font-extrabold text-slate-700">{totalAlerts}</span>
              </div>
            </div>
          </section>

          {/* TAB 1: MONITORAMENTO EM TEMPO REAL */}
          {activeTab === 'monitor' && (
            <div className="flex flex-col gap-6">
              
              {/* Painel Modo Turbo / Simulador Acelerado */}
              <div className="bg-gradient-to-r from-pastel-purple-50/50 to-pastel-blue-50/50 border border-pastel-purple-100 p-4.5 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="text-pastel-purple-600 shrink-0 mt-0.5">
                    <Clock size={20} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Modo Turbo do Simulador</h4>
                    <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5">
                      Ative para acelerar a contagem regressiva da criança (<strong>1 segundo real = 1 minuto de tela</strong>). Excelente para ver os avisos de 15m, 5m e o bloqueio de tempo em tempo real!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTurboMode(!turboMode)}
                  className="shrink-0 transition-transform active:scale-95"
                >
                  {turboMode ? (
                    <ToggleRight size={44} className="text-pastel-purple-500 fill-pastel-purple-100" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-300" />
                  )}
                </button>
              </div>

              {/* Lista de Dispositivos/Crianças Ativas */}
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-extrabold text-slate-800">Monitor de Dispositivos e Controles Rápidos</h3>
                  <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-pastel-green-500 hover:bg-pastel-green-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                  >
                    <Plus size={14} /> Novo Perfil
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {perfis.map((kid) => {
                    const limiteSegundos = kid.limiteDiario * 60;
                    const restanteSegundos = Math.max(0, limiteSegundos - kid.tempoUsadoHoje);
                    const restanteMinutos = Math.ceil(restanteSegundos / 60);
                    const usadoMinutos = Math.floor(kid.tempoUsadoHoje / 60);
                    const progressPercent = Math.min(100, (kid.tempoUsadoHoje / limiteSegundos) * 100);

                    // Estilo de progresso
                    let progressBarColor = 'bg-pastel-green-500';
                    if (restanteMinutos <= 5) progressBarColor = 'bg-pastel-pink-500';
                    else if (restanteMinutos <= 15) progressBarColor = 'bg-pastel-yellow-500';

                    return (
                      <div 
                        key={kid.id} 
                        className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${
                          kid.status === 'online' 
                            ? 'bg-pastel-green-50/20 border-pastel-green-200/60 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {/* Linha Principal (Info + Progresso + Controles) */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                          
                          {/* Kid Info */}
                          <div className="flex items-center gap-3.5 shrink-0">
                            <div className="relative">
                              <Avatar type={kid.avatar} className="w-14 h-14" />
                              {kid.status === 'online' && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-pastel-green-500 border-2 border-white rounded-full animate-ping" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-800 text-base">{kid.nome}</h4>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  kid.status === 'online' ? 'bg-pastel-green-100 text-pastel-green-600' :
                                  kid.status === 'pausado' ? 'bg-pastel-yellow-100 text-pastel-yellow-700' :
                                  'bg-pastel-purple-100 text-pastel-purple-600'
                                }`}>
                                  {kid.status === 'online' ? 'Online' :
                                   kid.status === 'pausado' ? 'Pausado' : 'Esgotado 💤'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold font-parents">Idade: {kid.idade} anos • Dormir às {kid.limiteNoturno}</span>
                            </div>
                          </div>

                          {/* Barra de Progresso do Tempo */}
                          <div className="flex-1 w-full max-w-xs sm:mx-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-bold">
                              <span className="font-medium font-parents">Progresso Diário</span>
                              <span>{usadoMinutos}m / {kid.limiteDiario}m</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div 
                                className={`h-full ${progressBarColor} transition-all duration-500`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-1 font-semibold text-right">
                              {kid.status === 'bloqueado' ? 'Tempo diário esgotado' : `Restam ${restanteMinutos} minutos`}
                            </span>
                          </div>

                          {/* Ações de Controle Remoto */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                            {/* Botão Entregar Celular para a Criança */}
                            <button
                              onClick={() => {
                                selecionarPerfil(kid.id);
                                onNavigate('child-mode');
                              }}
                              disabled={kid.status === 'bloqueado'}
                              className="flex items-center gap-1.5 px-3 py-2 bg-pastel-green-500 hover:bg-pastel-green-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all mr-1"
                              title="Iniciar Sessão Segura e Entregar Celular para a Criança"
                            >
                              <Play size={12} fill="currentColor" />
                              Entregar 📱
                            </button>

                            {kid.status === 'online' ? (
                              <button
                                onClick={() => pausarTempoRemoto(kid.id)}
                                className="p-2.5 bg-pastel-yellow-50 hover:bg-pastel-yellow-100 text-pastel-yellow-600 rounded-xl border border-pastel-yellow-200 transition-colors"
                                title="Pausar Sessão Temporariamente"
                              >
                                <Pause size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => iniciarTempoRemoto(kid.id)}
                                disabled={kid.status === 'bloqueado'}
                                className="p-2.5 bg-pastel-green-50 hover:bg-pastel-green-100 text-pastel-green-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-pastel-green-200 transition-colors"
                                title="Retomar Sessão da Criança"
                              >
                                <Play size={15} />
                              </button>
                            )}

                            <button
                              onClick={() => bloquearRemoto(kid.id)}
                              disabled={kid.status === 'bloqueado'}
                              className="p-2.5 bg-pastel-pink-50 hover:bg-pastel-pink-100 text-pastel-pink-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-pastel-pink-200 transition-colors"
                              title="Bloquear Dispositivo Imediatamente"
                            >
                              <Square size={14} fill="currentColor" />
                            </button>

                            <button
                              onClick={() => adicionarTempoRemoto(kid.id, 15)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 active:scale-95 transition-all"
                              title="Presentear Criança com +15 Minutos"
                            >
                              +15 min
                            </button>
                          </div>

                        </div>

                        {/* Linha Secundária: Banner de Pedido de Tempo Extra (Linguagem Acolhedora) */}
                        {kid.pediuMaisTempo && (
                          <div className="w-full flex flex-col sm:flex-row items-center justify-between p-3.5 bg-pastel-purple-50 border border-pastel-purple-200 rounded-2xl animate-pulse gap-3.5 mt-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-pastel-purple-100 text-pastel-purple-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shrink-0">📨 Pedido</span>
                              <span className="text-slate-700 text-xs font-semibold font-parents leading-relaxed">
                                <strong>{kid.nome}</strong> está pedindo mais 15 minutinhos na tela de bloqueio.
                              </span>
                            </div>
                            <button
                              onClick={() => aprovarMaisTempo(kid.id)}
                              className="w-full sm:w-auto px-4 py-2 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white font-black text-xs rounded-xl shadow-md border-b-4 border-pastel-purple-700 active:scale-95 transition-all shrink-0"
                              title="Aprovar tempo extra solicitado"
                            >
                              Aprovar +15 min! 👍
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Histórico Semanal Lúdico em SVG */}
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
                
                {/* Cabeçalho Interativo do Histórico */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-pastel-purple-500 animate-pulse" size={18} />
                      <h3 className="text-base font-extrabold text-slate-800">Histórico Lúdico de Uso (Últimos 7 Dias)</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Diagnósticos e médias recomendadas por pediatras em tempo real.</p>
                  </div>

                  {/* Seletor de Crianças do Histórico */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 gap-1 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full no-scrollbar select-none">
                    <button
                      type="button"
                      onClick={() => { setHistoryFilterId('all'); setHoveredBarInfo(null); }}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all active:scale-95 ${
                        historyFilterId === 'all'
                          ? 'bg-white text-pastel-purple-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Todos os Filhos
                    </button>
                    {perfis.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setHistoryFilterId(p.id); setHoveredBarInfo(null); }}
                        className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all active:scale-95 flex items-center gap-1.5 ${
                          historyFilterId === p.id
                            ? 'bg-white text-pastel-purple-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Avatar type={p.avatar} className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Métricas de Diagnóstico Rápido */}
                {(() => {
                  // Cálculos dinâmicos com base no filtro
                  let avg = 0;
                  let total = 0;
                  let estrelas = 0;
                  
                  if (historyFilterId === 'all') {
                    const somaMedias = perfis.reduce((soma, p) => {
                      const somaPerf = p.historicoSeteDias.reduce((a, b) => a + b, 0);
                      return soma + (somaPerf / 7);
                    }, 0);
                    avg = perfis.length > 0 ? Math.round(somaMedias / perfis.length) : 0;
                    total = perfis.reduce((soma, p) => soma + p.historicoSeteDias.reduce((a, b) => a + b, 0), 0);
                    estrelas = perfis.reduce((soma, p) => soma + p.estrelasAcumuladas, 0);
                  } else {
                    const p = perfis.find(prof => prof.id === historyFilterId);
                    if (p) {
                      avg = Math.round(p.historicoSeteDias.reduce((a, b) => a + b, 0) / 7);
                      total = p.historicoSeteDias.reduce((a, b) => a + b, 0);
                      estrelas = p.estrelasAcumuladas;
                    }
                  }

                  // Avaliação e Cor de acordo com a média
                  let cardBg = 'bg-emerald-50/40 border-emerald-100';
                  let textColor = 'text-emerald-600';
                  let ratingText = 'Excelente Equilíbrio! 🟢';
                  let insightText = 'O tempo de tela médio está saudável e dentro do limite recomendado de 1h/dia.';

                  if (avg > 60 && avg <= 120) {
                    cardBg = 'bg-pastel-yellow-50/40 border-pastel-yellow-200/60';
                    textColor = 'text-pastel-yellow-600';
                    ratingText = 'Consumo Moderado 🟡';
                    insightText = 'Recomendado introduzir 15m extras de quest física ou brincadeira offline.';
                  } else if (avg > 120) {
                    cardBg = 'bg-pastel-pink-50/40 border-pastel-pink-100';
                    textColor = 'text-pastel-pink-500';
                    ratingText = 'Limite Excedido 🔴';
                    insightText = 'Hiperestimulação detectada. Recomendado reduzir o tempo de tela diário.';
                  }

                  // Índice de desenvolvimento neurológico lúdico
                  // Score = (estrelas * 10) / (avg + 1) -> ponderado entre 1 e 10
                  const scoreRaw = (estrelas * 10) / (avg + 1);
                  const score = Math.max(3.2, Math.min(10, Math.round((scoreRaw + 5.5) * 10) / 10));
                  
                  let scoreLabel = 'Altamente Saudável 🌟';
                  if (score < 6) scoreLabel = 'Atenção Necessária ⚠️';
                  else if (score < 8.5) scoreLabel = 'Bom Equilíbrio 🚀';

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      {/* Card Média Diária */}
                      <div className={`p-4 rounded-2xl border shadow-xs ${cardBg}`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Média Diária</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className={`text-2xl font-black ${textColor}`}>{avg}</span>
                          <span className="text-xs text-slate-500 font-bold font-parents">m / dia</span>
                        </div>
                        <span className="text-[10px] font-black uppercase mt-1 block tracking-wider">{ratingText}</span>
                      </div>

                      {/* Card Total Semanal */}
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total na Semana</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-black text-slate-700">{(total / 60).toFixed(1)}</span>
                          <span className="text-xs text-slate-500 font-bold font-parents">horas</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-tight font-parents">{insightText}</span>
                      </div>

                      {/* Card Estrelas */}
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estrelas Acumuladas</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-black text-pastel-yellow-500">★ {estrelas}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-tight font-parents">Estrelas conquistadas em quests e missões no mundo real.</span>
                      </div>

                      {/* Card Índice Neuropediátrico */}
                      <div className="p-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-pastel-purple-50/40 to-pastel-blue-50/40 shadow-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score de Equilíbrio</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-black text-pastel-purple-600">{score.toFixed(1)}</span>
                          <span className="text-xs text-slate-500 font-bold font-parents">/ 10</span>
                        </div>
                        <span className="text-[10px] text-pastel-purple-600 font-black uppercase block mt-1 tracking-wider">{scoreLabel}</span>
                      </div>

                    </div>
                  );
                })()}

                {/* Área do Gráfico */}
                <div className="w-full bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative">
                  
                  {/* Tooltip Flutuante Interativo */}
                  {hoveredBarInfo && (
                    <div className="absolute top-2.5 left-4 bg-slate-900/95 text-white text-[11px] py-1.5 px-3.5 rounded-xl shadow-lg z-20 flex items-center gap-1.5 font-parents border border-slate-700/50 animate-fade-in">
                      <span className="text-pastel-yellow-400 font-black">★</span>
                      <span>
                        <strong>{perfis.find(p => p.id === hoveredBarInfo.childId)?.nome}</strong>: {hoveredBarInfo.val} min em {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][hoveredBarInfo.dayIdx]}
                      </span>
                    </div>
                  )}

                  {/* Indicadores de Limite Ativos (Flutuando no Top Right do Painel para não poluir o gráfico) */}
                  <div className="absolute top-2.5 right-4 hidden sm:flex items-center gap-2 select-none pointer-events-none z-10">
                    {historyFilterId !== 'all' ? (() => {
                      const p = perfis.find(prof => prof.id === historyFilterId);
                      if (!p) return null;
                      return (
                        <div className="flex items-center gap-1.5 bg-pastel-pink-50 border border-pastel-pink-200 px-2.5 py-1 rounded-lg text-[9px] font-black text-pastel-pink-500 shadow-2xs">
                          <span className="w-1.5 h-1.5 bg-pastel-pink-500 rounded-full animate-pulse" />
                          <span>Meta do(a) {p.nome}: {p.limiteDiario}m</span>
                        </div>
                      );
                    })() : null}
                    <div className="flex items-center gap-1.5 bg-pastel-green-50 border border-pastel-green-200 px-2.5 py-1 rounded-lg text-[9px] font-black text-pastel-green-600 shadow-2xs">
                      <span className="w-1.5 h-1.5 bg-pastel-green-500 rounded-full" />
                      <span>Zona Segura: 60m</span>
                    </div>
                  </div>

                  {/* SVG do Gráfico Responsivo */}
                  <svg className="w-full h-44" viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Definições de Gradientes */}
                    <defs>
                      <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#46b3cc" />
                        <stop offset="100%" stopColor="#338ea3" />
                      </linearGradient>
                      <linearGradient id="grad-pink" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f67280" />
                        <stop offset="100%" stopColor="#d55160" />
                      </linearGradient>
                      <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9e74d6" />
                        <stop offset="100%" stopColor="#7b53b2" />
                      </linearGradient>
                      <linearGradient id="grad-yellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f1c43f" />
                        <stop offset="100%" stopColor="#d4a727" />
                      </linearGradient>
                    </defs>

                    {/* Linhas de grade horizontais */}
                    <line x1="40" y1="20" x2="560" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="60" x2="560" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="100" x2="560" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="140" x2="560" y2="140" stroke="#cbd5e1" strokeWidth="1.5" /> {/* Linha Zero */}

                    {/* Rótulos do Eixo Y */}
                    <text x="15" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold">3h+</text>
                    <text x="15" y="64" fill="#94a3b8" fontSize="10" fontWeight="bold">2h</text>
                    <text x="15" y="104" fill="#94a3b8" fontSize="10" fontWeight="bold">1h</text>
                    <text x="15" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

                    {/* Guia Pediatria Padrão (60m) - Sempre visível como referência verde de Zona Segura */}
                    <line x1="40" y1="100" x2="560" y2="100" stroke="#3db87a" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />

                    {/* Linha de Limite do Perfil Ativo (Meta Estabelecida) - Visível quando um filho específico é selecionado */}
                    {historyFilterId !== 'all' && (() => {
                      const p = perfis.find(prof => prof.id === historyFilterId);
                      if (p) {
                        const yLimit = Math.max(10, 140 - (p.limiteDiario / 180) * 115);
                        return (
                          <line x1="40" y1={yLimit} x2="560" y2={yLimit} stroke="#f67280" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
                        );
                      }
                      return null;
                    })()}

                    {/* Renderização das Barras de Histórico */}
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, idx) => {
                      const spacing = 72;
                      const xStart = 55 + idx * spacing;
                      const maxVal = 180; // 3h = 180m

                      if (historyFilterId === 'all') {
                        // Renderiza todos os filhos atômicos lado a lado
                        return (
                          <g key={dia}>
                            {perfis.map((kid, kIdx) => {
                              const val = kid.historicoSeteDias[idx] || 0;
                              const height = Math.min(115, (val / maxVal) * 115);
                              const y = 140 - height;
                              const width = 10;
                              // Ajusta coordenada X para posicionar colunas lado a lado
                              const x = xStart + kIdx * 13 - ((perfis.length * 13) / 2) + 6;

                              const colors = {
                                lion: 'url(#grad-blue)',
                                cat: 'url(#grad-pink)',
                                owl: 'url(#grad-purple)',
                                bear: 'url(#grad-yellow)'
                              };
                              const fillColor = colors[kid.avatar] || 'url(#grad-blue)';

                              // Destaques dinâmicos interativos
                              const isHovered = hoveredBarInfo && hoveredBarInfo.childId === kid.id && hoveredBarInfo.dayIdx === idx;
                              const isAnyHovered = hoveredBarInfo !== null;
                              const barOpacity = isAnyHovered ? (isHovered ? 1 : 0.35) : 0.95;
                              const barScale = isHovered ? 'scale(1.15)' : 'scale(1)';
                              const barFilter = isHovered ? 'brightness(1.15) drop-shadow(0px 3px 5px rgba(0,0,0,0.22))' : 'none';

                              return (
                                <rect
                                  key={kid.id}
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={Math.max(2, height)}
                                  rx="3"
                                  fill={fillColor}
                                  style={{
                                    opacity: barOpacity,
                                    transform: barScale,
                                    transformOrigin: `${x + width / 2}px ${y + height}px`,
                                    filter: barFilter,
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                  }}
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoveredBarInfo({ childId: kid.id, dayIdx: idx, val })}
                                  onMouseLeave={() => setHoveredBarInfo(null)}
                                />
                              );
                            })}
                            
                            {/* Rótulo do Dia */}
                            <text x={xStart + 6} y="160" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">{dia}</text>
                          </g>
                        );
                      } else {
                        // Renderiza apenas o filho filtrado com colunas mais encorpadas e atraentes
                        const kid = perfis.find(p => p.id === historyFilterId);
                        if (!kid) return null;

                        const val = kid.historicoSeteDias[idx] || 0;
                        const height = Math.min(115, (val / maxVal) * 115);
                        const y = 140 - height;
                        const width = 28;
                        const x = xStart - 8;

                        const colors = {
                          lion: 'url(#grad-blue)',
                          cat: 'url(#grad-pink)',
                          owl: 'url(#grad-purple)',
                          bear: 'url(#grad-yellow)'
                        };
                        const fillColor = colors[kid.avatar] || 'url(#grad-blue)';

                        // Destaques dinâmicos interativos
                        const isHovered = hoveredBarInfo && hoveredBarInfo.childId === kid.id && hoveredBarInfo.dayIdx === idx;
                        const isAnyHovered = hoveredBarInfo !== null;
                        const barOpacity = isAnyHovered ? (isHovered ? 1 : 0.35) : 0.95;
                        const barScale = isHovered ? 'scale(1.08)' : 'scale(1)';
                        const barFilter = isHovered ? 'brightness(1.12) drop-shadow(0px 4px 6px rgba(0,0,0,0.18))' : 'none';

                        return (
                          <g key={dia}>
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={Math.max(2, height)}
                              rx="6"
                              fill={fillColor}
                              style={{
                                opacity: barOpacity,
                                transform: barScale,
                                transformOrigin: `${x + width / 2}px ${y + height}px`,
                                filter: barFilter,
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredBarInfo({ childId: kid.id, dayIdx: idx, val })}
                              onMouseLeave={() => setHoveredBarInfo(null)}
                            />
                            
                            {/* Rótulo do Dia */}
                            <text x={xStart + 6} y="160" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">{dia}</text>
                          </g>
                        );
                      }
                    })}
                  </svg>
                  
                  {/* Legenda Dinâmica baseada no filtro */}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs font-bold text-slate-500 border-t border-slate-100 pt-3">
                    {historyFilterId === 'all' ? (
                      perfis.map(kid => {
                        const colors = {
                          lion: 'bg-pastel-blue-500',
                          cat: 'bg-pastel-pink-500',
                          owl: 'bg-pastel-purple-500',
                          bear: 'bg-pastel-yellow-500'
                        };
                        const classBg = colors[kid.avatar] || 'bg-slate-400';
                        const media = Math.round(kid.historicoSeteDias.reduce((a, b) => a + b, 0) / 7);

                        return (
                          <div key={kid.id} className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => setHistoryFilterId(kid.id)}>
                            <span className={`w-3.5 h-3.5 ${classBg} rounded-md inline-block`} />
                            <span>{kid.nome} (Média: {media}m)</span>
                          </div>
                        );
                      })
                    ) : (
                      (() => {
                        const kid = perfis.find(p => p.id === historyFilterId);
                        if (!kid) return null;
                        
                        const colors = {
                          lion: 'bg-pastel-blue-500',
                          cat: 'bg-pastel-pink-500',
                          owl: 'bg-pastel-purple-500',
                          bear: 'bg-pastel-yellow-500'
                        };
                        const classBg = colors[kid.avatar] || 'bg-slate-400';
                        const media = Math.round(kid.historicoSeteDias.reduce((a, b) => a + b, 0) / 7);

                        return (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 ${classBg} rounded-md inline-block`} />
                            <span>Média de Uso do(a) {kid.nome}: {media}m / dia</span>
                          </div>
                        );
                      })()
                    )}
                    
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-0.5 border-t border-b border-dashed border-pastel-green-500 inline-block" />
                      <span className="text-[11px] text-slate-400">Diretriz Pediatria</span>
                    </div>

                    {historyFilterId !== 'all' && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-0.5 border-t border-b border-dashed border-pastel-pink-500 inline-block" />
                        <span className="text-[11px] text-slate-400">Meta Estabelecida</span>
                      </div>
                    )}
                  </div>

                </div>

              </section>

            </div>
          )}

          {/* TAB 2: SAÚDE E ALERTAS PEDIÁTRICOS */}
          {activeTab === 'alerts' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Alertas de Saúde e Prejuízos Cognitivos</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Nossos algoritmos analisam comportamentos incomuns para alertar possíveis riscos no sono, foco e desenvolvimento neurológico infantil.
                </p>
              </div>

              {alertas.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="text-pastel-green-500 inline-block p-4 bg-pastel-green-50 rounded-full mb-3">
                    <Check size={28} />
                  </div>
                  <h4 className="font-bold text-slate-700">Tudo equilibrado por aqui!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Nenhum comportamento fora dos limites de saúde infantil foi detectado nas últimas semanas. Continue com o bom trabalho!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {[...alertas]
                    .sort((a, b) => {
                      const priority = { critico: 4, preocupante: 3, alerta: 2, evolucao: 1 };
                      return (priority[b.gravidade] || 0) - (priority[a.gravidade] || 0);
                    })
                    .map((alert) => (
                      <HealthAlertCard key={alert.id} alerta={alert} />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONFIGURAÇÃO DE LIMITES */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Formulário Editar Limites */}
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 mb-4">Editar Limites por Perfil</h3>
                  
                  <form onSubmit={handleSaveLimits} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Escolher Criança</label>
                      <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-purple-400"
                      >
                        {perfis.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                    </div>

                    {selectedProfile && (
                      <>
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            <span>Limite Diário de Tela</span>
                            <span className="text-pastel-purple-500 font-extrabold text-sm font-kids">{editLimit} minutos</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="240"
                            step="15"
                            value={editLimit}
                            onChange={(e) => setEditLimit(parseInt(e.target.value))}
                            className="w-full accent-pastel-purple-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                            <span>15 min</span>
                            <span>Recomendado: 60m</span>
                            <span>4 horas</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Horário de Repouso (Toque de Recolher)</label>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            <input
                              type="time"
                              value={editBedtime}
                              onChange={(e) => setEditBedtime(e.target.value)}
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-purple-400"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1.5 leading-normal">
                            O dispositivo será bloqueado automaticamente a partir desse horário para incentivar o sono saudável.
                          </span>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="mt-4 w-full py-3 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Save size={16} /> Salvar Configurações
                    </button>
                  </form>
                </div>
              </section>

              {/* Detalhes de Guia Pediatria */}
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
                    <Sparkles className="text-pastel-yellow-500" size={18} />
                    Diretrizes Médicas de Tempo de Tela
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-4">
                    Sociedade Brasileira de Pediatria (SBP) e Organização Mundial da Saúde (OMS) recomendam:
                  </p>

                  <div className="flex flex-col gap-3 font-parents">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-extrabold text-pastel-pink-500">Menores de 2 anos:</span>
                      <p className="text-slate-500 font-medium mt-0.5">Zero exposição a telas, mesmo passiva (como TV ao fundo).</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-extrabold text-pastel-yellow-600">De 2 a 5 anos:</span>
                      <p className="text-slate-500 font-medium mt-0.5">No máximo 1 hora de tela de alta qualidade por dia, sempre com mediação.</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-extrabold text-pastel-green-600">De 6 a 10 anos:</span>
                      <p className="text-slate-500 font-medium mt-0.5">No máximo 1 a 2 horas por dia. Evite o uso durante as refeições principais.</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 4: RANKING DE MISSÕES CUMPRIDAS */}
          {activeTab === 'ranking' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 font-kids">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                  <Trophy className="text-pastel-yellow-500 fill-pastel-yellow-200 animate-wiggle shrink-0" size={22} />
                  Ranking de Missões de Equilíbrio
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1 font-parents">
                  Acompanhe quem está cumprindo mais atividades offline no mundo real e conquistando estrelas saudáveis!
                </p>
              </div>

              {/* Pódio Gráfico 3D */}
              {(() => {
                const perfisOrdenados = [...perfis].sort((a, b) => b.estrelasAcumuladas - a.estrelasAcumuladas);
                const primeiro = perfisOrdenados[0];
                const segundo = perfisOrdenados[1];
                const terceiro = perfisOrdenados[2];

                return (
                  <div className="w-full bg-slate-50/50 p-6 rounded-2xl border border-slate-100/80 my-2">
                    <div className="flex items-end justify-center gap-2 sm:gap-6 md:gap-10 h-60 max-w-lg mx-auto relative select-none pb-2">
                      
                      {/* 2º Lugar */}
                      {segundo && (
                        <div className="flex flex-col items-center animate-pop" style={{ animationDelay: '0.1s' }}>
                          <div className="relative mb-2">
                            <Avatar type={segundo.avatar} className="w-14 h-14 sm:w-16 sm:h-16 hover:rotate-3 transition-transform" />
                            <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-700 text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              2º
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-700 font-kids truncate max-w-[80px]">{segundo.nome}</span>
                          <span className="text-[10px] text-pastel-yellow-600 font-black mb-1 font-parents">★ {segundo.estrelasAcumuladas} estrelas</span>
                          <div className="w-16 sm:w-20 bg-gradient-to-t from-slate-200 to-slate-100 border-t-4 border-slate-300 h-20 rounded-t-2xl shadow-sm flex items-center justify-center">
                            <Medal size={24} className="text-slate-400 fill-slate-50" />
                          </div>
                        </div>
                      )}

                      {/* 1º Lugar */}
                      {primeiro && (
                        <div className="flex flex-col items-center animate-pop">
                          <div className="relative mb-2">
                            <Crown className="w-7 h-7 text-pastel-yellow-500 fill-pastel-yellow-200 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                            <Avatar type={primeiro.avatar} className="w-18 h-18 sm:w-20 sm:h-20 hover:scale-105 transition-transform" />
                            <span className="absolute -top-1 -right-1 bg-pastel-yellow-400 text-white text-[11px] font-black w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                              1º
                            </span>
                          </div>
                          <span className="text-sm font-black text-slate-800 font-kids truncate max-w-[100px]">{primeiro.nome}</span>
                          <span className="text-[11px] text-pastel-yellow-600 font-black mb-1 font-parents">★ {primeiro.estrelasAcumuladas} estrelas</span>
                          <div className="w-20 sm:w-24 bg-gradient-to-t from-pastel-yellow-200 to-pastel-yellow-100 border-t-4 border-pastel-yellow-400 h-28 rounded-t-2xl shadow-md flex items-center justify-center">
                            <Trophy size={32} className="text-pastel-yellow-500 fill-pastel-yellow-200" />
                          </div>
                        </div>
                      )}

                      {/* 3º Lugar */}
                      {terceiro && (
                        <div className="flex flex-col items-center animate-pop" style={{ animationDelay: '0.2s' }}>
                          <div className="relative mb-2">
                            <Avatar type={terceiro.avatar} className="w-12 h-12 sm:w-14 sm:h-14 hover:-rotate-3 transition-transform" />
                            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              3º
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-700 font-kids truncate max-w-[80px]">{terceiro.nome}</span>
                          <span className="text-[10px] text-pastel-yellow-600 font-black mb-1 font-parents">★ {terceiro.estrelasAcumuladas} estrelas</span>
                          <div className="w-14 sm:w-16 bg-gradient-to-t from-amber-200 to-amber-100 border-t-4 border-amber-300 h-14 rounded-t-2xl shadow-sm flex items-center justify-center">
                            <Medal size={20} className="text-amber-700 fill-amber-50" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tabela / Leaderboard */}
              <div className="flex flex-col gap-3 font-parents">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Tabela de Classificação</h4>
                
                {[...perfis]
                  .sort((a, b) => b.estrelasAcumuladas - a.estrelasAcumuladas)
                  .map((perfil, index) => {
                    const positions = [
                      'bg-pastel-yellow-500 text-white border-pastel-yellow-400',
                      'bg-slate-300 text-slate-700 border-slate-200',
                      'bg-amber-600 text-white border-amber-500',
                    ];
                    
                    const themeConfig = {
                      cat: 'hover:border-pastel-pink-300 hover:shadow-pastel-pink-50',
                      lion: 'hover:border-pastel-yellow-300 hover:shadow-pastel-yellow-50',
                      owl: 'hover:border-pastel-purple-300 hover:shadow-pastel-purple-50',
                      bear: 'hover:border-pastel-blue-300 hover:shadow-pastel-blue-50'
                    };

                    const hoverStyle = themeConfig[perfil.avatar] || themeConfig.bear;

                    return (
                      <div 
                        key={perfil.id}
                        className={`flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all active:scale-99 ${hoverStyle}`}
                      >
                        {/* Posição e Info da Criança */}
                        <div className="flex items-center gap-3">
                          {/* Emblema de Posição */}
                          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black border shadow-sm ${
                            index < 3 ? positions[index] : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            {index + 1}
                          </span>

                          <Avatar type={perfil.avatar} className="w-10 h-10 shrink-0" />
                          
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-black text-slate-800 text-sm font-kids">{perfil.nome}</h5>
                              {index === 0 && (
                                <span className="bg-pastel-yellow-50 text-pastel-yellow-600 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-pastel-yellow-200 animate-pulse">
                                  Líder 👑
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold font-parents">Idade: {perfil.idade} anos</span>
                          </div>
                        </div>

                        {/* Estatísticas de Missões e Estrelas */}
                        <div className="flex items-center gap-3">
                          {/* Missões Cumpridas */}
                          <div className="flex items-center gap-1 bg-pastel-green-50 text-pastel-green-600 px-3 py-1.5 rounded-full font-black text-xs font-kids">
                            <Check size={13} className="stroke-[3]" />
                            <span>{perfil.missoesCumpridas} Missões</span>
                          </div>

                          {/* Estrelas */}
                          <div className="flex items-center gap-1 bg-pastel-yellow-50 text-pastel-yellow-600 px-3 py-1.5 rounded-full font-black text-xs">
                            <span className="text-pastel-yellow-500 font-bold">★</span>
                            <span className="text-slate-700">{perfil.estrelasAcumuladas}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Dica lúdica */}
              <div className="bg-gradient-to-r from-pastel-purple-50/50 to-pastel-blue-50/50 border border-pastel-purple-100 p-4 rounded-2xl flex items-center gap-3 font-parents">
                <span className="text-lg animate-float">🎖️</span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  <strong>Desafio de Equilíbrio Digital</strong>: Toda vez que as crianças concluem uma missão saudável offline no simulador, elas ganham estrelas e sobem no ranking! Isso as motiva a balancear o tempo de tela com diversão no mundo real.
                </p>
              </div>
            </div>
          )}

          {/* FORMULÁRIO DE CADASTRO DE PERFIL (OVERLAY/MODAL INTEGRADO) */}
          {showNewForm && (
            <div className="fixed inset-0 z-40 bg-soft-dark-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <form 
                onSubmit={handleCreateProfile}
                className="w-full max-w-md bg-white p-6 rounded-3xl border-4 border-pastel-green-200 shadow-2xl animate-pop relative flex flex-col gap-4"
              >
                <div className="text-center mb-2">
                  <h3 className="text-lg font-black text-slate-800">Cadastrar Nova Criança</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Adicione um novo perfil para gerenciar o tempo</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedrinho"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-green-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Idade</label>
                    <input
                      type="number"
                      required
                      min="2"
                      max="16"
                      value={newAge}
                      onChange={(e) => setNewAge(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hora de Dormir</label>
                    <input
                      type="time"
                      required
                      value={newBedtime}
                      onChange={(e) => setNewBedtime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-green-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>Limite Diário</span>
                    <span className="text-pastel-green-600 font-extrabold text-sm">{newLimit} min</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={newLimit}
                    onChange={(e) => setNewLimit(parseInt(e.target.value))}
                    className="w-full accent-pastel-green-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Seleção de Avatar */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Escolher Mascote/Avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['lion', 'owl', 'cat', 'bear'] as const).map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setNewAvatar(av)}
                        className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                          newAvatar === av 
                            ? 'border-pastel-green-500 bg-pastel-green-50 shadow-sm scale-105' 
                            : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <Avatar type={av} className="w-10 h-10" />
                        <span className="text-[8px] font-black uppercase text-slate-400 mt-1">{av}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 font-extrabold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-pastel-green-500 hover:bg-pastel-green-600 text-white font-extrabold text-xs rounded-xl shadow-md border-b-4 border-pastel-green-600 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> Cadastrar Perfil
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>

        {/* COLUNA DIREITA: EMULADOR DO APARELHO DA CRIANÇA (Apenas se SplitView estiver ligada) */}
        {splitView && (
          <aside className="hidden xl:flex w-[380px] shrink-0 flex-col items-center justify-start sticky top-24 z-10 animate-pop">
            
            {/* Título explicativo */}
            <div className="text-center mb-3">
              <span className="text-[10px] text-pastel-purple-500 uppercase tracking-widest font-black flex items-center justify-center gap-1">
                <Sparkles size={12} className="animate-wiggle" />
                Simulador do Aparelho
              </span>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                Altere os controles à esquerda e veja a interface do seu filho reagir em tempo real abaixo!
              </p>
            </div>

            {/* Seletor de Perfis do Emulador */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-sm gap-1 mb-4 w-full">
              {perfis.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setActiveProfileId(k.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                    activeProfileId === k.id
                      ? 'bg-pastel-purple-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Avatar type={k.avatar} className="w-4 h-4 shrink-0" />
                  <span>{k.nome}</span>
                </button>
              ))}
            </div>

            {/* Molde físico de Smartphone (Celular Convencional) */}
            <div className="w-[360px] h-[720px] bg-slate-900 rounded-[38px] border-[8px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-slate-800/20">
              
              {/* Câmera frontal punch-hole centralizada (Celular convencional) */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rounded-full z-50 flex items-center justify-center border border-slate-800/60 shadow-inner">
                <div className="w-1 h-1 bg-blue-900/50 rounded-full" />
              </div>

              {/* Tela do celular (Viewport) */}
              <div className="flex-1 w-full bg-white overflow-y-auto overflow-x-hidden no-scrollbar relative select-none" style={{ fontSize: '13.5px' }}>
                <div className="h-full w-full flex flex-col">
                  <ChildInterface onNavigate={() => {}} className="h-full min-h-full p-3" isCompact={true} />
                </div>
              </div>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
};
