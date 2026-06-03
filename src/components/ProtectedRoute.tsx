import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-radial-gradient p-6 font-kids">
        <div className="flex flex-col items-center gap-4 animate-pop">
          {/* Logo animado */}
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
              Verificando acesso seguro... 🔒
            </p>
          </div>

          {/* Spinner de carregamento */}
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200/50">
            <div className="h-full bg-pastel-purple-500 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
