import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldAlert, Award, Calculator, Eye, EyeOff } from 'lucide-react';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'pin' | 'math'>('pin');
  const [pin, setPin] = useState<string>('');
  const [mathChallenge, setMathChallenge] = useState<{ num1: number; num2: number; op: 'x' | '+'; result: number }>({ num1: 0, num2: 0, op: '+', result: 0 });
  const [mathAnswer, setMathAnswer] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumberClick = (num: string) => {
    setError(false);
    if (method === 'pin') {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        
        // Se preencheu 4 dígitos, valida automaticamente
        if (newPin.length === 4) {
          validatePin(newPin);
        }
      }
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

  const validatePin = (code: string) => {
    if (code === '1234') {
      onSuccess();
      onClose();
    } else {
      triggerError('Código PIN incorreto! Dica: O PIN padrão da demonstração é 1234.');
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
    // Vibrar levemente no celular se disponível
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soft-dark-900/60 backdrop-blur-md animate-fade-in font-parents">
      <div 
        className={`w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-pastel-purple-200 glass-panel transition-all duration-300 ${
          error ? 'animate-bounce shadow-pastel-pink-200' : ''
        }`}
        style={error ? { animation: 'wiggle 0.3s ease-in-out 2' } : {}}
      >
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-r from-pastel-purple-50 to-pastel-blue-50 border-b border-pastel-purple-100">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pastel-purple-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
          
          <div className="inline-flex p-3 bg-pastel-purple-100 text-pastel-purple-600 rounded-2xl mb-3">
            <Lock size={24} className="animate-pulse" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800">Controle de Adultos</h3>
          <p className="text-sm text-slate-500 mt-1">Insira a senha dos pais para acessar as configurações</p>
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
            Senha PIN
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
            Desafio
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
            /* Campo PIN */
            <div className="w-full flex flex-col items-center">
              <div className="relative flex items-center justify-center gap-3.5 py-4 mb-6">
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      pin.length > idx 
                        ? 'bg-pastel-purple-500 border-pastel-purple-600 scale-110' 
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                ))}
                
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute -right-10 text-slate-400 hover:text-slate-600 p-1"
                  title={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {showPin && pin.length > 0 && (
                <div className="text-xs text-pastel-purple-500 font-semibold mb-4 bg-pastel-purple-50 px-3 py-1 rounded-full">
                  Digitado: {pin}
                </div>
              )}
            </div>
          ) : (
            /* Desafio Matemático */
            <div className="w-full flex flex-col items-center mb-6">
              <div className="text-center mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Quanto é?</span>
                <div className="text-3xl font-black text-slate-700 mt-1 flex items-center justify-center gap-2">
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

          {/* Teclado Numérico Lúdico */}
          <div className="w-full max-w-[280px] grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="h-14 bg-slate-50 hover:bg-pastel-purple-100 hover:text-pastel-purple-600 border border-slate-100 text-slate-600 font-extrabold text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                if (method === 'pin') setPin('');
                else setMathAnswer('');
                setError(false);
              }}
              className="h-14 text-xs font-bold text-pastel-pink-500 hover:bg-pastel-pink-50 rounded-2xl border border-transparent active:scale-95 flex items-center justify-center"
            >
              Limpar
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-14 bg-slate-50 hover:bg-pastel-purple-100 hover:text-pastel-purple-600 border border-slate-100 text-slate-600 font-extrabold text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-2xl border border-transparent active:scale-95 flex items-center justify-center"
            >
              Apagar
            </button>
          </div>
          
          <div className="mt-5 text-center">
            <span className="text-[10px] text-slate-400 block">Demonstração: PIN padrão é <strong>1234</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
