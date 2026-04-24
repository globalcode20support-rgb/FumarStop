const CACHE_NAME = 'fumarstop-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
  if (e.data?.type === 'ALARM') {
    const { tag, title, body } = e.data;
    self.registration.showNotification(title, {
      body,
      tag,
      vibrate: [800, 300, 800, 300, 800, 300, 1000],
      requireInteraction: true,
      actions: [
        { action: 'taken', title: '✅ Tomada' },
        { action: 'snooze', title: '⏰ +10 min' }
      ]
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    setTimeout(() => {
      self.registration.showNotification('💊 Recordatorio — ' + e.notification.body.split('—')[0], {
        body: e.notification.body,
        tag: e.notification.tag + '-s',
        vibrate: [800, 300, 800, 300, 800],
        requireInteraction: true
      });
    }, 10 * 60 * 1000);
  } else {
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(c => c.postMessage({ type: 'TAKEN', tag: e.notification.tag }));
        if (clients.length > 0) clients[0].focus();
        else return self.clients.openWindow('./');
      })
    );
  }
});
