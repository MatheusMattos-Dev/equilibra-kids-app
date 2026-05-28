import React from 'react';
import type { HealthAlert } from '../hooks/useScreenTime';
import { AlertTriangle, Moon, Calendar, Eye, HeartPulse, Sparkles, BookOpen, TrendingUp } from 'lucide-react';

interface HealthAlertCardProps {
  alerta: HealthAlert;
  onResolve?: () => void;
}

export const HealthAlertCard: React.FC<HealthAlertCardProps> = ({ alerta, onResolve }) => {
  // Configuração visual de acordo com a gravidade
  const severityConfig = {
    alerta: {
      bg: 'bg-pastel-yellow-50/70 border-pastel-yellow-200',
      iconBg: 'bg-pastel-yellow-100 text-pastel-yellow-600',
      tagBg: 'bg-pastel-yellow-100 text-pastel-yellow-700',
      borderLeft: 'border-l-4 border-l-pastel-yellow-500',
      label: 'Aviso de Atenção'
    },
    preocupante: {
      bg: 'bg-pastel-pink-50/50 border-pastel-purple-200',
      iconBg: 'bg-pastel-purple-100 text-pastel-purple-500',
      tagBg: 'bg-pastel-purple-100 text-pastel-purple-700',
      borderLeft: 'border-l-4 border-l-pastel-purple-500',
      label: 'Comportamento Preocupante'
    },
    critico: {
      bg: 'bg-pastel-pink-50/70 border-pastel-pink-200',
      iconBg: 'bg-pastel-pink-100 text-pastel-pink-500',
      tagBg: 'bg-pastel-pink-100 text-pastel-pink-600',
      borderLeft: 'border-l-4 border-l-pastel-pink-500',
      label: 'Alerta Crítico'
    },
    evolucao: {
      bg: 'bg-pastel-green-50/70 border-pastel-green-200',
      iconBg: 'bg-pastel-green-100 text-pastel-green-600',
      tagBg: 'bg-pastel-green-100 text-pastel-green-700',
      borderLeft: 'border-l-4 border-l-pastel-green-500',
      label: 'Evolução Saudável'
    }
  };

  const config = severityConfig[alerta.gravidade] || severityConfig.alerta;

  // Selecionar ícone com base no tipo de alerta
  const getIcon = () => {
    switch (alerta.tipo) {
      case 'USO_NOTURNO':
        return <Moon size={20} />;
      case 'DIAS_SEGUIDOS':
        return <Calendar size={20} />;
      case 'USO_EXTREMO':
        return <Eye size={20} />;
      case 'EVOLUCAO_POSITIVA':
        return <TrendingUp size={20} className="animate-pulse text-pastel-green-600" />;
      default:
        return <AlertTriangle size={20} />;
    }
  };

  return (
    <div className={`p-5 rounded-2xl border ${config.bg} ${config.borderLeft} shadow-sm glass-panel transition-all hover:shadow-md font-parents animate-pop`}>
      {/* Header do Alerta */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${config.iconBg} shrink-0`}>
            {getIcon()}
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${config.tagBg}`}>
              {config.label}
            </span>
            <h4 className="text-base font-bold text-slate-800 mt-1">{alerta.titulo}</h4>
          </div>
        </div>
        <div className="bg-slate-100 text-slate-600 font-extrabold text-xs px-3 py-1 rounded-full border border-slate-200">
          Perfil: {alerta.childNome}
        </div>
      </div>

      {/* Descrição Básica */}
      <p className="text-slate-700 text-sm font-semibold mb-4 bg-white/40 p-2.5 rounded-xl border border-white/60">
        {alerta.descricao}
      </p>

      {/* Grid de Impacto vs Dica Prática */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impacto Clínico / Benefício do Desenvolvimento */}
        <div className="bg-white/60 p-3.5 rounded-xl border border-white/80">
          <div className={`flex items-center gap-1.5 font-bold text-xs mb-2 ${alerta.tipo === 'EVOLUCAO_POSITIVA' ? 'text-pastel-blue-600' : 'text-pastel-pink-500'}`}>
            {alerta.tipo === 'EVOLUCAO_POSITIVA' ? <Sparkles size={14} /> : <HeartPulse size={14} />}
            <span>{alerta.tipo === 'EVOLUCAO_POSITIVA' ? 'Benefício para o Desenvolvimento' : 'Por que isso prejudica a saúde?'}</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            {alerta.impacto}
          </p>
        </div>

        {/* Dica de Intervenção / Como Incentivar */}
        <div className={alerta.tipo === 'EVOLUCAO_POSITIVA' ? 'bg-pastel-purple-50/50 p-3.5 rounded-xl border border-pastel-purple-100' : 'bg-pastel-green-50/50 p-3.5 rounded-xl border border-pastel-green-100'}>
          <div className={`flex items-center gap-1.5 font-bold text-xs mb-2 ${alerta.tipo === 'EVOLUCAO_POSITIVA' ? 'text-pastel-purple-600' : 'text-pastel-green-600'}`}>
            <Sparkles size={14} className="animate-wiggle" />
            <span>{alerta.tipo === 'EVOLUCAO_POSITIVA' ? 'Como celebrar e incentivar?' : 'Dica Prática para os Pais'}</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            {alerta.dicaPratica}
          </p>
        </div>
      </div>

      {/* Ação de Resolução */}
      {onResolve && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onResolve}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-pastel-green-50 text-pastel-green-600 hover:text-pastel-green-700 font-bold text-xs rounded-xl border border-pastel-green-200 transition-colors shadow-sm active:scale-95"
          >
            <BookOpen size={12} />
            {alerta.tipo === 'EVOLUCAO_POSITIVA' ? 'Excelente, vou continuar incentivando!' : 'Entendi, vou aplicar a dica!'}
          </button>
        </div>
      )}
    </div>
  );
};
