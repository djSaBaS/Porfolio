# Juan Antonio Sánchez Plaza · Currículum interactivo

Portfolio estático para [GitHub Pages](https://djsabas.github.io/Porfolio/), sincronizado con la presentación actual de Sites. Dos vistas: RR. HH. prioriza experiencia reciente; TECH, casos y mapa de ramas. Incluye 45 hitos, 34 formaciones, cinco casos y cuatro repositorios públicos seleccionados. No se consultan APIs para obtener contenido durante la visita.

La fotografía `assets/avatar.jpg` y las imágenes `avatar_pixel.jpg` y `avatar_zoom.jpg` conservan sus bytes originales. El retrato muestra pixelart al pasar el ratón y también admite teclado o una pulsación. La demostración de procesos incluye contadores y funciona con movimiento reducido; sus tiempos son ilustrativos, sin atribuir ahorros reales.

## Mantener el contenido

Edita `source/src/career.json` y `source/src/presentation.json`. Las plantillas están en `source/src/`; los generadores de HTML y SVG, en `source/`. Los controles y estilos compartidos están en `source/assets/`. Los archivos antiguos `assets/json/`, `data/` y los controladores de la versión anterior se conservan como historial; el currículum actual utiliza exclusivamente la fuente normalizada de `source/src/`.

Con Python 3.12, sin dependencias de producción:

```text
python tools/build_pages.py
python tools/validate_pages.py
python -m unittest discover -s source/tests
node --check assets/app.js
node --check assets/portrait.js
```

El constructor adapta enlaces, preferencias de audiencia y canonical a `/Porfolio/`; `source/dist/` es una carpeta intermedia ignorada por Git. No se debe publicar configuración de Sites ni copiar documentos personales de verificación. Los PDF públicos son las versiones breves y completas previamente generadas y autorizadas.

## Publicación

GitHub Pages utiliza `main` y la carpeta raíz. Los archivos HTML de la raíz y sus secciones ya están construidos; `.nojekyll` conserva su tratamiento estático. Antes de integrar un cambio, regenera, valida y revisa su PR. No es necesario instalar Python ni ejecutar un backend en el alojamiento.

Las rutas antiguas de sobre mí, cursos y proyectos conducen a las secciones actuales mediante destinos locales fijos. Los casos corporativos se describen sin enlaces privados, código empresarial, nóminas o registros de alumnos. La beta de tutorías conserva su validación pendiente y la migración PHP su estado de implantación.

Las preferencias de tema y audiencia se guardan solo en el navegador; no hay formularios de envío, analítica añadida o cuentas de usuario. El código ofrece estructura accesible, estados textuales y navegación por teclado. SonarQube y escáneres dedicados no forman parte de una certificación de esta entrega.
