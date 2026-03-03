



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

  // Liga os botões recém-criados
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      addToCart(id);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('welcome-modal');
    const okBtn = document.getElementById('welcome-ok');

    // Mostra o modal
    modal.classList.add('show');

    // Fecha ao clicar em "Começar"
    okBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  });

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
    li.textContent = `${item.qtd}x ${item.name} — ${formatBRL(item.price * item.qtd)}`;
    listEl.appendChild(li);
  });

  countEl.textContent = carrinho.reduce((sum, item) => sum + item.qtd, 0);
  totalEl.textContent = formatBRL(total);
}

function toggleCart() {
  const panel = document.getElementById("cart-panel");
  if (panel) {
    panel.classList.toggle("open");
  }
}

/* ==========================================================================
   Filter Chips
   ========================================================================== */
function initFilters() {
  const chips = document.querySelectorAll(".chip");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const team = chip.getAttribute("data-team");
      renderProducts(team);
    });
  });
}

function toggleCustomInput() {
  const inputDiv = document.getElementById("custom-input");
  if (inputDiv) {
    inputDiv.style.display =
      inputDiv.style.display === "none" ? "block" : "none";
  }
}

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();   // mostra todos no início
  initFilters();      // ativa filtros

  // Botão do carrinho
  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", toggleCart);
  }

  // Ano no rodapé
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
