import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Mail, Lock, User as UserIcon, Eye, EyeOff, 
  ArrowLeft, Sparkles, AlertCircle, CheckCircle, Shield 
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    loading: authLoading, 
    signInWithEmail, 
    signInWithGoogle, 
    signUp, 
    resetPassword 
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/pais', { replace: true });
    }
  }, [user, navigate]);

  // Limpa erros ao alternar modos
  useEffect(() => {
    setLocalError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  }, [mode]);

  // Tradutor de erros do Firebase para Português
  const getFriendlyErrorMessage = (code: string | null): string => {
    if (!code) return '';
    switch (code) {
      case 'auth/user-not-found':
        return 'E-mail não cadastrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso';
      case 'auth/weak-password':
        return 'A senha deve conter no mínimo 6 caracteres';
      case 'auth/invalid-email':
        return 'E-mail em formato inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente em alguns minutos';
      case 'auth/popup-closed-by-user':
        return 'Login com Google cancelado.';
      default:
        return 'Ocorreu um erro ao processar. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setLocalError('Preencha todos os campos.');
          setIsSubmitting(false);
          return;
        }
        await signInWithEmail(email, password);
        // O useEffect tratará o redirecionamento
      } else if (mode === 'signup') {
        if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
          setLocalError('Preencha todos os campos obrigatórios.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('A senha deve ter no mínimo 6 caracteres.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setLocalError('As senhas não coincidem.');
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, displayName);
      } else if (mode === 'reset') {
        if (!email.trim()) {
          setLocalError('Informe seu e-mail de cadastro.');
          setIsSubmitting(false);
          return;
        }
        await resetPassword(email);
        setSuccessMessage(`E-mail de redefinição enviado para ${email}`);
        setEmail('');
      }
    } catch (err: any) {
      // O erro é capturado e traduzido
      setLocalError(getFriendlyErrorMessage(err.code || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(getFriendlyErrorMessage(err.code || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-pastel-blue-50 to-pastel-purple-50 font-parents">
      
      {/* Coluna do Formulário */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-16 max-w-xl mx-auto xl:max-w-2xl">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl animate-pop">
          
          {/* Header do Form */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-pastel-purple-50 text-pastel-purple-500 rounded-2xl mb-3 border-2 border-pastel-purple-100">
              <Shield size={24} className="animate-pulse" />
            </div>
            
            {mode === 'login' && (
              <>
                <h1 className="text-2xl font-black text-slate-800">Acesso dos Pais</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Gerencie o tempo de tela e crie limites saudáveis
                </p>
              </>
            )}
            {mode === 'signup' && (
              <>
                <h1 className="text-2xl font-black text-slate-800">Criar Nova Conta</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Junte-se ao EquilibraKids para gerenciar sua família
                </p>
              </>
            )}
            {mode === 'reset' && (
              <>
                <h1 className="text-2xl font-black text-slate-800">Recuperar Senha</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Enviaremos as instruções de redefinição por e-mail
                </p>
              </>
            )}
          </div>

          {/* Mensagens de Feedback */}
          {localError && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-pastel-pink-50 border border-pastel-pink-200 text-pastel-pink-500 text-xs font-bold rounded-xl animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-pastel-green-50 border border-pastel-green-200 text-pastel-green-600 text-xs font-bold rounded-xl animate-pop">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 font-parents" htmlFor="displayName">
                  Nome Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    id="displayName"
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 text-sm focus:border-pastel-purple-300 focus:bg-white outline-none transition-all font-semibold"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 font-parents" htmlFor="email">
                E-mail de Responsável
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 text-sm focus:border-pastel-purple-300 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 font-parents" htmlFor="password">
                  Senha
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 text-sm focus:border-pastel-purple-300 focus:bg-white outline-none transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 font-parents" htmlFor="confirmPassword">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 text-sm focus:border-pastel-purple-300 focus:bg-white outline-none transition-all font-semibold"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-xs font-bold text-pastel-purple-500 hover:text-pastel-purple-600 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Botão de Enviar */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="mt-2 w-full py-3 bg-gradient-to-r from-pastel-purple-500 to-pastel-blue-500 hover:from-pastel-purple-600 hover:to-pastel-blue-600 text-white font-black text-sm rounded-2xl shadow-md border-b-4 border-pastel-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {(isSubmitting || authLoading) ? (
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'Entrar'
              ) : mode === 'signup' ? (
                'Criar conta'
              ) : (
                'Enviar e-mail'
              )}
            </button>

            {/* Divisor */}
            {mode === 'login' && (
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">ou</span>
              </div>
            )}

            {/* Login com Google */}
            {mode === 'login' && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || authLoading}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-extrabold text-xs rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all"
              >
                {/* Ícone lúdico do Google */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.4 7.56l3.89 3.02C6.21 7.55 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.29 14.54a7.18 7.18 0 010-4.54L1.4 6.98a11.96 11.96 0 000 10.58l3.89-3.02z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.13 0-5.79-2.51-6.71-5.54L1.8 15.82C3.77 19.73 7.75 23 12 23z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </button>
            )}
          </form>

          {/* Relação de Modos */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500 font-parents">
            {mode === 'login' ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-bold text-pastel-purple-500 hover:text-pastel-purple-600 transition-colors"
                >
                  Criar conta
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Já possui uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-pastel-purple-500 hover:text-pastel-purple-600 transition-colors"
                >
                  Entrar
                </button>
              </p>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-1 mx-auto font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={14} /> Voltar para o Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Coluna do Mascote (Ilustração lateral para Desktop) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-pastel-purple-500/10 to-pastel-blue-500/10 items-center justify-center p-12 border-l border-slate-100">
        <div className="text-center max-w-sm animate-pop">
          {/* Mascote Coruja Inteligente SVG */}
          <svg className="w-56 h-56 mx-auto mb-6 animate-float" viewBox="0 0 200 200" fill="none">
            {/* Orelhas/Penas da cabeça */}
            <path d="M40 70 L60 40 L90 50 Z" fill="#9e74d6" />
            <path d="M160 70 L140 40 L110 50 Z" fill="#9e74d6" />
            {/* Corpo */}
            <circle cx="100" cy="115" r="65" fill="#decbf2" />
            {/* Barriga pastel */}
            <circle cx="100" cy="125" r="45" fill="#f9f6fc" />
            {/* Asas */}
            <path d="M35 110 Q15 130 45 155 Z" fill="#7b53b2" />
            <path d="M165 110 Q185 130 155 155 Z" fill="#7b53b2" />
            {/* Olhos (Grandes e fofos) */}
            <circle cx="72" cy="90" r="22" fill="#fff" />
            <circle cx="128" cy="90" r="22" fill="#fff" />
            {/* Pupilas com brilhos */}
            <circle cx="72" cy="90" r="10" fill="#334155" />
            <circle cx="128" cy="90" r="10" fill="#334155" />
            <circle cx="75" cy="87" r="4" fill="#fff" />
            <circle cx="131" cy="87" r="4" fill="#fff" />
            {/* Bochechas rosadas */}
            <circle cx="56" cy="112" r="7" fill="#ffcbd8" />
            <circle cx="144" cy="112" r="7" fill="#ffcbd8" />
            {/* Bico */}
            <path d="M100 95 L93 108 L107 108 Z" fill="#f1c43f" />
            {/* Patinhas */}
            <circle cx="85" cy="178" r="8" fill="#f1c43f" />
            <circle cx="115" cy="178" r="8" fill="#f1c43f" />
          </svg>

          <h2 className="text-xl font-black text-slate-800">Sou a corujinha Coruja! 🦉</h2>
          <p className="text-xs text-slate-500 font-parents font-semibold mt-2 leading-relaxed">
            Estou aqui para ajudar a monitorar e construir hábitos digitais divertidos e equilibrados para os pequenos.
          </p>

          <div className="mt-6 flex items-center gap-1.5 justify-center text-[10px] text-pastel-purple-500 font-extrabold uppercase tracking-wider">
            <Sparkles size={12} className="animate-spin-slow" />
            <span>Área Exclusiva para Adultos</span>
          </div>
        </div>
      </div>

    </div>
  );
};
