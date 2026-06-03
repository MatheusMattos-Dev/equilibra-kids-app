import { useState, useEffect } from 'react';

/**
 * Hook para monitorar o status de conexão do navegador.
 * Retorna true se estiver online, e false se estiver offline.
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
