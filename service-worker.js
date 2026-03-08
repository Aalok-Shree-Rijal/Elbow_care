const CACHE_NAME = 'elbowcare-v2';
const urlsToCache = [
  '/Elbow_care/',
  '/Elbow_care/index.html',
  '/Elbow_care/app.js',
  '/Elbow_care/style.css',
  '/Elbow_care/manifest.json',
  '/Elbow_care/icon-192.png',
  '/Elbow_care/icon-512.png',
  '/Elbow_care/exercise1.mp4',
  '/Elbow_care/exercise2.mp4',
  '/Elbow_care/exercise3.mp4',
  '/Elbow_care/exercise4.mp4',
  '/Elbow_care/buzzer.mp3',
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