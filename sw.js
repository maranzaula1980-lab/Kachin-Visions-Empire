const CACHE_NAME = 'quickchat-v2.0.0';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './config.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap',
  'https://img.icons8.com/color/96/000000/chat.png',
  'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with network-first strategy for API, cache-first for static assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and API calls
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it can only be used once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New message received',
    icon: 'https://img.icons8.com/color/96/000000/chat.png',
    badge: 'https://img.icons8.com/color/96/000000/chat.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'QuickChat', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'close') {
    // Do nothing
  } else {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle sync events for offline messages
self.addEventListener('sync', event => {
  if (event.tag === 'send-messages') {
    console.log('Background sync: send-messages');
    // Here you would implement logic to send queued messages
  }
});