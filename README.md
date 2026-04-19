# Series Tracker — Frontend 🎬

Interfaz web para el tracker personal de series (y lo que quieras trackear). Construida con HTML, CSS y JavaScript vanilla, sin frameworks ni dependencias de build.

## Cómo correr el proyecto

### Requisitos
- El [backend](https://github.com/MarceloDetlefsen/backend-proyecto1-web) corriendo en `http://localhost:8080`
- Un servidor de archivos estático (cualquiera sirve)

### Instalación

```bash
git clone https://github.com/MarceloDetlefsen/frontend-proyecto1-web.git
cd frontend-proyecto1-web
```

Luego servís los archivos con cualquiera de estas opciones:

```bash
# Con Python
python -m http.server 3000

# Con Node
npx serve .

# Con VS Code
# Extensión Live Server → click derecho en index.html → "Open with Live Server"
```

Abrís `http://localhost:3000` en el navegador y listo.

### Estructura del proyecto

```
.
├── index.html        # Lista principal con búsqueda, filtros y cards
├── crear.html        # Formulario para agregar una nueva entrada
├── detalle.html      # Vista detallada de una serie + sistema de ratings
├── css/
│   └── styles.css    # Estilos globales con design tokens en CSS variables
└── js/
    ├── api.js        # Todas las llamadas al backend (fetch)
    ├── index.js      # Lógica de la lista: búsqueda, sort, paginación, modal
    ├── crear.js      # Lógica del formulario de creación
    └── detalle.js    # Lógica de la vista detalle + ratings
```

## Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Lista | `index.html` | Grilla de cards con búsqueda, ordenamiento y paginación |
| Nueva entrada | `crear.html` | Formulario con preview de imagen en tiempo real |
| Detalle | `detalle.html?id={id}` | Info completa, controles de episodio y calificaciones |

## Funcionalidades

### Lista principal (`index.html`)
- Búsqueda en tiempo real con debounce de 400ms
- Ordenamiento por: fecha de adición, título, progreso, calificación y estado — todo delegado al backend
- Paginación de 8 elementos por página
- Incrementar / decrementar episodio directamente desde la card
- Modal de edición sin cambiar de página
- Preferencias de sort y búsqueda persistidas en `localStorage`

### Nueva entrada (`crear.html`)
- Preview de la imagen al pegar la URL, antes de guardar
- Validación de campos requeridos en cliente y manejo de errores del servidor

### Detalle (`detalle.html`)
- Controles de episodio con barra de progreso actualizada en vivo
- Sistema de ratings: agregar puntuación (1–10) con comentario opcional, ver promedio y lista histórica, eliminar ratings individuales

## Comunicación con el backend

Todo pasa por `js/api.js`. Cada función corresponde a un endpoint:

| Función | Método | Endpoint |
|---------|--------|----------|
| `getSeries(params)` | GET | `/series` |
| `getSerieByID(id)` | GET | `/series/{id}` |
| `createSerie(data)` | POST | `/series` |
| `updateSerie(id, data)` | PUT | `/series/{id}` |
| `deleteSerie(id)` | DELETE | `/series/{id}` |
| `incrementarEpisodio(id)` | PATCH | `/series/{id}/episodio/incrementar` |
| `decrementarEpisodio(id)` | PATCH | `/series/{id}/episodio/decrementar` |
| `getRatings(serieID)` | GET | `/series/{id}/ratings` |
| `createRating(serieID, data)` | POST | `/series/{id}/ratings` |
| `deleteRating(id)` | DELETE | `/ratings/{id}` |

Si necesitás cambiar la URL base del backend, editás la constante al inicio de `api.js`:

```js
const BASE_URL = "http://localhost:8080";
```

## 👨‍💻 Autor
Marcelo Detlefsen - 24554

## 🔗 Links
- [Repositorio Backend](https://github.com/MarceloDetlefsen/backend-proyecto1-web)