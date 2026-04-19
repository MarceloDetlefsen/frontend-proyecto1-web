let serieID = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  serieID = params.get("id");

  if (!serieID) {
    window.location.href = "index.html";
    return;
  }

  cargarDetalle();
  cargarRatings();

  document.getElementById("btn-incrementar").addEventListener("click", () => handleEpisodio("incrementar"));
  document.getElementById("btn-decrementar").addEventListener("click", () => handleEpisodio("decrementar"));
  document.getElementById("rating-form").addEventListener("submit", handleRatingSubmit);
});

// ── Detalle de la serie ──
async function cargarDetalle() {
  try {
    const s = await getSerieByID(serieID);
    renderHero(s);
    renderControles(s);
    document.title = `${s.titulo} — Series Tracker`;
  } catch (err) {
    document.getElementById("detalle-hero").innerHTML =
      `<div style="color:var(--gray-400);padding:2rem">No se pudo cargar la serie.</div>`;
    showToast(err.message, "error");
  }
}

function renderHero(s) {
  const poster = s.imagen
    ? `<img class="detalle-poster" src="${s.imagen}" alt="${s.titulo}" onerror="this.outerHTML='<div class=\\'detalle-poster-placeholder\\'>🎬</div>'">`
    : `<div class="detalle-poster-placeholder">🎬</div>`;

  const cal = s.calificacion != null
    ? `<span class="meta-chip orange">⭐ ${parseFloat(s.calificacion).toFixed(1)}</span>`
    : "";

  document.getElementById("detalle-hero").innerHTML = `
    ${poster}
    <div class="detalle-info">
      <h1 class="detalle-titulo">${s.titulo}</h1>
      <div class="detalle-meta">
        <span class="estado-badge estado-${s.estado}" style="position:static">${s.estado}</span>
        <span class="meta-chip">${s.episodio_actual} / ${s.total_episodios} episodios</span>
        ${cal}
      </div>
    </div>`;
}

function renderControles(s) {
  const pct = s.total_episodios > 0
    ? Math.round((s.episodio_actual / s.total_episodios) * 100)
    : 0;

  document.getElementById("ep-label").textContent = `Ep. ${s.episodio_actual} / ${s.total_episodios}`;
  document.getElementById("ep-pct").textContent   = `${pct}%`;
  document.getElementById("ep-fill").style.width  = `${pct}%`;
  document.getElementById("detalle-controles").style.display = "block";
  document.getElementById("ratings-section").style.display  = "block";
}

// ── Episodios ──
async function handleEpisodio(accion) {
  try {
    const fn = accion === "incrementar" ? incrementarEpisodio : decrementarEpisodio;
    const s  = await fn(serieID);
    renderHero(s);
    renderControles(s);
    showToast(`Episodio ${accion === "incrementar" ? "avanzado" : "retrocedido"}`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Ratings ──
async function cargarRatings() {
  try {
    const summary = await getRatings(serieID);
    renderRatings(summary);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderRatings(summary) {
  const promedio = document.getElementById("rating-promedio");
  const total    = document.getElementById("rating-total");
  const lista    = document.getElementById("ratings-list");

  if (summary.total === 0) {
    promedio.textContent = "—";
    total.textContent    = "Sin calificaciones";
    lista.innerHTML      = `<p style="color:var(--gray-400);font-size:0.9rem">Todavía no hay calificaciones. ¡Agregá la primera!</p>`;
    return;
  }

  promedio.textContent = parseFloat(summary.promedio).toFixed(1);
  total.textContent    = `${summary.total} calificación${summary.total !== 1 ? "es" : ""}`;

  lista.innerHTML = summary.ratings.map(r => {
    const fecha    = new Date(r.created_at).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
    const comentario = r.comentario ? `<span class="rating-item-comment">${r.comentario}</span>` : `<span class="rating-item-comment" style="color:var(--gray-400);font-style:italic">Sin comentario</span>`;
    return `
      <div class="rating-item">
        <span class="rating-item-score">${parseFloat(r.puntuacion).toFixed(1)}</span>
        ${comentario}
        <div class="rating-item-right">
          <span class="rating-item-date">${fecha}</span>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteRating(${r.id})">Eliminar</button>
        </div>
      </div>`;
  }).join("");
}

async function handleRatingSubmit(e) {
  e.preventDefault();

  document.getElementById("rating-error").textContent = "";

  const puntuacion = parseFloat(document.getElementById("rating-puntuacion").value);
  if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 10) {
    document.getElementById("rating-error").textContent = "La puntuación debe estar entre 1 y 10";
    return;
  }

  const comentario = document.getElementById("rating-comentario").value.trim();

  const btn = e.target.querySelector("[type=submit]");
  btn.disabled    = true;
  btn.textContent = "Guardando...";

  try {
    await createRating(serieID, {
      puntuacion,
      comentario: comentario !== "" ? comentario : null,
    });
    document.getElementById("rating-puntuacion").value  = "";
    document.getElementById("rating-comentario").value  = "";
    showToast("Calificación agregada", "success");
    await cargarRatings();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Agregar calificación";
  }
}

async function handleDeleteRating(id) {
  if (!confirm("¿Eliminar esta calificación?")) return;
  try {
    await deleteRating(id);
    showToast("Calificación eliminada", "success");
    await cargarRatings();
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