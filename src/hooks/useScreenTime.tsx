import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Tipos para Perfil de Criança
export interface ChildProfile {
  id: string;
  nome: string;
  idade: number;
  limiteDiario: number; // em minutos
  tempoUsadoHoje: number; // em segundos
  status: 'online' | 'pausado' | 'bloqueado';
  avatar: 'lion' | 'owl' | 'cat' | 'bear';
  pediuMaisTempo: boolean;
  estrelasAcumuladas: number;
  missoesCumpridas: number;
  historicoSeteDias: number[]; // em minutos, últimos 7 dias (excluindo hoje)
  usoApos22hCount: number; // ocorrências detectadas no histórico
  excedeuDiasSeguidos: number; // sequência recente de dias excedendo
  limiteNoturno: string; // Ex: "21:30" ou "22:00"
  horarioInicioPermitido: string; // Ex: "14:00"
  horarioFimPermitido: string; // Ex: "18:00"
}

// Tipos para Alertas de Saúde
export interface HealthAlert {
  id: string;
  childId: string;
  childNome: string;
  tipo: 'USO_NOTURNO' | 'DIAS_SEGUIDOS' | 'USO_EXTREMO' | 'EVOLUCAO_POSITIVA';
  titulo: string;
  descricao: string;
  impacto: string;
  dicaPratica: string;
  gravidade: 'alerta' | 'preocupante' | 'critico' | 'evolucao';
}

// Preferências para o Relatório por E-mail
export interface EmailConfig {
  email: string;
  ativo: boolean;
  incluirAlertas: boolean;
  incluirRanking: boolean;
}

// Preferências para as Notificações FCM/Locais
export interface NotificationPreferences {
  warnings15Min: boolean;
  warnings5Min: boolean;
  warningsEnd: boolean;
  healthAlerts: boolean;
}

// Tipo para Missões (Quests) Offline Customizáveis
export interface Quest {
  id: string;
  titulo: string;
  descricao: string;
  recompensa: number; // estrelas
  icone: 'smile' | 'palette' | 'droplet' | 'compass' | 'book' | 'star' | 'run' | 'clean';
  custom?: boolean;
}

// Interface do Contexto
interface ScreenTimeContextProps {
  perfis: ChildProfile[];
  activeProfileId: string | null;
  turboMode: boolean;
  alertas: HealthAlert[];
  emailConfig: EmailConfig;
  notificationPreferences: NotificationPreferences;
  quests: Quest[];
  dataLoading: boolean;
  syncError: string | null;
  setActiveProfileId: (id: string | null) => void;
  setTurboMode: (enabled: boolean) => void;
  selecionarPerfil: (id: string) => void;
  pausarTempoRemoto: (id: string) => void;
  iniciarTempoRemoto: (id: string) => void;
  bloquearRemoto: (id: string) => void;
  adicionarTempoRemoto: (id: string, minutos: number) => void;
  pedirMaisTempo: (id: string) => void;
  aprovarMaisTempo: (id: string) => void;
  redefinirLimite: (id: string, novoLimite: number, limiteNoturno: string, inicioPermitido: string, fimPermitido: string) => void;
  concluirAtividadeOffline: (id: string, estrelas: number) => void;
  adicionarNovoPerfil: (nome: string, idade: number, limiteDiario: number, avatar: 'lion' | 'owl' | 'cat' | 'bear', limiteNoturno: string, inicioPermitido: string, fimPermitido: string) => void;
  atualizarEmailConfig: (config: EmailConfig) => void;
  atualizarNotificationPreferences: (prefs: NotificationPreferences) => void;
  adicionarQuestCustomizada: (titulo: string, descricao: string, recompensa: number, icone: 'smile' | 'palette' | 'droplet' | 'compass' | 'book' | 'star' | 'run' | 'clean') => void;
  deletarQuestCustomizada: (id: string) => void;
  resetarSimulador: () => void;
}

// Perfis Iniciais Padrão para Demonstração
const INITIAL_PROFILES: ChildProfile[] = [
  {
    id: 'gabi-1',
    nome: 'Gabi',
    idade: 6,
    limiteDiario: 45,
    tempoUsadoHoje: 1200, // 20 minutos usados (sobrando 25 min)
    status: 'pausado',
    avatar: 'cat',
    pediuMaisTempo: false,
    estrelasAcumuladas: 4,
    missoesCumpridas: 2,
    historicoSeteDias: [50, 48, 55, 46, 52, 49, 50], // Excedeu o limite de 45 nos últimos 7 dias consecutivos!
    usoApos22hCount: 0,
    excedeuDiasSeguidos: 7,
    limiteNoturno: '21:00',
    horarioInicioPermitido: '09:00',
    horarioFimPermitido: '20:00'
  },
  {
    id: 'leo-2',
    nome: 'Leo',
    idade: 10,
    limiteDiario: 120, // 2 horas
    tempoUsadoHoje: 6900, // 1h55m usados (faltando 5 min)
    status: 'online',
    avatar: 'lion',
    pediuMaisTempo: false,
    estrelasAcumuladas: 12,
    missoesCumpridas: 5,
    historicoSeteDias: [100, 110, 85, 380, 95, 115, 105], // Teve um dia de uso extremo (380m = 6.3h)
    usoApos22hCount: 4, // Usou telas após às 22h por 4 vezes
    excedeuDiasSeguidos: 0,
    limiteNoturno: '22:00',
    horarioInicioPermitido: '14:00', // Fora do horário agora (10:00 AM) para demonstração de bloqueio!
    horarioFimPermitido: '19:00'
  },
  {
    id: 'bia-3',
    nome: 'Bia',
    idade: 8,
    limiteDiario: 60, // 1 hora
    tempoUsadoHoje: 3600, // 60 minutos usados (tempo esgotado!)
    status: 'bloqueado',
    avatar: 'owl',
    pediuMaisTempo: true, // Começa pedindo mais tempo na demo!
    estrelasAcumuladas: 8,
    missoesCumpridas: 3,
    historicoSeteDias: [45, 55, 58, 40, 50, 60, 55],
    usoApos22hCount: 1,
    excedeuDiasSeguidos: 1,
    limiteNoturno: '21:30',
    horarioInicioPermitido: '08:00',
    horarioFimPermitido: '21:00'
  }
];

export const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'stretch-1',
    titulo: 'Espreguiçar de Gatinho 🐱',
    descricao: 'Fique de pé, estique os braços lá no alto e respire fundo três vezes como um gatinho acordando!',
    recompensa: 1,
    icone: 'smile'
  },
  {
    id: 'drawing-2',
    titulo: 'Artista do Papel 🎨',
    descricao: 'Pegue papel e giz de cera e desenhe um animal fantástico de três cabeças ou seu brinquedo preferido!',
    recompensa: 3,
    icone: 'palette'
  },
  {
    id: 'water-3',
    titulo: 'Poção da Hidratação 💧',
    descricao: 'Beba um copo de água bem fresquinho e coma uma fruta saborosa para se recarregar!',
    recompensa: 2,
    icone: 'droplet'
  },
  {
    id: 'origami-4',
    titulo: 'Engenheiro de Avião ⛵',
    descricao: 'Faça um avião ou barquinho de papel tradicional e aposte corrida para ver se ele consegue planar longe!',
    recompensa: 3,
    icone: 'compass'
  }
];

const ScreenTimeContext = createContext<ScreenTimeContextProps | undefined>(undefined);

export const ScreenTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perfis, setPerfis] = useState<ChildProfile[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    email: 'pais@equilibrakids.com.br',
    ativo: true,
    incluirAlertas: true,
    incluirRanking: true
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    warnings15Min: true,
    warnings5Min: true,
    warningsEnd: true,
    healthAlerts: true
  });
  const [alertas, setAlertas] = useState<HealthAlert[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubscribesRef = useRef<(() => void)[]>([]);
  const timerSyncCountRef = useRef<number>(0);

  const notifiedAlertsRef = useRef<Set<string>>(new Set());
  const triggeredWarningsRef = useRef<Record<string, { warn15?: boolean; warn5?: boolean; warnEnd?: boolean; warnWindow?: boolean }>>({});

  // Helper para obter a data de hoje no formato YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  // Helper para salvar perfil individual no Firestore
  const saveProfileToFirestore = async (uid: string, p: ChildProfile) => {
    const todayStr = getTodayDateStr();
    
    // 1. Salva documento principal do perfil
    await setDoc(doc(db, `families/${uid}/profiles/${p.id}`), {
      id: p.id,
      name: p.nome,
      nome: p.nome,
      age: p.idade,
      idade: p.idade,
      dailyLimit: p.limiteDiario,
      limiteDiario: p.limiteDiario,
      avatar: p.avatar,
      status: p.status,
      pediuMaisTempo: p.pediuMaisTempo,
      starsAccumulated: p.estrelasAcumuladas,
      estrelasAcumuladas: p.estrelasAcumuladas,
      missionsCompleted: p.missoesCumpridas,
      missoesCumpridas: p.missoesCumpridas,
      limiteNoturno: p.limiteNoturno,
      horarioInicioPermitido: p.horarioInicioPermitido,
      horarioFimPermitido: p.horarioFimPermitido,
      usoApos22hCount: p.usoApos22hCount,
      excedeuDiasSeguidos: p.excedeuDiasSeguidos,
      tempoUsadoHoje: p.tempoUsadoHoje
    });

    // 2. Registra sessão de hoje na subcoleção
    await setDoc(doc(db, `families/${uid}/profiles/${p.id}/sessions/${todayStr}`), {
      secondsUsed: p.tempoUsadoHoje,
      minutesUsed: Math.floor(p.tempoUsadoHoje / 60),
      starsEarned: p.estrelasAcumuladas,
      mood: 'smile'
    }, { merge: true });
  };

  // Helper para salvar missão no Firestore
  const saveMissionToFirestore = async (uid: string, quest: Quest) => {
    await setDoc(doc(db, `families/${uid}/missions/${quest.id}`), {
      id: quest.id,
      title: quest.titulo,
      description: quest.descricao,
      stars: quest.recompensa,
      emoji: quest.icone,
      custom: quest.custom ?? true
    });
  };

  // Helper para salvar alerta no Firestore
  const saveAlertToFirestore = async (uid: string, alert: HealthAlert) => {
    await setDoc(doc(db, `families/${uid}/alerts/${alert.id}`), {
      type: alert.tipo,
      profileId: alert.childId,
      createdAt: new Date().toISOString(),
      read: false,
      childNome: alert.childNome,
      titulo: alert.titulo,
      descricao: alert.descricao,
      impacto: alert.impacto,
      dicaPratica: alert.dicaPratica,
      gravidade: alert.gravidade
    });
  };

  // Cancela todos os listeners ativos do Firestore
  const stopFirestoreSync = () => {
    unsubscribesRef.current.forEach(unsub => unsub());
    unsubscribesRef.current = [];
  };

  // Carrega e sincroniza dados do Firestore
  const syncFamilyData = (uid: string) => {
    setDataLoading(true);
    setSyncError(null);
    stopFirestoreSync();

    // 1. Ouvinte para Configurações (Preferences)
    const unsubSettings = onSnapshot(doc(db, `families/${uid}/settings/preferences`), (docSnap) => {
      if (docSnap.exists()) {
        setEmailConfig(docSnap.data() as EmailConfig);
      } else {
        const defaultConfig = {
          email: auth.currentUser?.email || 'pais@equilibrakids.com.br',
          ativo: true,
          incluirAlertas: true,
          incluirRanking: true
        };
        setDoc(doc(db, `families/${uid}/settings/preferences`), defaultConfig).catch(console.error);
        setEmailConfig(defaultConfig);
      }
    }, (err) => {
      setSyncError("Erro ao sincronizar preferências.");
      console.error(err);
    });
    unsubscribesRef.current.push(unsubSettings);

    // Ouvinte para Preferências de Notificação
    const unsubNotificationPrefs = onSnapshot(doc(db, `families/${uid}/settings/notificationPreferences`), (docSnap) => {
      if (docSnap.exists()) {
        setNotificationPreferences(docSnap.data() as NotificationPreferences);
      } else {
        const defaultPrefs = {
          warnings15Min: true,
          warnings5Min: true,
          warningsEnd: true,
          healthAlerts: true
        };
        setDoc(doc(db, `families/${uid}/settings/notificationPreferences`), defaultPrefs).catch(console.error);
        setNotificationPreferences(defaultPrefs);
      }
    }, (err) => {
      console.error("Erro ao sincronizar preferências de notificação:", err);
    });
    unsubscribesRef.current.push(unsubNotificationPrefs);

    // 2. Ouvinte para Missões Customizadas
    const unsubMissions = onSnapshot(collection(db, `families/${uid}/missions`), (snapshot) => {
      if (!snapshot.empty) {
        const loadedQuests: Quest[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          loadedQuests.push({
            id: docSnap.id,
            titulo: data.title || data.titulo || '',
            descricao: data.description || data.descricao || '',
            recompensa: data.stars || data.recompensa || 1,
            icone: data.emoji || data.icone || 'star',
            custom: data.custom ?? true
          });
        });
        setQuests(loadedQuests);
      } else {
        // Popula missões padrão se estiver vazio
        DEFAULT_QUESTS.forEach(q => {
          saveMissionToFirestore(uid, q).catch(console.error);
        });
      }
    }, (err) => {
      setSyncError("Erro ao sincronizar missões.");
      console.error(err);
    });
    unsubscribesRef.current.push(unsubMissions);

    // 3. Ouvinte para Alertas de Saúde
    const unsubAlerts = onSnapshot(collection(db, `families/${uid}/alerts`), (snapshot) => {
      const loadedAlerts: HealthAlert[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        loadedAlerts.push({
          id: docSnap.id,
          childId: data.profileId || data.childId || '',
          childNome: data.childNome || '',
          tipo: data.type || data.tipo || 'USO_EXTREMO',
          titulo: data.titulo || '',
          descricao: data.descricao || '',
          impacto: data.impacto || '',
          dicaPratica: data.dicaPratica || '',
          gravidade: data.gravidade || 'alerta'
        });
      });
      setAlertas(loadedAlerts);
    }, (err) => {
      console.error("Erro ao sincronizar alertas:", err);
    });
    unsubscribesRef.current.push(unsubAlerts);

    // 4. Ouvinte para Perfis de Crianças
    const unsubProfiles = onSnapshot(collection(db, `families/${uid}/profiles`), async (snapshot) => {
      if (snapshot.empty) {
        // Tenta migrar do localStorage ou popula perfis iniciais
        const hasLocal = localStorage.getItem('equilibrakids_profiles');
        if (hasLocal) {
          try {
            console.log("Migrando dados do localStorage para o Firestore...");
            const localProfiles = JSON.parse(hasLocal) as ChildProfile[];
            for (const p of localProfiles) {
              await saveProfileToFirestore(uid, p);
            }
            // Migrar também missões se existirem localmente
            const hasLocalQuests = localStorage.getItem('equilibrakids_quests');
            if (hasLocalQuests) {
              const localQuests = JSON.parse(hasLocalQuests) as Quest[];
              for (const q of localQuests) {
                await saveMissionToFirestore(uid, q);
              }
            }
            localStorage.clear();
            console.log("Migração de dados realizada com sucesso!");
          } catch (e) {
            console.error("Erro na migração de dados locais:", e);
          }
        } else {
          // Cria perfis de demonstração iniciais no Firestore
          INITIAL_PROFILES.forEach(p => {
            saveProfileToFirestore(uid, p).catch(console.error);
          });
        }
        setDataLoading(false);
        return;
      }

      try {
        const profilesList: ChildProfile[] = [];
        const todayStr = getTodayDateStr();

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const pId = docSnap.id;

          // Recupera sessões para montar histórico dos últimos 7 dias
          const sessionsSnap = await getDocs(collection(db, `families/${uid}/profiles/${pId}/sessions`));
          const sessionsMap: Record<string, any> = {};
          sessionsSnap.forEach(sDoc => {
            sessionsMap[sDoc.id] = sDoc.data();
          });

          const last7DaysStr: string[] = [];
          for (let i = 7; i >= 1; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            last7DaysStr.push(dateStr);
          }

          const historicoSeteDias = last7DaysStr.map(dateStr => {
            const session = sessionsMap[dateStr];
            return session ? Math.floor((session.secondsUsed || (session.minutesUsed * 60) || 0) / 60) : 0;
          });

          const todaySession = sessionsMap[todayStr];
          const tempoUsadoHoje = todaySession ? (todaySession.secondsUsed || (todaySession.minutesUsed * 60) || 0) : 0;

          profilesList.push({
            id: pId,
            nome: data.name || data.nome || '',
            idade: data.age || data.idade || 0,
            limiteDiario: data.dailyLimit || data.limiteDiario || 60,
            status: (data.status as ChildProfile['status']) || 'pausado',
            avatar: (data.avatar as ChildProfile['avatar']) || 'bear',
            pediuMaisTempo: data.pediuMaisTempo || false,
            estrelasAcumuladas: data.starsAccumulated || data.estrelasAcumuladas || 0,
            missoesCumpridas: data.missionsCompleted || data.missoesCumpridas || 0,
            limiteNoturno: data.limiteNoturno || '21:30',
            horarioInicioPermitido: data.horarioInicioPermitido || '08:00',
            horarioFimPermitido: data.horarioFimPermitido || '20:00',
            tempoUsadoHoje,
            historicoSeteDias,
            usoApos22hCount: data.usoApos22hCount || 0,
            excedeuDiasSeguidos: data.excedeuDiasSeguidos || 0,
          });
        }

        setPerfis(prev => {
          // Previne que o cronômetro local sofra "saltos temporais" para trás caso chegue atualização desatualizada do Firestore
          return profilesList.map(p => {
            const activeId = localStorage.getItem('equilibrakids_active_id');
            if (p.id === activeId && p.status === 'online') {
              const currentLocal = prev.find(x => x.id === p.id)?.tempoUsadoHoje || 0;
              return {
                ...p,
                tempoUsadoHoje: Math.max(currentLocal, p.tempoUsadoHoje)
              };
            }
            return p;
          });
        });
      } catch (err) {
        console.error("Erro ao sincronizar documentos de perfil:", err);
      } finally {
        setDataLoading(false);
      }
    }, (err) => {
      setSyncError("Erro ao sincronizar perfis.");
      setDataLoading(false);
      console.error(err);
    });
    unsubscribesRef.current.push(unsubProfiles);
  };

  // Carrega do LocalStorage se deslogado
  const loadFromLocalStorage = () => {
    setDataLoading(true);
    
    const lastDate = localStorage.getItem('equilibrakids_last_date');
    const todayStr = getTodayDateStr();
    const localProfiles = localStorage.getItem('equilibrakids_profiles');
    
    if (lastDate && lastDate !== todayStr) {
      let profiles: ChildProfile[] = INITIAL_PROFILES;
      if (localProfiles) {
        try {
          profiles = JSON.parse(localProfiles);
          profiles = profiles.map(p => {
            const hist = [...(p.historicoSeteDias || [0,0,0,0,0,0,0])];
            hist.shift();
            hist.push(Math.round(p.tempoUsadoHoje / 60));
            return {
              ...p,
              tempoUsadoHoje: 0,
              status: 'pausado' as const,
              historicoSeteDias: hist,
              pediuMaisTempo: false
            };
          });
          localStorage.setItem('equilibrakids_profiles', JSON.stringify(profiles));
        } catch (e) {
          // ignore
        }
      }
    }
    localStorage.setItem('equilibrakids_last_date', todayStr);

    const updatedLocalProfiles = localStorage.getItem('equilibrakids_profiles');
    if (updatedLocalProfiles) {
      try {
        setPerfis(JSON.parse(updatedLocalProfiles));
      } catch (e) {
        setPerfis(INITIAL_PROFILES);
      }
    } else {
      setPerfis(INITIAL_PROFILES);
    }

    const localQuests = localStorage.getItem('equilibrakids_quests');
    if (localQuests) {
      try {
        setQuests(JSON.parse(localQuests));
      } catch (e) {
        setQuests(DEFAULT_QUESTS);
      }
    } else {
      setQuests(DEFAULT_QUESTS);
    }

    const localActiveId = localStorage.getItem('equilibrakids_active_id');
    if (localActiveId) {
      setActiveProfileId(localActiveId);
    }

    const localTurbo = localStorage.getItem('equilibrakids_turbo');
    setTurboMode(localTurbo === 'true');

    const localEmailConfig = localStorage.getItem('equilibrakids_email_config');
    if (localEmailConfig) {
      try {
        setEmailConfig(JSON.parse(localEmailConfig));
      } catch (e) {
        // mantem padrao
      }
    }

    const localNotificationPrefs = localStorage.getItem('equilibrakids_notification_prefs');
    if (localNotificationPrefs) {
      try {
        setNotificationPreferences(JSON.parse(localNotificationPrefs));
      } catch (e) {
        // mantem padrao
      }
    }

    setDataLoading(false);
  };

  // Listener para estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        syncFamilyData(user.uid);
      } else {
        stopFirestoreSync();
        loadFromLocalStorage();
      }
    });

    return () => {
      unsubscribeAuth();
      stopFirestoreSync();
    };
  }, []);

  // Persistência local (LocalStorage como cache offline)
  useEffect(() => {
    if (!dataLoading && perfis && perfis.length > 0) {
      localStorage.setItem('equilibrakids_profiles', JSON.stringify(perfis));
    }
  }, [perfis, dataLoading]);

  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem('equilibrakids_active_id', activeProfileId);
    } else {
      localStorage.removeItem('equilibrakids_active_id');
    }
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('equilibrakids_turbo', String(turboMode));
  }, [turboMode]);

  useEffect(() => {
    if (!dataLoading) {
      localStorage.setItem('equilibrakids_email_config', JSON.stringify(emailConfig));
    }
  }, [emailConfig, dataLoading]);

  useEffect(() => {
    if (!dataLoading) {
      localStorage.setItem('equilibrakids_notification_prefs', JSON.stringify(notificationPreferences));
    }
  }, [notificationPreferences, dataLoading]);

  useEffect(() => {
    if (!dataLoading && quests && quests.length > 0) {
      localStorage.setItem('equilibrakids_quests', JSON.stringify(quests));
    }
  }, [quests, dataLoading]);

  // Efeito para salvar o tempo imediatamente quando o status de algum perfil muda de online para pausado/bloqueado
  const prevStatusesRef = useRef<Record<string, string>>({});
  useEffect(() => {
    if (auth.currentUser && perfis.length > 0) {
      const uid = auth.currentUser.uid;
      perfis.forEach(p => {
        const prevStatus = prevStatusesRef.current[p.id];
        if (prevStatus === 'online' && p.status !== 'online') {
          saveProfileTimeUsed(uid, p.id, p.tempoUsadoHoje, p.status).catch(console.error);
        }
        prevStatusesRef.current[p.id] = p.status;
      });
    }
  }, [perfis]);

  // Função para disparar notificação local nativa
  const sendLocalNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if (document.visibilityState === 'hidden') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico'
          });
        } catch (e) {
          console.error("Erro ao instanciar Notification:", e);
        }
      }
    }
  };

  // Dispara e persiste alertas de saúde (se logado)
  const triggerHealthAlertNotification = async (uid: string, alert: HealthAlert) => {
    if (notifiedAlertsRef.current.has(alert.id)) return;
    notifiedAlertsRef.current.add(alert.id);

    if (notificationPreferences.healthAlerts) {
      sendLocalNotification(alert.titulo, alert.descricao);

      const alertId = `${alert.id}-${Date.now()}`;
      try {
        await setDoc(doc(db, `families/${uid}/pendingNotifications/${alertId}`), {
          title: alert.titulo,
          body: alert.descricao,
          childId: alert.childId,
          type: alert.tipo,
          createdAt: serverTimestamp(),
          sent: false
        });
      } catch (e) {
        console.error("Erro ao salvar notificação pendente de saúde:", e);
      }
    }
  };

  // Dispara alertas de saúde (se deslogado/offline)
  const triggerLocalHealthAlert = (alert: HealthAlert) => {
    if (notifiedAlertsRef.current.has(alert.id)) return;
    notifiedAlertsRef.current.add(alert.id);

    if (notificationPreferences.healthAlerts) {
      sendLocalNotification(alert.titulo, alert.descricao);
    }
  };

  // Dispara notificações de avisos de tempo de tela
  const triggerChildWarningNotification = async (perfil: ChildProfile, type: 'warn15' | 'warn5' | 'warnEnd' | 'warnWindow') => {
    const childId = perfil.id;
    if (!triggeredWarningsRef.current[childId]) {
      triggeredWarningsRef.current[childId] = {};
    }

    if (triggeredWarningsRef.current[childId][type]) return;
    triggeredWarningsRef.current[childId][type] = true;

    let isEnabled = false;
    let title = '';
    let body = '';
    let msgType = '';

    if (type === 'warn15') {
      isEnabled = notificationPreferences.warnings15Min;
      title = `Tempo Restante: 15 Minutos para ${perfil.nome}`;
      body = `${perfil.nome} tem mais 15 minutos de uso de tela hoje.`;
      msgType = 'WARN_15';
    } else if (type === 'warn5') {
      isEnabled = notificationPreferences.warnings5Min;
      title = `Tempo Restante: 5 Minutos para ${perfil.nome}`;
      body = `${perfil.nome} tem mais 5 minutos de uso de tela hoje.`;
      msgType = 'WARN_5';
    } else if (type === 'warnEnd') {
      isEnabled = notificationPreferences.warningsEnd;
      title = `Tempo Esgotado: ${perfil.nome}`;
      body = `O limite diário de uso de tela para ${perfil.nome} foi atingido e o app foi bloqueado.`;
      msgType = 'WARN_END';
    } else if (type === 'warnWindow') {
      isEnabled = true; // Sempre avisar se tentou usar fora da janela
      title = `Uso Fora do Horário: ${perfil.nome}`;
      body = `${perfil.nome} tentou usar o dispositivo fora do horário permitido.`;
      msgType = 'WARN_WINDOW';
    }

    if (isEnabled) {
      sendLocalNotification(title, body);

      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const alertId = `${childId}-${type}-${Date.now()}`;
        try {
          await setDoc(doc(db, `families/${uid}/pendingNotifications/${alertId}`), {
            title,
            body,
            childId,
            type: msgType,
            createdAt: serverTimestamp(),
            sent: false
          });
        } catch (e) {
          console.error("Erro ao salvar notificação pendente de tempo:", e);
        }
      }
    }
  };

  // Efeito para monitorar tempo e disparar alertas infantis em tempo real
  useEffect(() => {
    if (!activeProfileId) return;
    const perfil = perfis.find(p => p.id === activeProfileId);
    if (!perfil) return;

    const limiteSegundos = perfil.limiteDiario * 60;
    const restanteSegundos = Math.max(0, limiteSegundos - perfil.tempoUsadoHoje);
    const restanteMinutos = restanteSegundos / 60;
    const childId = perfil.id;

    // Reset progressivo dos alertas se o tempo restante aumentar (ex: pais aprovaram mais tempo)
    if (restanteMinutos > 15) {
      if (triggeredWarningsRef.current[childId]) {
        triggeredWarningsRef.current[childId].warn15 = false;
        triggeredWarningsRef.current[childId].warn5 = false;
        triggeredWarningsRef.current[childId].warnEnd = false;
      }
    } else if (restanteMinutos > 5) {
      if (triggeredWarningsRef.current[childId]) {
        triggeredWarningsRef.current[childId].warn5 = false;
        triggeredWarningsRef.current[childId].warnEnd = false;
      }
    } else if (restanteSegundos > 0) {
      if (triggeredWarningsRef.current[childId]) {
        triggeredWarningsRef.current[childId].warnEnd = false;
      }
    }

    if (isInsideAllowedWindow(perfil)) {
      if (triggeredWarningsRef.current[childId]) {
        triggeredWarningsRef.current[childId].warnWindow = false;
      }
    }

    // Monitoramento ativo quando a tela está em uso (status === 'online')
    if (perfil.status === 'online') {
      if (!isInsideAllowedWindow(perfil)) {
        triggerChildWarningNotification(perfil, 'warnWindow');
      }

      if (restanteMinutos <= 15 && restanteMinutos > 5) {
        triggerChildWarningNotification(perfil, 'warn15');
      }

      if (restanteMinutos <= 5 && restanteMinutos > 0) {
        triggerChildWarningNotification(perfil, 'warn5');
      }

      if (restanteSegundos <= 0) {
        triggerChildWarningNotification(perfil, 'warnEnd');
      }
    }
  }, [perfis, activeProfileId]);

  // Gerador automático de Alertas de Saúde baseado no histórico (Apenas se deslogado, caso logado vem do Firestore)
  useEffect(() => {
    if (auth.currentUser) return; // Gerenciado via Firestore no ouvinte unsubAlerts

    const novosAlertas: HealthAlert[] = [];

    perfis.forEach((perfil) => {
      if (perfil.usoApos22hCount > 0) {
        const alert: HealthAlert = {
          id: `alert-noturno-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'USO_NOTURNO',
          titulo: 'Padrão Preocupante: Uso Noturno Detectado',
          descricao: `Telas ativas após as 22h por ${perfil.usoApos22hCount} vezes nas últimas semanas.`,
          impacto: 'A luz azul inibe a produção de melatonina, hormônio regulador do sono.',
          dicaPratica: 'Estipule o "sono das telas": desligar 1 hora antes de dormir.',
          gravidade: perfil.usoApos22hCount >= 3 ? 'preocupante' : 'alerta'
        };
        novosAlertas.push(alert);
        triggerLocalHealthAlert(alert);
      }

      if (perfil.excedeuDiasSeguidos >= 3) {
        const alert: HealthAlert = {
          id: `alert-seguidos-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'DIAS_SEGUIDOS',
          titulo: 'Alerta de Consistência: Sequência Acima do Limite',
          descricao: `${perfil.nome} usou o dispositivo acima do limite por ${perfil.excedeuDiasSeguidos} dias consecutivos.`,
          impacto: 'A falta de aderência rotineira aos limites acordados enfraquece o autocontrole.',
          dicaPratica: 'Crie um quadro físico na geladeira onde ela mesma cola um adesivo verde.',
          gravidade: perfil.excedeuDiasSeguidos >= 5 ? 'critico' : 'preocupante'
        };
        novosAlertas.push(alert);
        triggerLocalHealthAlert(alert);
      }

      const maxDiaHistorico = Math.max(...perfil.historicoSeteDias);
      if (maxDiaHistorico >= 360) {
        const alert: HealthAlert = {
          id: `alert-extremo-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'USO_EXTREMO',
          titulo: 'Alerta Crítico: Pico de Uso Extremamente Elevado',
          descricao: `Uso diário de telas atingiu ${Math.round(maxDiaHistorico / 60)} horas em um dia desta semana.`,
          impacto: 'Mais de 6 horas de tela induzem comportamento sedentário extremo e fadiga visual.',
          dicaPratica: 'Adote a regra de ouro "20-20-20": olhar para longe a cada 20 minutos.',
          gravidade: 'critico'
        };
        novosAlertas.push(alert);
        triggerLocalHealthAlert(alert);
      }

      if (perfil.missoesCumpridas >= 3 || perfil.estrelasAcumuladas >= 8) {
        const alert: HealthAlert = {
          id: `alert-evolucao-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'EVOLUCAO_POSITIVA',
          titulo: 'Parabéns: Evolução Altamente Saudável! 🚀',
          descricao: `${perfil.nome} completou ${perfil.missoesCumpridas} missões reais e acumulou ★ ${perfil.estrelasAcumuladas} estrelas!`,
          impacto: 'A alternância programada entre telas e atividades motoras estimula conexões neurais.',
          dicaPratica: 'Recompense a rotina exemplar com um passeio especial no parque.',
          gravidade: 'evolucao'
        };
        novosAlertas.push(alert);
        triggerLocalHealthAlert(alert);
      }
    });

    setAlertas(novosAlertas);
  }, [perfis, auth.currentUser]);

  // Alertas automáticos também são gravados no Firestore para fins de persistência na nuvem
  useEffect(() => {
    if (!auth.currentUser || perfis.length === 0) return;
    const uid = auth.currentUser.uid;

    perfis.forEach((perfil) => {
      if (perfil.usoApos22hCount > 0) {
        const alert: HealthAlert = {
          id: `alert-noturno-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'USO_NOTURNO',
          titulo: 'Padrão Preocupante: Uso Noturno Detectado',
          descricao: `Telas ativas após as 22h por ${perfil.usoApos22hCount} vezes nas últimas semanas.`,
          impacto: 'A luz azul inibe a produção de melatonina, hormônio regulador do sono.',
          dicaPratica: 'Estipule o "sono das telas": desligar 1 hora antes de dormir.',
          gravidade: perfil.usoApos22hCount >= 3 ? 'preocupante' : 'alerta'
        };
        saveAlertToFirestore(uid, alert).catch(console.error);
        triggerHealthAlertNotification(uid, alert);
      }

      if (perfil.excedeuDiasSeguidos >= 3) {
        const alert: HealthAlert = {
          id: `alert-seguidos-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'DIAS_SEGUIDOS',
          titulo: 'Alerta de Consistência: Sequência Acima do Limite',
          descricao: `${perfil.nome} usou o dispositivo acima do limite por ${perfil.excedeuDiasSeguidos} dias consecutivos.`,
          impacto: 'A falta de aderência rotineira aos limites acordados enfraquece o autocontrole.',
          dicaPratica: 'Crie um quadro físico na geladeira onde ela mesma cola um adesivo verde.',
          gravidade: perfil.excedeuDiasSeguidos >= 5 ? 'critico' : 'preocupante'
        };
        saveAlertToFirestore(uid, alert).catch(console.error);
        triggerHealthAlertNotification(uid, alert);
      }

      const maxDiaHistorico = Math.max(...perfil.historicoSeteDias);
      if (maxDiaHistorico >= 360) {
        const alert: HealthAlert = {
          id: `alert-extremo-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'USO_EXTREMO',
          titulo: 'Alerta Crítico: Pico de Uso Extremamente Elevado',
          descricao: `Uso diário de telas atingiu ${Math.round(maxDiaHistorico / 60)} horas em um dia desta semana.`,
          impacto: 'Mais de 6 horas de tela induzem comportamento sedentário extremo e fadiga visual.',
          dicaPratica: 'Adote a regra de ouro "20-20-20": olhar para longe a cada 20 minutos.',
          gravidade: 'critico'
        };
        saveAlertToFirestore(uid, alert).catch(console.error);
        triggerHealthAlertNotification(uid, alert);
      }

      if (perfil.missoesCumpridas >= 3 || perfil.estrelasAcumuladas >= 8) {
        const alert: HealthAlert = {
          id: `alert-evolucao-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'EVOLUCAO_POSITIVA',
          titulo: 'Parabéns: Evolução Altamente Saudável! 🚀',
          descricao: `${perfil.nome} completou ${perfil.missoesCumpridas} missões reais e acumulou ★ ${perfil.estrelasAcumuladas} estrelas!`,
          impacto: 'A alternância programada entre telas e atividades motoras estimula conexões neurais.',
          dicaPratica: 'Recompense a rotina exemplar com um passeio especial no parque.',
          gravidade: 'evolucao'
        };
        saveAlertToFirestore(uid, alert).catch(console.error);
        triggerHealthAlertNotification(uid, alert);
      }
    });
  }, [perfis, auth.currentUser]);

  // Função assíncrona para gravar o tempo acumulado de forma controlada (Throttled/Debounced)
  const saveProfileTimeUsed = async (uid: string, profileId: string, secondsUsed: number, status: string) => {
    try {
      const todayStr = getTodayDateStr();
      await updateDoc(doc(db, `families/${uid}/profiles/${profileId}`), {
        tempoUsadoHoje: secondsUsed,
        status: status
      });
      await setDoc(doc(db, `families/${uid}/profiles/${profileId}/sessions/${todayStr}`), {
        secondsUsed: secondsUsed,
        minutesUsed: Math.floor(secondsUsed / 60)
      }, { merge: true });
    } catch (e) {
      console.error("Erro de persistência do cronômetro:", e);
    }
  };

  // Cronômetro em Tempo Real com Ticks de 1 Segundo
  useEffect(() => {
    if (activeProfileId) {
      const activeProfile = perfis.find(p => p.id === activeProfileId);
      
      if (activeProfile && activeProfile.status === 'online') {
        const tickInterval = 1000;
        
        timerRef.current = setInterval(() => {
          setPerfis(prevPerfis => {
            return prevPerfis.map(p => {
              if (p.id === activeProfileId && p.status === 'online') {
                const incremento = turboMode ? 60 : 1;
                const novoTempo = p.tempoUsadoHoje + incremento;
                const limiteSegundos = p.limiteDiario * 60;
                
                let novoStatus: ChildProfile['status'] = p.status;
                if (novoTempo >= limiteSegundos) {
                  novoStatus = 'bloqueado';
                }

                // Sincroniza periodicamente com Firestore se logado (Throttling a cada 10 segundos)
                if (auth.currentUser) {
                  const uid = auth.currentUser.uid;
                  timerSyncCountRef.current += 1;
                  if (timerSyncCountRef.current >= 10 || novoStatus === 'bloqueado') {
                    timerSyncCountRef.current = 0;
                    saveProfileTimeUsed(uid, p.id, novoTempo, novoStatus);
                  }
                }

                return {
                  ...p,
                  tempoUsadoHoje: Math.min(limiteSegundos, novoTempo),
                  status: novoStatus
                };
              }
              return p;
            });
          });
        }, tickInterval);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeProfileId, perfis, turboMode]);

  // Ações Remotas
  const selecionarPerfil = (id: string) => {
    setActiveProfileId(id);
    const updatedPerfis = perfis.map(p => {
      if (p.id === id) {
        const limiteSegundos = p.limiteDiario * 60;
        const novoStatus = p.tempoUsadoHoje >= limiteSegundos ? 'bloqueado' as const : 'online' as const;
        return { ...p, status: novoStatus } as ChildProfile;
      }
      return (p.status === 'online' ? { ...p, status: 'pausado' as const } : p) as ChildProfile;
    });

    setPerfis(updatedPerfis);

    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updatedPerfis.forEach(p => {
        updateDoc(doc(db, `families/${uid}/profiles/${p.id}`), {
          status: p.status
        }).catch(console.error);
      });
    }
  };

  const pausarTempoRemoto = (id: string) => {
    setPerfis(prev => prev.map(p => (p.id === id ? { ...p, status: 'pausado' as const } : p) as ChildProfile));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), { status: 'pausado' }).catch(console.error);
    }
  };

  const iniciarTempoRemoto = (id: string) => {
    let targetStatus: ChildProfile['status'] = 'pausado';
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        const limiteSegundos = p.limiteDiario * 60;
        targetStatus = p.tempoUsadoHoje >= limiteSegundos ? 'bloqueado' as const : 'online' as const;
        return { ...p, status: targetStatus } as ChildProfile;
      }
      return p as ChildProfile;
    }));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), { status: targetStatus }).catch(console.error);
    }
  };

  const bloquearRemoto = (id: string) => {
    setPerfis(prev => prev.map(p => (p.id === id ? { ...p, status: 'bloqueado' as const } : p) as ChildProfile));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), { status: 'bloqueado' }).catch(console.error);
    }
  };

  const adicionarTempoRemoto = (id: string, minutos: number) => {
    let targetLimite = 0;
    let targetStatus: ChildProfile['status'] = 'pausado';
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        const novoLimite = p.limiteDiario + minutos;
        const novoStatus = p.status === 'bloqueado' ? 'online' as const : p.status;
        targetLimite = novoLimite;
        targetStatus = novoStatus;
        return {
          ...p,
          limiteDiario: novoLimite,
          status: novoStatus,
          pediuMaisTempo: false
        } as ChildProfile;
      }
      return p as ChildProfile;
    }));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), {
        dailyLimit: targetLimite,
        limiteDiario: targetLimite,
        status: targetStatus,
        pediuMaisTempo: false
      }).catch(console.error);
    }
  };

  const pedirMaisTempo = (id: string) => {
    setPerfis(prev => prev.map(p => (p.id === id ? { ...p, pediuMaisTempo: true } : p) as ChildProfile));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), { pediuMaisTempo: true }).catch(console.error);
    }
  };

  const aprovarMaisTempo = (id: string) => {
    adicionarTempoRemoto(id, 15);
  };

  const redefinirLimite = (
    id: string,
    novoLimite: number,
    limiteNoturno: string,
    inicioPermitido: string,
    fimPermitido: string
  ) => {
    let targetStatus: ChildProfile['status'] = 'pausado';
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        const limiteSegundos = novoLimite * 60;
        const novoStatus = p.tempoUsadoHoje >= limiteSegundos ? 'bloqueado' as const : (p.status === 'bloqueado' ? 'online' as const : p.status);
        targetStatus = novoStatus;
        return {
          ...p,
          limiteDiario: novoLimite,
          limiteNoturno: limiteNoturno,
          horarioInicioPermitido: inicioPermitido,
          horarioFimPermitido: fimPermitido,
          status: novoStatus
        } as ChildProfile;
      }
      return p as ChildProfile;
    }));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), {
        dailyLimit: novoLimite,
        limiteDiario: novoLimite,
        limiteNoturno: limiteNoturno,
        horarioInicioPermitido: inicioPermitido,
        horarioFimPermitido: fimPermitido,
        status: targetStatus
      }).catch(console.error);
    }
  };

  const concluirAtividadeOffline = (id: string, estrelas: number) => {
    let targetEstrelas = 0;
    let targetMissoes = 0;
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        targetEstrelas = p.estrelasAcumuladas + estrelas;
        targetMissoes = p.missoesCumpridas + 1;
        return {
          ...p,
          estrelasAcumuladas: targetEstrelas,
          missoesCumpridas: targetMissoes
        } as ChildProfile;
      }
      return p as ChildProfile;
    }));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      updateDoc(doc(db, `families/${uid}/profiles/${id}`), {
        starsAccumulated: targetEstrelas,
        estrelasAcumuladas: targetEstrelas,
        missionsCompleted: targetMissoes,
        missoesCumpridas: targetMissoes
      }).catch(console.error);

      const todayStr = getTodayDateStr();
      setDoc(doc(db, `families/${uid}/profiles/${id}/sessions/${todayStr}`), {
        starsEarned: targetEstrelas
      }, { merge: true }).catch(console.error);
    }
  };

  const adicionarNovoPerfil = (
    nome: string,
    idade: number,
    limiteDiario: number,
    avatar: 'lion' | 'owl' | 'cat' | 'bear',
    limiteNoturno: string,
    inicioPermitido: string,
    fimPermitido: string
  ) => {
    const newId = `child-${Date.now()}`;
    const novo: ChildProfile = {
      id: newId,
      nome,
      idade,
      limiteDiario,
      tempoUsadoHoje: 0,
      status: 'pausado',
      avatar,
      pediuMaisTempo: false,
      estrelasAcumuladas: 0,
      missoesCumpridas: 0,
      historicoSeteDias: [30, 45, 40, 50, 45, 55, 30],
      usoApos22hCount: 0,
      excedeuDiasSeguidos: 0,
      limiteNoturno,
      horarioInicioPermitido: inicioPermitido,
      horarioFimPermitido: fimPermitido
    };
    setPerfis(prev => [...prev, novo]);
    if (auth.currentUser) {
      saveProfileToFirestore(auth.currentUser.uid, novo).catch(console.error);
    }
  };

  const atualizarEmailConfig = (config: EmailConfig) => {
    setEmailConfig(config);
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      setDoc(doc(db, `families/${uid}/settings/preferences`), config).catch(console.error);
    }
  };

  const atualizarNotificationPreferences = (prefs: NotificationPreferences) => {
    setNotificationPreferences(prefs);
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      setDoc(doc(db, `families/${uid}/settings/notificationPreferences`), prefs).catch(console.error);
    }
  };

  const adicionarQuestCustomizada = (
    titulo: string,
    descricao: string,
    recompensa: number,
    icone: 'smile' | 'palette' | 'droplet' | 'compass' | 'book' | 'star' | 'run' | 'clean'
  ) => {
    const newId = `quest-${Date.now()}`;
    const nova: Quest = {
      id: newId,
      titulo,
      descricao,
      recompensa,
      icone,
      custom: true
    };
    setQuests(prev => [...prev, nova]);
    if (auth.currentUser) {
      saveMissionToFirestore(auth.currentUser.uid, nova).catch(console.error);
    }
  };

  const deletarQuestCustomizada = (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      deleteDoc(doc(db, `families/${uid}/missions/${id}`)).catch(console.error);
    }
  };

  const resetarSimulador = async () => {
    setPerfis(INITIAL_PROFILES);
    setActiveProfileId(null);
    setTurboMode(false);
    setEmailConfig({
      email: 'pais@equilibrakids.com.br',
      ativo: true,
      incluirAlertas: true,
      incluirRanking: true
    });
    setNotificationPreferences({
      warnings15Min: true,
      warnings5Min: true,
      warningsEnd: true,
      healthAlerts: true
    });
    setQuests(DEFAULT_QUESTS);
    
    localStorage.removeItem('equilibrakids_profiles');
    localStorage.removeItem('equilibrakids_active_id');
    localStorage.removeItem('equilibrakids_turbo');
    localStorage.removeItem('equilibrakids_email_config');
    localStorage.removeItem('equilibrakids_notification_prefs');
    localStorage.removeItem('equilibrakids_quests');

    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      try {
        await setDoc(doc(db, `families/${uid}/settings/preferences`), {
          email: auth.currentUser.email || 'pais@equilibrakids.com.br',
          ativo: true,
          incluirAlertas: true,
          incluirRanking: true
        });

        await setDoc(doc(db, `families/${uid}/settings/notificationPreferences`), {
          warnings15Min: true,
          warnings5Min: true,
          warningsEnd: true,
          healthAlerts: true
        });

        const questsSnap = await getDocs(collection(db, `families/${uid}/missions`));
        for (const docSnap of questsSnap.docs) {
          await deleteDoc(doc(db, `families/${uid}/missions/${docSnap.id}`));
        }
        DEFAULT_QUESTS.forEach(q => {
          saveMissionToFirestore(uid, q).catch(console.error);
        });

        const profilesSnap = await getDocs(collection(db, `families/${uid}/profiles`));
        for (const docSnap of profilesSnap.docs) {
          await deleteDoc(doc(db, `families/${uid}/profiles/${docSnap.id}`));
        }
        INITIAL_PROFILES.forEach(p => {
          saveProfileToFirestore(uid, p).catch(console.error);
        });
      } catch (err) {
        console.error("Erro ao resetar simulador no Firestore:", err);
      }
    }
  };

  return (
    <ScreenTimeContext.Provider value={{
      perfis,
      activeProfileId,
      turboMode,
      alertas,
      emailConfig,
      notificationPreferences,
      quests,
      dataLoading,
      syncError,
      setActiveProfileId,
      setTurboMode,
      selecionarPerfil,
      pausarTempoRemoto,
      iniciarTempoRemoto,
      bloquearRemoto,
      adicionarTempoRemoto,
      pedirMaisTempo,
      aprovarMaisTempo,
      redefinirLimite,
      concluirAtividadeOffline,
      adicionarNovoPerfil,
      atualizarEmailConfig,
      atualizarNotificationPreferences,
      adicionarQuestCustomizada,
      deletarQuestCustomizada,
      resetarSimulador
    }}>
      {children}
    </ScreenTimeContext.Provider>
  );
};

export const useScreenTime = () => {
  const context = useContext(ScreenTimeContext);
  if (!context) {
    throw new Error('useScreenTime deve ser usado dentro de um ScreenTimeProvider');
  }
  return context;
};

export const isInsideAllowedWindow = (profile: ChildProfile | undefined): boolean => {
  if (!profile) return true;
  
  const agora = new Date();
  const horaMinutosAgora = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
  
  const inicio = profile.horarioInicioPermitido;
  const fim = profile.horarioFimPermitido;
  
  if (!inicio || !fim) return true;
  
  if (inicio <= fim) {
    return horaMinutosAgora >= inicio && horaMinutosAgora <= fim;
  } else {
    return horaMinutosAgora >= inicio || horaMinutosAgora <= fim;
  }
};
