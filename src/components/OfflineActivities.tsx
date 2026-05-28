import React, { useState } from 'react';
import { Palette, Compass, Apple, Sparkles, Smile, CheckCircle, Flame } from 'lucide-react';

interface Activity {
  id: string;
  titulo: string;
  descricao: string;
  recompensa: number;
  icon: React.ReactNode;
  cor: string;
  corTexto: string;
}

interface OfflineActivitiesProps {
  onCompleteActivity: (estrelas: number) => void;
}

export const OfflineActivities: React.FC<OfflineActivitiesProps> = ({ onCompleteActivity }) => {
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [activeCelebration, setActiveCelebration] = useState<string | null>(null);

  const activities: Activity[] = [
    {
      id: 'stretch-1',
      titulo: 'Espreguiçar de Gatinho 🐱',
      descricao: 'Fique de pé, estique os braços lá no alto e respire fundo três vezes como um gatinho acordando!',
      recompensa: 1,
      icon: <Smile className="w-6 h-6" />,
      cor: 'bg-pastel-pink-100 hover:bg-pastel-pink-200 border-pastel-pink-200',
      corTexto: 'text-pastel-pink-500'
    },
    {
      id: 'drawing-2',
      titulo: 'Artista do Papel 🎨',
      descricao: 'Pegue papel e giz de cera e desenhe um animal fantástico de três cabeças ou seu brinquedo preferido!',
      recompensa: 3,
      icon: <Palette className="w-6 h-6" />,
      cor: 'bg-pastel-yellow-100 hover:bg-pastel-yellow-200 border-pastel-yellow-200',
      corTexto: 'text-pastel-yellow-600'
    },
    {
      id: 'water-3',
      titulo: 'Poção da Hidratação 🍎',
      descricao: 'Vá até a cozinha, beba um copo inteiro de água e coma um pedaço de fruta deliciosa para recarregar as energias.',
      recompensa: 2,
      icon: <Apple className="w-6 h-6" />,
      cor: 'bg-pastel-green-100 hover:bg-pastel-green-200 border-pastel-green-200',
      corTexto: 'text-pastel-green-600'
    },
    {
      id: 'origami-4',
      titulo: 'Engenheiro de Avião ⛵',
      descricao: 'Faça um avião ou barquinho de papel tradicional e aposte corrida para ver se ele consegue planar longe!',
      recompensa: 3,
      icon: <Compass className="w-6 h-6" />,
      cor: 'bg-pastel-blue-100 hover:bg-pastel-blue-200 border-pastel-blue-200',
      corTexto: 'text-pastel-blue-600'
    }
  ];

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
      <div className="text-center mb-6">
        <h4 className="text-lg md:text-xl font-black text-pastel-purple-600 flex items-center justify-center gap-2">
          <Sparkles className="animate-wiggle text-pastel-yellow-500 fill-pastel-yellow-200" />
          Sua Estação de Descanso Real!
          <Sparkles className="animate-wiggle text-pastel-yellow-500 fill-pastel-yellow-200" />
        </h4>
        <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">
          Escolha uma missão divertida abaixo para fazer no mundo real e ganhe estrelas de equilíbrio!
        </p>
      </div>

      {/* Grid de Missões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activities.map((act) => {
          const isCompleted = completedList.includes(act.id);
          const isCelebrating = activeCelebration === act.id;
          
          return (
            <div
              key={act.id}
              className={`p-4 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                isCompleted 
                  ? 'bg-slate-50 border-slate-200 opacity-70' 
                  : `${act.cor} cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`
              }`}
              onClick={() => !isCompleted && handleComplete(act.id, act.recompensa)}
            >
              {/* Overlay de Comemoração de Estrelas */}
              {isCelebrating && (
                <div className="absolute inset-0 bg-gradient-to-r from-pastel-purple-500/95 to-pastel-blue-500/95 flex flex-col items-center justify-center text-white z-10 animate-fade-in">
                  <Flame size={28} className="animate-bounce text-pastel-yellow-400 fill-pastel-yellow-300 mb-1" />
                  <span className="font-extrabold text-sm text-center">Incrível! 🌟</span>
                  <span className="text-[10px] font-medium font-parents mt-0.5">+{act.recompensa} Estrela(s) Adicionada(s)!</span>
                </div>
              )}

              <div>
                {/* Ícone & Recompensa */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 bg-white rounded-2xl ${act.corTexto} shadow-sm shrink-0`}>
                    {act.icon}
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
                  <span className={`text-xs font-black px-3.5 py-1 bg-white/90 rounded-full border shadow-sm ${act.corTexto} border-white active:scale-95 transition-transform`}>
                    Quero Fazer! →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
