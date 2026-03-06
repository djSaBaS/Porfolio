# Portfolio de Sabas (GitHub Pages)

Sitio estático (HTML/CSS/JS) preparado para publicar en GitHub Pages desde la raíz de `main`.

## Despliegue en GitHub Pages
1. Sube este contenido a la rama `main`.
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Branch: `main` y carpeta `/ (root)`.
5. URL esperada: `https://djsabas.github.io/Porfolio/`.

## Assets que debes añadir
Coloca estos archivos dentro de `assets/`:
- `avatar.jpg` (foto de perfil)
- `og.png` (imagen para redes sociales)
- `favicon.ico` (opcional)
- `01-cv-juanantoniosanchezplaza.pdf` (CV en PDF)

## Añadir o editar proyectos
1. Edita `projects/catalog.json` para añadir metadatos del portfolio por repositorio (`slug`, `url`, `hrSummary`, `techNotes`, `tags`, `featured`).
2. El listado principal se carga automáticamente desde la API pública de GitHub (`djSaBaS`) y mezcla esos datos con el catálogo local.
3. Si quieres una página de detalle nueva, crea carpeta en `projects/<slug>/index.html` y añádela también al `sitemap.xml`.

## Formación dinámica
1. Edita `assets/json/formacion.json` para mantener cursos, horas y skills.
2. La sección de formación del CV y el total de horas en métricas se actualizan automáticamente desde este JSON.

## Vista RRHH / Tech
El toggle se guarda en `localStorage` con la clave `portfolioAudienceView` y se aplica automáticamente en todas las páginas.
