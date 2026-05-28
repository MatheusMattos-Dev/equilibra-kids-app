import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  historicoSeteDias: number[]; // em minutos, últimos 7 dias (excluindo hoje)
  usoApos22hCount: number; // ocorrências detectadas no histórico
  excedeuDiasSeguidos: number; // sequência recente de dias excedendo
  limiteNoturno: string; // Ex: "21:30" ou "22:00"
}

// Tipos para Alertas de Saúde
export interface HealthAlert {
  id: string;
  childId: string;
  childNome: string;
  tipo: 'USO_NOTURNO' | 'DIAS_SEGUIDOS' | 'USO_EXTREMO';
  titulo: string;
  descricao: string;
  impacto: string;
  dicaPratica: string;
  gravidade: 'alerta' | 'preocupante' | 'critico';
}

// Interface do Contexto
interface ScreenTimeContextProps {
  perfis: ChildProfile[];
  activeProfileId: string | null;
  turboMode: boolean;
  alertas: HealthAlert[];
  setActiveProfileId: (id: string | null) => void;
  setTurboMode: (enabled: boolean) => void;
  selecionarPerfil: (id: string) => void;
  pausarTempoRemoto: (id: string) => void;
  iniciarTempoRemoto: (id: string) => void;
  bloquearRemoto: (id: string) => void;
  adicionarTempoRemoto: (id: string, minutos: number) => void;
  pedirMaisTempo: (id: string) => void;
  aprovarMaisTempo: (id: string) => void;
  redefinirLimite: (id: string, novoLimite: number, limiteNoturno: string) => void;
  concluirAtividadeOffline: (id: string, estrelas: number) => void;
  adicionarNovoPerfil: (nome: string, idade: number, limiteDiario: number, avatar: 'lion' | 'owl' | 'cat' | 'bear', limiteNoturno: string) => void;
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
    historicoSeteDias: [50, 48, 55, 46, 52, 49, 50], // Excedeu o limite de 45 nos últimos 7 dias consecutivos!
    usoApos22hCount: 0,
    excedeuDiasSeguidos: 7,
    limiteNoturno: '21:00'
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
    historicoSeteDias: [100, 110, 85, 380, 95, 115, 105], // Teve um dia de uso extremo (380m = 6.3h)
    usoApos22hCount: 4, // Usou telas após às 22h por 4 vezes
    excedeuDiasSeguidos: 0,
    limiteNoturno: '22:00'
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
    historicoSeteDias: [45, 55, 58, 40, 50, 60, 55],
    usoApos22hCount: 1,
    excedeuDiasSeguidos: 1,
    limiteNoturno: '21:30'
  }
];

const ScreenTimeContext = createContext<ScreenTimeContextProps | undefined>(undefined);

export const ScreenTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perfis, setPerfis] = useState<ChildProfile[]>(() => {
    const localData = localStorage.getItem('equilibrakids_profiles');
    return localData ? JSON.parse(localData) : INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    return localStorage.getItem('equilibrakids_active_id') || null;
  });

  const [turboMode, setTurboMode] = useState<boolean>(() => {
    return localStorage.getItem('equilibrakids_turbo') === 'true';
  });

  const [alertas, setAlertas] = useState<HealthAlert[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persistência
  useEffect(() => {
    localStorage.setItem('equilibrakids_profiles', JSON.stringify(perfis));
  }, [perfis]);

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

  // Gerador automático de Alertas de Saúde baseado no histórico dos perfis
  useEffect(() => {
    const novosAlertas: HealthAlert[] = [];

    perfis.forEach((perfil) => {
      // 1. Alerta de Uso Noturno
      if (perfil.usoApos22hCount > 0) {
        novosAlertas.push({
          id: `alert-noturno-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'USO_NOTURNO',
          titulo: 'Padrão Preocupante: Uso Noturno Detectado',
          descricao: `Telas ativas após as 22h por ${perfil.usoApos22hCount} vezes nas últimas semanas.`,
          impacto: 'A luz azul inibe a produção de melatonina, hormônio regulador do sono. Isso atrasa a entrada nas fases de sono REM e profundo, cruciais para a consolidação de memória, regulação do humor e foco escolar no dia seguinte.',
          dicaPratica: 'Estipule o "sono das telas": todos os aparelhos digitais devem ser desligados 1 hora antes de dormir e guardados fora do quarto da criança.',
          gravidade: perfil.usoApos22hCount >= 3 ? 'preocupante' : 'alerta'
        });
      }

      // 2. Alerta de Limite Excedido por Dias Seguidos
      if (perfil.excedeuDiasSeguidos >= 3) {
        novosAlertas.push({
          id: `alert-seguidos-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'DIAS_SEGUIDOS',
          titulo: 'Alerta de Consistência: Sequência Acima do Limite',
          descricao: `${perfil.nome} usou o dispositivo acima do limite de ${perfil.limiteDiario}m por ${perfil.excedeuDiasSeguidos} dias consecutivos.`,
          impacto: 'A falta de aderência rotineira aos limites acordados enfraquece o autocontrole da criança. Além disso, a exposição prolongada diária gera hiperestimulação cortical, diminuindo a paciência em atividades offline.',
          dicaPratica: 'Evite discussões na hora de desligar. Crie um quadro físico na geladeira onde ela mesma cola um adesivo verde quando cumpre o combinado. Celebrem pequenas conquistas juntos!',
          gravidade: perfil.excedeuDiasSeguidos >= 5 ? 'critico' : 'preocupante'
        });
      }

      // 3. Alerta de Uso Extremo em um Único Dia (>6 horas)
      const maxDiaHistorico = Math.max(...perfil.historicoSeteDias);
      if (maxDiaHistorico >= 360) {
        novosAlertas.push({
          id: `alert-extremo-${perfil.id}`,
          childId: perfil.id,
          childNome: perfil.nome,
          tipo: 'USO_EXTREMO',
          titulo: 'Alerta Crítico: Pico de Uso Extremamente Elevado',
          descricao: `Uso diário de telas atingiu ${Math.round(maxDiaHistorico / 60)} horas em um dia desta semana.`,
          impacto: 'Mais de 6 horas de tela induzem comportamento sedentário extremo, fadiga visual severa (síndrome do olho seco), má postura e reduzem o engajamento físico indispensável para o desenvolvimento saudável.',
          dicaPratica: 'Insira pausas programadas. Adote a regra de ouro "20-20-20": a cada 20 minutos de uso, olhar para um objeto a 20 pés (6 metros) de distância por 20 segundos para relaxar os olhos.',
          gravidade: 'critico'
        });
      }
    });

    setAlertas(novosAlertas);
  }, [perfis]);

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
                const incremento = turboMode ? 60 : 1; // Modo turbo soma 1 minuto por segundo
                const novoTempo = p.tempoUsadoHoje + incremento;
                const limiteSegundos = p.limiteDiario * 60;
                
                if (novoTempo >= limiteSegundos) {
                  return {
                    ...p,
                    tempoUsadoHoje: limiteSegundos,
                    status: 'bloqueado'
                  };
                }
                return {
                  ...p,
                  tempoUsadoHoje: novoTempo
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
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        // Ao selecionar para brincar, se estava bloqueado ou pausado, coloca como online se sobrou tempo
        const limiteSegundos = p.limiteDiario * 60;
        if (p.tempoUsadoHoje >= limiteSegundos) {
          return { ...p, status: 'bloqueado' };
        }
        return { ...p, status: 'online' };
      }
      // Outros perfis ficam suspensos/pausados
      return p.status === 'online' ? { ...p, status: 'pausado' } : p;
    }));
  };

  const pausarTempoRemoto = (id: string) => {
    setPerfis(prev => prev.map(p => p.id === id ? { ...p, status: 'pausado' } : p));
  };

  const iniciarTempoRemoto = (id: string) => {
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        const limiteSegundos = p.limiteDiario * 60;
        if (p.tempoUsadoHoje >= limiteSegundos) {
          return { ...p, status: 'bloqueado' };
        }
        return { ...p, status: 'online' };
      }
      return p;
    }));
  };

  const bloquearRemoto = (id: string) => {
    setPerfis(prev => prev.map(p => p.id === id ? { ...p, status: 'bloqueado' } : p));
  };

  const adicionarTempoRemoto = (id: string, minutos: number) => {
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        const novoLimite = p.limiteDiario + minutos;
        
        // Se estava bloqueado, passa a ficar online de novo pois ganhou mais tempo
        const novoStatus = p.status === 'bloqueado' ? 'online' : p.status;

        return {
          ...p,
          limiteDiario: novoLimite,
          status: novoStatus,
          pediuMaisTempo: false
        };
      }
      return p;
    }));
  };

  const pedirMaisTempo = (id: string) => {
    setPerfis(prev => prev.map(p => p.id === id ? { ...p, pediuMaisTempo: true } : p));
  };

  const aprovarMaisTempo = (id: string) => {
    // Concede +15 minutos por padrão ao aprovar pedido remoto
    adicionarTempoRemoto(id, 15);
  };

  const redefinirLimite = (id: string, novoLimite: number, limiteNoturno: string) => {
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        const limiteSegundos = novoLimite * 60;
        const novoStatus = p.tempoUsadoHoje >= limiteSegundos ? 'bloqueado' : (p.status === 'bloqueado' ? 'online' : p.status);
        return {
          ...p,
          limiteDiario: novoLimite,
          limiteNoturno: limiteNoturno,
          status: novoStatus
        };
      }
      return p;
    }));
  };

  const concluirAtividadeOffline = (id: string, estrelas: number) => {
    setPerfis(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estrelasAcumuladas: p.estrelasAcumuladas + estrelas
        };
      }
      return p;
    }));
  };

  const adicionarNovoPerfil = (
    nome: string,
    idade: number,
    limiteDiario: number,
    avatar: 'lion' | 'owl' | 'cat' | 'bear',
    limiteNoturno: string
  ) => {
    const novo: ChildProfile = {
      id: `child-${Date.now()}`,
      nome,
      idade,
      limiteDiario,
      tempoUsadoHoje: 0,
      status: 'pausado',
      avatar,
      pediuMaisTempo: false,
      estrelasAcumuladas: 0,
      historicoSeteDias: [30, 45, 40, 50, 45, 55, 30],
      usoApos22hCount: 0,
      excedeuDiasSeguidos: 0,
      limiteNoturno
    };
    setPerfis(prev => [...prev, novo]);
  };

  const resetarSimulador = () => {
    setPerfis(INITIAL_PROFILES);
    setActiveProfileId(null);
    setTurboMode(false);
    localStorage.removeItem('equilibrakids_profiles');
    localStorage.removeItem('equilibrakids_active_id');
    localStorage.removeItem('equilibrakids_turbo');
  };

  return (
    <ScreenTimeContext.Provider value={{
      perfis,
      activeProfileId,
      turboMode,
      alertas,
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
