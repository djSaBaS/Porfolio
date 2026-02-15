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
1. Edita `projects/data.json`.
2. Cada proyecto incluye `name`, `url`, `repo`, `hrSummary`, `techNotes`, `tags`.
3. Si quieres una página de detalle nueva, crea carpeta en `projects/<slug>/index.html` y añádela también al `sitemap.xml`.

## Vista RRHH / Tech
El toggle se guarda en `localStorage` con la clave `portfolioAudienceView` y se aplica automáticamente en todas las páginas.
