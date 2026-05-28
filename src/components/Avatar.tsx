import React from 'react';

export type AvatarType = 'lion' | 'owl' | 'cat' | 'bear';

interface AvatarProps {
  type: AvatarType;
  className?: string;
  animate?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ type, className = 'w-16 h-16', animate = false }) => {
  const animationClass = animate ? 'animate-float' : 'hover:scale-105 transition-transform duration-300';
  
  switch (type) {
    case 'lion':
      return (
        <svg className={`${className} ${animationClass}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mane (Juba) */}
          <circle cx="50" cy="50" r="40" fill="#E28743" />
          <path d="M50 10 L60 20 L50 30 L40 20 Z" fill="#C35A1E" />
          <path d="M80 30 L90 40 L80 50 L70 40 Z" fill="#C35A1E" />
          <path d="M90 60 L80 70 L70 60 L80 50 Z" fill="#C35A1E" />
          <path d="M60 80 L50 90 L40 80 L50 70 Z" fill="#C35A1E" />
          <path d="M20 70 L10 60 L20 50 L30 60 Z" fill="#C35A1E" />
          <path d="M10 40 L20 30 L30 40 L20 50 Z" fill="#C35A1E" />
          
          {/* Face */}
          <circle cx="50" cy="53" r="28" fill="#F8C77F" />
          
          {/* Ears */}
          <circle cx="28" cy="32" r="8" fill="#E28743" />
          <circle cx="28" cy="32" r="5" fill="#F0A65F" />
          <circle cx="72" cy="32" r="8" fill="#E28743" />
          <circle cx="72" cy="32" r="5" fill="#F0A65F" />
          
          {/* Eyes */}
          <circle cx="40" cy="48" r="3.5" fill="#334155" />
          <circle cx="60" cy="48" r="3.5" fill="#334155" />
          <circle cx="38.5" cy="46.5" r="1" fill="white" />
          <circle cx="58.5" cy="46.5" r="1" fill="white" />
          
          {/* Cheeks (Bochechas) */}
          <circle cx="36" cy="55" r="3" fill="#F59E0B" opacity="0.4" />
          <circle cx="64" cy="55" r="3" fill="#F59E0B" opacity="0.4" />
          
          {/* Nose & Mouth */}
          <polygon points="50,54 46,50 54,50" fill="#C35A1E" />
          <path d="M47 57 C48.5 59, 50 59, 50 57 C50 59, 51.5 59, 53 57" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
      
    case 'owl':
      return (
        <svg className={`${className} ${animationClass}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <rect x="22" y="24" width="56" height="58" rx="28" fill="#9E74D6" />
          
          {/* Belly (Barriga) */}
          <rect x="32" y="46" width="36" height="30" rx="15" fill="#DECBF2" />
          <path d="M42 56 L46 52 L50 56 L54 52 L58 56" stroke="#9E74D6" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 64 L46 60 L50 64 L54 60 L58 64" stroke="#9E74D6" strokeWidth="2" strokeLinecap="round" />
          
          {/* Ears (Penachos) */}
          <polygon points="26,26 18,10 38,20" fill="#7B53b2" />
          <polygon points="74,26 82,10 62,20" fill="#7B53b2" />
          
          {/* Eyes (Olhos de Coruja) */}
          <circle cx="38" cy="38" r="11" fill="white" stroke="#DECBF2" strokeWidth="2" />
          <circle cx="38" cy="38" r="4.5" fill="#334155" />
          <circle cx="36" cy="36" r="1.5" fill="white" />
          
          <circle cx="62" cy="38" r="11" fill="white" stroke="#DECBF2" strokeWidth="2" />
          <circle cx="62" cy="38" r="4.5" fill="#334155" />
          <circle cx="60" cy="36" r="1.5" fill="white" />
          
          {/* Beak (Bico) */}
          <polygon points="50,42 46,37 54,37" fill="#F1C43F" />
          
          {/* Wings (Asas) */}
          <path d="M22 42 C16 46, 14 56, 20 64 C22 58, 22 48, 22 42 Z" fill="#7B53B2" />
          <path d="M78 42 C84 46, 86 56, 80 64 C78 58, 78 48, 78 42 Z" fill="#7B53B2" />
          
          {/* Feet */}
          <circle cx="42" cy="83" r="4" fill="#F1C43F" />
          <circle cx="58" cy="83" r="4" fill="#F1C43F" />
        </svg>
      );
      
    case 'cat':
      return (
        <svg className={`${className} ${animationClass}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Face */}
          <circle cx="50" cy="52" r="32" fill="#F67280" />
          
          {/* Ears */}
          <polygon points="20,34 10,12 36,26" fill="#F67280" />
          <polygon points="22,32 15,16 32,26" fill="#FFE8EE" />
          
          <polygon points="80,34 90,12 64,26" fill="#F67280" />
          <polygon points="78,32 85,16 68,26" fill="#FFE8EE" />
          
          {/* Eyes */}
          <ellipse cx="38" cy="48" rx="3.5" ry="5" fill="#334155" />
          <ellipse cx="62" cy="48" rx="3.5" ry="5" fill="#334155" />
          <circle cx="36.5" cy="46" r="1.2" fill="white" />
          <circle cx="60.5" cy="46" r="1.2" fill="white" />
          
          {/* Cheeks */}
          <circle cx="32" cy="56" r="3.5" fill="#FFE8EE" opacity="0.6" />
          <circle cx="68" cy="56" r="3.5" fill="#FFE8EE" opacity="0.6" />
          
          {/* Nose & Mouth */}
          <polygon points="50,52 47,49 53,49" fill="#FFE8EE" />
          <path d="M47 54 C48.5 56, 50 56, 50 54 C50 56, 51.5 56, 53 54" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          
          {/* Whiskers (Bigodes) */}
          <path d="M22 52 L12 50 M22 56 L10 56 M22 60 L13 62" stroke="#FFE8EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M78 52 L88 50 M78 56 L90 56 M78 60 L87 62" stroke="#FFE8EE" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
      
    case 'bear':
    default:
      return (
        <svg className={`${className} ${animationClass}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ears */}
          <circle cx="26" cy="30" r="11" fill="#46B3CC" />
          <circle cx="26" cy="30" r="6" fill="#C0E5EE" />
          <circle cx="74" cy="30" r="11" fill="#46B3CC" />
          <circle cx="74" cy="30" r="6" fill="#C0E5EE" />
          
          {/* Face */}
          <circle cx="50" cy="54" r="30" fill="#46B3CC" />
          
          {/* Snout (Focinho) */}
          <ellipse cx="50" cy="62" rx="14" ry="10" fill="#C0E5EE" />
          
          {/* Nose */}
          <polygon points="50,59 45,55 55,55" fill="#338EA3" />
          <path d="M50 59 L50 63" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 64 C48 66, 50 66, 50 64 C50 66, 52 66, 54 64" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          
          {/* Eyes */}
          <circle cx="38" cy="48" r="4.5" fill="#334155" />
          <circle cx="62" cy="48" r="4.5" fill="#334155" />
          <circle cx="36.5" cy="46" r="1.2" fill="white" />
          <circle cx="60.5" cy="46" r="1.2" fill="white" />
          
          {/* Cheeks */}
          <circle cx="32" cy="56" r="3.5" fill="#C0E5EE" opacity="0.5" />
          <circle cx="68" cy="56" r="3.5" fill="#C0E5EE" opacity="0.5" />
        </svg>
      );
  }
};
