const CACHE_NAME = 'studyflow-v2'; // ভার্সন পরিবর্তন করা হয়েছে

// অ্যাপের নিজস্ব এবং বাইরের লাইব্রেরি (CDN) সব ক্যাশ করা হবে
const urlsToCache = [
  '/',
  '/index.html',
  '/Assets/style.css',
  '/Assets/script.js',
  '/manifest.json',
  '/Assets/brain-duotone.png', // আইকনটিও যোগ করা হলো
  
  // --- External Libraries (CDNs) ---
  // এগুলো ক্যাশ করলে লোডিং সুপারফাস্ট হবে
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.socket.io/4.7.2/socket.io.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // নতুন সার্ভিস ওয়ার্কার দ্রুত একটিভ হবে
});

// Fetch Assets (Cache First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // ১. যদি ক্যাশে থাকে, সেখান থেকেই লোড করবে (সুপারফাস্ট)
        if (response) {
          return response;
        }
        
        // ২. না থাকলে নেটওয়ার্ক থেকে আনবে এবং ক্যাশে সেভ করে রাখবে (Runtime Caching)
        return fetch(event.request).then(
          (newResponse) => {
            // রেসপন্স ভ্যালিড কিনা চেক করা
            if(!newResponse || newResponse.status !== 200 || newResponse.type !== 'basic') {
              return newResponse;
            }

            // রেসপন্স ক্লোন করে ক্যাশে রাখা
            const responseToCache = newResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return newResponse;
          }
        ).catch(() => {
            // অফলাইনে থাকলে এবং পেজ লোড না হলে কিছু করার নেই (অথবা একটি অফলাইন পেজ দেখানো যেতে পারে)
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});