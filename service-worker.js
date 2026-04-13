/* ═══════════════════════════════════════════════════════
   VELOZ TÊNIS — SERVICE WORKER (PWA)
   Gerencia o cache de arquivos para carregamento rápido
   e permite que o site funcione offline.
   ═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'veloztenis-v6'; // Versão atualizada com logo.png correto

const STATIC_ASSETS = [
  './',                
  './index.html',
  './html/catalogo.html',
  './html/produto.html',
  './html/carrinho.html',
  './html/checkout.html',
  './html/sucesso.html',
  './html/wishlist.html',
  './css/styles.css',
  './js/app.js',
  './js/animations.js',
  './js/produtos.js',
  './json/manifest.json',
  './images/logo.png',
  './images/veloz-tenis-escrita.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('viacep.com.br')) return;
  if (e.request.url.includes('fonts.googleapis') || e.request.url.includes('fonts.gstatic')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
