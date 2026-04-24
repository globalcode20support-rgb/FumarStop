// Service Worker - Mis Medicinas
const CACHE_NAME = 'medicinas-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Recibir mensaje desde la app para programar alarma
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_ALARM') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [500, 200, 500, 200, 500],
        requireInteraction: true,
        actions: [
          { action: 'taken', title: '✅ Tomada' },
          { action: 'snooze', title: '⏰ +10 min' }
        ]
      });
    }, delay);
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'taken') {
    // Notificar a la app que se marcó como tomada
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'MEDICINE_TAKEN', tag: e.notification.tag });
        });
        if (clients.length === 0) {
          self.clients.openWindow('./');
        }
      })
    );
  } else if (e.action === 'snooze') {
    // Posponer 10 minutos
    setTimeout(() => {
      self.registration.showNotification(e.notification.title + ' (recordatorio)', {
        body: e.notification.body,
        tag: e.notification.tag + '-snooze',
        icon: 'icon.png',
        vibrate: [500, 200, 500],
        requireInteraction: true
      });
    }, 10 * 60 * 1000);
  } else {
    // Click en la notificación → abrir app
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        if (clients.length > 0) clients[0].focus();
        else self.clients.openWindow('./');
      })
    );
  }
});
