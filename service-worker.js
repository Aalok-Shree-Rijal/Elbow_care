const CACHE_NAME = 'elbowcare-v5';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './exercise1.mp4',
  './exercise2.mp4',
  './exercise3.mp4',
  './exercise4.mp4',
  './buzzer.mp3',
];

self.addEventListener('install', event => {
  console.log('[SW] Installing cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching files');
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('[SW] All files cached successfully');
    }).catch(err => {
      console.error('[SW] Cache failed:', err);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => {
        console.log('[SW] Deleting old cache:', key);
        return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('[SW] Serving from cache:', event.request.url);
        return response;
      }
      return fetch(event.request);
    })
  );
});
