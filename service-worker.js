/* ═══════════════════════════════════════════════════════
   VELOZ TÊNIS — SERVICE WORKER (PWA)
   Gerencia o cache de arquivos para carregamento rápido
   e permite que o site funcione offline.
   ═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'veloztenis-v7'; 

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
  './images/veloz-logo.png',
  './images/veloz-tenis-escrita.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Precache start');
      return cache.addAll(STATIC_ASSETS);
    })
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
  // Ignora requisições de outras origens ou que não sejam GET
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  // Ignora APIs de terceiros e fontes
  if (e.request.url.includes('viacep.com.br')) return;
  if (e.request.url.includes('fonts.googleapis') || e.request.url.includes('fonts.gstatic')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Se estiver no cache, retorna. Caso contrário, busca na rede.
      return cached || fetch(e.request).catch(() => {
        // Fallback: se for uma navegação de página, retorna o index.html
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    }).catch(() => {
      // Se tudo falhar, retorna erro básico do navegador
      return fetch(e.request);
    })
  );
});
