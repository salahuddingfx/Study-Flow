const CACHE_NAME = 'studyflow-v3';

// Only cache local assets, skip CDN URLs to avoid CORS issues
const urlsToCache = [
  './',
  './index.html',
  './Assets/style.css',
  './Assets/script.js',
  './manifest.json',
  './Assets/brain-duotone.png'
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

// Fetch Event - Network First for API, Cache First for Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API calls - Network First
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.pathname.includes('/api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response) return response;
          const responseClone = response.clone();
          // Only cache HTTP/HTTPS requests
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static Assets - Cache First
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseClone = response.clone();
          // Only cache HTTP/HTTPS requests
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        });
      })
      .catch(() => {
        return new Response('Offline - No cached version available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Activate & Remove Old Caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
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
