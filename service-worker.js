const CACHE_NAME = 'elbowcare-v6';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Handle video range requests for offline playback
  if (req.headers.get('range')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req.url.replace(self.location.origin, '').split('?')[0]).then(cached => {
          if (!cached) return fetch(req);
          return cached.arrayBuffer().then(buffer => {
            const range = req.headers.get('range');
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : buffer.byteLength - 1;
            const chunk = buffer.slice(start, end + 1);
            return new Response(chunk, {
              status: 206,
              statusText: 'Partial Content',
              headers: {
                'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                'Content-Length': chunk.byteLength,
                'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
              }
            });
          });
        })
      )
    );
    return;
  }

  // Normal requests
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});