// Service Worker para Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Inicializa o Firebase no Service Worker usando chaves reais do cliente
firebase.initializeApp({
  apiKey: "AIzaSyDJRFo_xDkXPeAQtvRnyI3TtWJLqa6vQqk",
  authDomain: "equilibrakids-d2d9f.firebaseapp.com",
  projectId: "equilibrakids-d2d9f",
  storageBucket: "equilibrakids-d2d9f.firebasestorage.app",
  messagingSenderId: "287075932173",
  appId: "1:287075932173:web:25aa21dbbe5a77f4975d44",
});

const messaging = firebase.messaging();

// Listener para gerenciar mensagens recebidas em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);
  const { title, body, icon } = payload.notification || {};
  
  self.registration.showNotification(title || "EquilibraKids", {
    body: body || "",
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
  });
});
