import React, { useState } from 'react';
import { Palette, Compass, Droplet, Sparkles, Smile, CheckCircle, Flame, BookOpen, Star, Activity } from 'lucide-react';
import { useScreenTime } from '../hooks/useScreenTime';

interface OfflineActivitiesProps {
  onCompleteActivity: (estrelas: number) => void;
  isCompact?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  smile: <Smile className="w-6 h-6" />,
  palette: <Palette className="w-6 h-6" />,
  droplet: <Droplet className="w-6 h-6" />,
  compass: <Compass className="w-6 h-6" />,
  book: <BookOpen className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  run: <Activity className="w-6 h-6" />,
  clean: <Sparkles className="w-6 h-6" />
};

const colorSchemes: Record<string, { cor: string; corTexto: string }> = {
  smile: {
    cor: 'bg-pastel-pink-100 hover:bg-pastel-pink-200 border-pastel-pink-200',
    corTexto: 'text-pink-800'
  },
  palette: {
    cor: 'bg-pastel-yellow-100 hover:bg-pastel-yellow-200 border-pastel-yellow-200',
    corTexto: 'text-amber-800'
  },
  droplet: {
    cor: 'bg-pastel-green-100 hover:bg-pastel-green-200 border-pastel-green-200',
    corTexto: 'text-emerald-800'
  },
  compass: {
    cor: 'bg-pastel-blue-100 hover:bg-pastel-blue-200 border-pastel-blue-200',
    corTexto: 'text-sky-800'
  },
  book: {
    cor: 'bg-pastel-purple-100 hover:bg-pastel-purple-200 border-pastel-purple-200',
    corTexto: 'text-purple-800'
  },
  star: {
    cor: 'bg-amber-100 hover:bg-amber-200 border-amber-200',
    corTexto: 'text-amber-800'
  },
  run: {
    cor: 'bg-orange-100 hover:bg-orange-200 border-orange-200',
    corTexto: 'text-orange-800'
  },
  clean: {
    cor: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200',
    corTexto: 'text-emerald-800'
  }
};

export const OfflineActivities: React.FC<OfflineActivitiesProps> = ({ onCompleteActivity, isCompact = false }) => {
  const { quests } = useScreenTime();
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [activeCelebration, setActiveCelebration] = useState<string | null>(null);

  const handleComplete = (id: string, recompensa: number) => {
    if (completedList.includes(id)) return;
    
    // Animação de confete/comemoração local
    setActiveCelebration(id);
    setCompletedList(prev => [...prev, id]);
    onCompleteActivity(recompensa);
    
    // Desativar pop de comemoração após 2 segundos
    setTimeout(() => {
      setActiveCelebration(null);
    }, 2500);
  };

  return (
    <div className="w-full max-w-xl mx-auto font-kids">
      <div className="text-center mb-4 sm:mb-6">
        <h4 className="text-base sm:text-lg md:text-xl font-black text-pastel-purple-600 flex items-center justify-center gap-1.5 sm:gap-2">
          <Sparkles size={16} className="animate-wiggle text-pastel-yellow-500 fill-pastel-yellow-200 shrink-0" />
          Sua Estação de Descanso Real!
          <Sparkles size={16} className="animate-wiggle text-pastel-yellow-500 fill-pastel-yellow-200 shrink-0" />
        </h4>
        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 max-w-sm mx-auto mt-0.5 font-medium leading-relaxed">
          Escolha uma missão divertida abaixo para fazer no mundo real e ganhe estrelas de equilíbrio!
        </p>
      </div>

      {/* Grid de Missões */}
      <div className={`grid gap-3 sm:gap-4 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {quests.map((act) => {
          const isCompleted = completedList.includes(act.id);
          const isCelebrating = activeCelebration === act.id;
          const scheme = colorSchemes[act.icone] || colorSchemes.smile;
          const icon = iconMap[act.icone] || iconMap.smile;
          
          return (
            <button
              key={act.id}
              disabled={isCompleted}
              aria-label={isCompleted 
                ? `Missão concluída: ${act.titulo}. Ganhou ${act.recompensa} estrela${act.recompensa > 1 ? 's' : ''}`
                : `Completar missão: ${act.titulo}. Recompensa: ${act.recompensa} estrela${act.recompensa > 1 ? 's' : ''}`}
              className={`text-left p-3.5 rounded-[22px] sm:rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                isCompleted 
                  ? 'bg-slate-50 border-slate-200 opacity-70' 
                  : `${scheme.cor} cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`
              }`}
              onClick={() => !isCompleted && handleComplete(act.id, act.recompensa)}
            >
              {/* Overlay de Comemoração de Estrelas */}
              {isCelebrating && (
                <div className="absolute inset-0 bg-gradient-to-r from-pastel-purple-500/95 to-pastel-blue-500/95 flex flex-col items-center justify-center text-white z-10 animate-fade-in">
                  <Flame size={24} className="animate-bounce text-pastel-yellow-400 fill-pastel-yellow-300 mb-0.5" />
                  <span className="font-extrabold text-xs sm:text-sm text-center">Incrível! 🌟</span>
                  <span className="text-[9px] sm:text-[10px] font-medium font-parents mt-0.5">+{act.recompensa} Estrela(s) Adicionada(s)!</span>
                </div>
              )}

              <div>
                {/* Ícone & Recompensa */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 bg-white rounded-2xl ${scheme.corTexto} shadow-sm shrink-0`}>
                    {icon}
                  </div>
                  <div className="bg-white/80 border border-white text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="text-pastel-yellow-500">★</span>
                    <span className="text-slate-700">+{act.recompensa}</span>
                  </div>
                </div>

                {/* Título */}
                <h5 className="font-bold text-slate-800 text-sm leading-tight mb-1">{act.titulo}</h5>
                {/* Descrição */}
                <p className="text-slate-500 text-[11px] leading-snug font-medium font-parents">
                  {act.descricao}
                </p>
              </div>

              {/* Botão de Conclusão */}
              <div className="mt-3.5 pt-2 border-t border-dashed border-slate-200/50 flex justify-end">
                {isCompleted ? (
                  <span className="text-emerald-500 text-xs font-black flex items-center gap-1">
                    <CheckCircle size={14} className="fill-emerald-50" /> Missão Concluída!
                  </span>
                ) : (
                  <span className={`text-xs font-black px-3.5 py-1 bg-white/90 rounded-full border shadow-sm ${scheme.corTexto} border-white active:scale-95 transition-transform`}>
                    Quero Fazer! →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
