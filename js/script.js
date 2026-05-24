



/* ==========================================================================
   Data Models (Simulated “Databases” in Memory)
   ========================================================================== */
const produtosDB = [
  { id: 1, name: 'Camisa Flamengo 2024 - Home', team: 'flamengo', price: 249.9, img: 'assets/flamengo.JPEG' },
  { id: 2, name: 'Camisa Palmeiras 2023 - Away', team: 'palmeiras', price: 219.9, img: 'assets/palmeiras.jpg' },
  { id: 3, name: 'Camisa Vasco Retrô', team: 'vasco', price: 179.9, img: 'assets/vasco.jpg' },
  { id: 4, name: 'Camisa Santos Oficial', team: 'santos', price: 199.9, img: 'assets/santos.JPEG' },
  { id: 5, name: 'Camisa Personalizada - Nome e Número', team: 'custom', price: 129.9, img: 'assets/custom.JPEG' }
];

let carrinho = [];

const CART_STORAGE_KEY = 'champions_cart_v1';
const REVIEW_STORAGE_KEY = 'champions_reviews_v1';

/* ==========================================================================
   Utility Functions
   ========================================================================== */
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


/* ==========================================================================
   Renderização dos Produtos
   ========================================================================== */
function renderProducts(team = "all") {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const filtrados = team === "all"
    ? produtosDB
    : produtosDB.filter(p => p.team === team);

  filtrados.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-team", prod.team);

    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}">
      <h4>${prod.name}</h4>
      <p class="price">${formatBRL(prod.price)}</p>
      <button class="btn add-to-cart" data-id="${prod.id}">Adicionar ao carrinho</button>
    `;

    grid.appendChild(card);
  });

}


/* Renderiza uma lista específica de produtos (usado por filtros personalizados) */
function renderProductList(items) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = "";

  items.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-team", prod.team);

    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}">
      <h4>${prod.name}</h4>
      <p class="price">${formatBRL(prod.price)}</p>
      <button class="btn add-to-cart" data-id="${prod.id}">Adicionar ao carrinho</button>
    `;

    grid.appendChild(card);
  });
}


/* ==========================================================================
   Carrinho
   ========================================================================== */
function addToCart(id) {
  const produto = produtosDB.find(p => p.id === id);
  const existente = carrinho.find(item => item.id === id);

  if (existente) {
    existente.qtd += 1;
  } else {
    carrinho.push({ ...produto, qtd: 1 });
  }

  saveCart();
  updateCartUI();
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrinho));
  } catch (e) {
    // ignore storage errors
    console.warn('Não foi possível salvar o carrinho:', e);
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      carrinho = parsed.map(it => ({ ...it }));
    }
  } catch (e) {
    console.warn('Erro carregando carrinho:', e);
  }
}

function setQuantity(id, qty) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd = Math.max(1, Math.floor(qty) || 1);
  saveCart();
  updateCartUI();
}

function changeQuantity(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd = Math.max(1, item.qtd + delta);
  // remove if quantity is 0 (shouldn't occur due to min 1)
  if (item.qtd <= 0) {
    carrinho = carrinho.filter(i => i.id !== id);
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById("cart-count");
  const listEl  = document.getElementById("cart-list");
  const totalEl = document.getElementById("cart-total");

  if (!countEl || !listEl || !totalEl) return;

  let total = 0;
  listEl.innerHTML = "";

  carrinho.forEach(item => {
    total += item.price * item.qtd;
    const li = document.createElement("li");
    li.setAttribute('data-id', item.id);
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="item-info">
        <span class="name">${item.name}</span>
        <span class="meta">${formatBRL(item.price)}</span>
        <div class="qty-controls">
          <button class="qty-btn decrease" data-id="${item.id}" type="button" aria-label="Diminuir quantidade">−</button>
          <input class="qty-input" data-id="${item.id}" type="number" min="1" value="${item.qtd}">
          <button class="qty-btn increase" data-id="${item.id}" type="button" aria-label="Aumentar quantidade">+</button>
          <button class="remove-item" data-id="${item.id}" type="button" aria-label="Remover item">Remover</button>
        </div>
        <div class="item-sub">${formatBRL(item.price * item.qtd)}</div>
      </div>
    `;
    listEl.appendChild(li);
  });

  countEl.textContent = carrinho.reduce((sum, item) => sum + item.qtd, 0);
  totalEl.textContent = formatBRL(total);
}

function toggleCart() {
  const panel = document.getElementById("cart-panel");
  if (panel) {
    const isOpen = panel.classList.toggle("open");
    const btn = document.getElementById("cart-btn");
    if (btn) {
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }


    // Atualiza atributo ARIA do painel para leitores de tela
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }
}



/* ==========================================================================
   Filter Chips
   ========================================================================== */
function initFilters() {
  const container = document.getElementById('teams');
  if (!container) return;



  // Torna chips focáveis para acessibilidade
  const chips = container.querySelectorAll('.chip');
  chips.forEach(c => c.setAttribute('tabindex', '0'));

  const customInput = document.getElementById('custom-input');
  const customText = document.getElementById('custom-team-text');



  // Clique delegando no container
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip || !container.contains(chip)) return;



    // Ativa apenas o chip clicado
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const team = chip.getAttribute('data-team');
    if (team === 'custom') {
      if (customInput) customInput.style.display = 'block';
      if (customText) { customText.value = ''; customText.focus(); }
      renderProducts('all');
    } else {
      if (customInput) customInput.style.display = 'none';
      renderProducts(team);
    }
  });



  // Permite ativar chips via teclado (Enter / Space)
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const chip = e.target.closest('.chip');
      if (chip) { chip.click(); e.preventDefault(); }
    }
  });



  // Filtro personalizado por nome (busca no nome e no time)
  if (customText) {
    customText.addEventListener('input', () => {
      const q = customText.value.trim().toLowerCase();
      if (!q) {
        renderProducts('all');
        return;
      }
      const results = produtosDB.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
      renderProductList(results);
    });
  }
}

function toggleCustomInput() {
  const inputDiv = document.getElementById("custom-input");
  if (inputDiv) {
    inputDiv.style.display =
      inputDiv.style.display === "none" ? "block" : "none";
  }
}


/* ==========================================================================
   Avaliacoes
   ========================================================================== */
function buildStars(rating) {
  const value = Math.max(1, Math.min(5, Number(rating) || 5));
  return '\u2605'.repeat(value) + '\u2606'.repeat(5 - value);
}

function createReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card';

  const stars = document.createElement('strong');
  stars.textContent = buildStars(review.rating);

  const comment = document.createElement('p');
  comment.textContent = `"${review.comment}"`;

  const name = document.createElement('span');
  name.textContent = review.name;

  card.append(stars, comment, name);
  return card;
}

function saveReviews(reviews) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Nao foi possivel salvar as avaliacoes:', e);
  }
}

function loadReviews() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Erro carregando avaliacoes:', e);
    return [];
  }
}

function renderSavedReviews() {
  const reviewsList = document.querySelector('#avaliacoes .reviews');
  if (!reviewsList) return;

  loadReviews().forEach(review => {
    reviewsList.appendChild(createReviewCard(review));
  });
}

function initReviewForm() {
  const form = document.getElementById('review-form');
  const reviewsList = document.querySelector('#avaliacoes .reviews');
  const feedback = document.getElementById('review-feedback');
  if (!form || !reviewsList) return;

  renderSavedReviews();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('review-name');
    const ratingInput = document.getElementById('review-rating');
    const commentInput = document.getElementById('review-comment');
    const name = nameInput.value.trim();
    const rating = ratingInput.value;
    const comment = commentInput.value.trim();

    if (!name || !comment) {
      if (feedback) feedback.textContent = 'Preencha seu nome e comentario.';
      return;
    }

    const review = { name, rating, comment };
    reviewsList.appendChild(createReviewCard(review));
    saveReviews([...loadReviews(), review]);
    form.reset();

    if (feedback) {
      feedback.textContent = 'Avaliacao enviada com sucesso!';
    }
  });
}


/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Modal de boas-vindas
  const modal = document.getElementById("welcome-modal");
  const okBtn = document.getElementById("welcome-ok");
  modal.classList.add("show");
  okBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  renderProducts();
  initFilters();
  initReviewForm();



  // Botão "Ver produtos" no hero
  const heroBtn = document.getElementById("hero-produtos-btn");
  if (heroBtn) {
    heroBtn.addEventListener("click", () => {
      document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    });
  }



  // Botão do carrinho
  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", toggleCart);
  }



  // Botão para fechar/minimizar o carrinho quando estiver aberto
  const cartCloseBtn = document.getElementById('cart-close');
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => {
      // garante que o painel será fechado
      const panel = document.getElementById('cart-panel');
      if (panel && panel.classList.contains('open')) toggleCart();
    });
  }



  // Responsive nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      primaryNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });



    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!primaryNav.classList.contains('open')) return;
      if (e.target.closest('#primary-nav') || e.target.closest('#nav-toggle')) return;
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.setAttribute('aria-hidden', 'true');
    });



    // Close nav on resize to large screens
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && primaryNav.classList.contains('open')) {
        primaryNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.setAttribute('aria-hidden', 'false');
      }
    });
  }



  // Delegação de eventos no grid de produtos para garantir que
  // cliques em botões estáticos ou dinâmicos adicionem ao carrinho
  const grid = document.getElementById('product-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      // Botões gerados dinamicamente têm a classe `add-to-cart` e `data-id`
      if (btn.classList.contains('add-to-cart') && btn.dataset.id) {
        addToCart(parseInt(btn.dataset.id, 10));
        return;
      }


      // Suporte para botões estáticos sem data-id: identifica pelo texto
      if (btn.textContent && btn.textContent.toLowerCase().includes('adicionar ao carrinho')) {
        const card = btn.closest('.product-card');
        if (!card) return;
        const title = card.querySelector('h4');
        const name = title ? title.textContent.trim() : null;
        if (!name) return;
        const prod = produtosDB.find(p => p.name === name);
        if (prod) addToCart(prod.id);
      }
    });
  }



  // Eventos no painel do carrinho: delegação para controles de quantidade e remoção
  const cartPanel = document.getElementById('cart-panel');
  if (cartPanel) {
    cartPanel.addEventListener('click', (e) => {
      const inc = e.target.closest('.increase');
      if (inc) { changeQuantity(parseInt(inc.dataset.id,10), 1); return; }
      const dec = e.target.closest('.decrease');
      if (dec) { changeQuantity(parseInt(dec.dataset.id,10), -1); return; }
      const rem = e.target.closest('.remove-item');
      if (rem) { removeFromCart(parseInt(rem.dataset.id,10)); return; }
    });

    cartPanel.addEventListener('input', (e) => {
      const input = e.target.closest('.qty-input');
      if (input) {
        const id = parseInt(input.dataset.id, 10);
        const val = parseInt(input.value, 10);
        if (!Number.isNaN(val)) setQuantity(id, val);
      }
    });
  }



  // Carrega carrinho salvo e atualiza UI
  loadCart();
  updateCartUI();

  // Ano no rodapé
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
