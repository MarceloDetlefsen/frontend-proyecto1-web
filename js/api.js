// Local
// const BASE_URL = "http://localhost:8080";

// Producción en Railway
// const BASE_URL = "https://backend-proyecto1-web-production.up.railway.app/";

// Producción en Render
const BASE_URL = "https://backend-proyecto1-web.onrender.com";

// ── Series ──

async function getSeries(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/series?${query}`);
  if (!res.ok) throw new Error("Error obteniendo series");
  return res.json();
}

async function getSerieByID(id) {
  const res = await fetch(`${BASE_URL}/series/${id}`);
  if (!res.ok) throw new Error("Serie no encontrada");
  return res.json();
}

async function createSerie(data) {
  const res = await fetch(`${BASE_URL}/series`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error creando serie");
  return json;
}

async function updateSerie(id, data) {
  const res = await fetch(`${BASE_URL}/series/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error actualizando serie");
  return json;
}

async function deleteSerie(id) {
  const res = await fetch(`${BASE_URL}/series/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error eliminando serie");
}

async function incrementarEpisodio(id) {
  const res = await fetch(`${BASE_URL}/series/${id}/episodio/incrementar`, { method: "PATCH" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error incrementando episodio");
  return json;
}

async function decrementarEpisodio(id) {
  const res = await fetch(`${BASE_URL}/series/${id}/episodio/decrementar`, { method: "PATCH" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error decrementando episodio");
  return json;
}

// ── Ratings ──

async function getRatings(serieID) {
  const res = await fetch(`${BASE_URL}/series/${serieID}/ratings`);
  if (!res.ok) throw new Error("Error obteniendo ratings");
  return res.json();
}

async function createRating(serieID, data) {
  const res = await fetch(`${BASE_URL}/series/${serieID}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error creando rating");
  return json;
}

async function deleteRating(id) {
  const res = await fetch(`${BASE_URL}/ratings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error eliminando rating");
}