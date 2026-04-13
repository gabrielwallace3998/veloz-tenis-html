/* ═══════════════════════════════════════════════════════
   VELOZ TÊNIS — ANIMATIONS.JS v2.0
   Microinterações, partículas em canvas, cursor neon, 
   efeito magnético, ripple e transições visuais.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Fundo de Partículas Neon (Canvas) ───────────────
     Cria um elemento <canvas> dinâmico no fundo da página
     e desenha partículas flutuantes que se conectam por
     linhas quando estão próximas (efeito constelação).
  */
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'vz-particles'; // ID para o canvas de fundo
    canvas.style.cssText = `
      position:fixed; inset:0; z-index:0; pointer-events:none;
      opacity:0.55;
    `;
    document.body.prepend(canvas); // Insere o canvas no início do corpo do documento

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    // Ajusta o tamanho do canvas para cobrir a tela inteira
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    // Paleta de cores das partículas em tons de cinza e branco para o novo tema
    const COLORS = ['#ffffff', '#d1d1d1', '#a8a8a8', '#f5f5f5', '#6e6e6e'];

    // Instancia uma partícula com velocidade, cor e pulsação aleatórias
    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.6 + 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.008
      };
    }

    // Define a quantidade de partículas baseada no tamanho da tela
    function initParticleSet() {
      particles = [];
      const count = Math.min(Math.floor((W * H) / 12000), 90);
      for (let i = 0; i < count; i++) particles.push(createParticle());
    }

    // Desenha as linhas conectando partículas próximas
    function drawLines(p) {
      particles.forEach(q => {
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - dist / 130) * 0.12; // Opacidade baseada na distância
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    }

    // Loop de animação principal (roda a 60fps)
    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.pulse += p.pulseSpeed;
        const a = p.alpha + Math.sin(p.pulse) * 0.18;

        // Faz as partículas reaparecerem do lado oposto se saírem da tela
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.globalAlpha = Math.max(0, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        drawLines(p);
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    }

    resize();
    initParticleSet();
    animate();
    window.addEventListener('resize', () => { resize(); initParticleSet(); });
  }

  /* ─── Efeito de Onda (Ripple) nos Botões ──────────────
     Cria um círculo de clique estilo "Material Design"
     onde o usuário clica dentro do botão.
  */
  function initRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .btn-primary, .btn-outline, .btn-ghost, .btn-danger, .btn-cyan');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:2px; height:2px; left:${x}px; top:${y}px;
        transform:translate(-50%,-50%) scale(0);
        background:rgba(255,255,255,0.35);
        animation:rippleAnim 0.55s ease forwards;
        z-index:999;
      `;
      if (!getComputedStyle(btn).position || getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      
      // Remove o span do DOM após a animação concluir para evitar lixo
      setTimeout(() => ripple.remove(), 600);
    });

    const style = document.createElement('style');
    style.textContent = `@keyframes rippleAnim { to { transform:translate(-50%,-50%) scale(120); opacity:0; } }`;
    document.head.appendChild(style);
  }

  /* ─── Botões Magnéticos ───────────────────────────────
     Faz os botões primários e a logo se moverem levemente
     na direção do cursor quando em hover.
  */
  function initMagneticBtns() {
    if (window.matchMedia('(hover:none)').matches) return; // Ignora em mobile

    function applyMagnetic(btn) {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        // Calcula a distância do centro do botão
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Move o botão uma fração dessa distância
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = ''; // Reseta ao tirar o mouse
      });
    }

    function scanMagnetic() {
      document.querySelectorAll('.btn-primary, .logo-mark').forEach(applyMagnetic);
    }

    scanMagnetic();
    // MutationObserver vigia se novos botões são adicionados dinamicamente na tela
    const observer = new MutationObserver(scanMagnetic);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ─── Órbitas Flutuantes (Glow Orbs) ──────────────────
     Cria grandes círculos desfocados (blur) no fundo do site
     que flutuam suavemente para dar vida ao background escuro.
  */
  function initGlowOrbs() {
    const orbs = [
      { color: 'rgba(255,255,255,0.04)', size: 600, x: '10%', y: '20%', delay: '0s' },
      { color: 'rgba(180,180,180,0.05)', size: 500, x: '80%', y: '60%', delay: '-4s' },
      { color: 'rgba(120,120,120,0.03)', size: 400, x: '50%', y: '80%', delay: '-8s' }
    ];

    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatOrb {
        0%, 100% { transform: translate(0,0) scale(1); }
        33%       { transform: translate(30px,-20px) scale(1.04); }
        66%       { transform: translate(-20px,15px) scale(0.97); }
      }
      .vz-orb {
        position:fixed; border-radius:50%; pointer-events:none; z-index:0;
        filter:blur(80px); animation:floatOrb 18s ease-in-out infinite;
        transform-origin:center;
      }
    `;
    document.head.appendChild(style);

    orbs.forEach(orb => {
      const el = document.createElement('div');
      el.className = 'vz-orb';
      el.style.cssText = `
        width:${orb.size}px; height:${orb.size}px;
        left:${orb.x}; top:${orb.y};
        background:${orb.color};
        animation-delay:${orb.delay};
        margin-left:${-orb.size / 2}px; margin-top:${-orb.size / 2}px;
      `;
      document.body.appendChild(el);
    });
  }

  /* ─── Animação de Voar para o Carrinho (Fly to Cart) ──
     Expõe uma função global. Ao clicar "Comprar", uma bolinha
     neon sai da posição do botão clicado e faz uma curva parabólica
     até a posição exata do ícone do carrinho no header.
  */
  window.VZAnimations = window.VZAnimations || {};

  window.VZAnimations.flyToCart = function (sourceEl) {
    const cart = document.getElementById('cart-count'); // Badge do header
    if (!cart || !sourceEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed; z-index:9000; pointer-events:none;
      width:20px; height:20px; border-radius:50%;
      background:var(--gradient);
      left:${srcRect.left + srcRect.width / 2 - 10}px;
      top:${srcRect.top + srcRect.height / 2 - 10}px;
      box-shadow:0 0 20px rgba(255,255,255,0.4);
      transition:none;
    `;
    document.body.appendChild(dot);

    const startX = srcRect.left + srcRect.width / 2 - 10;
    const startY = srcRect.top + srcRect.height / 2 - 10;
    const endX = cartRect.left + cartRect.width / 2 - 10;
    const endY = cartRect.top + cartRect.height / 2 - 10;

    const start = performance.now();
    const duration = 620;

    // Calcula a trajetória a cada frame de tela
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // Equação de Ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const cx = startX + (endX - startX) * ease;
      // Adiciona uma curva baseada em seno para não ir em linha reta (parábola)
      const cy = startY + (endY - startY) * ease - Math.sin(t * Math.PI) * 80;
      const scale = 1 - ease * 0.5;

      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      dot.style.transform = `scale(${scale})`;
      dot.style.opacity = 1 - ease * 0.3;

      if (t < 1) requestAnimationFrame(step);
      else {
        dot.remove(); // Fim da animação
        // Dá um pulinho (scale) no ícone do carrinho
        cart.style.transform = 'scale(1.5)';
        setTimeout(() => { cart.style.transform = ''; }, 250);
      }
    }

    requestAnimationFrame(step);
  };

  /* ─── Efeito Neon Dinâmico nos Cards de Produto ────────
     Rastreia a posição exata do mouse em cima do card e envia
     as porcentagens para o CSS atualizar o gradiente radial.
  */
  function initCardGlow() {
    if (window.matchMedia('(hover:none)').matches) return;

    const style = document.createElement('style');
    style.textContent = `
      .product-card { --mouse-x:50%; --mouse-y:50%; }
      .product-card::after {
        content:''; position:absolute; inset:0; border-radius:inherit;
        background: radial-gradient(
          300px circle at var(--mouse-x) var(--mouse-y),
          rgba(255,255,255,0.05), transparent 80%
        );
        pointer-events:none; z-index:1; opacity:0; transition:opacity .35s ease;
      }
      .product-card:hover::after { opacity:1; }
    `;
    document.head.appendChild(style);

    function attach(card) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    }

    // Vigia a injeção de novos cards (ex: ao filtrar ou carregar página)
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.product-card:not([data-glow])').forEach(card => {
        card.setAttribute('data-glow', '1');
        attach(card);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll('.product-card').forEach(card => {
      card.setAttribute('data-glow', '1');
      attach(card);
    });
  }

  /* ─── Contador Numérico Animado ────────────────────────
     Faz números crescerem do 0 até o valor final rapidamente.
     Útil para contador de resultados no catálogo ou total do carrinho.
  */
  window.VZAnimations.countUp = function (el, to, duration = 700, prefix = '') {
    const from = 0;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // Ease-out cúbico
      el.textContent = prefix + Math.round(from + (to - from) * ease).toLocaleString('pt-BR');
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  /* ─── Efeito de Brilho Dinâmico em Textos (Shimmer) ────
     Injeta os estilos para criar um feixe de luz passando
     pelo texto (usado na logo do loader).
  */
  function initShimmer() {
    const style = document.createElement('style');
    style.textContent = `
      .shimmer-text {
        background: linear-gradient(90deg, #666666 40%, #ffffff 50%, #666666 60%);
        background-size: 200% auto;
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmerMove 3.5s linear infinite;
      }
      @keyframes shimmerMove { to { background-position: 200% center; } }
    `;
    document.head.appendChild(style);
  }

  /* ─── Gerador de Skeleton Loading ──────────────────────
     Retorna HTML de cards cinzas piscando, indicando que o
     conteúdo está sendo carregado.
  */
  window.VZAnimations.skeleton = function (count, cols = 4) {
    const style = document.createElement('style');
    if (!document.getElementById('vz-skeleton-style')) {
      style.id = 'vz-skeleton-style';
      style.textContent = `
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%); background-size:200% 100%; animation:skeletonShine 1.4s ease-in-out infinite; border-radius:var(--radius-lg); }
        @keyframes skeletonShine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .skeleton-card { border-radius:var(--radius-lg); overflow:hidden; border:1px solid rgba(255,255,255,0.06); }
        .skeleton-img { height:250px; }
        .skeleton-text { height:14px; border-radius:99px; margin:10px 18px 6px; }
        .skeleton-text.wide { width:65%; }
        .skeleton-text.medium { width:45%; }
        .skeleton-text.small { width:30%; }
        .skeleton-bottom { margin:16px 18px 18px; display:flex; justify-content:space-between; gap:12px; }
        .skeleton-price { height:22px; width:80px; border-radius:10px; }
        .skeleton-btn { height:38px; width:110px; border-radius:14px; }
      `;
      document.head.appendChild(style);
    }

    let html = `<div class="product-grid" style="grid-template-columns:repeat(${cols},1fr)">`;
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card">
          <div class="skeleton skeleton-img"></div>
          <div class="skeleton skeleton-text wide"></div>
          <div class="skeleton skeleton-text medium"></div>
          <div class="skeleton skeleton-text small"></div>
          <div class="skeleton-bottom">
            <div class="skeleton skeleton-price"></div>
            <div class="skeleton skeleton-btn"></div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  };

  /* ─── Transição Suave Entre Páginas ────────────────────
     Intercepta o clique em links locais, escurece a tela
     e só então redireciona para a nova página.
  */
  function initPageTransitions() {
    const overlay = document.createElement('div');
    overlay.id = 'vz-page-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9990; pointer-events:none;
      background:var(--gradient); opacity:0; transition:opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      // Ignora links externos, âncoras na mesma página ou chamadas JS
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript')) return;
      if (link.target === '_blank') return;

      e.preventDefault();
      overlay.style.opacity = '0.15';
      setTimeout(() => { window.location.href = href; }, 280);
    });
  }

  /* ─── Cabeçalho Dinâmico (Header Scroll Direcional) ────────
     Mostra a barra apenas ao descer (scroll down). Ao subir (scroll up),
     a barra some e o header/hero volta.
  */
  function initScrollHeader() {
    const header = document.getElementById('site-header');
    const promo = document.getElementById('promo-bar');
    if (!header) return;

    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY <= 0 ? 0 : window.scrollY;
      
      if (currentScroll > 40) {
        if (currentScroll > lastScroll) {
          // Rolando para BAIXO
          header.classList.add('scrolled');
          if (promo) promo.classList.add('scrolled');
        } else {
          // Rolando para CIMA
          header.classList.remove('scrolled');
          if (promo) promo.classList.remove('scrolled');
        }
      } else {
        // Se estiver lá no topo
        header.classList.remove('scrolled');
        if (promo) promo.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* ─── Botão de Voltar ao Topo ──────────────────────────
     Revela o botão no canto da tela apenas quando a rolagem
     já passou do topo do site.
  */
  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ─── Animações no Scroll (Intersection Observer) ──────
     Procura por elementos com a classe .reveal. Quando eles
     entram na tela, adiciona a classe .visible (que dispara o CSS).
  */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) el.target.classList.add('visible');
      });
    }, { threshold: 0.12 }); // Ativa quando 12% do elemento estiver visível

    function scan() {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    }
    scan();
    // Vigia a injeção de novos blocos que precisam da animação
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ─── INICIALIZAÇÃO GERAL ──────────────────────────────
     Chama todas as funções quando o DOM estiver pronto.
  */
  document.addEventListener('DOMContentLoaded', () => {
    initGlowOrbs();
    // initParticles(); // Desativado o efeito "molecular" de fundo por enquanto (pode ser reativado se necessário)
    initRipple();
    initMagneticBtns();
    initCardGlow();
    initShimmer();
    initScrollHeader();
    initScrollTop();
    initReveal();
    initPageTransitions();
  });

})();
