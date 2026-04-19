document.addEventListener("DOMContentLoaded", () => {
  initPreviewImagen();
  document.getElementById("crear-form").addEventListener("submit", handleSubmit);
});

// ── Preview de imagen en tiempo real ──
function initPreviewImagen() {
  const input   = document.getElementById("imagen");
  const preview = document.getElementById("imagen-preview");
  const img     = document.getElementById("imagen-preview-img");

  input.addEventListener("input", () => {
    const url = input.value.trim();
    if (url) {
      img.src = url;
      img.onload  = () => { preview.style.display = "block"; };
      img.onerror = () => { preview.style.display = "none"; };
    } else {
      preview.style.display = "none";
    }
  });
}

// ── Submit ──
async function handleSubmit(e) {
  e.preventDefault();

  // Limpiar errores
  document.getElementById("titulo-error").textContent = "";

  const titulo = document.getElementById("titulo").value.trim();
  if (!titulo) {
    document.getElementById("titulo-error").textContent = "El título es requerido";
    return;
  }

  const cal        = document.getElementById("calificacion").value;
  const imagen     = document.getElementById("imagen").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();

  const data = {
    titulo,
    episodio_actual: parseInt(document.getElementById("episodio-actual").value) || 0,
    total_episodios: parseInt(document.getElementById("total-episodios").value) || 0,
    estado:          document.getElementById("estado").value,
    calificacion:    cal !== "" ? parseFloat(cal) : null,
    imagen:          imagen !== "" ? imagen : null,
    descripcion:     descripcion !== "" ? descripcion : null,
  };

  const btn = e.target.querySelector("[type=submit]");
  btn.disabled     = true;
  btn.textContent  = "Agregando...";

  try {
    await createSerie(data);
    showToast("Serie agregada correctamente", "success");
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
  } catch (err) {
    showToast(err.message, "error");
    btn.disabled    = false;
    btn.textContent = "Agregar serie";
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