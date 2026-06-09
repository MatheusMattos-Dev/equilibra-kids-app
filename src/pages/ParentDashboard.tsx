import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useScreenTime } from '../hooks/useScreenTime';
import { Avatar } from '../components/Avatar';
import { HealthAlertCard } from '../components/HealthAlertCard';
import {
  Users, Activity, Bell, Settings, ArrowLeft, Play, Pause,
  Square, ShieldAlert, Plus, Save, Clock,
  TrendingUp, Sparkles, Check, Smartphone, ToggleLeft, ToggleRight,
  Trophy, Medal, Crown, Mail,
  Palette, Compass, Droplet, BookOpen, Star, Trash, Smile,
  AlertTriangle, X, Calendar
} from 'lucide-react';
import { ChildInterface } from './ChildInterface';
import { ParentPinModal } from '../components/ParentPinModal';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isOnline = useOnlineStatus();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
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
    setActiveProfileId,
    emailConfig,
    atualizarEmailConfig,
    notificationPreferences,
    atualizarNotificationPreferences,
    quests,
    adicionarQuestCustomizada,
    deletarQuestCustomizada,
    dataLoading,
    syncError
  } = useScreenTime();

  const {
    permissionStatus,
    foregroundNotification,
    clearForegroundNotification,
    requestPermission,
    isSupportedBrowser
  } = usePushNotifications();

  // Estados locais da página
  const [activeTab, setActiveTab] = useState<'monitor' | 'alerts' | 'settings' | 'ranking' | 'digest'>('monitor');
  const [selectedChildId, setSelectedChildId] = useState<string>(perfis[0]?.id || '');
  const [splitView, setSplitView] = useState<boolean>(true); // Split view ativa por padrão para demonstração incrível!
  const [historyFilterId, setHistoryFilterId] = useState<string>('all');

  const [pinOpen, setPinOpen] = useState<boolean>(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);

  const handleLogout = async () => {
    const confirm = window.confirm("Deseja realmente encerrar a sessão dos pais?");
    if (confirm) {
      try {
        await signOut();
        navigate('/');
      } catch (err) {
        alert("Erro ao deslogar.");
      }
    }
  };

  const handleBlockClick = (id: string) => {
    setPendingBlockId(id);
    setPinOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingBlockId) {
      bloquearRemoto(pendingBlockId);
      setPendingBlockId(null);
    }
  };

  // Estados para configuração do E-mail
  const [emailInput, setEmailInput] = useState<string>(emailConfig.email);
  const [emailAtivo, setEmailAtivo] = useState<boolean>(emailConfig.ativo);
  const [emailAlertas, setEmailAlertas] = useState<boolean>(emailConfig.incluirAlertas);
  const [emailRanking, setEmailRanking] = useState<boolean>(emailConfig.incluirRanking);
  const [isSimulatingEmail, setIsSimulatingEmail] = useState<boolean>(false);
  const [emailSentToast, setEmailSentToast] = useState<boolean>(false);

  // Sincronizar estados locais do e-mail com o contexto
  React.useEffect(() => {
    setEmailInput(emailConfig.email);
    setEmailAtivo(emailConfig.ativo);
    setEmailAlertas(emailConfig.incluirAlertas);
    setEmailRanking(emailConfig.incluirRanking);
  }, [emailConfig]);

  // Garantir que sempre haja um perfil ativo selecionado no emulador
  React.useEffect(() => {
    if (perfis.length > 0 && (!activeProfileId || !perfis.some(p => p.id === activeProfileId))) {
      setActiveProfileId(perfis[0].id);
    }
  }, [perfis, activeProfileId, setActiveProfileId]);

  // Garantir que sempre haja um perfil selecionado para limites
  React.useEffect(() => {
    if (perfis.length > 0 && (!selectedChildId || !perfis.some(p => p.id === selectedChildId))) {
      setSelectedChildId(perfis[0].id);
    }
  }, [perfis, selectedChildId]);

  // Estado para edição de limites
  const selectedProfile = perfis.find(p => p.id === selectedChildId);
  const [editLimit, setEditLimit] = useState<number>(selectedProfile?.limiteDiario || 60);
  const [editBedtime, setEditBedtime] = useState<string>(selectedProfile?.limiteNoturno || '21:30');
  const [editStartTime, setEditStartTime] = useState<string>(selectedProfile?.horarioInicioPermitido || '08:00');
  const [editEndTime, setEditEndTime] = useState<string>(selectedProfile?.horarioFimPermitido || '20:00');

  // Estado para cadastro de novo perfil
  const [newName, setNewName] = useState<string>('');
  const [newAge, setNewAge] = useState<number>(8);
  const [newLimit, setNewLimit] = useState<number>(60);
  const [newAvatar, setNewAvatar] = useState<'lion' | 'owl' | 'cat' | 'bear'>('bear');
  const [newBedtime, setNewBedtime] = useState<string>('21:30');
  const [newStartTime, setNewStartTime] = useState<string>('08:00');
  const [newEndTime, setNewEndTime] = useState<string>('20:00');
  const [showNewForm, setShowNewForm] = useState<boolean>(false);

  // Agendamento de dias da semana
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]); // Segunda a Sexta por padrão
  const handleToggleDay = (dayIdx: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  // Estados para cadastro de nova missão customizada
  const [questTitle, setQuestTitle] = useState<string>('');
  const [questDescription, setQuestDescription] = useState<string>('');
  const [questStars, setQuestStars] = useState<number>(2);
  const [questIcon, setQuestIcon] = useState<'smile' | 'palette' | 'droplet' | 'compass' | 'book' | 'star' | 'run' | 'clean'>('star');

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (questTitle.trim() && questDescription.trim()) {
      adicionarQuestCustomizada(questTitle, questDescription, questStars, questIcon);
      setQuestTitle('');
      setQuestDescription('');
      setQuestStars(2);
      setQuestIcon('star');
      alert('Missão customizada criada com sucesso! Ela já está ativa para todas as crianças na Estação de Descanso.');
    }
  };

  // Sincronizar campos de edição ao mudar criança selecionada nas configurações
  React.useEffect(() => {
    if (selectedProfile) {
      setEditLimit(selectedProfile.limiteDiario);
      setEditBedtime(selectedProfile.limiteNoturno);
      setEditStartTime(selectedProfile.horarioInicioPermitido);
      setEditEndTime(selectedProfile.horarioFimPermitido);
    }
  }, [selectedChildId, perfis]);

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChildId) {
      redefinirLimite(selectedChildId, editLimit, editBedtime, editStartTime, editEndTime);
      alert('Configurações atualizadas com sucesso! Os limites foram aplicados remotamente.');
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      adicionarNovoPerfil(newName, newAge, newLimit, newAvatar, newBedtime, newStartTime, newEndTime);
      setNewName('');
      setShowNewForm(false);
      alert(`Perfil do(a) ${newName} criado com sucesso!`);
    }
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarEmailConfig({
      email: emailInput,
      ativo: emailAtivo,
      incluirAlertas: emailAlertas,
      incluirRanking: emailRanking
    });
    alert('Preferências de e-mail salvas com sucesso! O relatório semanal será consolidado para ' + emailInput);
  };

  const handleSimulateEmail = () => {
    setIsSimulatingEmail(true);
    setTimeout(() => {
      setIsSimulatingEmail(false);
      setEmailSentToast(true);
      setTimeout(() => setEmailSentToast(false), 4000);
    }, 1500);
  };

  // Cálculo das estatísticas gerais dos pais
  const totalKids = perfis.length;
  const activeKids = perfis.filter(p => p.status === 'online').length;
  const totalAlerts = alertas.length;

  const getChartAriaLabel = () => {
    if (historyFilterId === 'all') {
      return `Gráfico de uso semanal dos filhos. ${perfis.map(kid => {
        const diasStr = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
          .map((d, i) => `${d}: ${kid.historicoSeteDias[i] || 0} minutos`)
          .join(', ');
        return `Histórico do(a) ${kid.nome}: ${diasStr}.`;
      }).join(' ')}`;
    } else {
      const kid = perfis.find(p => p.id === historyFilterId);
      if (!kid) return "Gráfico de uso semanal";
      const diasStr = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
        .map((d, i) => `${d}: ${kid.historicoSeteDias[i] || 0} minutos`)
        .join(', ');
      return `Gráfico de uso semanal do(a) ${kid.nome}: ${diasStr}.`;
    }
  };

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
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Equilibra<span className="text-pastel-green-500">Kids</span>
            </h2>
            <p className="text-xs text-slate-400 font-parents font-semibold mt-1 animate-pulse">
              Sincronizando dados dos pais com a nuvem... ☁️
            </p>
          </div>
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200/50">
            <div className="h-full bg-pastel-purple-500 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-parents dark-mode-transition">
      {!isOnline && (
        <div className="bg-pastel-yellow-100 border-b border-pastel-yellow-200 text-pastel-yellow-700 text-xs font-bold text-center py-2 px-4 shadow-sm flex items-center justify-center gap-2 animate-pulse z-50">
          <AlertTriangle size={14} className="stroke-[3]" />
          <span>Modo offline — dados sincronizarão quando a conexão voltar</span>
        </div>
      )}
      {syncError && (
        <div className="bg-pastel-pink-500 text-white text-xs font-bold text-center py-2 px-4 shadow-sm flex items-center justify-center gap-2 animate-pulse z-50">
          <ShieldAlert size={14} />
          <span>{syncError} - Exibindo informações locais salvas offline</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="order-1 flex w-full lg:w-auto items-center justify-start gap-3">
          <div className="flex items-center gap-3 flex-nowrap">
            <button
              onClick={() => navigate('/')}
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

            <button
              onClick={handleLogout}
              className="lg:hidden px-3 py-1.5 bg-pastel-pink-50 hover:bg-pastel-pink-100 text-pastel-pink-500 hover:text-pastel-pink-600 font-bold text-xs rounded-xl border border-pastel-pink-200 transition-colors active:scale-95 ml-8"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Abas Principais */}
        <nav
          role="tablist"
          aria-label="Abas do painel dos pais"
          className="order-3 lg:order-2 w-full lg:w-auto flex justify-between lg:justify-start bg-slate-100 p-1 rounded-xl border border-slate-200/50 no-scrollbar max-w-full shrink-0"
        >
          <button
            id="tab-monitor"
            role="tab"
            aria-selected={activeTab === 'monitor'}
            aria-controls="panel-monitor"
            onClick={() => setActiveTab('monitor')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'monitor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Activity size={14} className="shrink-0" />
            <span className="hidden lg:inline">Monitor</span>
          </button>
          <button
            id="tab-alerts"
            role="tab"
            aria-selected={activeTab === 'alerts'}
            aria-controls="panel-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'alerts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <div className="relative flex items-center justify-center">
              <Bell size={14} className="shrink-0" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pastel-pink-500 text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </div>
            <span className="hidden lg:inline">Saúde & Alertas</span>
          </button>
          <button
            id="tab-settings"
            role="tab"
            aria-selected={activeTab === 'settings'}
            aria-controls="panel-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Settings size={14} className="shrink-0" />
            <span className="hidden lg:inline">Limites</span>
          </button>
          <button
            id="tab-ranking"
            role="tab"
            aria-selected={activeTab === 'ranking'}
            aria-controls="panel-ranking"
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'ranking' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Trophy size={14} className="text-pastel-yellow-500 fill-pastel-yellow-200 shrink-0" />
            <span className="hidden lg:inline">Ranking</span>
          </button>
          <button
            id="tab-digest"
            role="tab"
            aria-selected={activeTab === 'digest'}
            aria-controls="panel-digest"
            onClick={() => setActiveTab('digest')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'digest' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Mail size={14} className="text-pastel-blue-500 shrink-0" />
            <span className="hidden lg:inline">E-mail</span>
          </button>
        </nav>

        <div className="order-2 lg:order-3 hidden lg:flex items-center gap-4">
          {/* Toggle de Modo Lado a Lado (Demonstração - Oculto em Telas Responsivas Menores) */}
          <button
            onClick={() => setSplitView(!splitView)}
            className={`hidden xl:inline-flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl border-2 transition-all shadow-sm active:scale-95 ${splitView
              ? 'bg-pastel-purple-50 border-pastel-purple-300 text-pastel-purple-600'
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
          >
            <Smartphone size={14} />
            {splitView ? 'Desativar Lado a Lado' : 'Simular Lado a Lado 📱'}
          </button>

          {/* Dados do Responsável e Botão de Logout */}
          <div className="flex items-center gap-3 border-slate-200 xl:border-l pl-0 xl:pl-3">
            {auth.currentUser?.photoURL ? (
              <img
                src={auth.currentUser.photoURL}
                alt={auth.currentUser.displayName || 'Responsável'}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pastel-purple-100 text-pastel-purple-600 flex items-center justify-center font-bold text-sm border border-pastel-purple-200 uppercase">
                {(auth.currentUser?.displayName || auth.currentUser?.email || 'P')[0]}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <span className="text-xs font-bold text-slate-700 block max-w-[120px] truncate leading-tight">
                {auth.currentUser?.displayName || 'Responsável'}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block leading-none truncate max-w-[120px]">
                {auth.currentUser?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-pastel-pink-50 hover:bg-pastel-pink-100 text-pastel-pink-500 hover:text-pastel-pink-600 font-bold text-xs rounded-xl border border-pastel-pink-200 transition-colors active:scale-95"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Flex Layout */}
      <div className={`p-6 max-w-[1600px] mx-auto flex flex-col ${splitView ? 'xl:flex-row gap-8' : 'gap-6'}`}>

        {/* COLUNA ESQUERDA: CONTROLE DOS PAIS */}
        <main className={`w-full ${splitView ? 'xl:flex-1' : ''} flex flex-col gap-6 animate-pop`}>

          {/* Card Resumo Rápido */}
          <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
              <div className="p-2 sm:p-3 bg-pastel-blue-50 text-pastel-blue-600 rounded-xl shrink-0">
                <Users size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block leading-tight tracking-tight sm:tracking-normal">Crianças</span>
                <span className="text-base sm:text-xl font-extrabold text-slate-700 leading-none">{totalKids}</span>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
              <div className="p-2 sm:p-3 bg-pastel-green-50 text-pastel-green-500 rounded-xl shrink-0">
                <Activity size={18} className="sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block leading-tight tracking-tight sm:tracking-normal">Ativos Agora</span>
                <span className="text-base sm:text-xl font-extrabold text-slate-700 leading-none">{activeKids}</span>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
              <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${totalAlerts > 0 ? 'bg-pastel-pink-50 text-pastel-pink-500 animate-wiggle' : 'bg-slate-50 text-slate-400'}`}>
                <ShieldAlert size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block leading-tight tracking-tight sm:tracking-normal">Padrões Alerta</span>
                <span className="text-base sm:text-xl font-extrabold text-slate-700 leading-none">{totalAlerts}</span>
              </div>
            </div>
          </section>

          {/* TAB 1: MONITORAMENTO EM TEMPO REAL */}
          {activeTab === 'monitor' && (
            <div
              role="tabpanel"
              id="panel-monitor"
              aria-labelledby="tab-monitor"
              tabIndex={0}
              className="flex flex-col gap-6 focus-visible:outline-none"
            >

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
                  <h3 className="text-base font-extrabold text-slate-800">Monitor de Dispositivos</h3>
                  <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-pastel-green-500 hover:bg-pastel-green-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                  >
                    <Plus size={14} /> Novo Perfil
                  </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${splitView ? 'lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'} gap-4`}>
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
                        className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${kid.status === 'online'
                          ? 'bg-pastel-green-50/20 border-pastel-green-200/60 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                      >
                        {/* Linha 1: Informações da Criança (Avatar, Nome, Status e Janela de Horário) */}
                        <div className="flex items-center gap-3 w-full pb-3 border-b border-slate-100">
                          <div className="relative">
                            <Avatar type={kid.avatar} className="w-12 h-12" />
                            {kid.status === 'online' && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-pastel-green-500 border-2 border-white rounded-full animate-ping" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-slate-800 text-sm truncate">{kid.nome}</h4>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${kid.status === 'online' ? 'bg-pastel-green-100 text-pastel-green-600' :
                                kid.status === 'pausado' ? 'bg-pastel-yellow-100 text-pastel-yellow-700' :
                                  'bg-pastel-purple-100 text-pastel-purple-600'
                                }`}>
                                {kid.status === 'online' ? 'Online' :
                                  kid.status === 'pausado' ? 'Pausado' : 'Esgotado 💤'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold font-parents mt-0.5 flex flex-col gap-0.5">
                              <span>{kid.idade} anos • Dormir às {kid.limiteNoturno}</span>
                              <span className="text-pastel-blue-600 font-black text-[9px] uppercase tracking-wider">
                                Janela: {kid.horarioInicioPermitido} - {kid.horarioFimPermitido}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Linha 2: Barra de Progresso do Tempo de Tela */}
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-bold">
                            <span className="font-medium font-parents">Uso de Tela</span>
                            <span>{usadoMinutos}m / {kid.limiteDiario}m</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div
                              className={`h-full ${progressBarColor} transition-all duration-500`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-1 font-semibold text-right">
                            {kid.status === 'bloqueado' ? 'Tempo diário esgotado' : `Restam ${restanteMinutos} minutos`}
                          </span>
                        </div>

                        {/* Linha 3: Controles Rápidos do Dispositivo */}
                        <div className="flex flex-col gap-2 w-full pt-3 border-t border-slate-100">
                          {/* Entregar dispositivo */}
                          <button
                            onClick={() => {
                              selecionarPerfil(kid.id);
                              navigate('/crianca');
                            }}
                            disabled={kid.status === 'bloqueado'}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-pastel-green-500 hover:bg-pastel-green-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Iniciar Sessão Segura e Entregar Celular para a Criança"
                          >
                            <Play size={12} fill="currentColor" />
                            Entregar Celular 📱
                          </button>

                          <div className="flex gap-2">
                            {/* Pausar / Retomar */}
                            {kid.status === 'online' ? (
                              <button
                                onClick={() => pausarTempoRemoto(kid.id)}
                                className="flex-1 py-2 bg-pastel-yellow-50 hover:bg-pastel-yellow-100 text-pastel-yellow-600 rounded-xl border border-pastel-yellow-200 transition-colors flex items-center justify-center text-xs font-bold"
                                title="Pausar Sessão"
                              >
                                <Pause size={13} className="mr-1" /> Pausar
                              </button>
                            ) : (
                              <button
                                onClick={() => iniciarTempoRemoto(kid.id)}
                                disabled={kid.status === 'bloqueado'}
                                className="flex-1 py-2 bg-pastel-green-50 hover:bg-pastel-green-100 text-pastel-green-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-pastel-green-200 transition-colors flex items-center justify-center text-xs font-bold"
                                title="Retomar Sessão"
                              >
                                <Play size={13} className="mr-1" /> Retomar
                              </button>
                            )}

                            {/* Bloquear */}
                            <button
                              onClick={() => handleBlockClick(kid.id)}
                              disabled={kid.status === 'bloqueado'}
                              className="flex-1 py-2 bg-pastel-pink-50 hover:bg-pastel-pink-100 text-pastel-pink-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-pastel-pink-200 transition-colors flex items-center justify-center text-xs font-bold"
                              title="Bloquear Dispositivo Imediatamente"
                            >
                              <Square size={11} fill="currentColor" className="mr-1" /> Bloquear
                            </button>
                          </div>

                          {/* Presentear +15 minutos */}
                          <button
                            onClick={() => adicionarTempoRemoto(kid.id, 15)}
                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1"
                            title="Presentear Criança com +15 Minutos"
                          >
                            +15 Minutos Extra ⚡
                          </button>
                        </div>

                        {/* Linha 4: Pedido de tempo extra recebido */}
                        {kid.pediuMaisTempo && (
                          <div className="w-full flex flex-col p-3 bg-pastel-purple-50 border border-pastel-purple-200 rounded-xl gap-2 mt-1 animate-pulse">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-pastel-purple-100 text-pastel-purple-700 text-[8px] font-black uppercase px-2 py-0.5 rounded">📨 Pedido</span>
                              <span className="text-slate-700 text-[10px] font-bold font-parents">
                                Pedido de +15 minutos recebido.
                              </span>
                            </div>
                            <button
                              onClick={() => aprovarMaisTempo(kid.id)}
                              className="w-full py-1.5 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white font-black text-xs rounded-lg shadow-md border-b-2 border-pastel-purple-700 active:scale-95 transition-all"
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
              <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">

                {/* Cabeçalho Interativo do Histórico */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-pastel-purple-500 animate-pulse" size={18} />
                      <h3 className="text-base font-extrabold text-slate-800">Histórico de Uso (Últimos 7 Dias)</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Diagnósticos e médias recomendadas por pediatras em tempo real.</p>
                  </div>

                  {/* Seletor de Crianças do Histórico */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 gap-1 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full no-scrollbar select-none">
                    <button
                      type="button"
                      onClick={() => setHistoryFilterId('all')}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all active:scale-95 ${historyFilterId === 'all'
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
                        onClick={() => setHistoryFilterId(p.id)}
                        className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all active:scale-95 flex items-center gap-1.5 ${historyFilterId === p.id
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">

                      {/* Card Média Diária */}
                      <div className={`p-4.5 rounded-3xl border shadow-2xs transition-all hover:shadow-sm ${cardBg} flex flex-col justify-between min-h-[112px]`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Média Diária</span>
                          <div className={`p-1.5 rounded-xl ${textColor === 'text-pastel-pink-500' ? 'bg-pastel-pink-100/50' : (textColor === 'text-pastel-yellow-600' ? 'bg-pastel-yellow-100/50' : 'bg-emerald-100/50')}`}>
                            <Clock size={15} className={textColor} />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black ${textColor}`}>{avg}</span>
                            <span className="text-xs text-slate-500 font-bold font-parents">m / dia</span>
                          </div>
                          <span className="text-[9px] font-black uppercase mt-1 block tracking-wider leading-none">{ratingText}</span>
                        </div>
                      </div>

                      {/* Card Total Semanal */}
                      <div className="p-4.5 rounded-3xl border border-slate-100 bg-slate-50/50 shadow-2xs transition-all hover:shadow-sm flex flex-col justify-between min-h-[112px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total na Semana</span>
                          <div className="p-1.5 rounded-xl bg-slate-200/50">
                            <Calendar size={15} className="text-slate-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-700">{(total / 60).toFixed(1)}</span>
                            <span className="text-xs text-slate-500 font-bold font-parents">horas</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-tight font-parents">{insightText}</span>
                        </div>
                      </div>

                      {/* Card Estrelas */}
                      <div className="p-4.5 rounded-3xl border border-slate-100 bg-slate-50/50 shadow-2xs transition-all hover:shadow-sm flex flex-col justify-between min-h-[112px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estrelas Acumuladas</span>
                          <div className="p-1.5 rounded-xl bg-pastel-yellow-100/50">
                            <Star size={15} className="text-pastel-yellow-500 fill-pastel-yellow-200" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-pastel-yellow-500">★ {estrelas}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-tight font-parents">Ganhas em missões e brincadeiras offline.</span>
                        </div>
                      </div>

                      {/* Card Score de Equilíbrio */}
                      <div className="p-4.5 rounded-3xl border border-slate-100 bg-gradient-to-br from-pastel-purple-50/50 to-pastel-blue-50/50 shadow-2xs transition-all hover:shadow-sm flex flex-col justify-between min-h-[112px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score de Equilíbrio</span>
                          <div className="p-1.5 rounded-xl bg-pastel-purple-100/50">
                            <Activity size={15} className="text-pastel-purple-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-pastel-purple-600">{score.toFixed(1)}</span>
                            <span className="text-xs text-slate-500 font-bold font-parents">/ 10</span>
                          </div>
                          <span className="text-[9px] text-pastel-purple-600 font-black uppercase block mt-1 tracking-wider leading-none">{scoreLabel}</span>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* Área do Gráfico */}
                <div className="w-full bg-slate-50/30 p-3 sm:p-5 rounded-2xl border border-slate-100 relative overflow-hidden">

                  {/* Tabela de Estatísticas de Uso de Tela */}
                  <div className="w-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto no-scrollbar scroll-smooth">
                      <table className="w-full text-left border-collapse min-w-[550px]" aria-label={getChartAriaLabel()}>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider font-parents">
                            <th className="py-3.5 px-4.5">Filho</th>
                            <th className="py-3.5 px-2.5 text-center">Seg</th>
                            <th className="py-3.5 px-2.5 text-center">Ter</th>
                            <th className="py-3.5 px-2.5 text-center">Qua</th>
                            <th className="py-3.5 px-2.5 text-center">Qui</th>
                            <th className="py-3.5 px-2.5 text-center">Sex</th>
                            <th className="py-3.5 px-2.5 text-center">Sáb</th>
                            <th className="py-3.5 px-2.5 text-center">Dom</th>
                            <th className="py-3.5 px-4.5 text-right">Média</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-700">
                          {(() => {
                            const filteredProfiles = historyFilterId === 'all' ? perfis : perfis.filter(p => p.id === historyFilterId);
                            return filteredProfiles.map((kid) => {
                              const total = kid.historicoSeteDias.reduce((a, b) => a + b, 0);
                              const media = Math.round(total / 7);
                              return (
                                <tr key={kid.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-4.5 flex items-center gap-2.5 font-bold font-kids">
                                    <Avatar type={kid.avatar} className="w-6 h-6 shrink-0" />
                                    <span className="truncate">{kid.nome}</span>
                                  </td>
                                  {kid.historicoSeteDias.map((val, idx) => {
                                    let badgeColor = 'text-slate-500 bg-slate-50 border-slate-100';
                                    let dotColor = '';
                                    if (val > 120) {
                                      badgeColor = 'text-pastel-pink-600 bg-pastel-pink-50/40 border-pastel-pink-100/60';
                                      dotColor = 'bg-pastel-pink-500';
                                    } else if (val > 60) {
                                      badgeColor = 'text-pastel-yellow-700 bg-pastel-yellow-50/40 border-pastel-yellow-100/60';
                                      dotColor = 'bg-pastel-yellow-500';
                                    } else if (val > 0) {
                                      badgeColor = 'text-pastel-green-600 bg-pastel-green-50/40 border-pastel-green-100/60';
                                      dotColor = 'bg-pastel-green-500';
                                    }

                                    return (
                                      <td key={idx} className="py-3 px-2.5 text-center font-mono text-[11px] sm:text-xs">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${badgeColor}`}>
                                          {dotColor && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
                                          <span>{val}m</span>
                                        </span>
                                      </td>
                                    );
                                  })}
                                  <td className="py-3 px-4.5 text-right font-bold font-kids text-pastel-purple-600 text-xs sm:text-sm whitespace-nowrap">
                                    {media}m/dia
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Legenda Explicativa da Tabela */}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-[10px] sm:text-xs font-bold text-slate-400 pt-3 font-parents border-t border-slate-100/60">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-pastel-green-500 border border-pastel-green-600 inline-block shadow-sm" />
                      <span>Zona Segura (Até 60m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-pastel-yellow-500 border border-pastel-yellow-600 inline-block shadow-sm" />
                      <span>Consumo Moderado (60m a 120m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-pastel-pink-500 border border-pastel-pink-600 inline-block shadow-sm" />
                      <span>Limite Excedido (Mais de 120m)</span>
                    </div>
                  </div>

                </div>
              </section>

            </div>
          )}

          {/* TAB 2: SAÚDE E ALERTAS PEDIÁTRICOS */}
          {activeTab === 'alerts' && (
            <div
              role="tabpanel"
              id="panel-alerts"
              aria-labelledby="tab-alerts"
              tabIndex={0}
              className="focus-visible:outline-none flex flex-col gap-6"
            >
              {/* SEÇÃO SUPERIOR: CONFIGURAÇÕES DE NOTIFICAÇÕES (Lado a lado em telas médias/grandes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pop">

                {/* Card Status do Canal de Notificação */}
                <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 font-parents">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Canal de Notificações</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Status de recebimento dos avisos push no seu aparelho.
                    </p>
                  </div>

                  {isSupportedBrowser ? (
                    <>
                      {permissionStatus === 'default' && (
                        <div className="p-4 bg-white/75 border border-pastel-purple-200 rounded-2xl flex flex-col gap-3 text-center items-center">
                          <div className="p-2.5 bg-pastel-purple-100/50 text-pastel-purple-500 rounded-xl">
                            <Bell size={20} className="animate-wiggle text-pastel-purple-500 fill-pastel-purple-100" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-800">Alertas Desativados</h5>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">
                              Ative para receber os avisos mesmo com o app fechado.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={requestPermission}
                            className="w-full mt-1 py-2 bg-pastel-purple-100 hover:bg-pastel-purple-200 text-pastel-purple-700 font-black text-xs rounded-xl active:scale-95 transition-all duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Bell size={13} className="fill-pastel-purple-700/10" />
                            <span>Ativar Notificações</span>
                          </button>
                        </div>
                      )}

                      {permissionStatus === 'denied' && (
                        <div className="p-4 bg-pastel-pink-50 border border-pastel-pink-200 rounded-2xl flex flex-col gap-3 text-center items-center">
                          <div className="p-2.5 bg-pastel-pink-100/50 text-pastel-pink-500 rounded-xl">
                            <AlertTriangle size={20} className="animate-pulse" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-800">Acesso Bloqueado</h5>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">
                              Permita as notificações nas configurações do navegador (clique no cadeado 🔒).
                            </p>
                          </div>
                        </div>
                      )}

                      {permissionStatus === 'granted' && (
                        <div className="p-4 bg-pastel-green-50/50 border border-pastel-green-200 rounded-2xl flex flex-col gap-2 items-center text-center">
                          <div className="p-2 bg-pastel-green-100 text-pastel-green-600 rounded-full">
                            <Check size={18} className="stroke-[3]" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-800">Notificações Ativas!</h5>
                            <p className="text-[10px] text-pastel-green-600 font-bold mt-0.5">
                              Canal de push configurado e online.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-semibold">
                      Navegador incompatível com notificações push.
                    </div>
                  )}
                </section>

                {/* Card Preferências de Alertas */}
                <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 font-parents">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Tipos de Avisos</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Selecione quais alertas deseja receber.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Restam 15 Minutos</span>
                        <span className="text-[9px] text-slate-400 font-semibold leading-tight block mt-0.5">Alerta de aproximação do limite.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => atualizarNotificationPreferences({
                          ...notificationPreferences,
                          warnings15Min: !notificationPreferences.warnings15Min
                        })}
                        className="transition-transform active:scale-95 shrink-0 cursor-pointer"
                        aria-label="Alternar alerta de 15 minutos"
                      >
                        {notificationPreferences.warnings15Min ? (
                          <ToggleRight size={34} className="text-pastel-purple-500 fill-pastel-purple-100" />
                        ) : (
                          <ToggleLeft size={34} className="text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Restam 5 Minutos</span>
                        <span className="text-[9px] text-slate-400 font-semibold leading-tight block mt-0.5">Aviso final de transição.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => atualizarNotificationPreferences({
                          ...notificationPreferences,
                          warnings5Min: !notificationPreferences.warnings5Min
                        })}
                        className="transition-transform active:scale-95 shrink-0 cursor-pointer"
                        aria-label="Alternar alerta de 5 minutos"
                      >
                        {notificationPreferences.warnings5Min ? (
                          <ToggleRight size={34} className="text-pastel-purple-500 fill-pastel-purple-100" />
                        ) : (
                          <ToggleLeft size={34} className="text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Tempo Esgotado</span>
                        <span className="text-[9px] text-slate-400 font-semibold leading-tight block mt-0.5">Dispositivo foi bloqueado.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => atualizarNotificationPreferences({
                          ...notificationPreferences,
                          warningsEnd: !notificationPreferences.warningsEnd
                        })}
                        className="transition-transform active:scale-95 shrink-0 cursor-pointer"
                        aria-label="Alternar alerta de tempo esgotado"
                      >
                        {notificationPreferences.warningsEnd ? (
                          <ToggleRight size={34} className="text-pastel-purple-500 fill-pastel-purple-100" />
                        ) : (
                          <ToggleLeft size={34} className="text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Alertas de Saúde</span>
                        <span className="text-[9px] text-slate-400 font-semibold leading-tight block mt-0.5">Uso noturno ou picos de uso.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => atualizarNotificationPreferences({
                          ...notificationPreferences,
                          healthAlerts: !notificationPreferences.healthAlerts
                        })}
                        className="transition-transform active:scale-95 shrink-0 cursor-pointer"
                        aria-label="Alternar alertas pediátricos de saúde"
                      >
                        {notificationPreferences.healthAlerts ? (
                          <ToggleRight size={34} className="text-pastel-purple-500 fill-pastel-purple-100" />
                        ) : (
                          <ToggleLeft size={34} className="text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* SEÇÃO INFERIOR: DIAGNÓSTICOS E ALERTAS (LARGURA TOTAL) */}
              <div className="w-full flex flex-col gap-6">
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Alertas de Saúde e Prejuízos Cognitivos</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Nossos algoritmos analisam comportamentos incomuns para alertar possíveis riscos no sono, foco e desenvolvimento neurológico infantil.
                    </p>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
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
                </section>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURAÇÃO DE LIMITES */}
          {activeTab === 'settings' && (
            <div
              role="tabpanel"
              id="panel-settings"
              aria-labelledby="tab-settings"
              tabIndex={0}
              className="focus-visible:outline-none flex flex-col gap-6"
            >
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
                              <span>Limite Geral de Tela</span>
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
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dias com Limite Ativo</label>
                            <div className="grid grid-cols-7 gap-1">
                              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, dIdx) => {
                                const isSelected = selectedDays.includes(dIdx);
                                return (
                                  <button
                                    key={dIdx}
                                    type="button"
                                    onClick={() => handleToggleDay(dIdx)}
                                    className={`h-11 w-full rounded-xl text-xs font-black transition-all flex items-center justify-center border ${isSelected
                                      ? 'bg-pastel-purple-500 border-pastel-purple-600 text-white shadow-xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                      }`}
                                    title={`Alternar limite para ${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][dIdx]}`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
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

                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Janela de Horário Permitida (Uso de Telas)</label>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold font-parents">Das</span>
                                <input
                                  type="time"
                                  value={editStartTime}
                                  onChange={(e) => setEditStartTime(e.target.value)}
                                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-purple-400"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold font-parents">Até</span>
                                <input
                                  type="time"
                                  value={editEndTime}
                                  onChange={(e) => setEditEndTime(e.target.value)}
                                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-purple-400"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1.5 leading-normal">
                              O app bloqueará automaticamente fora desta janela de horário, independente do tempo diário consumido.
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

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 mt-6 font-parents">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Sparkles className="text-pastel-purple-500 animate-wiggle" size={18} />
                    Gerenciador de Missões Reais
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Estimule brincadeiras, hábitos saudáveis e afazeres domésticos offline! Crie missões personalizadas que rendem estrelas no painel da criança.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Formulário Nova Missão (col-span-5) */}
                  <form onSubmit={handleCreateQuest} className="md:col-span-5 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Nova Missão Personalizada</h4>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Título da Missão</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Arrumar a cama 🛏️"
                        value={questTitle}
                        onChange={(e) => setQuestTitle(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-pastel-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Instruções para a Criança</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Ex: Estique os lençóis e coloque os travesseiros arrumadinhos!"
                        value={questDescription}
                        onChange={(e) => setQuestDescription(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-600 outline-none focus:border-pastel-purple-400 resize-none"
                      />
                    </div>

                    {/* Recompensa Estrelas */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2">Recompensa (Estrelas ★)</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setQuestStars(stars)}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-black transition-all flex items-center justify-center gap-0.5 ${questStars === stars
                              ? 'bg-pastel-yellow-50 border-pastel-yellow-400 text-pastel-yellow-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                          >
                            <span className="text-pastel-yellow-500">★</span>
                            <span>+{stars}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Seleção de Ícone / Categoria */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2">Ícone e Categoria</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: 'smile', icon: <Smile size={16} /> },
                          { name: 'palette', icon: <Palette size={16} /> },
                          { name: 'droplet', icon: <Droplet size={16} /> },
                          { name: 'compass', icon: <Compass size={16} /> },
                          { name: 'book', icon: <BookOpen size={16} /> },
                          { name: 'star', icon: <Star size={16} /> },
                          { name: 'run', icon: <Activity size={16} /> },
                          { name: 'clean', icon: <Sparkles size={16} /> }
                        ].map((iconItem) => (
                          <button
                            key={iconItem.name}
                            type="button"
                            onClick={() => setQuestIcon(iconItem.name as any)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${questIcon === iconItem.name
                              ? 'border-pastel-purple-400 bg-pastel-purple-50 text-pastel-purple-600 scale-105 shadow-2xs'
                              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                              }`}
                          >
                            {iconItem.icon}
                            <span className="text-[8px] font-bold uppercase tracking-wider">{iconItem.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 py-2.5 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 border-b-4 border-pastel-purple-700"
                    >
                      <Plus size={14} /> Ativar Missão Real 🚀
                    </button>
                  </form>

                  {/* Lista de Missões Ativas (col-span-7) */}
                  <div className="md:col-span-7 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Missões Ativas na Casa</h4>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                        {quests.length} Missão(ões)
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 select-none no-scrollbar">
                      {quests.map((q) => {
                        const isCustom = !!q.custom;

                        // Encontrar representação local do ícone
                        const localIconsMap = {
                          smile: <Smile size={16} />,
                          palette: <Palette size={16} />,
                          droplet: <Droplet size={16} />,
                          compass: <Compass size={16} />,
                          book: <BookOpen size={16} />,
                          star: <Star size={16} />,
                          run: <Activity size={16} />,
                          clean: <Sparkles size={16} />
                        };

                        return (
                          <div
                            key={q.id}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${isCustom
                              ? 'bg-pastel-purple-50/10 border-pastel-purple-200/60 shadow-2xs hover:border-pastel-purple-300'
                              : 'bg-slate-50/50 border-slate-150'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-white rounded-xl shadow-2xs border ${isCustom ? 'text-pastel-purple-500 border-pastel-purple-100' : 'text-slate-500 border-slate-100'
                                }`}>
                                {localIconsMap[q.icone] || <Star size={16} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-extrabold text-slate-800 text-xs">{q.titulo}</h5>
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${isCustom ? 'bg-pastel-purple-100 text-pastel-purple-600' : 'bg-slate-200/60 text-slate-500 font-parents'
                                    }`}>
                                    {isCustom ? 'Criada por Você' : 'Padrão'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold font-parents mt-0.5 leading-tight">{q.descricao}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="bg-white border border-slate-150 px-2 py-1 rounded-lg text-[10px] font-black text-slate-700 flex items-center gap-0.5 shadow-3xs">
                                <span className="text-pastel-yellow-500">★</span>
                                <span>+{q.recompensa}</span>
                              </div>

                              {isCustom ? (
                                <button
                                  type="button"
                                  onClick={() => deletarQuestCustomizada(q.id)}
                                  className="p-1.5 hover:bg-pastel-pink-50 text-pastel-pink-500 rounded-lg border border-transparent hover:border-pastel-pink-200 transition-colors"
                                  title="Excluir Missão Customizada"
                                >
                                  <Trash size={14} />
                                </button>
                              ) : (
                                <span className="w-7 h-7" /> // Spacing matching trash icon width
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RANKING DE MISSÕES CUMPRIDAS */}
          {activeTab === 'ranking' && (
            <div
              role="tabpanel"
              id="panel-ranking"
              aria-labelledby="tab-ranking"
              tabIndex={0}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 font-kids focus-visible:outline-none"
            >
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
                    <div className="flex items-end justify-center gap-1.5 sm:gap-6 md:gap-10 h-56 sm:h-64 max-w-lg mx-auto relative select-none pb-2">

                      {/* 2º Lugar */}
                      {segundo && (
                        <div className="flex flex-col items-center animate-pop" style={{ animationDelay: '0.1s' }}>
                          <div className="relative mb-2">
                            <Avatar type={segundo.avatar} className="w-11 h-11 sm:w-16 sm:h-16 hover:rotate-3 transition-transform" />
                            <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-700 text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              2º
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-700 font-kids truncate max-w-[80px]">{segundo.nome}</span>
                          <span className="text-[10px] text-pastel-yellow-600 font-black mb-1 font-parents">★ {segundo.estrelasAcumuladas} estrelas</span>
                          <div className="w-14 sm:w-20 bg-gradient-to-t from-slate-200 to-slate-100 border-t-4 border-slate-300 h-14 sm:h-16 rounded-t-2xl shadow-sm flex items-center justify-center">
                            <Medal size={24} className="text-slate-400 fill-slate-50" />
                          </div>
                        </div>
                      )}

                      {/* 1º Lugar */}
                      {primeiro && (
                        <div className="flex flex-col items-center animate-pop">
                          <div className="relative mb-2">
                            <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-pastel-yellow-500 fill-pastel-yellow-200 absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                            <Avatar type={primeiro.avatar} className="w-14 h-14 sm:w-20 sm:h-20 hover:scale-105 transition-transform" />
                            <span className="absolute -top-1 -right-1 bg-pastel-yellow-400 text-white text-[11px] font-black w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                              1º
                            </span>
                          </div>
                          <span className="text-sm font-black text-slate-800 font-kids truncate max-w-[100px]">{primeiro.nome}</span>
                          <span className="text-[11px] text-pastel-yellow-600 font-black mb-1 font-parents">★ {primeiro.estrelasAcumuladas} estrelas</span>
                          <div className="w-18 sm:w-24 bg-gradient-to-t from-pastel-yellow-200 to-pastel-yellow-100 border-t-4 border-pastel-yellow-400 h-20 sm:h-24 rounded-t-2xl shadow-md flex items-center justify-center">
                            <Trophy size={32} className="text-pastel-yellow-500 fill-pastel-yellow-200" />
                          </div>
                        </div>
                      )}

                      {/* 3º Lugar */}
                      {terceiro && (
                        <div className="flex flex-col items-center animate-pop" style={{ animationDelay: '0.2s' }}>
                          <div className="relative mb-2">
                            <Avatar type={terceiro.avatar} className="w-9 h-9 sm:w-14 sm:h-14 hover:-rotate-3 transition-transform" />
                            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              3º
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-700 font-kids truncate max-w-[80px]">{terceiro.nome}</span>
                          <span className="text-[10px] text-pastel-yellow-600 font-black mb-1 font-parents">★ {terceiro.estrelasAcumuladas} estrelas</span>
                          <div className="w-12 sm:w-16 bg-gradient-to-t from-amber-200 to-amber-100 border-t-4 border-amber-300 h-10 sm:h-12 rounded-t-2xl shadow-sm flex items-center justify-center">
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
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all active:scale-99 ${hoverStyle}`}
                      >
                        {/* Posição e Info da Criança */}
                        <div className="flex items-center gap-3">
                          {/* Emblema de Posição */}
                          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black border shadow-sm ${index < 3 ? positions[index] : 'bg-slate-50 text-slate-400 border-slate-200'
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
                        <div className="flex items-center gap-2.5 sm:gap-3 pl-9.5 sm:pl-0 self-start sm:self-auto">
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

          {activeTab === 'digest' && (
            <div
              role="tabpanel"
              id="panel-digest"
              aria-labelledby="tab-digest"
              tabIndex={0}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pop focus-visible:outline-none"
            >

              {/* COLUNA ESQUERDA: CONFIGURAÇÕES E FLUXO (4 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">

                {/* Card Configurações */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Settings size={18} className="text-pastel-purple-500" />
                    Preferências do Digest
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mb-4 leading-normal font-parents">
                    Configure os dados de recebimento do relatório consolidado semanal.
                  </p>

                  <form onSubmit={handleSaveEmailConfig} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail de Destino</label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: maeepai@exemplo.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-purple-400"
                      />
                    </div>

                    {/* Toggle Ativo */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mt-1">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Enviar toda Segunda-feira</span>
                        <span className="text-[10px] text-slate-400 font-semibold font-parents">Digest agendado para 08:00 AM</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailAtivo(!emailAtivo)}
                        className="transition-transform active:scale-95 shrink-0"
                      >
                        {emailAtivo ? (
                          <ToggleRight size={38} className="text-pastel-purple-500 fill-pastel-purple-100" />
                        ) : (
                          <ToggleLeft size={38} className="text-slate-300" />
                        )}
                      </button>
                    </div>

                    {/* Checkboxes adicionais */}
                    <div className="flex flex-col gap-3 mt-1.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Incluir Conteúdo</span>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={emailAlertas}
                          onChange={(e) => setEmailAlertas(e.target.checked)}
                          className="w-4 h-4 accent-pastel-purple-500 rounded border-slate-300 cursor-pointer"
                        />
                        <span className="font-parents">Alertas Pediátricos e Diagnósticos</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={emailRanking}
                          onChange={(e) => setEmailRanking(e.target.checked)}
                          className="w-4 h-4 accent-pastel-purple-500 rounded border-slate-300 cursor-pointer"
                        />
                        <span className="font-parents">Ranking e Estrelas Cumpridas</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full py-3 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Save size={16} /> Salvar Configurações
                    </button>
                  </form>
                </section>

                {/* Card Simulação */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 font-parents">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Simulador de Inbox</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Envie um e-mail de teste imediato para conferir os dados da última semana do EquilibraKids.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSimulatingEmail}
                    onClick={handleSimulateEmail}
                    className="w-full py-3 bg-gradient-to-r from-pastel-purple-500 to-pastel-blue-500 hover:from-pastel-purple-600 hover:to-pastel-blue-600 text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isSimulatingEmail ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-1" />
                        <span>Consolidando dados e enviando...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Simular Envio de E-mail ✉️</span>
                      </>
                    )}
                  </button>

                  {/* Aviso Local Sutil */}
                  {emailSentToast && (
                    <div className="w-full bg-pastel-green-50 text-slate-700 font-bold px-4 py-3.5 rounded-2xl border border-pastel-green-200/80 animate-fade-in text-xs flex items-start gap-2.5">
                      <div className="p-1 bg-white text-pastel-green-600 rounded-lg shrink-0 mt-0.5 shadow-2xs">
                        <Sparkles size={13} className="animate-pulse" />
                      </div>
                      <span className="leading-normal text-slate-600">
                        Relatório semanal simulado e enviado com sucesso para <strong className="text-slate-900 font-extrabold">{emailConfig.email}</strong>! Verifique o preview ao lado.
                      </span>
                    </div>
                  )}

                  <div className="p-3 bg-pastel-yellow-50/50 border border-pastel-yellow-200 rounded-2xl text-[10px] text-slate-500 font-semibold leading-relaxed">
                    💡 <strong>Como funciona na vida real?</strong> Nosso sistema calcula de forma autônoma na madrugada de domingo para segunda o histórico de consumo, gera gráficos estatísticos e dispara um boletim por e-mail, poupando os pais de abrirem o console todos os dias.
                  </div>
                </section>

              </div>

              {/* COLUNA DIREITA: PREVIEW PREMIUM DO CLIENTE DE E-MAIL (8 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">

                {/* Janela de Cliente de E-mail */}
                <div className="w-full bg-slate-100 border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-md flex flex-col">

                  {/* Barra Superior do Cliente de E-mail (Mac Style) */}
                  <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-pastel-pink-400" />
                      <span className="w-3 h-3 rounded-full bg-pastel-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-pastel-green-500" />
                    </div>
                    <div className="bg-slate-200/80 border border-slate-300/40 rounded-lg text-[10px] text-slate-500 font-bold px-12 py-1 truncate max-w-sm font-parents">
                      inbox.equilibrakids.com/digest
                    </div>
                    <div className="w-12" /> {/* Spacing */}
                  </div>

                  {/* Header de Metadados do E-mail */}
                  <div className="bg-white p-5 border-b border-slate-100 flex flex-col gap-2 font-parents text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
                        EquilibraKids Digest: Balanço do(a) {perfis.map(p => p.nome).join(', ')} da última semana
                      </h4>
                      <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-md shrink-0">
                        Entrada 📥
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] mt-1 pt-1.5 border-t border-slate-50">
                      <div>
                        <span className="text-slate-400">De:</span> <strong className="text-slate-700">EquilibraKids Relatórios</strong> <span className="text-slate-400">&lt;relatorios@equilibrakids.com.br&gt;</span>
                      </div>
                      <div className="text-slate-400 font-semibold text-right">
                        Segunda-feira, 08:00 AM (Hoje)
                      </div>
                    </div>

                    <div className="text-[11px]">
                      <span className="text-slate-400">Para:</span> <strong className="text-slate-700">Responsável Legal</strong> <span className="text-slate-400">&lt;{emailConfig.email}&gt;</span>
                    </div>
                  </div>

                  {/* CORPO DO E-MAIL (O Relatório em Si) */}
                  <div className="bg-slate-100 p-6 overflow-y-auto max-h-[580px] select-none no-scrollbar">

                    {/* Molde do Email HTML */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-xl mx-auto flex flex-col">

                      {/* Email Header */}
                      <div className="bg-gradient-to-r from-pastel-purple-500 to-pastel-blue-500 p-6 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                        <h2 className="text-base sm:text-lg font-black tracking-tight leading-none">EquilibraKids Weekly Digest</h2>
                        <p className="text-[10px] font-semibold text-white/90 uppercase tracking-widest mt-1.5 font-parents">Relatório de Equilíbrio Digital • Segunda-Feira</p>
                      </div>

                      {/* Email Greeting */}
                      <div className="p-6 border-b border-slate-100 font-parents">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-1.5">Olá pais,</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-semibold">
                          Aqui está o consolidado de uso de dispositivos digitais e a evolução de metas de equilíbrio de seus filhos referente aos últimos 7 dias. Com este boletim, você monitora os hábitos de saúde deles sem esforço.
                        </p>
                      </div>

                      {/* Conteúdo dinâmico das crianças */}
                      <div className="p-6 flex flex-col gap-6 border-b border-slate-100">
                        {perfis.map((kid) => {
                          const somaHistorico = kid.historicoSeteDias.reduce((a, b) => a + b, 0);
                          const mediaUso = Math.round(somaHistorico / 7);

                          // Cálculo dinâmico de cores/estilo
                          let statusLabel = 'Equilibrado';
                          let statusBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';

                          if (mediaUso > 60 && mediaUso <= 120) {
                            statusLabel = 'Consumo Moderado';
                            statusBg = 'bg-pastel-yellow-50 text-pastel-yellow-600 border-pastel-yellow-200/60';
                          } else if (mediaUso > 120) {
                            statusLabel = 'Atenção Necessária';
                            statusBg = 'bg-pastel-pink-50 text-pastel-pink-500 border-pastel-pink-100';
                          }

                          return (
                            <div key={kid.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3 font-parents">

                              {/* Criança Identidade */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                  <Avatar type={kid.avatar} className="w-10 h-10 shrink-0" />
                                  <div>
                                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm font-kids">{kid.nome}</h4>
                                    <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Média Diária: {mediaUso}m / dia</span>
                                  </div>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBg}`}>
                                  {statusLabel}
                                </span>
                              </div>

                              {/* Barra de média comparativa */}
                              <div>
                                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${statusLabel === 'Atenção Necessária' ? 'bg-pastel-pink-500' : (statusLabel === 'Consumo Moderado' ? 'bg-pastel-yellow-500' : 'bg-pastel-green-500')} rounded-full`}
                                    style={{ width: `${Math.min(100, (mediaUso / 180) * 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-400 mt-1 font-semibold">
                                  <span>Limite Ideal: {kid.limiteDiario}m</span>
                                  <span>Média Calculada</span>
                                </div>
                              </div>

                              {/* Estatísticas e Ranking */}
                              {emailRanking && (
                                <div className="grid grid-cols-2 gap-3 mt-2 pt-2.5 border-t border-slate-200/40 border-dashed">
                                  <div className="bg-pastel-yellow-50/50 p-2 rounded-xl border border-pastel-yellow-200/50 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <span className="text-pastel-yellow-500 font-bold text-xs">★</span>
                                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Estrelas</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-700">{kid.estrelasAcumuladas}</span>
                                  </div>
                                  <div className="bg-pastel-green-50/50 p-2 rounded-xl border border-pastel-green-200/50 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Check size={10} className="text-pastel-green-500 stroke-[3]" />
                                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Quests</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-700">{kid.missoesCumpridas}</span>
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>

                      {/* Tabela de Classificação do Ranking no E-mail */}
                      {emailRanking && (
                        <div className="p-6 border-b border-slate-100 bg-slate-50/20 font-parents">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            🏆 Ranking de Missões Saudáveis
                          </h3>
                          <div className="flex flex-col gap-2.5">
                            {[...perfis]
                              .sort((a, b) => b.estrelasAcumuladas - a.estrelasAcumuladas)
                              .map((perfil, index) => {
                                const rankColors = [
                                  'bg-pastel-yellow-100 text-pastel-yellow-700 border-pastel-yellow-300',
                                  'bg-slate-100 text-slate-700 border-slate-300',
                                  'bg-amber-100 text-amber-800 border-amber-300'
                                ];
                                const rankText = index === 0 ? '🥇 1º' : index === 1 ? '🥈 2º' : index === 2 ? '🥉 3º' : `${index + 1}º`;
                                const isLeader = index === 0;

                                return (
                                  <div
                                    key={perfil.id}
                                    className={`p-3 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${isLeader ? 'ring-1 ring-pastel-yellow-300/80 bg-pastel-yellow-50/10' : ''
                                      }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${index < 3 ? rankColors[index] : 'bg-slate-50 text-slate-400 border-slate-200'
                                        }`}>
                                        {rankText}
                                      </span>
                                      <Avatar type={perfil.avatar} className="w-7 h-7 shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-extrabold text-xs text-slate-800 font-kids block leading-tight truncate">{perfil.nome}</span>
                                          {isLeader && (
                                            <span className="bg-pastel-yellow-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-3xs leading-none shrink-0">
                                              Líder 👑
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold font-parents">
                                          {perfil.idade} anos
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pl-[38px] sm:pl-0 self-start sm:self-auto shrink-0 mt-0.5 sm:mt-0">
                                      <span className="text-[9.5px] font-black text-pastel-green-600 bg-pastel-green-50/80 px-2 py-0.5 rounded-lg border border-pastel-green-100 flex items-center gap-0.5 shrink-0 font-kids">
                                        <Check size={9} className="stroke-[3]" /> {perfil.missoesCumpridas} {perfil.missoesCumpridas === 1 ? 'Quest' : 'Quests'}
                                      </span>
                                      <span className="text-[9.5px] font-black text-pastel-yellow-600 bg-pastel-yellow-50/80 px-2 py-0.5 rounded-lg border border-pastel-yellow-100 flex items-center gap-0.5 shrink-0">
                                        ★ {perfil.estrelasAcumuladas}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Alertas de saúde da semana */}
                      {emailAlertas && (
                        <div className="p-6 border-b border-slate-100 bg-slate-50/20 font-parents">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sinais de Atenção Clínicos</h3>

                          {alertas.length === 0 ? (
                            <div className="text-center py-4 bg-white rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-500">Tudo equilibrado! Nenhum alerta de saúde disparou na semana. 👍</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {alertas.slice(0, 2).map((alert) => {
                                const severityColors = {
                                  critico: 'text-pastel-pink-500 bg-pastel-pink-50 border-pastel-pink-100',
                                  preocupante: 'text-pastel-purple-500 bg-pastel-purple-50 border-pastel-purple-100',
                                  alerta: 'text-pastel-yellow-600 bg-pastel-yellow-50 border-pastel-yellow-200/60',
                                  evolucao: 'text-pastel-green-600 bg-pastel-green-50 border-pastel-green-100'
                                };
                                const classColor = severityColors[alert.gravidade] || severityColors.alerta;

                                return (
                                  <div key={alert.id} className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-extrabold text-[11px] text-slate-800">{alert.titulo}</span>
                                      <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${classColor}`}>
                                        {alert.gravidade}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-semibold block">{alert.childNome} • {alert.descricao}</span>
                                    <span className="text-[9px] text-slate-500 font-semibold block leading-relaxed mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                      <strong>Dica de Intervenção:</strong> {alert.dicaPratica}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dica da semana e encerramento */}
                      <div className="p-6 bg-gradient-to-br from-pastel-purple-50/40 to-pastel-blue-50/40 text-center font-parents">
                        <span className="text-xl">💡</span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1.5">Dica Pediatria da Semana</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto mt-1">
                          "Evite entregar dispositivos nos momentos de choro ou tédio. A criança precisa passar pela experiência do tédio para incentivar a imaginação e a autorregulação do sistema dopaminérgico."
                        </p>

                        <div className="mt-6 pt-5 border-t border-slate-200/60 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          © EquilibraKids • Relatório Consolidado de Bem-Estar
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

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
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 ${activeProfileId === k.id
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
                  <ChildInterface className="h-full min-h-full p-3" isCompact={true} />
                </div>
              </div>

            </div>
          </aside>
        )}

      </div>

      {/* FORMULÁRIO DE CADASTRO DE PERFIL (OVERLAY/MODAL INTEGRADO) */}
      {showNewForm && createPortal(
        <div className="fixed inset-0 z-[9999] bg-soft-dark-900/40 flex items-center justify-center p-4 font-kids">
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
                <span>Limite Diário Geral</span>
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



            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Janela Das</label>
                <input
                  type="time"
                  required
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Janela Até</label>
                <input
                  type="time"
                  required
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-pastel-green-400"
                />
              </div>
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
                    className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${newAvatar === av
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
        </div>,
        document.body
      )}

      <ParentPinModal
        isOpen={pinOpen}
        onClose={() => {
          setPinOpen(false);
          setPendingBlockId(null);
        }}
        onSuccess={handlePinSuccess}
      />

      {needRefresh && (
        <div className="fixed bottom-6 left-6 bg-slate-900 text-white text-xs font-bold py-3 px-4.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-50 animate-pop border border-slate-700 font-parents">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-pastel-yellow-400 fill-pastel-yellow-100" />
            <span>Nova versão disponível! Clique para atualizar.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-3 py-1.5 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Atualizar
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              aria-label="Dispensar atualização"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toast para Mensagens Recebidas em Foreground */}
      {foregroundNotification && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950 text-white p-4.5 rounded-2xl shadow-2xl border border-slate-800 flex gap-3 animate-pop"
        >
          <div className="p-2.5 bg-pastel-purple-500/20 text-pastel-purple-400 rounded-xl self-start shrink-0">
            <Bell size={20} className="animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-black tracking-tight text-white uppercase">{foregroundNotification.title || 'EquilibraKids'}</h5>
            <p className="text-xs text-slate-300 font-parents font-medium mt-1 leading-normal">{foregroundNotification.body}</p>
          </div>
          <button
            type="button"
            onClick={clearForegroundNotification}
            className="p-1 hover:bg-slate-800 rounded-lg self-start text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
