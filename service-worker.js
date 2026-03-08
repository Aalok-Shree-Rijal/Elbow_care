const CACHE_NAME = 'elbowcare-v1';
const urlsToCache = [
  '/Elbow_care/',
  '/Elbow_care/index.html',
  // add your CSS/JS files here too
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});