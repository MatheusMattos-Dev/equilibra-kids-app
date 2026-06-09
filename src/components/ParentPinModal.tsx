import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ShieldAlert, Award, Calculator, Eye, EyeOff } from 'lucide-react';
import { auth } from '../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'pin' | 'math'>('pin');
  const [pin, setPin] = useState<string>(''); // Usado como senha/PIN do responsável
  const [mathChallenge, setMathChallenge] = useState<{ num1: number; num2: number; op: 'x' | '+'; result: number }>({ num1: 0, num2: 0, op: '+', result: 0 });
  const [mathAnswer, setMathAnswer] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isGoogleUser = auth.currentUser?.providerData.some(p => p.providerId === 'google.com');

  // Gerar Desafio Matemático Aleatório
  const generateMathChallenge = () => {
    const isMult = Math.random() > 0.5;
    if (isMult) {
      const num1 = Math.floor(Math.random() * 8) + 3; // 3-10
      const num2 = Math.floor(Math.random() * 7) + 3; // 3-9
      setMathChallenge({ num1, num2, op: 'x', result: num1 * num2 });
    } else {
      const num1 = Math.floor(Math.random() * 40) + 15; // 15-55
      const num2 = Math.floor(Math.random() * 40) + 15; // 15-55
      setMathChallenge({ num1, num2, op: '+', result: num1 + num2 });
    }
    setMathAnswer('');
    setError(false);
  };

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setMathAnswer('');
      setError(false);
      setErrorMessage('');
      generateMathChallenge();

      previousFocusRef.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumberClick = (num: string) => {
    setError(false);
    if (method === 'pin') {
      setPin(prev => prev + num);
    } else {
      setMathAnswer(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setError(false);
    if (method === 'pin') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setMathAnswer(prev => prev.slice(0, -1));
    }
  };

  const validatePin = async (password: string) => {
    setError(false);
    setErrorMessage('');
    const user = auth.currentUser;

    if (!user) {
      triggerError('Nenhum responsável autenticado no momento.');
      return;
    }

    const isEmailProvider = user.providerData.some(p => p.providerId === 'password');

    if (isEmailProvider && user.email) {
      setIsValidating(true);
      try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        setIsValidating(false);
        onSuccess();
        onClose();
      } catch (err: any) {
        setIsValidating(false);
        let msg = 'Senha incorreta.';
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = 'Senha incorreta. Digite a senha da sua conta do Firebase.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Muitas tentativas. Aguarde alguns minutos ou use o desafio matemático.';
        }
        triggerError(msg);
      }
    } else {
      // Se for Google ou outro provider sem senha local
      onSuccess();
      onClose();
    }
  };

  const validateMath = () => {
    if (parseInt(mathAnswer) === mathChallenge.result) {
      onSuccess();
      onClose();
    } else {
      triggerError('Ops, resposta incorreta! Tente de novo, com atenção. 🧮');
      generateMathChallenge();
    }
  };

  const triggerError = (msg: string) => {
    setError(true);
    setErrorMessage(msg);
    setPin('');
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-soft-dark-900/60 animate-fade-in font-parents">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-parents-title"
        className={`w-full h-full sm:h-auto sm:max-w-sm bg-white rounded-none sm:rounded-3xl overflow-y-auto sm:overflow-hidden shadow-2xl border-0 sm:border-4 border-pastel-purple-200 glass-panel transition-all duration-300 ${
          error ? 'animate-bounce shadow-pastel-pink-200' : ''
        }`}
        style={error ? { animation: 'wiggle 0.3s ease-in-out 2' } : {}}
      >
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-r from-pastel-purple-50 to-pastel-blue-50 border-b border-pastel-purple-100">
          <button 
            ref={closeButtonRef}
            onClick={onClose} 
            aria-label="Fechar"
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pastel-purple-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
          
          <div className="inline-flex p-3 bg-pastel-purple-100 text-pastel-purple-600 rounded-2xl mb-3">
            <Lock size={24} className="animate-pulse" />
          </div>
          
          <h3 id="modal-parents-title" className="text-xl font-bold text-slate-800">Controle de Adultos</h3>
          <p id="pin-instruction" className="text-sm text-slate-500 mt-1">Valide sua identidade para realizar ações protegidas</p>
        </div>

        {/* Seleção do Método */}
        <div className="flex p-2 bg-slate-50 mx-6 mt-4 rounded-xl border border-slate-100 gap-1">
          <button
            onClick={() => { setMethod('pin'); setError(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              method === 'pin' 
                ? 'bg-white text-pastel-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <Lock size={15} />
            {isGoogleUser ? 'Confirmar Acesso' : 'Senha do Responsável'}
          </button>
          <button
            onClick={() => { setMethod('math'); setError(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              method === 'math' 
                ? 'bg-white text-pastel-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <Calculator size={15} />
            Desafio Matemático
          </button>
        </div>

        {/* Body do Formulário */}
        <div className="p-6 flex flex-col items-center">
          {error && (
            <div className="w-full flex items-start gap-2.5 p-3.5 mb-4 bg-pastel-pink-50 border border-pastel-pink-200 text-pastel-pink-500 text-xs rounded-xl animate-shake">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {method === 'pin' ? (
            /* Método PIN / Senha */
            <div className="w-full flex flex-col items-center">
              {isGoogleUser ? (
                /* Layout para Google Users */
                <div className="text-center py-4 mb-4 w-full">
                  <p className="text-sm font-semibold text-slate-700">
                    Você está autenticado com o Google:
                  </p>
                  <p className="text-xs text-pastel-purple-600 font-black mt-1">
                    {auth.currentUser?.displayName || auth.currentUser?.email}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-4 font-medium leading-relaxed">
                    Sessão ativa protegida pelo Firebase. Clique abaixo para confirmar o acesso.
                  </p>
                </div>
              ) : (
                /* Input de Senha Tradicional/Física para Email/Senha Users */
                <div className="w-full relative mb-4">
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Digite a senha..."
                    value={pin}
                    onChange={(e) => {
                      setError(false);
                      setPin(e.target.value);
                    }}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 text-xl sm:text-2xl tracking-[0.25em] focus:border-pastel-purple-300 focus:bg-white outline-none transition-all font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}
              
              <button
                onClick={() => validatePin(pin)}
                disabled={(!isGoogleUser && !pin) || isValidating}
                className="w-full py-2.5 mb-4 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Award size={16} /> Confirmar Acesso
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Desafio Matemático */
            <div className="w-full flex flex-col items-center mb-6">
              <div className="text-center mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Quanto é?</span>
                <div className="text-3xl sm:text-4xl font-black text-slate-700 mt-1 flex flex-wrap items-center justify-center gap-2">
                  <span>{mathChallenge.num1}</span>
                  <span className="text-pastel-purple-500 text-2xl">{mathChallenge.op === 'x' ? '×' : '+'}</span>
                  <span>{mathChallenge.num2}</span>
                  <span className="text-slate-400">=</span>
                  <div className="w-20 h-11 border-2 border-dashed border-pastel-purple-300 rounded-xl bg-pastel-purple-50/50 flex items-center justify-center text-pastel-purple-600">
                    {mathAnswer || '?'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={validateMath}
                disabled={!mathAnswer}
                className="w-full py-2.5 bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                <Award size={16} /> Confirmar Resposta
              </button>
            </div>
          )}

          {/* Teclado Numérico Lúdico (útil se a senha for numérica ou para o desafio) */}
          {(!isGoogleUser || method === 'math') && (
            <div
              role="group"
              aria-label="Teclado numérico virtual"
              className="w-full max-w-[280px] grid grid-cols-3 gap-3"
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberClick(num)}
                  aria-label={`Dígito ${num}`}
                  className="h-14 sm:h-12 bg-slate-50 hover:bg-pastel-purple-100 hover:text-pastel-purple-600 border border-slate-100 text-slate-600 font-extrabold text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (method === 'pin') setPin('');
                  else setMathAnswer('');
                  setError(false);
                }}
                aria-label="Limpar todos os dígitos"
                className="h-14 sm:h-12 text-xs font-bold text-pastel-pink-500 hover:bg-pastel-pink-50 rounded-2xl border border-transparent active:scale-95 flex items-center justify-center"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => handleNumberClick('0')}
                aria-label="Dígito 0"
                className="h-14 sm:h-12 bg-slate-50 hover:bg-pastel-purple-100 hover:text-pastel-purple-600 border border-slate-100 text-slate-600 font-extrabold text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                aria-label="Apagar último dígito"
                className="h-14 sm:h-12 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-2xl border border-transparent active:scale-95 flex items-center justify-center"
              >
                Apagar
              </button>
            </div>
          )}
          
          <div id="pin-demo-note" className="mt-5 text-center">
            <span className="text-[10px] text-slate-400 block">Sessão protegida por autenticação real via Firebase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
