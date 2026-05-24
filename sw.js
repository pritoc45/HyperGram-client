const CACHE = 'ayugram-v1';

// Установка SW
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(cache =>
            cache.addAll(['/', '/index.html']).catch(() => {})
        )
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

// Кэширование запросов
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    if (e.request.url.includes('unsplash.com')) return; // не кэшируем обои
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});

// Получение сообщения от страницы — показать уведомление
self.addEventListener('message', e => {
    if (e.data?.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon, tag, data } = e.data;
        e.waitUntil(
            self.registration.showNotification(title, {
                body,
                icon: icon || '/icon-192.png',
                badge: '/icon-192.png',
                tag,
                data,
                vibrate: [200, 100, 200, 100, 200],
                requireInteraction: false,
                actions: [
                    { action: 'reply', title: '↩ Ответить' },
                    { action: 'close', title: '✕ Закрыть' }
                ]
            })
        );
    }
});

// Клик по уведомлению — открыть приложение
self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.action === 'close') return;

    const from = e.notification.data?.from;
    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            // Если приложение уже открыто — фокус
            for (const client of clients) {
                if (client.url.includes('ayugram') || client.url.includes('github.io')) {
                    client.focus();
                    if (from) client.postMessage({ type: 'OPEN_CHAT', from });
                    return;
                }
            }
            // Иначе открыть новое окно
            return self.clients.openWindow('/');
        })
    );
});

// Фоновая синхронизация (для Android)
self.addEventListener('sync', e => {
    if (e.tag === 'sync-messages') {
        // placeholder
    }
});
