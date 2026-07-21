const CACHE_NAME = 'ahmad-suite-cache-v2'; // Cache version incremented
const ASSETS = [
  './',
  'index.html',
  'quotation.html',
  'invoice.html',
  'receipt.html',
  'delivery_note.html', // Caching the delivery note module
  'manifest.json',
  'Ahmad_Aluminium_Logo.png',
  'Signature-Ahmad.png',
  'Stamp-Ahmad.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore Google APIs and Sheets database responses to prevent CORS issues
  if (event.request.url.includes('google.com') || event.request.url.includes('googleusercontent.com')) {
    return;
  }
  
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
