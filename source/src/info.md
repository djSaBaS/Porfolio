# Módulo de currículum

La firma de la cabecera prioriza el nombre completo en ambas audiencias; el alias aparece debajo. Los títulos de páginas secundarias identifican también a Juan Antonio Sánchez Plaza. Los handles de GitHub y la terminal simulada conservan su contexto técnico.

`career.json` es la fuente curricular común y conserva sobreescrituras editoriales explícitas para la importación inicial. `presentation.json` añade resúmenes y casos autorizados; `presentation.py` valida rutas y escapa el contenido. `page.html` define la estructura; `sections/` conserva bloques de experiencia, trayectoria, formación y proyectos. `build.py` los ordena por audiencia y produce documentos y casos estáticos. `app.js` filtra nodos preconstruidos, muestra fichas nativas y procesa terminal y preferencias solo en navegador. El CSS y recursos se sirven desde `dist/assets`.

Los casos corporativos no incluyen enlaces a repositorios. Los públicos solo enlazan al destino exacto del catálogo verificado. El estado beta de tutorías se presenta junto al título y en el detalle, con validación pendiente. Semáforos y radar son funciones descritas del proyecto corporativo; este portfolio no implementa puntuación ni recoge datos de alumnos.

La cronología ordena inicios con precisión anual o mensual. No representa la distancia entre filas como duración proporcional. El mapa usa escala mensual proporcional de 1995 a 2026; desplaza rótulos verticalmente para reducir colisiones. Los intervalos laborales se trazan hasta su fin documentado. Main agrupa formación reglada y certificados profesionales y ocupa el eje central.

Las salidas comienzan antes del primer hito para que cursos y trabajos queden en el tramo plano; esos conectores son espacio geométrico, no actividad profesional adicional. Los controles Bézier avanzan siempre en X. La portada es un esquema de etapas con espaciado mínimo para apartaderos breves; la escala mensual exacta se conserva en las estaciones del mapa detallado. IA ocupa su propio corredor entre informática y main.

Las fichas reservan filas según la anchura de la etiqueta y la duración completa de un trabajo. No se reutiliza una fila ocupada; un cambio futuro que no quepa detiene la construcción. El lienzo mantiene 3900 píxeles de ancho y amplía su altura a 1860. `data-main-y` permite adaptar los saltos de fecha. Cada periodo admite `y`, `labelDirection` y `mergeRamp` para situar una reapertura cercana a main y dejar su último trabajo en el tramo plano; esos valores se validan antes de dibujar.

`graph.py` dibuja la topología definida en `career.json → graph.routes`. Cada ruta declara su padre, sectores integrados y periodos. Una fecha `end` produce merge en esa fecha; `end: null` conserva una flecha y PR abierto. Varios periodos representan cierre y reapertura. IA nace de desarrollo; sistemas y desarrollo comparten el corredor del dibujo aportado por el titular. Los periodos conceptuales de una rama no cambian las fechas de sus contratos o cursos.

Automoción se integra en 1999; sonido/diseño tiene etapas 2000–2001 y 2014–2015; industria tiene etapas 1999–2015 y 2020–2023. Desarrollo continúa desde 2011 e IA desde su formación específica en 2024, con aplicación en el puesto actual. Un año de cierre se dibuja en el extremo del año sin afirmar un mes de finalización documentalmente desconocido.

Los cuatro certificados de 2023 aparecen por fecha de expedición, sin deducir que se cursaron en un mes. Los datos pendientes se mantienen fuera de `dist`. La TPC se identifica como vencida; no se publica como acreditación vigente.

La revisión 4.2.0 incorpora once cargas horarias contrastadas y tres registros recuperados mediante documentos personales, con 45 hitos y 34 formaciones. `docs/formacion-contrastada-4.2.0.md` distingue diplomas individuales de horas nominales u orientativas de catálogo. Ningún diploma privado, DNI, firma, número de cuenta o enlace de descarga autenticado forma parte del sitio o de la entrega de código.
