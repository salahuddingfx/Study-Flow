const CACHE_NAME = 'studyflow-v8-production';
const RUNTIME_CACHE = 'studyflow-runtime-v8';
const CDN_CACHE = 'studyflow-cdn-v8';

// Static assets to cache immediately
const urlsToCache = [
  './',
  './index.html',
  './Assets/style.css',
  './Assets/script.js',
  './Assets/critical.css',
  './manifest.json',
  './Assets/brain-duotone.png',
  './Assets/chart.umd.min.js'
];

// CDN resources to cache (with longer TTL)
const cdnUrls = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.15/vue.global.prod.min.js',
  'https://cdn.jsdelivr.net/npm/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Service Worker: Cache install failed', error);
      })
  );
  self.skipWaiting();
});

// Fetch Event - Optimized Caching Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip unsupported schemes (e.g., chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API calls - Network First with offline fallback
  if (url.pathname.includes('/api') || url.hostname.includes('render.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone).catch(err => console.log('Cache put error:', err));
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // CDN Resources - Cache First with 7-day expiry
  if (url.hostname.includes('cdn.') || url.hostname.includes('cdnjs.') || url.hostname.includes('unpkg.')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Check if cache is older than 7 days
          const cacheDate = new Date(cachedResponse.headers.get('date'));
          const now = new Date();
          const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);
          
          if (daysDiff < 7) {
            return cachedResponse;
          }
        }

        return fetch(request).then((response) => {
          // Cache successful responses (including opaque responses from CDN)
          if (response && (response.status === 200 || response.type === 'opaque')) {
            const responseClone = response.clone();
            caches.open(CDN_CACHE).then((cache) => {
              cache.put(request, responseClone).catch(err => {
                // Silently fail for opaque responses
                if (response.type !== 'opaque') {
                  console.log('CDN cache error:', err);
                }
              });
            });
          }
          return response;
        }).catch(() => cachedResponse || fetch(request));
      })
    );
    return;
  }

  // Local Assets - Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch(err => console.log('Asset cache error:', err));
          });
        }
        return response;
      });

      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return new Response('Offline - No cached version available', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    })
  );
});

// Activate & Remove Old Caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('🗑️  Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});