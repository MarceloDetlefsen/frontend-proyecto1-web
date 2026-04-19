// ── Estado ──
let currentPage  = 1;
const limit      = 8;
let searchTimer  = null;

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  cargarSeries();
  initToolbar();
  initModal();
});

// ── Cargar y renderizar series ──
async function cargarSeries() {
  const params = {
    page:  currentPage,
    limit,
    q:     document.getElementById("search").value.trim(),
    sort:  document.getElementById("sort").value,
    order: document.getElementById("order").value,
  };

  try {
    const { data, total } = await getSeries(params);
    renderCards(data);
    renderPaginacion(total);
    renderSubtitle(total);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderSubtitle(total) {
  document.getElementById("subtitle").textContent =
    total === 0 ? "No hay series todavía." : `${total} serie${total !== 1 ? "s" : ""} en tu lista`;
}

// ── Cards ──
function renderCards(series) {
  const grid = document.getElementById("cards-grid");

  if (series.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🎬</div>
        <p>No encontramos ninguna serie.</p>
        <a href="crear.html" class="btn btn-primary">+ Agregar la primera</a>
      </div>`;
    return;
  }

  grid.innerHTML = series.map(renderCard).join("");

  // Eventos de cada card
  grid.querySelectorAll(".btn-incrementar").forEach(btn => {
    btn.addEventListener("click", () => handleEpisodio(btn.dataset.id, "incrementar"));
  });
  grid.querySelectorAll(".btn-decrementar").forEach(btn => {
    btn.addEventListener("click", () => handleEpisodio(btn.dataset.id, "decrementar"));
  });
  grid.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirModal(btn.dataset.id));
  });
  grid.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => handleEliminar(btn.dataset.id));
  });
}

function renderCard(s) {
  const pct     = s.total_episodios > 0 ? Math.round((s.episodio_actual / s.total_episodios) * 100) : 0;
  const imagen  = s.imagen
    ? `<img src="${s.imagen}" alt="${s.titulo}" onerror="this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'>🎬</div>'">`
    : `<div class="card-img-placeholder">🎬</div>`;
  const cal     = s.calificacion != null ? `⭐ ${parseFloat(s.calificacion).toFixed(1)}` : "Sin calificar";

  return `
    <div class="serie-card">
      <div class="card-image">
        ${imagen}
        <span class="estado-badge estado-${s.estado}">${s.estado}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${s.titulo}</div>

        <div class="progress-section">
          <div class="progress-label">
            <span>Ep. ${s.episodio_actual} / ${s.total_episodios}</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="episodio-controls">
          <button class="btn btn-secondary btn-sm btn-decrementar" data-id="${s.id}">−1</button>
          <span>Episodio actual</span>
          <button class="btn btn-primary btn-sm btn-incrementar" data-id="${s.id}">+1</button>
        </div>

        <div class="card-rating">${cal}</div>
      </div>

      <div class="card-footer">
        <a href="detalle.html?id=${s.id}" class="btn btn-ghost btn-sm">Ver más</a>
        <button class="btn btn-secondary btn-sm btn-editar" data-id="${s.id}">Editar</button>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${s.id}">Eliminar</button>
      </div>
    </div>`;
}

// ── Episodios ──
async function handleEpisodio(id, accion) {
  try {
    const fn = accion === "incrementar" ? incrementarEpisodio : decrementarEpisodio;
    await fn(id);
    await cargarSeries();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Eliminar ──
async function handleEliminar(id) {
  if (!confirm("¿Seguro que querés eliminar esta serie?")) return;
  try {
    await deleteSerie(id);
    showToast("Serie eliminada", "success");
    await cargarSeries();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Paginación ──
function renderPaginacion(total) {
  const pages = Math.ceil(total / limit);
  const pag   = document.getElementById("pagination");

  if (pages <= 1) { pag.innerHTML = ""; return; }

  let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} id="prev">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" ${currentPage === pages ? "disabled" : ""} id="next">›</button>`;

  pag.innerHTML = html;

  pag.querySelector("#prev")?.addEventListener("click", () => { currentPage--; cargarSeries(); });
  pag.querySelector("#next")?.addEventListener("click", () => { currentPage++; cargarSeries(); });
  pag.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => { currentPage = parseInt(btn.dataset.page); cargarSeries(); });
  });
}

// ── Toolbar: búsqueda y ordenamiento ──
function initToolbar() {
  document.getElementById("search").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; cargarSeries(); }, 400);
  });

  document.getElementById("sort").addEventListener("change",  () => { currentPage = 1; cargarSeries(); });
  document.getElementById("order").addEventListener("change", () => { currentPage = 1; cargarSeries(); });
}

// ── Modal editar ──
function initModal() {
  const overlay = document.getElementById("modal-overlay");
  document.getElementById("modal-close").addEventListener("click",  cerrarModal);
  document.getElementById("modal-cancel").addEventListener("click", cerrarModal);
  overlay.addEventListener("click", e => { if (e.target === overlay) cerrarModal(); });
  document.getElementById("edit-form").addEventListener("submit", handleEditSubmit);
}

async function abrirModal(id) {
  try {
    const s = await getSerieByID(id);
    document.getElementById("edit-id").value              = s.id;
    document.getElementById("edit-titulo").value          = s.titulo;
    document.getElementById("edit-episodio-actual").value = s.episodio_actual;
    document.getElementById("edit-total-episodios").value = s.total_episodios;
    document.getElementById("edit-estado").value          = s.estado;
    document.getElementById("edit-calificacion").value    = s.calificacion ?? "";
    document.getElementById("edit-imagen").value          = s.imagen ?? "";
    document.getElementById("modal-overlay").classList.add("open");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function cerrarModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.getElementById("edit-titulo-error").textContent = "";
}

async function handleEditSubmit(e) {
  e.preventDefault();

  const id  = document.getElementById("edit-id").value;
  const cal = document.getElementById("edit-calificacion").value;

  const data = {
    titulo:          document.getElementById("edit-titulo").value.trim(),
    episodio_actual: parseInt(document.getElementById("edit-episodio-actual").value) || 0,
    total_episodios: parseInt(document.getElementById("edit-total-episodios").value) || 0,
    estado:          document.getElementById("edit-estado").value,
    calificacion:    cal !== "" ? parseFloat(cal) : null,
    imagen:          document.getElementById("edit-imagen").value.trim() || null,
  };

  if (!data.titulo) {
    document.getElementById("edit-titulo-error").textContent = "El título es requerido";
    return;
  }

  try {
    await updateSerie(id, data);
    showToast("Serie actualizada", "success");
    cerrarModal();
    await cargarSeries();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Toast ──
function showToast(msg, type = "success") {
  const container = document.getElementById("toast-container");
  const toast     = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = type === "success" ? `✓ ${msg}` : `✕ ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}