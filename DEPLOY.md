# 🚀 Veloz Tênis - Estrutura Otimizada para Vercel

## 📁 Estrutura do Projeto

```
veloz-tenis-html-main/
├── index.html                 ⭐ NOVO - Página principal na raiz
├── vercel.json                ⭐ NOVO - Configuração do Vercel
├── service-worker.js          ✅ Atualizado para nova estrutura
├── README.md
├── css/
│   └── styles.css
├── html/
│   ├── carrinho.html          ✅ Links atualizados
│   ├── catalogo.html          ✅ Links atualizados
│   ├── checkout.html          ✅ Links atualizados
│   ├── produto.html           ✅ Links atualizados
│   ├── sucesso.html           ✅ Links atualizados
│   └── wishlist.html          ✅ Links atualizados
├── images/
│   └── shoes/
├── js/
│   ├── animations.js
│   ├── app.js                 ✅ Sistema de detecção automática de caminho
│   ├── produtos.js
│   └── service-worker.js
└── json/
    └── manifest.json          ✅ start_url atualizado
```

## ✨ Mudanças Realizadas

### 1. **Index.html na Raiz**
- Movido de `html/index.html` para `/index.html`
- Caminhos ajustados para CSS, JS e imagens
- Links internos apontam para `html/` para outras páginas

### 2. **Sistema Inteligente de Detecção de Caminho**
Adicionado no `app.js`:
```javascript
const isInHtmlFolder = window.location.pathname.includes('/html/');
const PATH_PREFIX = isInHtmlFolder ? '' : 'html/';
const ASSETS_PREFIX = isInHtmlFolder ? '../' : '';
```

### 3. **Normalização de Imagens**
```javascript
function normalizeImagePath(imagePath) {
  return imagePath.replace(/^\.\.\//, ASSETS_PREFIX);
}
```

### 4. **Arquivos HTML Atualizados**
Todos os arquivos em `html/` agora linkam para:
- `../index.html` para a home
- Caminhos relativos mantidos para arquivos dentro de `html/`

### 5. **Service Workers Atualizados**
- `/service-worker.js` - Cache atualizado para index na raiz
- `CACHE_NAME` atualizado para v4

### 6. **Manifest PWA**
- `start_url` alterado de `/html/index.html` para `/`

### 7. **Configuração Vercel (vercel.json)**
- Headers otimizados para cache
- Service Worker configurado corretamente
- Suporte a PWA

## 🎯 Como Fazer Deploy

### Via Vercel CLI
```bash
npm i -g vercel
cd veloz-tenis-html-main/veloz-tenis-html-main
vercel
```

### Via Vercel Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório
4. Configure:
   - **Root Directory**: `veloz-tenis-html-main/veloz-tenis-html-main`
   - **Framework Preset**: Other
   - **Build Command**: (deixar vazio)
   - **Output Directory**: (deixar vazio)
5. Deploy!

## ✅ Compatibilidade

O projeto agora funciona perfeitamente tanto:
- ✅ Localmente (abrindo index.html)
- ✅ No Vercel (com path correto)
- ✅ Em qualquer servidor estático
- ✅ Como PWA instalável

## 🔄 Como Funciona

### Detecção Automática
O JavaScript detecta automaticamente se está sendo executado:
- **Na raiz** (index.html) → Links vão para `html/catalogo.html`
- **Na pasta html/** → Links vão para `catalogo.html`

### Caminhos de Assets
- **Imagens**: Normalizadas automaticamente baseado no contexto
- **CSS/JS**: Prefixos dinâmicos aplicados
- **Links**: PATH_PREFIX ajusta automaticamente

## 🎨 Funcionalidades Preservadas

Todas as funcionalidades originais foram mantidas:
- ✅ PWA funcional
- ✅ Service Worker com cache
- ✅ LocalStorage (carrinho, favoritos, histórico)
- ✅ Navegação entre páginas
- ✅ Animações e efeitos neon
- ✅ Responsividade mobile
- ✅ Quick View
- ✅ Filtros de catálogo
- ✅ Checkout com ViaCEP

## 📝 Notas Importantes

1. **Não apague a pasta html/** - As páginas internas precisam dela
2. **O index.html duplicado é normal** - Um na raiz, estrutura original em html/
3. **Service Worker** - Pode levar alguns segundos para atualizar o cache
4. **PWA** - Funciona melhor com HTTPS (Vercel fornece automaticamente)

## 🚀 Pronto para Deploy!

O projeto está 100% preparado para o Vercel. Basta fazer o upload e tudo funcionará automaticamente.
