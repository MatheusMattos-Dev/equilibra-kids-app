import React, { useState } from 'react';
import { useScreenTime } from '../hooks/useScreenTime';
import { Avatar } from '../components/Avatar';
import { HealthAlertCard } from '../components/HealthAlertCard';
import { 
  Users, Activity, Bell, Settings, ArrowLeft, Play, Pause, 
  Square, ShieldAlert, Plus, Save, Clock, 
  TrendingUp, Sparkles, Check, Smartphone, ToggleLeft, ToggleRight
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
  const [activeTab, setActiveTab] = useState<'monitor' | 'alerts' | 'settings'>('monitor');
  const [selectedChildId, setSelectedChildId] = useState<string>(perfis[0]?.id || '');
  const [splitView, setSplitView] = useState<boolean>(true); // Split view ativa por padrão para demonstração incrível!
  
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
        </nav>

        {/* Toggle de Modo Lado a Lado (Demonstração) */}
        <button
          onClick={() => setSplitView(!splitView)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl border-2 transition-all shadow-sm active:scale-95 ${
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
                        className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          kid.status === 'online' 
                            ? 'bg-pastel-green-50/20 border-pastel-green-200/60 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
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

                        {/* Ações de Controle Remoto Remoto */}
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

                          {kid.pediuMaisTempo && (
                            <button
                              onClick={() => aprovarMaisTempo(kid.id)}
                              className="px-3.5 py-2 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md border-b-4 border-pastel-purple-700 animate-bounce flex items-center gap-1.5 active:scale-95 transition-all mr-2"
                              title="Criança solicitou tempo extra de tela!"
                            >
                              <Check size={14} /> Aprovar +15 min!
                            </button>
                          )}

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
                    );
                  })}
                </div>
              </section>

              {/* Histórico Semanal Lúdico em SVG */}
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="text-pastel-purple-500" size={18} />
                  <h3 className="text-base font-extrabold text-slate-800">Histórico de Uso dos Últimos 7 Dias</h3>
                </div>
                <p className="text-xs text-slate-400 font-semibold mb-6">Média de consumo semanal recomendada por pediatras: 60m/dia.</p>

                {/* Gráfico SVG customizado */}
                <div className="w-full bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <svg className="w-full h-44" viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Linhas de grade horizontais */}
                    <line x1="40" y1="20" x2="560" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="60" x2="560" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="100" x2="560" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="140" x2="560" y2="140" stroke="#cbd5e1" strokeWidth="1.5" /> {/* Linha Zero */}

                    {/* Rótulos do Eixo Y */}
                    <text x="15" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold">3h+</text>
                    <text x="15" y="64" fill="#94a3b8" fontSize="10" fontWeight="bold">2h</text>
                    <text x="15" y="104" fill="#94a3b8" fontSize="10" fontWeight="bold">1h</text>
                    <text x="15" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

                    {/* Barra Guias Recomendadas (Pediatria) */}
                    <rect x="40" y="80" width="520" height="40" fill="#3db87a" opacity="0.04" rx="2" />
                    <text x="490" y="92" fill="#3db87a" fontSize="9" fontWeight="bold" opacity="0.8">Zona Segura</text>

                    {/* Loop de renderização das barras */}
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, idx) => {
                      const spacing = 72;
                      const xStart = 55 + idx * spacing;
                      
                      // Mock de barras de tempo baseados no Leo e Gabi
                      const valGabi = [40, 50, 48, 55, 46, 52, 25][idx] || 0;
                      const valLeo = [90, 110, 85, 140, 95, 115, 105][idx] || 0;

                      // Altura em pixels (máximo 120px)
                      const maxVal = 180; // 3h = 180m
                      const heightGabi = Math.min(115, (valGabi / maxVal) * 115);
                      const heightLeo = Math.min(115, (valLeo / maxVal) * 115);

                      const yGabi = 140 - heightGabi;
                      const yLeo = 140 - heightLeo;

                      return (
                        <g key={dia}>
                          {/* Leo (Barra Azul) */}
                          <rect 
                            x={xStart} 
                            y={yLeo} 
                            width="14" 
                            height={heightLeo} 
                            rx="4" 
                            fill="#46b3cc" 
                            className="transition-all hover:opacity-80"
                          />
                          {/* Gabi (Barra Rosa) */}
                          <rect 
                            x={xStart + 18} 
                            y={yGabi} 
                            width="14" 
                            height={heightGabi} 
                            rx="4" 
                            fill="#f67280" 
                            className="transition-all hover:opacity-80"
                          />
                          {/* Nome do Dia */}
                          <text 
                            x={xStart + 16} 
                            y="160" 
                            fill="#64748b" 
                            fontSize="10" 
                            fontWeight="bold" 
                            textAnchor="middle"
                          >
                            {dia}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legenda do Gráfico */}
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 bg-pastel-blue-500 rounded-md inline-block" />
                      <span>Leo (Média: 105m)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 bg-pastel-pink-500 rounded-md inline-block" />
                      <span>Gabi (Média: 48m)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-8 h-2 bg-pastel-green-500/10 border-t border-b border-pastel-green-200 rounded-sm inline-block" />
                      <span>Limite Recomendado</span>
                    </div>
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
                  {alertas.map((alert) => (
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

            {/* Molde físico de Smartphone */}
            <div className="w-[360px] h-[720px] bg-slate-900 rounded-[50px] border-[10px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-slate-800/20">
              
              {/* Notch superior do celular */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-900 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-2 border border-slate-800/40" />
              </div>

              {/* Botão de Home Bar inferior do iOS simulado */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-800 rounded-full z-50" />

              {/* Tela do celular (Viewport) */}
              <div className="flex-1 w-full bg-white overflow-hidden relative select-none" style={{ fontSize: '13.5px' }}>
                <div className="h-full w-full flex flex-col">
                  <ChildInterface onNavigate={() => {}} className="h-full min-h-full p-3" />
                </div>
              </div>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
};
