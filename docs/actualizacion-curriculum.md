# Actualización del currículum · 5 de noviembre de 2026

La presentación actual utiliza fuentes normalizadas, 45 hitos, 34 formaciones, cinco casos y cuatro repositorios públicos. El origen editorial es el currículum autorizado de Sites; se adapta a GitHub Pages conservando foto y pixelart de este repositorio. Las tres imágenes originales mantienen sus blobs `2d7c43b11cf2cd055b650fc1edcdcfe57e3cd08b` y `cefaf4ee934dc23095ea9c57d76768b104f2856b` (las dos variantes pixelart comparten contenido).

## Alcance y riesgo

Presentación estática R1; revisión RELEASE por publicación. No se añaden autenticación, backend, API, formularios remotos, SQL, secretos o dependencias de ejecución. No se modifican permisos de GitHub, workflows ni protecciones de ramas. Se integra mediante rama y PR. `.nojekyll` mantiene la publicación de archivos estáticos; no concede privilegios.

La fuente editorial pública se guarda en `source/`; `source/dist/` es un resultado intermedio ignorado. Se copian solo generadores, plantillas, datos autorizados y recursos publicables. Quedan fuera la configuración de Sites, los documentos personales utilizados para contrastar formación y los archivos de trabajo. Los antiguos datos/controladores del portfolio se conservan como historial y no son cargados por las nuevas páginas.

## Compatibilidad y privacidad

Canonical, sitemap, schema y rutas del documento utilizan `https://djsabas.github.io/Porfolio/`. También se adaptan la redirección inicial de audiencia y el cambio de vista del JavaScript; filtros y anclas se mantienen dentro del proyecto. Las rutas históricas se redirigen mediante una tabla cerrada, sin destinos introducidos por visitantes.

El retrato alternativo usa botones semánticos, `aria-pressed` y el pixelart decorativo. Hover se limita a punteros que lo admiten; teclado y pulsación alternan el mismo estado. No se cambia la preferencia del visitante ni se añaden solicitudes a terceros. La demostración de procesos comparte la corrección de movimiento reducido de Sites: estados, contadores y temporizadores acotados con cancelación al repetir.

## Verificación

- Constructor portable y validación de las diez páginas principales: canonical propio, prefijo `/Porfolio/`, IDs únicos y recursos locales existentes.
- Diecisiete regresiones de mapas, topología, escape, rutas y enlaces corporativos.
- Sintaxis JavaScript de los dos controladores nuevos y sintaxis Python del constructor/validador.
- Navegador local: 45 estaciones; foto original y pixelart enlazados correctamente; hover con `aria-pressed=false` y sin foco de teclado muestra el pixelart; cambio de RR. HH. a TECH conserva `/Porfolio/tech/` y el mapa completo.
- La demostración compartida se probó en la copia ficticia autorizada con movimiento reducido, secuencia visible y repetición mediante doble clic.

La revisión manual mantiene escapes y destinos conocidos. No se identificaron findings Critical/High en el alcance cambiado. SonarQube, Semgrep, Gitleaks y SCA dedicado: NOT VERIFIED. No se afirma certificación de accesibilidad ni de seguridad. Los recibos de código de revisiones anteriores no certifican esta fuente nueva.
