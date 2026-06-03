import { useState, useEffect } from 'react';
import { messaging, db, auth } from '../lib/firebase';
import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';

export interface ForegroundNotification {
  title?: string;
  body?: string;
}

export const usePushNotifications = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [foregroundNotification, setForegroundNotification] = useState<ForegroundNotification | null>(null);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState<boolean>(false);

  // Verifica compatibilidade ao carregar
  useEffect(() => {
    isSupported().then((supported) => {
      setIsSupportedBrowser(supported);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
    });
  }, []);

  // Solicita permissão e gera Token FCM
  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Este navegador não suporta notificações.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted' && isSupportedBrowser && messaging) {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (token) {
          console.log('FCM Token gerado com sucesso:', token);
          setFcmToken(token);

          // Salva o Token no Firestore se logado
          if (auth.currentUser) {
            const uid = auth.currentUser.uid;
            await setDoc(doc(db, `families/${uid}/settings/fcmToken`), {
              token: token,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao registrar permissão de notificações:', error);
    }
    return false;
  };

  // Carrega e atualiza token silenciosamente se a permissão já estiver concedida
  useEffect(() => {
    if (permissionStatus === 'granted' && isSupportedBrowser && messaging && auth.currentUser) {
      const uid = auth.currentUser.uid;
      
      const fetchTokenSilently = async () => {
        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          if (token) {
            setFcmToken(token);
            await setDoc(doc(db, `families/${uid}/settings/fcmToken`), {
              token: token,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error) {
          console.error('Erro silencioso ao obter FCM token:', error);
        }
      };

      fetchTokenSilently();
    }
  }, [permissionStatus, isSupportedBrowser, auth.currentUser]);

  // Listener para mensagens em foreground (Primeiro Plano)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isSupportedBrowser && messaging) {
      isSupported().then((supported) => {
        if (supported) {
          unsubscribe = onMessage(messaging, (payload) => {
            console.log('Notificação recebida em foreground:', payload);
            if (payload.notification) {
              setForegroundNotification({
                title: payload.notification.title,
                body: payload.notification.body
              });
            }
          });
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupportedBrowser]);

  // Limpa notificações em foreground após 5 segundos
  useEffect(() => {
    if (foregroundNotification) {
      const timer = setTimeout(() => {
        setForegroundNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [foregroundNotification]);

  return {
    permissionStatus,
    notificationsEnabled: permissionStatus === 'granted',
    fcmToken,
    foregroundNotification,
    clearForegroundNotification: () => setForegroundNotification(null),
    requestPermission,
    isSupportedBrowser
  };
};
