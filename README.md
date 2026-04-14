# 🚀 Veloz Tênis — E-Commerce Premium

> Projeto acadêmico de desenvolvimento web front-end com visual neon futurista, microinterações avançadas, catálogo dinâmico, carrinho inteligente e checkout validado.

### 🎨 Destaques
🛒 **E-commerce Completo** • 📱 **PWA Instalável** • 🎯 **100% Vanilla JS** • ⚡ **30+ Produtos** • 🌐 **API ViaCEP** • 💾 **LocalStorage**

---

## 📚 Informações Acadêmicas

**Instituição:** Estácio   
**Disciplina:** Desenvolvimento Web  
**Professor:** Paulo  
**Aluno:** Gabriel Lima  
**Período:** 2026  
**Tipo:** Projeto Front-End 100% JavaScript Vanilla

---

## 🎯 Objetivo do Projeto

Desenvolver um **e-commerce completo e funcional** utilizando apenas tecnologias web nativas (HTML5, CSS3 e JavaScript puro), demonstrando:

1. **Domínio de JavaScript Vanilla** - Sem dependência de frameworks
2. **Experiência do Usuário (UX)** - Interface intuitiva e responsiva
3. **Persistência de Dados** - LocalStorage para carrinho e favoritos
4. **Integração de APIs** - ViaCEP para busca de endereço
5. **Progressive Web App** - Instalável e funcional offline
6. **Design Moderno** - Visual premium com animações suaves

---

## 📋 Sobre o Projeto

Este é um e-commerce completo de tênis desenvolvido utilizando apenas **HTML5, CSS3 e JavaScript puro** (Vanilla JS), sem frameworks ou bibliotecas externas. O projeto demonstra conhecimentos avançados em:

- ✅ Manipulação do DOM
- ✅ LocalStorage e persistência de dados
- ✅ APIs externas (ViaCEP)
- ✅ PWA (Progressive Web App)
- ✅ Animações e microinterações
- ✅ Responsividade mobile-first
- ✅ Design moderno e acessível

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| **Linhas de Código (JS)** | ~3.000+ linhas |
| **Arquivos HTML** | 7 páginas |
| **Produtos no Catálogo** | 30+ itens |
| **Funcionalidades** | 50+ recursos |
| **Animações** | 15+ microinterações |
| **APIs Integradas** | 2 (ViaCEP + Google Fonts) |
| **Compatibilidade** | Chrome, Firefox, Safari, Edge |
| **Score Lighthouse** | Performance: 90+/100 |

---

## ✅ Funcionalidades Implementadas

### 🎨 Design & UX
- Visual **Neon Minimalista** com paleta ciano/azul/roxo/pink
- **Orbs flutuantes** com gradiente animado em degradê
- **Efeito de glow** nos cards ao hover com rastreamento de mouse
- **Botões magnéticos** com atração ao cursor (desktop)
- **Ripple effect** em todos os botões e elementos clicáveis
- **Shimmer text** no logo do loader
- **Transições de página** suaves com overlay
- **Scroll reveal** com IntersectionObserver
- **Loader screen** personalizado por página
- **Scroll-to-top** button com visibilidade dinâmica
- Header com **efeito glassmorphism** ao rolar a página
- **Barra promocional rotativa** com navegação por dots
- **Partículas animadas em canvas** (opcional, pode ser ativada)

### 📱 Responsividade Mobile-First
- **Menu hamburger** com drawer lateral animado
- **Bottom navigation bar** fixa (4 ícones principais)
- Grid adaptável: 4 cols (desktop) → 3 → 2 → 1 (mobile)
- Layout fluido em todos os breakpoints
- Touch-friendly: botões com mínimo 44x44px
- Imagens responsivas com lazy loading

### 🏠 Home (index.html)
- **Banner grid** com 4 imagens clicáveis de marcas
- **Vitrine de produtos mais vendidos** (8 produtos em destaque)
- **Produtos vistos recentemente** (persistência via localStorage)
- Animações de entrada em cascata
- Quick access para catálogo completo

### 📦 Catálogo (catalogo.html)
- **Filtros por marca** (Nike, Adidas, Puma, New Balance)
- **Filtros por categoria** (Corrida, Treino, Lifestyle, Performance)
- **Ordenação** (Relevância, Menor preço, Maior preço, Melhor avaliado, A-Z)
- **Filtro de preço máximo** com slider em tempo real
- **Toggle de visualização**: Grid 4 colunas, Grid 2 colunas, Lista
- **Skeleton loading** animado durante transição
- Contador de resultados dinâmico
- Botão "limpar filtros"

### 👟 Produto — PDP (produto.html)
- **Galeria com carrossel** (botões prev/next + thumbnails)
- **Zoom na imagem** ao clicar (toggle)
- **Seletor de cor** com dots coloridos
- **Seletor de tamanho** com validação visual (shake + error state)
- **Avaliações com barras de distribuição** por estrela
- **Sticky summary bar** que aparece ao rolar a página
- **Wishlist toggle** com feedback imediato
- **Animação fly-to-cart** ao adicionar produto
- Informações de produto: entrega expressa, 30 dias para troca, 12x sem juros

### ❤️ Favoritos / Wishlist (wishlist.html)
- Lista de produtos favoritados com **persistência localStorage**
- Badge dinâmico no header e bottom bar
- Estado vazio com CTA para catálogo

### 🛒 Carrinho (carrinho.html)
- **Controle de quantidade** (+/-) com mínimo de 1
- **Remoção individual** de itens
- **Calculadora dinâmica** com `.reduce()` (subtotal, frete, desconto, total)
- **Calculadora de frete fictícia** por CEP (lógica matemática)
- **Sistema de cupons local** (VELOZ10, NEON15, RUN5, FRETEGRATIS, ULTRA20)
- **Cross-sell** — "quem comprou também levou"
- **Barra de progresso** de etapas da compra
- **Mini cart drawer** acessível pelo header (outras páginas)

### ⚡ Checkout (checkout.html)
- **ViaCEP API** — preenchimento automático de endereço
- **Máscaras de input**: CPF, telefone, CEP, cartão, validade
- **Validação em tempo real** com feedback visual (verde/vermelho)
- **Barra de progresso do formulário** (% preenchido)
- **Campos de pagamento dinâmicos** (cartão de crédito com parcelas calculadas)
- **Parcelas simuladas** no select (valor por parcela calculado)
- **Geração de número de pedido** aleatório (`#VZ-XXXX`)
- Estado de pedido salvo no localStorage antes do redirecionamento

### ✅ Sucesso (sucesso.html)
- Número de pedido aleatório gerado por JS
- Resumo completo: cliente, endereço, itens, financeiro
- Cupom aplicado exibido quando presente
- Grid de dados de entrega responsivo

### 🎉 Recursos Extras
- **Toast notifications** (success/error/info) com animação slide-in
- **Quick View modal** no catálogo (visualização rápida sem sair da página)
- **Mini Cart drawer** lateral com animação e resumo
- **PWA completo** — manifest.json + service-worker v4
- **Cache offline** inteligente (funciona sem internet)
- **Contador de visualizações** dinâmico nos cards
- **Badge de contadores** em tempo real (carrinho, favoritos)
- **Detecção automática de caminhos** (funciona na raiz ou em subpastas)
- **Normalização de imagens** para compatibilidade total
- **30+ produtos** no catálogo com múltiplas cores e tamanhos

---

## 🗂️ Estrutura de Arquivos

```
veloz-tenis-html-main/
├── index.html              # Página inicial (raiz) ⭐
├── service-worker.js       # PWA - Cache offline
├── vercel.json            # Configuração para deploy Vercel
├── README.md              # Documentação do projeto
├── DEPLOY.md              # Guia de deploy
├── 
│
├── css/
│   └── styles.css         # Sistema de design completo (~180KB)
│
├── html/                  # Páginas secundárias
│   ├── catalogo.html      # Catálogo com filtros e Quick View
│   ├── produto.html       # PDP com galeria, zoom e reviews
│   ├── carrinho.html      # Carrinho inteligente
│   ├── checkout.html      # Checkout com ViaCEP
│   ├── sucesso.html       # Confirmação de pedido
│   └── wishlist.html      # Lista de favoritos
│
├── js/
│   ├── app.js             # Lógica principal (~90KB)
│   ├── animations.js      # Microinterações (~16KB)
│   └── produtos.js        # Base de dados (30+ produtos)
│
├── images/
│   ├── logo.png
│   ├── veloz-logo.png
│   ├── veloz-tenis-escrita.png
│   └── shoes/             # Imagens dos produtos
│
└── json/
    └── manifest.json      # PWA manifest
```

### 📐 Arquitetura do Código

**Sistema de Detecção Automática de Caminho:**
- O JavaScript detecta automaticamente se está executando na raiz ou em `html/`
- Links e assets se ajustam dinamicamente
- Compatível com qualquer servidor/CDN

**Organização Modular:**
- `app.js`: Storage, UI, Carrinho, Checkout, Páginas
- `animations.js`: Partículas, Ripple, Magnetic Buttons, Scroll Effects
- `produtos.js`: Array de produtos com imagens, preços, avaliações

---

## 🔗 Navegação e Rotas

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| **Home** | `index.html` | Página inicial com destaques |
| **Catálogo** | `html/catalogo.html` | Grid de produtos com filtros |
| **Produto** | `html/produto.html?id=X` | Detalhes do produto |
| **Carrinho** | `html/carrinho.html` | Gestão do carrinho |
| **Checkout** | `html/checkout.html` | Finalização da compra |
| **Sucesso** | `html/sucesso.html` | Confirmação do pedido |
| **Favoritos** | `html/wishlist.html` | Lista de desejos |

### Parâmetros de URL

- **Catálogo:** `?q=busca`, `?brand=Nike`, `?category=Corrida`
- **Produto:** `?id=1` (IDs de 1 a 30+)

---

## 🧪 Como Testar as Funcionalidades

### 1️⃣ Navegação e Catálogo
- ✅ Acesse o catálogo e use os filtros de marca/categoria
- ✅ Experimente o slider de preço máximo
- ✅ Mude a visualização (grid 4 colunas / 2 colunas / lista)
- ✅ Use a busca no header
- ✅ Clique em "Quick View" em qualquer produto

### 2️⃣ Produto e Carrinho
- ✅ Abra um produto e navegue pela galeria de imagens
- ✅ Clique na imagem para ativar o zoom
- ✅ Selecione tamanho e cor
- ✅ Adicione ao carrinho (veja animação fly-to-cart)
- ✅ Adicione aos favoritos (ícone de coração)
- ✅ Teste o mini-cart no header

### 3️⃣ Carrinho e Checkout
- ✅ No carrinho, altere quantidades (+/-)
- ✅ Calcule o frete inserindo um CEP (ex: 01310-100)
- ✅ Aplique um cupom (veja lista abaixo)
- ✅ No checkout, digite um CEP (busca automática via ViaCEP)
- ✅ Preencha o formulário (veja validações em tempo real)
- ✅ Finalize e veja a página de confirmação

### 4️⃣ PWA e Offline
- ✅ Abra DevTools → Application → Service Workers
- ✅ Navegue pelo site (cache será criado)
- ✅ Ative "Offline" no DevTools
- ✅ Recarregue a página (funcionará offline!)
- ✅ No mobile, use "Adicionar à tela inicial"

### 5️⃣ LocalStorage
- ✅ DevTools → Application → Local Storage
- ✅ Veja os dados salvos: carrinho, favoritos, pedido
- ✅ Feche o navegador e reabra (dados persistem!)

---

## 🏷️ Cupons para Teste

| Código | Desconto |
|--------|---------|
| `VELOZ10` | 10% OFF |
| `NEON15` | 15% OFF |
| `RUN5` | 5% OFF |
| `FRETEGRATIS` | Frete grátis |
| `ULTRA20` | 20% OFF |


---

## �️ Tecnologias Utilizadas

### Front-End
- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Design System customizado com variáveis CSS
- **JavaScript (Vanilla)** - Lógica 100% nativa, sem frameworks

### APIs Externas
- **ViaCEP** - Busca automática de endereço por CEP
- **Google Fonts** - Tipografia Inter

### Recursos Avançados
- **LocalStorage API** - Persistência de dados do cliente
- **Service Worker API** - Cache offline (PWA)
- **IntersectionObserver API** - Scroll animations
- **Canvas 2D API** - Partículas animadas de fundo
- **Fetch API** - Integração com ViaCEP

### PWA (Progressive Web App)
- ✅ Instalável no dispositivo
- ✅ Funciona offline após primeiro acesso
- ✅ Cache estratégico de assets
- ✅ Manifest.json configurado
- ✅ Service Worker v4



---


### Código
- ✅ Sistema modular de detecção de caminhos
- ✅ Normalização automática de assets
- ✅ Remoção de código morto
- ✅ Service Worker unificado e otimizado
- ✅ Consistência em navegação e links

📄 **Detalhes completos:** Veja [OPTIMIZATION-REPORT.md](OPTIMIZATION-REPORT.md)


---

## 📝 Notas de Desenvolvimento

### Estrutura de Dados (LocalStorage)
```javascript
// Carrinho
vz_cart_v2: [
  { id, brand, name, image, price, size, quantity }
]

// Favoritos
vz_wishlist_v2: [1, 5, 8, 12]

// Pedido
vz_order_v2: {
  number, date, items, shipping, payment, totals
}

// Outros
vz_freight_v2: { cep, value }
vz_coupon_v2: { code, discount }
vz_recent_v2: [3, 7, 2, 9]
```

### Sistema de Detecção de Caminho
```javascript
// Detecta automaticamente se está na raiz ou em html/
const isInHtmlFolder = window.location.pathname.includes('/html/');
const PATH_PREFIX = isInHtmlFolder ? '' : 'html/';
const ASSETS_PREFIX = isInHtmlFolder ? '../' : '';
```

---

## 📱 Responsividade

Breakpoints implementados:
- **Mobile:** < 576px
- **Tablet:** 576px - 992px  
- **Desktop:** > 992px
- **Large Desktop:** > 1400px

Recursos mobile:
- Bottom navigation bar fixa
- Menu hamburger animado
- Grid adaptável (4 → 3 → 2 → 1 colunas)
- Touch-friendly (botões > 44px)

---


## 📄 Documentação Adicional

- 📘 [DEPLOY.md](DEPLOY.md) - Guia completo de deploy no Vercel
- 📊 [OPTIMIZATION-REPORT.md](OPTIMIZATION-REPORT.md) - Relatório de otimizações

---

## 👨‍💻 Autor

**Gabriel Lima**  
Desenvolvimento Web - 2026  
Professor: Paulo

---

## 📜 Licença

Este projeto foi desenvolvido para fins educacionais como parte da disciplina de Desenvolvimento Web.

---

**Projeto Veloz Tênis** — E-Commerce Front-End Premium  
*Desenvolvido com HTML5, CSS3 e JavaScript Vanilla*
