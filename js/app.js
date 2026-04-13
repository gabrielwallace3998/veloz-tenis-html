/* ═══════════════════════════════════════════════════════
   VELOZ TÊNIS — APP.JS v2.0
   Módulo principal da aplicação. Gerencia estado (Storage),
   Interface (UI), Carrinho, Checkout, e renderização dinâmica
   das páginas baseado no atributo data-page do HTML.
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════
   0. DETECÇÃO DE CAMINHO (Raiz vs Pasta HTML)
   ════════════════════════════════════════════════════════ */
// Detecta se estamos na raiz ou na pasta html/
const isHome = document.body.dataset && document.body.dataset.page === 'home';
const isInHtmlFolder = !isHome;
const PATH_PREFIX = isInHtmlFolder ? '' : 'html/'; // Para páginas dentro de html/
const ROOT_PREFIX = isInHtmlFolder ? '../' : ''; // Para voltar à raiz (index.html)
const ASSETS_PREFIX = isInHtmlFolder ? '../' : '';

// Normaliza caminhos de imagens dos produtos
function normalizeImagePath(imagePath) {
  // Remove ../ do início se existir e adiciona o ASSETS_PREFIX correto
  return imagePath.replace(/^\.\.\//, ASSETS_PREFIX);
}

/* ════════════════════════════════════════════════════════
   1. CONSTANTES & CONFIGURAÇÕES
   Define chaves do LocalStorage, mensagens promocionais
   e cupons disponíveis no sistema.
   ════════════════════════════════════════════════════════ */
// Chaves usadas para identificar cada coleção de dados no LocalStorage
const KEYS = {
  cart: 'vz_cart_v2',     // Identificador do Carrinho de compras
  wishlist: 'vz_wishlist_v2', // Identificador da Lista de favoritos
  order: 'vz_order_v2',    // Identificador do Último pedido realizado
  freight: 'vz_freight_v2',  // Identificador do Frete calculado
  coupon: 'vz_coupon_v2',   // Identificador do Cupom aplicado
  recent: 'vz_recent_v2'    // Identificador dos Produtos vistos recentemente
};

const PROMO_MESSAGES = [
  '⚡ Frete grátis em compras acima de R$ 499 — use FRETEGRATIS',
  '🔥 Cupom VELOZ10 — 10% OFF na sua primeira compra',
  '🚀 Lançamentos neon toda semana — confira o catálogo',
  '💳 Parcele em até 12x sem juros no cartão',
  '🌟 Mais de 300 avaliações 5 estrelas — compre com confiança'
];

// Dicionário de cupons com regras de cálculo
const COUPONS = {
  VELOZ10: { type: 'percent', value: 0.10, label: '10% OFF' },
  ESTUDOS15: { type: 'percent', value: 0.15, label: '15% OFF' },
  RUN5: { type: 'percent', value: 0.05, label: '5% OFF' },
  FRETEGRATIS: { type: 'shipping', value: 1, label: 'Frete Grátis' },
  ULTRA20: { type: 'percent', value: 0.20, label: '20% OFF' }
};

/* ════════════════════════════════════════════════════════
   2. MÓDULO DE STORAGE (ARMAZENAMENTO)
   Abstração do localStorage para facilitar a leitura e gravação
   de dados, evitando repetição de JSON.parse e JSON.stringify.
   ════════════════════════════════════════════════════════ */
const Storage = {
  // Busca e converte dados do LocalStorage para objeto JS
  get: key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  // Converte objeto JS para string e salva no LocalStorage
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  // Remove uma chave específica do armazenamento local
  remove: key => localStorage.removeItem(key),

  getCart: () => Storage.get(KEYS.cart) || [],
  saveCart: cart => { Storage.set(KEYS.cart, cart); UI.updateCartBadge(); }, // Atualiza badge ao salvar
  getWishlist: () => Storage.get(KEYS.wishlist) || [],
  saveWishlist: list => { Storage.set(KEYS.wishlist, list); UI.updateWishlistBadge(); },
  getOrder: () => Storage.get(KEYS.order),
  saveOrder: order => Storage.set(KEYS.order, order),
  getFreight: () => Storage.get(KEYS.freight) || { cep: '', value: 0 },
  saveFreight: data => Storage.set(KEYS.freight, data),
  getCoupon: () => Storage.get(KEYS.coupon),
  saveCoupon: data => Storage.set(KEYS.coupon, data),
  getRecent: () => Storage.get(KEYS.recent) || [],

  // Adiciona item ao histórico de recentes (mantém no máximo 2 itens)
  addRecent: (id) => {
    let recent = Storage.getRecent().filter(x => x !== id); // Remove duplicata
    recent.unshift(id); // Adiciona no início
    if (recent.length > 2) recent = recent.slice(0, 2);
    Storage.set(KEYS.recent, recent);
  },
  // Limpa frete e cupons após finalizar compra
  clearOrderExtras: () => {
    Storage.remove(KEYS.freight);
    Storage.remove(KEYS.coupon);
  }
};

/* ════════════════════════════════════════════════════════
   3. MÓDULO DE UI (INTERFACE DO USUÁRIO)
   Controla notificações (Toasts), modais, formatação de moedas
   e atualização visual de contadores (badges).
   ════════════════════════════════════════════════════════ */
const UI = {
  // Notificações flutuantes temporárias no canto da tela
  toast(msg, type = 'info', duration = 3500) {
    const icons = { success: '✅', error: '❌', info: '⚡', warning: '⚠️' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || '⚡'}</span><span>${msg}</span>`;
    container.appendChild(t);
    // Animação de saída
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 350);
    }, duration);
  },

  // Modal genérico para alertas e confirmações
  modal({ title = 'Aviso', message = '', primaryText = 'Ok', primaryHref = '', secondaryText = 'Fechar', onPrimary = null }) {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = `
      <div class="modal-overlay" id="vz-modal">
        <div class="modal-card">
          <button class="modal-close" id="modal-close-btn">✕</button>
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="modal-actions">
            ${primaryHref
        ? `<a href="${primaryHref}" class="btn-primary">${primaryText}</a>`
        : `<button class="btn-primary" id="modal-primary-btn">${primaryText}</button>`
      }
            <button class="btn-outline" id="modal-secondary-btn">${secondaryText}</button>
          </div>
        </div>
      </div>`;

    const close = () => { root.innerHTML = ''; };
    document.getElementById('modal-close-btn')?.addEventListener('click', close);
    document.getElementById('modal-secondary-btn')?.addEventListener('click', close);
    document.getElementById('modal-primary-btn')?.addEventListener('click', () => {
      close();
      if (onPrimary) onPrimary();
    });
    // Fecha ao clicar fora ou apertar ESC
    document.getElementById('vz-modal')?.addEventListener('click', e => {
      if (e.target.id === 'vz-modal') close();
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  },

  // Atualiza a bolinha numérica (badge) do ícone de carrinho no header e na barra inferior
  updateCartBadge() {
    const cart = Storage.getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0); // Soma todas as quantidades
    document.querySelectorAll('#cart-count, .cart-count').forEach(el => {
      el.textContent = count; // Define o número visível
      // Efeito visual de pulso (escala) para dar feedback de mudança
      el.style.transform = 'scale(1.4)';
      setTimeout(() => { el.style.transform = ''; }, 250);
    });
    document.querySelectorAll('.bottom-bar-cart-badge').forEach(el => { el.textContent = count; });
  },

  // Atualiza o contador de favoritos no menu
  updateWishlistBadge() {
    const list = Storage.getWishlist();
    document.querySelectorAll('.wishlist-badge').forEach(el => {
      el.textContent = list.length; // Define a quantidade de itens favoritados
      el.style.display = list.length ? '' : 'none'; // Oculta se a lista estiver vazia
    });
  },

  // Formata números para o padrão monetário brasileiro (R$)
  formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  // Calcula a porcentagem de desconto baseada no preço antigo e atual
  formatDiscount(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return '';
    const pct = Math.round((1 - price / oldPrice) * 100);
    return `−${pct}%`;
  },

  // Transforma nota (ex: 4.5) em string de estrelas (★★★★⯨)
  starsHTML(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
  }
};

/* ════════════════════════════════════════════════════════
   4. BARRA PROMOCIONAL
   Alterna mensagens no topo do site usando um timer.
   ════════════════════════════════════════════════════════ */
function buildPromoBar() {
  const root = document.getElementById('promo-bar');
  if (!root) return;

  root.className = 'promo-bar';
  root.innerHTML = `
    <div class="promo-wrap">
      <p class="promo-text" id="promo-text">${PROMO_MESSAGES[0]}</p>
      <div class="promo-dots" id="promo-dots">
        ${PROMO_MESSAGES.map((_, i) => `<button class="promo-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`).join('')}
      </div>
    </div>`;

  let idx = 0;
  const dots = root.querySelectorAll('.promo-dot');

  function rotate(newIdx) {
    idx = newIdx;
    const txt = document.getElementById('promo-text');
    if (txt) {
      // Força o reflow (reset) da animação CSS
      txt.style.animation = 'none';
      txt.offsetWidth;
      txt.style.animation = '';
      txt.textContent = PROMO_MESSAGES[idx];
    }
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  dots.forEach(d => d.addEventListener('click', () => rotate(+d.dataset.idx)));
  // Rotaciona automaticamente a cada 4 segundos
  const timer = setInterval(() => rotate((idx + 1) % PROMO_MESSAGES.length), 4000);
  root._promoTimer = timer;
}

/* ════════════════════════════════════════════════════════
   5. HEADER (CABEÇALHO)
   Injeta o cabeçalho dinamicamente e gerencia a barra de busca.
   ════════════════════════════════════════════════════════ */
function buildHeader() {
  const root = document.getElementById('site-header');
  if (!root) return;

  const page = document.body.dataset.page;
  const q = new URLSearchParams(window.location.search).get('q') || ''; // Recupera termo de busca
  const cartCount = Storage.getCart().reduce((s, i) => s + i.quantity, 0);

  const navLinks = [
    { href: `${ROOT_PREFIX}index.html`, label: 'Home', key: 'home' },
    { href: `${PATH_PREFIX}catalogo.html`, label: 'Catálogo', key: 'catalogo' },
    { href: `${PATH_PREFIX}wishlist.html`, label: '❤️ Favoritos', key: 'wishlist' },
  ];

  root.className = 'site-header';
  root.innerHTML = `
    <div class="header-wrap" style="padding: 0 24px;">
      <a href="${ROOT_PREFIX}index.html" class="logo" title="Ir para o Início" style="display: flex; align-items: center; gap: 4px;">
        <img src="${ASSETS_PREFIX}images/veloz-logo.png" alt="Logo" style="height: 50px; width: auto; object-fit: contain;">
        <img src="${ASSETS_PREFIX}images/veloz-tenis-escrita.png" alt="Veloz Tênis" style="height: 38px; width: auto; object-fit: contain;">
      </a>

      <div class="header-center">
        <nav class="main-nav">
          ${navLinks.map(l => `<a href="${l.href}" class="${page === l.key ? 'active' : ''}">${l.label}</a>`).join('')}
        </nav>

        <form class="search-form" id="header-search-form">
          <input type="text" id="header-search-input" placeholder="Buscar por nome, marca..." value="${q}" autocomplete="off" />
          <button type="submit" class="search-btn" aria-label="Buscar">⌕</button> <!-- Botão de lupa para busca -->
        </form>
      </div>

      <div class="header-actions">
        <a class="cart-btn" href="${PATH_PREFIX}carrinho.html" aria-label="Carrinho" id="header-cart-btn">
          🛒 Carrinho
          <span class="cart-count" id="cart-count">${cartCount}</span>
        </a>
        <button class="hamburger" id="hamburger-btn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>`;

  const form = document.getElementById('header-search-form');
  const input = document.getElementById('header-search-input');
  const ham = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const term = input.value.trim();
    window.location.href = term ? `${PATH_PREFIX}catalogo.html?q=${encodeURIComponent(term)}` : `${PATH_PREFIX}catalogo.html`;
  });

  // Toggle do menu mobile
  ham?.addEventListener('click', () => {
    ham.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    // Trava o scroll da página quando o menu estiver aberto
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });

  // Abre a gaveta lateral (Mini Cart) ao invés de redirecionar para página do carrinho (exceto se já estiver nela)
  if (page !== 'carrinho') {
    document.getElementById('header-cart-btn')?.addEventListener('click', e => {
      e.preventDefault();
      openMiniCart();
    });
  }
}


/* ════════════════════════════════════════════════════════
   6. BOTTOM BAR (MOBILE NAV)
   Barra fixa inferior estilo aplicativo nativo.
   ════════════════════════════════════════════════════════ */
function buildBottomBar() {
  const bar = document.getElementById('bottom-bar');
  if (!bar) return;

  const page = document.body.dataset.page;
  const cartCount = Storage.getCart().reduce((s, i) => s + i.quantity, 0);
  const wishCount = Storage.getWishlist().length;

  bar.innerHTML = `
    <a href="${ROOT_PREFIX}index.html" class="bottom-bar-item ${page === 'home' ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9L12 2l9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      Home
    </a>
    <a href="${PATH_PREFIX}catalogo.html" class="bottom-bar-item ${page === 'catalogo' ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      Catálogo
    </a>
    <a href="${PATH_PREFIX}wishlist.html" class="bottom-bar-item ${page === 'wishlist' ? 'active' : ''}" style="position:relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
      ${wishCount > 0 ? `<span class="badge wishlist-badge">${wishCount}</span>` : ''}
      Favoritos
    </a>
    <a href="${PATH_PREFIX}carrinho.html" class="bottom-bar-item ${page === 'carrinho' ? 'active' : ''}" style="position:relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 001.97 1.61h9.72a2 2 0 001.97-1.61L23 6H6"/>
      </svg>
      ${cartCount > 0 ? `<span class="badge bottom-bar-cart-badge">${cartCount}</span>` : ''}
      Carrinho
    </a>`;
}

/* ════════════════════════════════════════════════════════
   7. FOOTER (RODAPÉ)
   ════════════════════════════════════════════════════════ */
function buildFooter() {
  const root = document.getElementById('site-footer');
  if (!root) return;
  root.className = 'footer-area';
  root.innerHTML = `
    <div class="footer-box container">
      <div class="footer-grid">
        <div>
          <div style="margin-bottom:16px; display:inline-flex; align-items:center; gap:12px;">
            <a href="${ROOT_PREFIX}index.html" class="logo" title="Ir para o Início" style="display:inline-flex; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <img src="${ASSETS_PREFIX}images/logo.png" alt="Veloz Tênis Ícone" style="height: 80px; width: auto; object-fit: contain;">
            </a>
            <img src="${ASSETS_PREFIX}images/veloz-tenis-escrita.png" alt="Veloz Tênis Escrita" style="height: 30px; width: auto; max-width: 100%; object-fit: contain;">
          </div>
          <p class="footer-text">
            Projeto feito para estudos 100% front-end, catálogo dinâmico,
            carrinho inteligente, checkout validado e persistência via localStorage.
          </p>
        </div>
        <div>
          <h4 class="footer-title">Navegação</h4>
          <div class="footer-links">
            <a href="${ROOT_PREFIX}index.html">Home</a>
            <a href="${PATH_PREFIX}catalogo.html">Catálogo</a>
            <a href="${PATH_PREFIX}wishlist.html">Favoritos</a>
            <a href="${PATH_PREFIX}carrinho.html">Carrinho</a>
            <a href="${PATH_PREFIX}checkout.html">Checkout</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Contato</h4>
          <div class="footer-links">
            <span>contato@veloztenis.com</span>
            <span>(11) 99999-0000</span>
            <span>São Paulo — Brasil</span>
            <span>Seg–Sex 9h–18h</span>
          </div>
        </div>
      </div>
      <div class="footer-copy">
        <span>© 2026 Veloz Tênis — Projeto 100% Front-End Desenvolvido por Gabriel Lima</span>
        <span>Cupons: VELOZ10 · ESTUDOS15 · RUN5 · FRETEGRATIS · ULTRA20</span>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════
   8. MINI CART DRAWER
   Gaveta lateral que mostra o resumo do carrinho.
   ════════════════════════════════════════════════════════ */
function openMiniCart() {
  const root = document.getElementById('mini-cart-root');
  if (!root) return;

  const cart = Storage.getCart();
  const totals = calcTotals(cart);

  // Renderiza itens ou estado vazio
  const itemsHTML = cart.length
    ? cart.map(item => `
        <div class="mini-cart-item">
          <img src="${normalizeImagePath(item.image)}" alt="${item.name}" />
          <div>
            <h4>${item.name}</h4>
            <small>${item.brand} · Tam. ${item.size} · Qtd. ${item.quantity}</small>
            <button class="remove-mini btn-danger btn-sm" data-id="${item.id}" data-size="${item.size}">🗑 Remover</button>
          </div>
          <strong>${UI.formatCurrency(item.price * item.quantity)}</strong>
        </div>`).join('')
    : `<div class="empty-state" style="padding:40px 20px; border:none; background:transparent">
        <div class="empty-icon">🛒</div>
        <h2 style="font-size:1.2rem; margin-top:12px">Carrinho vazio</h2>
        <p>Adicione produtos para vê-los aqui.</p>
      </div>`;

  root.innerHTML = `
    <div class="drawer-overlay" id="drawer-overlay"></div>
    <div class="mini-cart">
      <div class="mini-cart-header">
        <h3>🛒 Seu carrinho (${cart.reduce((s, i) => s + i.quantity, 0)})</h3>
        <button class="modal-close" id="close-mini-cart">✕</button>
      </div>
      <div class="mini-cart-body">${itemsHTML}</div>
      ${cart.length ? `
      <div class="mini-cart-footer">
        <div class="mini-cart-total">
          <span>Total</span>
          <strong>${UI.formatCurrency(totals.total)}</strong>
        </div>
        <a href="${PATH_PREFIX}carrinho.html" class="btn-outline btn-full">Ver carrinho</a>
        <a href="${PATH_PREFIX}checkout.html" class="btn-primary btn-full">Finalizar compra →</a>
      </div>` : ''}
    </div>`;

  const close = () => { root.innerHTML = ''; document.body.style.overflow = ''; };
  document.getElementById('close-mini-cart')?.addEventListener('click', close);
  document.getElementById('drawer-overlay')?.addEventListener('click', close);

  // Adiciona o evento de remoção para o botão de cada item no Mini Cart
  root.querySelectorAll('.remove-mini').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id; // Converte ID para número
      const size = btn.dataset.size; // Pega o tamanho do produto
      // Filtra o carrinho removendo apenas o item com ID e Tamanho correspondentes
      const cart = Storage.getCart().filter(i => !(i.id === id && i.size === size));
      Storage.saveCart(cart); // Salva no LocalStorage
      close(); // Fecha o drawer
      if (cart.length) setTimeout(openMiniCart, 100); // Reabre se ainda houver itens para atualizar a lista
      UI.toast('Produto removido do carrinho.', 'info');
    });
  });

  document.body.style.overflow = 'hidden'; // Evita rolagem da página atrás do drawer
}

/* ════════════════════════════════════════════════════════
   9. FACTORY DE CARDS DE PRODUTO
   Função reutilizável para renderizar um card de tênis.
   ════════════════════════════════════════════════════════ */
function createProductCard(product, showQuickView = true) {
  const wishlist = Storage.getWishlist();
  const inWL = wishlist.includes(product.id);
  const discount = UI.formatDiscount(product.price, product.oldPrice);

  return `
    <article class="product-card reveal" data-product-id="${product.id}">
      <!-- Link para a página interna do produto -->
      <a href="${PATH_PREFIX}produto.html?id=${product.id}" class="product-thumb">
        <img src="${normalizeImagePath(product.images[0])}" alt="${product.name}" loading="lazy" />
        <span class="product-badge">${product.badge}</span> <!-- Etiqueta promocional -->
        <span class="viewers-badge">👁 <strong class="viewers-count">${Math.floor(10 + product.reviews * 0.08)}</strong> vendo agora</span>
        <button class="wishlist-btn ${inWL ? 'active' : ''}" data-wl="${product.id}" aria-label="Favoritar">
          ${inWL ? '❤️' : '🤍'} <!-- Ícone de coração preenchido se já for favorito -->
        </button>
        ${showQuickView ? `<button class="btn-cyan btn-sm quick-view-btn" data-qv="${product.id}">⚡ Quick View</button>` : ''}
      </a>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="stars">
          <span class="stars-icons">${UI.starsHTML(product.rating)}</span> <!-- Gera as estrelas via JS -->
          <span class="stars-count">${product.rating} (${product.reviews})</span>
        </div>
        <p class="product-desc">${product.description}</p>
        <div class="product-bottom">
          <div class="price-wrap">
            <span class="price-old">${UI.formatCurrency(product.oldPrice)}</span> <!-- Preço de antes -->
            <strong class="price-current">${UI.formatCurrency(product.price)}</strong> <!-- Preço atual -->
            ${discount ? `<span class="price-discount">${discount}</span>` : ''}
          </div>
          <a href="${PATH_PREFIX}produto.html?id=${product.id}" class="btn-outline btn-sm">Detalhes</a>
        </div>
      </div>
    </article>`;
}

/* ════════════════════════════════════════════════════════
   10. QUICK VIEW MODAL
   Abre um pop-up com detalhes do produto e opção de compra
   rápida sem precisar acessar a página (PDP) principal.
   ════════════════════════════════════════════════════════ */
function openQuickView(id) {
  const p = PRODUTOS.find(x => x.id === +id);
  if (!p) return;

  const root = document.getElementById('modal-root');
  if (!root) return;

  root.innerHTML = `
    <div class="quickview-overlay" id="qv-overlay">
      <div class="quickview-card">
        <button class="quickview-close" id="qv-close">✕</button>
        <div class="quickview-layout">
          <div class="quickview-img">
            <img src="${normalizeImagePath(p.images[0])}" alt="${p.name}" id="qv-main-img" />
          </div>
          <div>
            <span class="eyebrow">${p.brand}</span>
            <h2 style="font-size:1.8rem; margin:12px 0 10px; line-height:1">${p.name}</h2>
            <div class="stars" style="margin-bottom:12px">
              <span class="stars-icons">${UI.starsHTML(p.rating)}</span>
              <span class="stars-count">${p.rating} (${p.reviews} avaliações)</span>
            </div>
            <p style="color:var(--muted); margin-bottom:18px; line-height:1.6">${p.description}</p>
            <div class="pdp-price" style="margin-bottom:18px">
              <strong>${UI.formatCurrency(p.price)}</strong>
              <del style="color:rgba(255,255,255,0.38)">${UI.formatCurrency(p.oldPrice)}</del>
              <span class="price-discount">${UI.formatDiscount(p.price, p.oldPrice)}</span>
            </div>
            <div class="size-area">
              <h4>Tamanho</h4>
              <div class="sizes-grid" id="qv-sizes">
                ${p.sizes.map(s => `<button class="size-chip" data-size="${s}">${s}</button>`).join('')}
              </div>
              <p class="size-feedback" id="qv-feedback">Selecione um tamanho.</p>
            </div>
            <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:20px">
              <button class="btn-primary" id="qv-add-btn">Adicionar ao carrinho</button>
              <a href="${PATH_PREFIX}produto.html?id=${p.id}" class="btn-outline">Ver página completa</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  let selectedSize = null;

  const close = () => { root.innerHTML = ''; document.body.style.overflow = ''; };
  document.getElementById('qv-close')?.addEventListener('click', close);
  document.getElementById('qv-overlay')?.addEventListener('click', e => { if (e.target.id === 'qv-overlay') close(); });

  // Seleção de tamanho
  root.querySelectorAll('.size-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.size-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
      document.getElementById('qv-feedback').textContent = `Tamanho ${selectedSize} selecionado.`;
      document.getElementById('qv-feedback').style.color = 'var(--green)';
    });
  });

  // Validação e envio do produto para o carrinho após selecionar o tamanho
  document.getElementById('qv-add-btn')?.addEventListener('click', (e) => {
    if (!selectedSize) {
      // Se não selecionar o tamanho, aplica estilo de erro visual nos chips
      root.querySelectorAll('.size-chip').forEach(b => b.classList.add('error'));
      document.getElementById('qv-feedback').textContent = 'Selecione um tamanho!';
      document.getElementById('qv-feedback').style.color = 'var(--danger)';
      return;
    }
    // Chama a função principal de adicionar ao carrinho enviando os dados do produto selecionado
    addToCart({ id: p.id, brand: p.brand, name: p.name, image: p.images[0], price: p.price, size: selectedSize }, e.target);
    close(); // Fecha o Quick View após adicionar
  });

  document.body.style.overflow = 'hidden';
}

/* ════════════════════════════════════════════════════════
   11. LÓGICA CORE DO CARRINHO (CART LOGIC)
   Adição de itens e cálculos financeiros complexos.
   ════════════════════════════════════════════════════════ */
function addToCart(item, sourceEl = null) {
  const cart = Storage.getCart(); // Busca o carrinho atual no LocalStorage
  // Verifica se o mesmo produto E tamanho já está no carrinho
  const existing = cart.find(i => i.id === item.id && i.size === item.size);
  if (existing) {
    existing.quantity += 1;
  } else {
    // Se não existir, adiciona o novo item com quantidade 1
    cart.push({ ...item, quantity: 1 });
  }
  Storage.saveCart(cart); // Salva o carrinho atualizado
  // Dispara animação visual do botão voando para o ícone no header
  if (sourceEl && window.VZAnimations?.flyToCart) VZAnimations.flyToCart(sourceEl);
  UI.toast(`${item.name} adicionado ao carrinho! 🛒`, 'success');
}

// Calcula todos os valores do pedido (subtotal, frete, descontos e total final)
function calcTotals(cart) {
  const freightData = Storage.getFreight(); // Busca dados de frete salvos
  const couponData = Storage.getCoupon();  // Busca dados de cupom salvos
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0); // Soma dos itens
  const freight = Number(freightData?.value || 0);

  let discount = 0;
  // Aplica desconto se for cupom de porcentagem
  if (couponData?.type === 'percent') discount = subtotal * couponData.value;
  // Zera o frete se o cupom for de Frete Grátis
  if (couponData?.type === 'shipping') discount = freight;

  // Total final garantindo que nunca seja negativo
  const total = Math.max(0, subtotal + freight - discount);
  return { subtotal, freight, discount, total, couponData, freightData };
}

// Simulação de cálculo de frete baseado no último dígito do CEP
function calcFreight(cep) {
  const d = cep.replace(/\D/g, '');
  if (d.length !== 8) return 0;
  return Number((14.9 + (+d.slice(-1)) * 2.35).toFixed(2));
}

/* ════════════════════════════════════════════════════════
   12. PÁGINA INICIAL (HOME PAGE)
   Renderiza a vitrine principal, seções dinâmicas e 
   histórico de últimos produtos vistos.
   ════════════════════════════════════════════════════════ */
function renderHome() {
  const showcase = document.getElementById('home-showcase');
  const recentGrid = document.getElementById('recently-viewed-grid');
  const recentSec = document.getElementById('recently-viewed-section');

  if (!showcase) return;

  const showcaseProducts = PRODUTOS.slice(0, 8);

  // Renderiza a Vitrine (Grid)
  showcase.innerHTML = showcaseProducts.map(p => createProductCard(p)).join('');


  // Vistos Recentemente
  const recentIds = Storage.getRecent();
  if (recentIds.length && recentSec && recentGrid) {
    recentSec.style.display = ''; // Exibe a seção
    const recentProducts = recentIds.map(id => PRODUTOS.find(p => p.id === id)).filter(Boolean);
    recentGrid.innerHTML = recentProducts.map(p => createProductCard(p)).join('');
  }

  attachCardListeners(); // Ativa os botões ❤️ e Quick View dos cards criados
}

/* ════════════════════════════════════════════════════════
   13. PÁGINA DE CATÁLOGO (FILTROS)
   Gerencia pesquisa, filtros dinâmicos, ordenação e toggle
   de visualização (grade / lista).
   ════════════════════════════════════════════════════════ */
function renderCatalog() {
  const section = document.getElementById('catalog-page');
  if (!section) return;

  // Lendo o estado inicial a partir da URL
  const params = new URLSearchParams(window.location.search);
  const state = {
    search: (params.get('q') || '').toLowerCase().trim(),
    brand: params.get('brand') || 'all',
    cat: 'all',
    sort: 'default',
    maxPrice: 1800,
    view: 'grid4'
  };

  section.innerHTML = `
    <div class="catalog-toolbar reveal">
      <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; flex:1">
        
        <div class="filter-chips" id="brand-chips">
          <button class="filter-chip ${state.brand === 'all' ? 'active' : ''}" data-brand="all">Todos</button>
          ${[...new Set(PRODUTOS.map(p => p.brand))].map(b =>
    `<button class="filter-chip ${state.brand === b ? 'active' : ''}" data-brand="${b}">${b}</button>`
  ).join('')}
        </div>
        
        <div class="filter-chips" id="cat-chips">
          ${[...new Set(PRODUTOS.map(p => p.category))].map(c =>
    `<button class="filter-chip" data-cat="${c}">${c}</button>`
  ).join('')}
        </div>
        
        <div class="filter-chips" id="sort-chips">
          <button class="filter-chip active" data-sort="default">Relevância</button>
          <button class="filter-chip" data-sort="lowest">Menor preço</button>
          <button class="filter-chip" data-sort="highest">Maior preço</button>
          <button class="filter-chip" data-sort="rating">Melhor avaliado</button>
          <button class="filter-chip" data-sort="az">A–Z</button>
        </div>
        
        <div class="price-range-filter">
          <label>Até</label>
          <input type="range" id="price-range" min="300" max="1800" step="50" value="1800" />
          <span class="price-display" id="price-display">R$ 1.800</span>
        </div>
      </div>
      
      <div style="display:flex; gap:12px; align-items:center">
        <span class="result-count" id="result-count"></span>
        <div class="view-toggle">
          <button class="view-btn active" data-view="grid4" title="Grid 4">▦</button>
          <button class="view-btn" data-view="grid2" title="Grid 2">⊞</button>
          <button class="view-btn" data-view="list" title="Lista">☰</button>
        </div>
      </div>
    </div>
    <div id="catalog-grid" class="product-grid" style="margin-top:8px">
      ${window.VZAnimations?.skeleton ? VZAnimations.skeleton(8) : ''}
    </div>`;

  const grid = section.querySelector('#catalog-grid');
  const resultEl = section.querySelector('#result-count');
  const priceRange = section.querySelector('#price-range');
  const priceDisp = section.querySelector('#price-display');

  // Função central para aplicar filtros e renderizar a tela
  function update() {
    let items = [...PRODUTOS];

    // Filtragem
    if (state.search) items = items.filter(p => `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(state.search));
    if (state.brand !== 'all') items = items.filter(p => p.brand === state.brand);
    if (state.cat !== 'all') items = items.filter(p => p.category === state.cat);
    items = items.filter(p => p.price <= state.maxPrice);

    // Ordenação
    if (state.sort === 'lowest') items.sort((a, b) => a.price - b.price);
    if (state.sort === 'highest') items.sort((a, b) => b.price - a.price);
    if (state.sort === 'rating') items.sort((a, b) => b.rating - a.rating);
    if (state.sort === 'az') items.sort((a, b) => a.name.localeCompare(b.name));

    resultEl.textContent = `${items.length} produto${items.length !== 1 ? 's' : ''}`;

    if (!items.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🔍</div>
          <h2>Nenhum produto encontrado</h2>
          <p>Tente outros filtros ou termos de busca.</p>
          <button class="btn-outline" id="clear-filters">Limpar filtros</button>
        </div>`;
      section.querySelector('#clear-filters')?.addEventListener('click', () => {
        state.brand = 'all'; state.cat = 'all'; state.search = ''; state.maxPrice = 1800;
        section.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        section.querySelectorAll('[data-brand="all"], [data-sort="default"]').forEach(c => c.classList.add('active'));
        if (priceRange) priceRange.value = 1800;
        if (priceDisp) priceDisp.textContent = 'R$ 1.800';
        update();
      });
    } else {
      const viewClass = { grid4: 'product-grid', grid2: 'product-grid cols-2', list: 'product-grid list' };
      grid.className = viewClass[state.view] || 'product-grid';
      grid.innerHTML = items.map(p => createProductCard(p)).join('');
      attachCardListeners();
    }
  }

  // Listeners dos botões de filtro (Delegação de eventos)
  section.querySelectorAll('[data-brand]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.brand = btn.dataset.brand;
      section.querySelectorAll('[data-brand]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });
  });

  section.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const same = btn.classList.contains('active');
      section.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
      if (!same) { btn.classList.add('active'); state.cat = btn.dataset.cat; }
      else state.cat = 'all'; // Toggle off (Desmarca a categoria se clicar nela mesma)
      update();
    });
  });

  section.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.dataset.sort;
      section.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });
  });

  section.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      section.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });
  });

  priceRange?.addEventListener('input', () => {
    state.maxPrice = +priceRange.value;
    priceDisp.textContent = `R$ ${(+priceRange.value).toLocaleString('pt-BR')}`;
    update();
  });

  // Aplica estado vindo da URL (ex: acessou via vitrine de "Nike")
  if (state.brand !== 'all') {
    section.querySelectorAll(`[data-brand="${state.brand}"]`).forEach(b => {
      section.querySelectorAll('[data-brand]').forEach(c => c.classList.remove('active'));
      b.classList.add('active');
    });
  }

  // Simula loading skeleton
  setTimeout(update, 350);
}

/* ════════════════════════════════════════════════════════
   14. PRODUCT PAGE (PÁGINA DE DETALHES DO PRODUTO)
   Exibe galeria com zoom, seletor de cores e tamanhos,
   avaliações com barras de progresso e barra "sticky".
   ════════════════════════════════════════════════════════ */
function renderProductPage() {
  const section = document.getElementById('product-page');
  const sticky = document.getElementById('pdp-sticky');
  if (!section) return;

  const id = new URLSearchParams(window.location.search).get('id');
  const p = PRODUTOS.find(x => x.id === +id);

  if (!p) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👟</div>
        <h2>Produto não encontrado</h2>
        <p>O item que você procura não existe ou foi removido.</p>
        <a href="${PATH_PREFIX}catalogo.html" class="btn-primary">Voltar ao catálogo</a>
      </div>`;
    return;
  }

  Storage.addRecent(p.id); // Registra que o usuário viu este item

  const wishlist = Storage.getWishlist();
  const inWL = wishlist.includes(p.id);
  const discount = UI.formatDiscount(p.price, p.oldPrice);

  // Calcula % de avaliações (5 estrelas = X%, 4 estrelas = Y%)
  const ratingDist = [5, 4, 3, 2, 1].map(star => {
    const count = p.reviewsList.filter(r => r.rating === star).length;
    const pct = p.reviewsList.length ? Math.round(count / p.reviewsList.length * 100) : 0;
    return { star, pct };
  });

  section.innerHTML = `
    <div class="pdp-layout reveal">
      <div class="pdp-gallery">
        <div class="gallery-main" id="gallery-main">
          <button class="carousel-btn prev" id="gal-prev">‹</button>
          <img id="gal-img" src="${normalizeImagePath(p.images[0])}" alt="${p.name}" />
          <button class="carousel-btn next" id="gal-next">›</button>
        </div>
        <div class="gallery-thumbs">
          ${p.images.map((img, i) => `
            <button class="thumb-btn ${i === 0 ? 'active' : ''}" data-idx="${i}">
              <img src="${normalizeImagePath(img)}" alt="${p.name} ${i + 1}" loading="lazy" />
            </button>`).join('')}
        </div>
      </div>

      <div class="pdp-info">
        <span class="eyebrow">${p.brand} · ${p.category}</span>
        <h1>${p.name}</h1>
        <div class="stars" style="margin:10px 0">
          <span class="stars-icons">${UI.starsHTML(p.rating)}</span>
          <span class="stars-count">${p.rating} (${p.reviews} avaliações)</span>
        </div>
        <p style="color:var(--text-2); line-height:1.7">${p.description}</p>

        <div class="pdp-price">
          <strong id="pdp-price" data-price="${p.price}">${UI.formatCurrency(p.price)}</strong>
          <del>${UI.formatCurrency(p.oldPrice)}</del>
          ${discount ? `<span class="price-discount">${discount}</span>` : ''}
        </div>

        <div class="color-selector">
          <h4>Cor: <span id="selected-color">${p.colors[0].name}</span></h4>
          <div class="color-dots">
            ${p.colors.map((c, i) => `
              <button class="color-dot ${i === 0 ? 'active' : ''}"
                data-color="${c.name}" data-hex="${c.hex}"
                style="background:${c.hex}" title="${c.name}">
              </button>`).join('')}
          </div>
        </div>

        <div class="size-area">
          <h4>Tamanho</h4>
          <div class="sizes-grid" id="sizes-grid">
            ${p.sizes.map(s => `<button class="size-chip" data-size="${s}">${s}</button>`).join('')}
          </div>
          <p class="size-feedback" id="size-feedback">Selecione um tamanho para continuar.</p>
        </div>

        <div class="info-pills">
          <span class="info-pill">⚡ Entrega expressa</span>
          <span class="info-pill">🔒 Compra segura</span>
          <span class="info-pill">↩️ 30 dias para troca</span>
          <span class="info-pill">💳 12x sem juros</span>
        </div>

        <div class="pdp-actions">
          <button class="btn-primary btn-lg" id="btn-add-cart">🛒 Adicionar ao carrinho</button>
          <button class="btn-outline btn-lg" id="btn-buy-now">⚡ Comprar agora</button>
          <button class="icon-btn ${inWL ? 'btn-cyan' : ''}" id="btn-wishlist" aria-label="Favoritar" style="width:52px;height:52px">
            ${inWL ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="reviews-section">
          <h3 style="margin-bottom:20px">Avaliações dos clientes</h3>
          <div class="reviews-summary">
            <div>
              <div class="rating-big">${p.rating}</div>
              <div class="stars-icons" style="color:var(--yellow)">${UI.starsHTML(p.rating)}</div>
              <div style="color:var(--muted);font-size:0.82rem;margin-top:4px">${p.reviews} avaliações</div>
            </div>
            <div class="rating-bars">
              ${ratingDist.map(r => `
                <div class="rating-bar-row">
                  <span>${r.star}★</span>
                  <div class="rating-bar-track">
                    <div class="rating-bar-fill" style="width:${r.pct}%"></div>
                  </div>
                  <span>${r.pct}%</span>
                </div>`).join('')}
            </div>
          </div>
          <div class="review-list">
            ${p.reviewsList.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <span class="reviewer-name">${r.author}</span>
                  <div style="display:flex;align-items:center;gap:10px">
                    <span class="review-stars">${'★'.repeat(r.rating)}</span>
                    <span class="review-date">${r.date}</span>
                  </div>
                </div>
                <p class="review-text">${r.comment}</p>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  // Barra de Comprar "Sticky"
  if (sticky) {
    sticky.innerHTML = `
      <div class="pdp-sticky-info">
        <strong>${p.name}</strong>
        <small>${UI.formatCurrency(p.price)}</small>
      </div>
      <button class="btn-primary" id="sticky-add-btn">🛒 Adicionar ao carrinho</button>`;

    // IntersectionObserver exibe a barra quando o botão principal sai da tela
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      sticky.classList.toggle('visible', !visible);
    }, { threshold: 0.3 });
    observer.observe(section.querySelector('.pdp-actions'));

    document.getElementById('sticky-add-btn')?.addEventListener('click', () => {
      document.querySelector('.pdp-actions')?.scrollIntoView({ behavior: 'smooth' }); // Rola para os tamanhos
    });
  }

  // Lógica da Galeria (Carrossel)
  let currentIdx = 0;
  const galImg = document.getElementById('gal-img');
  const galleryMain = document.getElementById('gallery-main');
  const thumbBtns = section.querySelectorAll('.thumb-btn');

  function setImage(idx) {
    currentIdx = idx;
    galImg.src = normalizeImagePath(p.images[currentIdx]);
    thumbBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }

  document.getElementById('gal-prev')?.addEventListener('click', () =>
    setImage(currentIdx === 0 ? p.images.length - 1 : currentIdx - 1));
  document.getElementById('gal-next')?.addEventListener('click', () =>
    setImage(currentIdx === p.images.length - 1 ? 0 : currentIdx + 1));
  thumbBtns.forEach(b => b.addEventListener('click', () => setImage(+b.dataset.idx)));

  // Lógica de Zoom na Imagem com o Mouse
  galleryMain?.addEventListener('mousemove', e => {
    if (window.matchMedia('(hover:none)').matches) return; // Desativa no mobile
    const rect = galleryMain.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    galleryMain.style.setProperty('--mouse-x', x + '%');
    galleryMain.style.setProperty('--mouse-y', y + '%');
  });
  galleryMain?.addEventListener('click', () => {
    galleryMain.classList.toggle('zoomed');
  });

  // Seletor de Cores
  let selectedColor = p.colors[0].name;
  section.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      selectedColor = dot.dataset.color;
      section.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const el = document.getElementById('selected-color');
      if (el) el.textContent = selectedColor;
    });
  });

  // Seletor de Tamanhos
  let selectedSize = null;
  section.querySelectorAll('.size-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSize = btn.dataset.size;
      section.querySelectorAll('.size-chip').forEach(b => b.classList.remove('active', 'error'));
      btn.classList.add('active');
      const fb = document.getElementById('size-feedback');
      if (fb) { fb.textContent = `Tamanho ${selectedSize} selecionado. ✓`; fb.style.color = 'var(--green)'; }
    });
  });

  // Adicionar ao Carrinho (Com ou sem Redirecionamento)
  function tryAddToCart(goCheckout = false, el = null) {
    if (!selectedSize) {
      section.querySelectorAll('.size-chip').forEach(b => b.classList.add('error'));
      const fb = document.getElementById('size-feedback');
      if (fb) { fb.textContent = 'Selecione um tamanho!'; fb.style.color = 'var(--danger)'; }
      return;
    }
    addToCart({ id: p.id, brand: p.brand, name: p.name, image: galImg.src, price: p.price, size: selectedSize }, el);
    if (goCheckout) { window.location.href = 'checkout.html'; }
    else {
      UI.modal({
        title: '🛒 Adicionado ao carrinho!',
        message: `<strong>${p.name}</strong> — Tamanho ${selectedSize} foi salvo com sucesso.`,
        primaryText: 'Ir para o carrinho',
        primaryHref: 'carrinho.html',
        secondaryText: 'Continuar comprando'
      });
    }
  }

  document.getElementById('btn-add-cart')?.addEventListener('click', e => tryAddToCart(false, e.currentTarget));
  document.getElementById('btn-buy-now')?.addEventListener('click', e => tryAddToCart(true, e.currentTarget));

  // Botão de Favorito (Página Interna)
  const wlBtn = document.getElementById('btn-wishlist');
  wlBtn?.addEventListener('click', () => {
    const list = Storage.getWishlist();
    if (list.includes(p.id)) {
      Storage.saveWishlist(list.filter(x => x !== p.id));
      wlBtn.textContent = '🤍'; wlBtn.classList.remove('btn-cyan');
      UI.toast('Removido dos favoritos.', 'info');
    } else {
      Storage.saveWishlist([...list, p.id]);
      wlBtn.textContent = '❤️'; wlBtn.classList.add('btn-cyan');
      UI.toast('Adicionado aos favoritos! ❤️', 'success');
    }
    UI.updateWishlistBadge();
  });
}

/* ════════════════════════════════════════════════════════
   15. CART PAGE (PÁGINA PRINCIPAL DO CARRINHO)
   Gerencia os produtos, atualiza quantidades e processa
   fretes fictícios e cupons.
   ════════════════════════════════════════════════════════ */
function renderCartPage() {
  const section = document.getElementById('cart-page');
  if (!section) return;

  const cart = Storage.getCart();

  if (!cart.length) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h2>Seu carrinho está vazio</h2>
        <p>Explore o catálogo, escolha seus modelos favoritos e monte sua corrida.</p>
        <a href="${PATH_PREFIX}catalogo.html" class="btn-primary">Ir para o catálogo</a>
      </div>`;
    return;
  }

  const totals = calcTotals(cart);

  section.innerHTML = `
    <div class="progress-bar" style="margin-bottom:28px">
      <div class="progress-step done">
        <div class="step-dot">✓</div>
        <span class="step-label">Seleção</span>
      </div>
      <div class="progress-step current">
        <div class="step-dot">2</div>
        <span class="step-label">Carrinho</span>
      </div>
      <div class="progress-step">
        <div class="step-dot">3</div>
        <span class="step-label">Checkout</span>
      </div>
      <div class="progress-step">
        <div class="step-dot">4</div>
        <span class="step-label">Confirmação</span>
      </div>
    </div>

    <div class="cart-layout reveal">
      <div>
        <div class="cart-items" id="cart-items">
          ${cart.map((item, idx) => `
            <article class="cart-card">
              <img src="${normalizeImagePath(item.image)}" alt="${item.name}" />
              <div>
                <p class="product-brand">${item.brand}</p>
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-meta">Tamanho ${item.size} · ${UI.formatCurrency(item.price)} cada</p>
                <div class="item-controls" style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px">
                  <div class="qty-box">
                    <button class="qty-btn cart-action" data-action="dec" data-idx="${idx}">−</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn cart-action" data-action="inc" data-idx="${idx}">+</button>
                  </div>
                  <button class="btn-danger btn-sm cart-action" data-action="remove" data-idx="${idx}">🗑 Remover</button>
                </div>
              </div>
              <div class="item-price-col">
                <strong>${UI.formatCurrency(item.price * item.quantity)}</strong>
              </div>
            </article>`).join('')}
        </div>

        <div style="margin-top:28px">
          <div class="section-heading" style="margin-bottom:16px">
            <div><span class="eyebrow">quem comprou também levou</span></div>
          </div>
          <div class="product-grid cols-2" id="cross-sell-grid"></div>
        </div>
      </div>

      <aside class="summary-card">
        <h3>Resumo do pedido</h3>

        <div class="freight-input-wrap" style="margin-bottom:14px">
          <input type="text" id="cep-freight" placeholder="CEP para frete" maxlength="9"
            value="${totals.freightData?.cep || ''}" />
          <button class="btn-cyan btn-sm" id="btn-calc-freight">Calcular</button>
        </div>

        <div class="coupon-input-wrap">
          <input type="text" id="coupon-input" placeholder="Cupom de desconto"
            value="${totals.couponData?.code || ''}" />
          <button class="btn-cyan btn-sm" id="btn-apply-coupon">Aplicar</button>
        </div>

        <div class="status-note info" id="cart-status">
          Cupons disponíveis: VELOZ10 · NEON15 · RUN5 · FRETEGRATIS · ULTRA20
        </div>

        <div class="summary-lines" style="margin-bottom:18px">
          <div class="summary-line muted"><span>Subtotal</span><span>${UI.formatCurrency(totals.subtotal)}</span></div>
          <div class="summary-line muted"><span>Frete</span><span>${UI.formatCurrency(totals.freight)}</span></div>
          <div class="summary-line muted"><span>Desconto</span><span>- ${UI.formatCurrency(totals.discount)}</span></div>
          <div class="summary-line total"><span>Total</span><span>${UI.formatCurrency(totals.total)}</span></div>
        </div>

        <a href="${PATH_PREFIX}checkout.html" class="btn-primary btn-full" style="margin-bottom:10px">Finalizar compra →</a>
        <a href="${PATH_PREFIX}catalogo.html" class="btn-ghost btn-full">Continuar comprando</a>
      </aside>
    </div>`;

  // Preenche a vitrine de Cross-Sell
  const cartIds = cart.map(i => i.id);
  const crossSell = PRODUTOS.filter(p => !cartIds.includes(p.id)).slice(0, 4);
  const crossGrid = section.querySelector('#cross-sell-grid');
  if (crossGrid) crossGrid.innerHTML = crossSell.map(p => createProductCard(p, false)).join('');

  // Lógica de Máscara e Cálculo de Frete Fictício
  const cepInput = document.getElementById('cep-freight');
  cepInput?.addEventListener('input', () => { cepInput.value = maskCEP(cepInput.value); });
  document.getElementById('btn-calc-freight')?.addEventListener('click', () => {
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) { UI.toast('Digite um CEP válido com 8 dígitos.', 'error'); return; }
    const value = calcFreight(cep);
    Storage.saveFreight({ cep: maskCEP(cep), value });
    UI.toast(`Frete calculado: ${UI.formatCurrency(value)} 🚚`, 'success');
    renderCartPage(); // Re-renderiza para atualizar totais
  });

  // Aplicação do Sistema de Cupom
  document.getElementById('btn-apply-coupon')?.addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    const statusEl = document.getElementById('cart-status');
    if (!COUPONS[code]) {
      Storage.saveCoupon(null); Storage.remove(KEYS.coupon);
      statusEl.className = 'status-note error';
      statusEl.textContent = `Cupom "${code}" inválido. Tente VELOZ10, NEON15, RUN5, FRETEGRATIS ou ULTRA20.`;
      return;
    }
    Storage.saveCoupon({ code, ...COUPONS[code] });
    statusEl.className = 'status-note success';
    statusEl.innerHTML = `Cupom <strong>${code}</strong> aplicado! (${COUPONS[code].label}) ✅`;
    renderCartPage(); // Re-renderiza para aplicar desconto no subtotal
  });

  // Listeners de Incrementar (+), Decrementar (-) e Remover Itens
  section.querySelectorAll('.cart-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.idx;
      const action = btn.dataset.action;
      const cart = Storage.getCart();
      if (action === 'inc') cart[idx].quantity += 1;
      if (action === 'dec') cart[idx].quantity = Math.max(1, cart[idx].quantity - 1);
      if (action === 'remove') {
        const removed = cart.splice(idx, 1);
        UI.toast(`${removed[0].name} removido do carrinho.`, 'info');
      }
      if (!cart.length) Storage.clearOrderExtras(); // Se zerasse, limpa cupons
      Storage.saveCart(cart);
      renderCartPage();
    });
  });

  attachCardListeners();
}

/* ════════════════════════════════════════════════════════
   16. CHECKOUT PAGE
   Recebe informações do usuário, calcula ViaCEP dinamicamente
   faz validações de form em tempo real e finaliza compra.
   ════════════════════════════════════════════════════════ */
function renderCheckoutPage() {
  const section = document.getElementById('checkout-page');
  if (!section) return;

  const cart = Storage.getCart();
  if (!cart.length) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>Nenhum item para checkout</h2>
        <p>Adicione produtos ao carrinho antes de finalizar o pedido.</p>
        <a href="${PATH_PREFIX}catalogo.html" class="btn-primary">Ir ao catálogo</a>
      </div>`;
    return;
  }

  const totals = calcTotals(cart);

  section.innerHTML = `
    <div class="progress-bar" style="margin-bottom:28px">
      <div class="progress-step done"><div class="step-dot">✓</div><span class="step-label">Seleção</span></div>
      <div class="progress-step done"><div class="step-dot">✓</div><span class="step-label">Carrinho</span></div>
      <div class="progress-step current"><div class="step-dot">3</div><span class="step-label">Checkout</span></div>
      <div class="progress-step"><div class="step-dot">4</div><span class="step-label">Confirmação</span></div>
    </div>

    <div class="checkout-layout reveal">
      <form class="checkout-form" id="checkout-form" novalidate>
        <div class="form-progress">
          <div class="form-progress-bar"><div class="form-progress-fill" id="form-progress-fill" style="width:0%"></div></div>
          <span class="form-progress-label" id="form-progress-label">0% preenchido</span>
        </div>

        <div>
          <h2 style="margin-bottom:16px; color:var(--cyan)">👤 Dados pessoais</h2>
          <div class="form-grid two">
            <div class="input-group">
              <label for="f-nome">Nome completo *</label>
              <input type="text" id="f-nome" placeholder="Seu nome completo" />
              <span class="field-error" id="err-nome"></span>
            </div>
            <div class="input-group">
              <label for="f-email">E-mail *</label>
              <input type="email" id="f-email" placeholder="seu@email.com" />
              <span class="field-error" id="err-email"></span>
            </div>
          </div>
          <div class="form-grid two" style="margin-top:14px">
            <div class="input-group">
              <label for="f-telefone">Telefone *</label>
              <input type="text" id="f-telefone" placeholder="(11) 99999-0000" maxlength="15" />
              <span class="field-error" id="err-telefone"></span>
            </div>
            <div class="input-group">
              <label for="f-cpf">CPF *</label>
              <input type="text" id="f-cpf" placeholder="000.000.000-00" maxlength="14" />
              <span class="field-error" id="err-cpf"></span>
            </div>
          </div>
        </div>

        <div>
          <h2 style="margin-bottom:16px; color:var(--cyan)">📍 Endereço de entrega</h2>
          <div class="form-grid three">
            <div class="input-group">
              <label for="f-cep">CEP *</label>
              <input type="text" id="f-cep" placeholder="00000-000" maxlength="9"
                value="${totals.freightData?.cep || ''}" />
              <span class="field-error" id="err-cep"></span>
            </div>
            <div class="input-group">
              <label for="f-numero">Número *</label>
              <input type="text" id="f-numero" placeholder="123" />
              <span class="field-error" id="err-numero"></span>
            </div>
            <div class="input-group">
              <label for="f-estado">Estado *</label>
              <input type="text" id="f-estado" placeholder="SP" maxlength="2" />
              <span class="field-error" id="err-estado"></span>
            </div>
          </div>
          <div class="form-grid two" style="margin-top:14px">
            <div class="input-group">
              <label for="f-rua">Rua *</label>
              <input type="text" id="f-rua" placeholder="Nome da rua" />
              <span class="field-error" id="err-rua"></span>
            </div>
            <div class="input-group">
              <label for="f-bairro">Bairro *</label>
              <input type="text" id="f-bairro" placeholder="Nome do bairro" />
              <span class="field-error" id="err-bairro"></span>
            </div>
          </div>
          <div class="form-grid two" style="margin-top:14px">
            <div class="input-group">
              <label for="f-cidade">Cidade *</label>
              <input type="text" id="f-cidade" placeholder="Sua cidade" />
              <span class="field-error" id="err-cidade"></span>
            </div>
            <div class="input-group">
              <label for="f-complemento">Complemento</label>
              <input type="text" id="f-complemento" placeholder="Apto, bloco..." />
            </div>
          </div>
          <div class="status-note" id="cep-status" style="margin-top:14px">
            Digite o CEP para preencher o endereço automaticamente via ViaCEP.
          </div>
        </div>

        <div>
          <h2 style="margin-bottom:16px; color:var(--cyan)">💳 Pagamento</h2>
          <div class="payment-grid" id="payment-grid">
            <div class="payment-option">
              <label><input type="radio" name="pagamento" value="Cartão de Crédito" /> Cartão de Crédito</label>
              <small>Parcelamento em até 12x sem juros</small>
              <div class="payment-details form-stack" id="credit-fields">
                <div class="form-grid two">
                  <div class="input-group" style="grid-column:1/-1">
                    <label>Número do cartão</label>
                    <input type="text" id="f-card-num" placeholder="0000 0000 0000 0000" maxlength="19" />
                  </div>
                  <div class="input-group">
                    <label>Nome no cartão</label>
                    <input type="text" id="f-card-name" placeholder="Como no cartão" />
                  </div>
                  <div class="input-group">
                    <label>Validade</label>
                    <input type="text" id="f-card-exp" placeholder="MM/AA" maxlength="5" />
                  </div>
                  <div class="input-group">
                    <label>CVV</label>
                    <input type="text" id="f-card-cvv" placeholder="000" maxlength="4" />
                  </div>
                  <div class="input-group">
                    <label>Parcelas</label>
                    <select id="f-installments">
                      ${Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const val = (totals.total / n).toFixed(2);
    return `<option value="${n}">${n}x de ${UI.formatCurrency(+val)} ${n === 1 ? '(à vista)' : 'sem juros'}</option>`;
  }).join('')}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="payment-option">
              <label><input type="radio" name="pagamento" value="Pix" /> Pix</label>
              <small>QR Code gerado após confirmação — aprovação imediata</small>
            </div>
            <div class="payment-option">
              <label><input type="radio" name="pagamento" value="Boleto" /> Boleto Bancário</label>
              <small>Vencimento em 3 dias úteis</small>
            </div>
          </div>
          <span class="field-error" id="err-pagamento" style="margin-top:8px;display:block"></span>
        </div>

        <div class="status-note" id="checkout-status">
          Preencha todos os campos obrigatórios para finalizar o pedido.
        </div>

        <button type="submit" class="btn-primary btn-lg btn-full">⚡ Finalizar pedido</button>
      </form>

      <aside class="checkout-side">
        <div class="summary-card">
          <h3>Itens do pedido</h3>
          <div class="mini-items">
            ${cart.map(item => `
              <div class="mini-item">
                <img src="${normalizeImagePath(item.image)}" alt="${item.name}" />
                <div>
                  <strong>${item.name}</strong>
                  <small>Tam. ${item.size} · Qtd. ${item.quantity}</small>
                </div>
                <span>${UI.formatCurrency(item.price * item.quantity)}</span>
              </div>`).join('')}
          </div>
          <div class="summary-lines">
            <div class="summary-line muted"><span>Subtotal</span><span>${UI.formatCurrency(totals.subtotal)}</span></div>
            <div class="summary-line muted"><span>Frete</span><span>${UI.formatCurrency(totals.freight)}</span></div>
            <div class="summary-line muted"><span>Desconto</span><span>- ${UI.formatCurrency(totals.discount)}</span></div>
            <div class="summary-line total"><span>Total</span><span>${UI.formatCurrency(totals.total)}</span></div>
          </div>
          ${totals.couponData ? `<div class="status-note success" style="margin-top:14px">Cupom ativo: ${totals.couponData.code} (${totals.couponData.label})</div>` : ''}
        </div>
        <div class="summary-card">
          <h3>Segurança</h3>
          <p style="color:var(--muted);font-size:0.88rem;line-height:1.7">
            🔒 Transação 100% simulada no front-end.<br>
            ✅ Dados salvos localmente via localStorage.<br>
            🚀 Nenhuma informação é enviada ao servidor.
          </p>
        </div>
      </aside>
    </div>`;

  // Inicializa Máscaras Dinâmicas
  const fCep = document.getElementById('f-cep');
  const fCpf = document.getElementById('f-cpf');
  const fPhone = document.getElementById('f-telefone');
  const fCard = document.getElementById('f-card-num');
  const fExp = document.getElementById('f-card-exp');

  fPhone?.addEventListener('input', () => { fPhone.value = maskPhone(fPhone.value); });
  fCpf?.addEventListener('input', () => { fCpf.value = maskCPF(fCpf.value); });
  fCep?.addEventListener('input', () => { fCep.value = maskCEP(fCep.value); });
  fCard?.addEventListener('input', () => { fCard.value = maskCard(fCard.value); });
  fExp?.addEventListener('input', () => { fExp.value = maskExpiry(fExp.value); });

  // Integração API Externa - ViaCEP
  fCep?.addEventListener('blur', async () => {
    const digits = fCep.value.replace(/\D/g, '');
    if (digits.length !== 8) return;
    const statusEl = document.getElementById('cep-status');
    statusEl.className = 'status-note';
    statusEl.textContent = 'Consultando CEP...';
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { statusEl.className = 'status-note error'; statusEl.textContent = 'CEP não encontrado.'; return; }

      // Auto-preenchimento
      document.getElementById('f-rua').value = data.logradouro || '';
      document.getElementById('f-bairro').value = data.bairro || '';
      document.getElementById('f-cidade').value = data.localidade || '';
      document.getElementById('f-estado').value = data.uf || '';

      // Marca campos como válidos (Bordas verdes)
      [document.getElementById('f-rua'), document.getElementById('f-bairro'),
      document.getElementById('f-cidade'), document.getElementById('f-estado')].forEach(el => {
        if (el?.value) el.classList.add('valid');
      });
      statusEl.className = 'status-note success';
      statusEl.textContent = `✅ Endereço preenchido: ${data.localidade}/${data.uf}`;
      updateFormProgress();
    } catch {
      statusEl.className = 'status-note error';
      statusEl.textContent = 'Erro ao consultar o CEP. Preencha manualmente.';
    }
  });

  // Mostra campos do Cartão de Crédito apenas quando a opção é selecionada
  document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('credit-fields').classList.toggle('active', radio.value === 'Cartão de Crédito');
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('invalid'));
    });
  });

  // Barra de progresso interativa do Formulário (% preenchido)
  const requiredIds = ['f-nome', 'f-email', 'f-telefone', 'f-cpf', 'f-cep', 'f-rua', 'f-numero', 'f-bairro', 'f-cidade', 'f-estado'];
  function updateFormProgress() {
    const filled = requiredIds.filter(id => document.getElementById(id)?.value.trim()).length;
    const pct = Math.round(filled / requiredIds.length * 100);
    const fill = document.getElementById('form-progress-fill');
    const lbl = document.getElementById('form-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (lbl) lbl.textContent = `${pct}% preenchido`;
  }
  requiredIds.forEach(id => document.getElementById(id)?.addEventListener('input', updateFormProgress));

  // Validação em Tempo Real (on blur)
  requiredIds.forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('blur', () => {
      const errEl = document.getElementById('err-' + id.replace('f-', ''));
      if (!el.value.trim()) {
        el.classList.add('invalid'); el.classList.remove('valid');
        if (errEl) errEl.textContent = 'Campo obrigatório.';
      } else {
        el.classList.remove('invalid'); el.classList.add('valid');
        if (errEl) errEl.textContent = '';
      }
    });
  });

  // Submissão Final do Checkout
  const form = document.getElementById('checkout-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;

    // Validação Geral de Campos Vazios
    requiredIds.forEach(id => {
      const el = document.getElementById(id);
      const errEl = document.getElementById('err-' + id.replace('f-', ''));
      el?.classList.remove('invalid', 'valid');
      if (!el?.value.trim()) {
        el?.classList.add('invalid');
        if (errEl) errEl.textContent = 'Campo obrigatório.';
        valid = false;
      } else {
        el?.classList.add('valid');
        if (errEl) errEl.textContent = '';
      }
    });

    // Validação de E-mail
    const emailEl = document.getElementById('f-email');
    if (emailEl?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('invalid');
      document.getElementById('err-email').textContent = 'E-mail inválido.';
      valid = false;
    }

    // Validação do tamanho do CPF
    const cpfDigits = document.getElementById('f-cpf')?.value.replace(/\D/g, '');
    if (cpfDigits && cpfDigits.length !== 11) {
      document.getElementById('f-cpf')?.classList.add('invalid');
      document.getElementById('err-cpf').textContent = 'CPF deve ter 11 dígitos.';
      valid = false;
    }

    // Validação do tamanho do Telefone
    const phoneDigits = document.getElementById('f-telefone')?.value.replace(/\D/g, '');
    if (phoneDigits && phoneDigits.length < 10) {
      document.getElementById('f-telefone')?.classList.add('invalid');
      document.getElementById('err-telefone').textContent = 'Telefone inválido.';
      valid = false;
    }

    // Validação da Opção de Pagamento
    const paymentEl = document.querySelector('input[name="pagamento"]:checked');
    if (!paymentEl) {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.add('invalid'));
      document.getElementById('err-pagamento').textContent = 'Selecione uma forma de pagamento.';
      valid = false;
    } else {
      document.getElementById('err-pagamento').textContent = '';
    }

    // Impede a submissão e Rola até o erro
    if (!valid) {
      const statusEl = document.getElementById('checkout-status');
      statusEl.className = 'status-note error';
      statusEl.textContent = 'Corrija os campos destacados em vermelho antes de continuar.';
      document.querySelector('.input-group input.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // GERA O OBJETO DO PEDIDO (MOCK / SIMULAÇÃO)
    const orderNum = `#VZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = {
      orderNumber: orderNum,
      createdAt: new Date().toLocaleString('pt-BR'),
      paymentMethod: paymentEl.value,
      customer: {
        name: document.getElementById('f-nome').value.trim(),
        email: document.getElementById('f-email').value.trim(),
        phone: document.getElementById('f-telefone').value.trim(),
        cpf: document.getElementById('f-cpf').value.trim()
      },
      address: {
        cep: document.getElementById('f-cep').value.trim(),
        street: document.getElementById('f-rua').value.trim(),
        number: document.getElementById('f-numero').value.trim(),
        district: document.getElementById('f-bairro').value.trim(),
        city: document.getElementById('f-cidade').value.trim(),
        state: document.getElementById('f-estado').value.trim(),
        complement: document.getElementById('f-complemento').value.trim()
      },
      items: [...cart],
      totals: { ...totals }
    };

    // Salva o pedido final no LocalStorage e limpa a sessão atual do carrinho
    Storage.saveOrder(order);
    Storage.remove(KEYS.cart);
    Storage.clearOrderExtras();

    const statusEl = document.getElementById('checkout-status');
    statusEl.className = 'status-note success';
    statusEl.textContent = `✅ Pedido ${orderNum} criado! Redirecionando...`;

    UI.toast(`Pedido ${orderNum} confirmado! 🎉`, 'success', 5000);

    // Simula o tempo de processamento antes de ir para a página de sucesso
    setTimeout(() => { window.location.href = 'sucesso.html'; }, 1200);
  });
}

/* ════════════════════════════════════════════════════════
   17. SUCCESS PAGE
   Página final do fluxo: agradecimento e recibo da compra.
   Lê o último pedido do LocalStorage e renderiza a nota.
   ════════════════════════════════════════════════════════ */
function renderSuccessPage() {
  const section = document.getElementById('success-page');
  if (!section) return;

  const order = Storage.getOrder();
  if (!order) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h2>Nenhum pedido encontrado</h2>
        <p>Não localizamos dados de pedido no navegador.</p>
        <a href="${PATH_PREFIX}catalogo.html" class="btn-primary">Voltar ao catálogo</a>
      </div>`;
    return;
  }

  section.innerHTML = `
    <div class="success-card reveal">
      <div class="success-icon">✅</div>
      <span class="eyebrow">pedido confirmado</span>
      <h1>Compra realizada com sucesso!</h1>
      <p>
        Obrigado, <strong>${order.customer.name}</strong>!
        Seu pedido foi registrado e toda a jornada foi concluída 100% no front-end
        com persistência local e resumo dinâmico.
      </p>

      <div class="order-number-box">
        🎫 Número do pedido: <strong>${order.orderNumber}</strong>
      </div>

      <div class="success-meta">
        <span>💳 ${order.paymentMethod}</span>
        <span>💰 ${UI.formatCurrency(order.totals.total)}</span>
        <span>📅 ${order.createdAt}</span>
        ${order.totals.couponData ? `<span>🏷️ Cupom: ${order.totals.couponData.code}</span>` : ''}
      </div>

      <div class="delivery-card">
        <h3>📦 Dados de entrega</h3>
        <div class="delivery-grid">
          <div class="delivery-row"><span>Cliente</span><strong>${order.customer.name}</strong></div>
          <div class="delivery-row"><span>E-mail</span><strong>${order.customer.email}</strong></div>
          <div class="delivery-row"><span>Telefone</span><strong>${order.customer.phone}</strong></div>
          <div class="delivery-row"><span>CPF</span><strong>${order.customer.cpf}</strong></div>
          <div class="delivery-row" style="grid-column:1/-1">
            <span>Endereço</span>
            <strong>${order.address.street}, ${order.address.number}${order.address.complement ? ' — ' + order.address.complement : ''}, ${order.address.district}, ${order.address.city}/${order.address.state} — CEP ${order.address.cep}</strong>
          </div>
        </div>
      </div>

      <div class="summary-card" style="text-align:left; margin-top:24px">
        <h3>Resumo financeiro</h3>
        <div class="summary-lines" style="margin-top:16px">
          <div class="summary-line muted"><span>Subtotal</span><span>${UI.formatCurrency(order.totals.subtotal)}</span></div>
          <div class="summary-line muted"><span>Frete</span><span>${UI.formatCurrency(order.totals.freight)}</span></div>
          <div class="summary-line muted"><span>Desconto</span><span>- ${UI.formatCurrency(order.totals.discount)}</span></div>
          <div class="summary-line total"><span>Total pago</span><span>${UI.formatCurrency(order.totals.total)}</span></div>
        </div>
      </div>

      <div class="success-items">
        ${order.items.map(item => `
          <div class="success-item">
            <img src="${normalizeImagePath(item.image)}" alt="${item.name}" />
            <div>
              <strong>${item.name}</strong>
              <small>${item.brand} · Tamanho ${item.size} · Quantidade ${item.quantity}</small>
            </div>
            <strong>${UI.formatCurrency(item.price * item.quantity)}</strong>
          </div>`).join('')}
      </div>

      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:14px; margin-top:32px">
        <a href="${PATH_PREFIX}catalogo.html" class="btn-outline btn-lg">👟 Continuar comprando</a>
        <a href="${ROOT_PREFIX}index.html" class="btn-primary btn-lg">🏠 Voltar para Home</a>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════
   18. WISHLIST PAGE (FAVORITOS)
   Página isolada que lê o array salvo e preenche a Grid.
   ════════════════════════════════════════════════════════ */
function renderWishlistPage() {
  const section = document.getElementById('wishlist-page');
  if (!section) return;

  const wishlist = Storage.getWishlist();
  if (!wishlist.length) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❤️</div>
        <h2>Sua lista de desejos está vazia</h2>
        <p>Explore o catálogo e clique no coração dos produtos para salvá-los aqui.</p>
        <a href="${PATH_PREFIX}catalogo.html" class="btn-primary">Explorar catálogo</a>
      </div>`;
    return;
  }

  const products = wishlist.map(id => PRODUTOS.find(p => p.id === id)).filter(Boolean);

  section.innerHTML = `
    <div class="product-grid reveal" id="wishlist-grid">
      ${products.map(p => createProductCard(p)).join('')}
    </div>`;

  attachCardListeners();
}

/* ════════════════════════════════════════════════════════
   19. CARD LISTENERS 
   Delega as ações dinâmicas para os botões dos Cards 
   injetados via JavaScript (Favorito e Visualização Rápida).
   ════════════════════════════════════════════════════════ */
function attachCardListeners() {
  // Lógica do botão de Favoritar
  document.querySelectorAll('.wishlist-btn[data-wl]').forEach(btn => {
    // Evita anexar o evento mais de uma vez no mesmo elemento
    if (btn.dataset.wlBound) return;
    btn.dataset.wlBound = '1';

    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const id = +btn.dataset.wl;
      const list = Storage.getWishlist();

      if (list.includes(id)) {
        Storage.saveWishlist(list.filter(x => x !== id));
        btn.textContent = '🤍'; btn.classList.remove('active');
        UI.toast('Removido dos favoritos.', 'info');
      } else {
        Storage.saveWishlist([...list, id]);
        btn.textContent = '❤️'; btn.classList.add('active');
        UI.toast('Adicionado aos favoritos! ❤️', 'success');
      }
      UI.updateWishlistBadge(); // Altera o badge no Header/BottomBar
    });
  });

  // Lógica do Botão de Quick View (Raio)
  document.querySelectorAll('.quick-view-btn[data-qv]').forEach(btn => {
    if (btn.dataset.qvBound) return;
    btn.dataset.qvBound = '1';
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      openQuickView(btn.dataset.qv);
    });
  });
}

/* ════════════════════════════════════════════════════════
   20. MASKS (REGEX DE FORMULÁRIO)
   Funções responsáveis por formatar visualmente as inputs.
   ════════════════════════════════════════════════════════ */
function maskCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCEP(v) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}
function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2'); // Fixos ou Antigos
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'); // Celular com o 9
}
function maskCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}
function maskExpiry(v) {
  return v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
}

/* ════════════════════════════════════════════════════════
   21. LOADER HIDE
   Faz o loader da tela inicial (VZ) desaparecer com fade.
   ════════════════════════════════════════════════════════ */
function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 600); // 600ms para a animação do Neon ser vista
}

/* ════════════════════════════════════════════════════════
   22. INITIALIZATION (INIT)
   Carrega a infraestrutura e define qual página renderizar 
   através da tag <body data-page="home">.
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Constrói Globais
  buildPromoBar();
  buildHeader();
  buildBottomBar();
  buildFooter();
  UI.updateCartBadge();
  UI.updateWishlistBadge();

  // Apaga tela de carregamento
  hideLoader();

  // Smart Header Scroll Logic (Esconde ao descer, mostra ao subir)
  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    const body = document.body;

    // Se estiver no topo absoluto, sempre mostra
    if (currentScrollY <= 80) {
      body.classList.remove('hide-nav');
      return;
    }

    // Detecta direção do scroll
    if (currentScrollY > lastScrollY && !body.classList.contains('hide-nav')) {
      // Rolando para BAIXO -> Esconde
      body.classList.add('hide-nav');
    } else if (currentScrollY < lastScrollY && body.classList.contains('hide-nav')) {
      // Rolando para CIMA -> Mostra
      body.classList.remove('hide-nav');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // Simula o efeito dinâmico de prova social (pessoas online) alterando os números cada 20s
  setInterval(() => {
    document.querySelectorAll('.viewers-count').forEach(el => {
      let current = parseInt(el.textContent) || 12;
      // Escolhe variar entre perder 1 pessoa (-1) até ganhar 2 pessoas (+2)
      const change = Math.floor(Math.random() * 4) - 1;
      current += change;
      if (current < 3) current = 3; // Impede que fique vazio
      el.textContent = current;
    });
  }, 20000);

  // Orquestrador de Telas (Roteamento simples do Front-End)
  // Orquestrador central: identifica a página atual e chama a função de renderização correta
  const page = document.body.dataset.page;
  switch (page) {
    case 'home': renderHome(); break; // Inicia a vitrine da home
    case 'catalogo': renderCatalog(); break; // Inicia filtros e grid do catálogo
    case 'produto': renderProductPage(); break; // Inicia galeria e detalhes da PDP
    case 'carrinho': renderCartPage(); break; // Inicia lista de itens do carrinho
    case 'checkout': renderCheckoutPage(); break; // Inicia formulário de pagamento
    case 'sucesso': renderSuccessPage(); break; // Inicia recibo final da compra
    case 'wishlist': renderWishlistPage(); break; // Inicia lista de favoritos
  }
});
