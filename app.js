// Año actual para el footer
document.getElementById('year').textContent = String(new Date().getFullYear());

// Configuración central de métricas (edita aquí sin tocar HTML/CSS)
const METRICS = [
  // Métrica de horas de formación
  {
    // Identificador interno
    id: 'training',
    // Título visible
    label: 'Formación (horas)',
    // Valor actual (ajústalo cuando quieras)
    current: 2000,
    // Objetivo para calcular porcentaje (ajústalo a tu gusto)
    target: 2500,
    // Texto extra
    hint: 'Cursos, certs y formación continua',
    // Color alternativo (opcional)
    accent: 'var(--accent)'
  },
  // Métrica de años en el sector
  {
    // Identificador interno
    id: 'years',
    // Título visible
    label: 'Años en el sector',
    // Valor actual estimado (2011 → 2026 = 15 aprox, ajusta si quieres)
    current: 15,
    // Objetivo para el rosco (ej. 20 años)
    target: 20,
    // Texto extra
    hint: 'Web, automatización y sistemas',
    // Color alternativo
    accent: 'var(--accent2)'
  },
  // Métrica de usuarios impactados
  {
    // Identificador interno
    id: 'users',
    // Título visible
    label: 'Usuarios impactados',
    // Valor actual conocido
    current: 500,
    // Objetivo visual (no tiene que ser “real”, es una escala de gráfico)
    target: 600,
    // Texto extra
    hint: 'Entornos educativos (9 colegios)',
    // Color alternativo
    accent: 'var(--accent)'
  },
  // Métrica de webs gestionadas
  {
    // Identificador interno
    id: 'sites',
    // Título visible
    label: 'Webs gestionadas',
    // Valor actual aproximado
    current: 15,
    // Objetivo visual
    target: 20,
    // Texto extra
    hint: 'WordPress + desarrollos propios',
    // Color alternativo
    accent: 'var(--accent2)'
  }
];

// Datos de proyectos (puedes ampliar cuando quieras)
const PROJECTS = [
  // Proyecto directorio
  {
    // Título
    title: 'Directorio de teléfonos para municipios',
    // Descripción
    desc: 'Directorio útil y mantenible para teléfonos de interés y servicios municipales.',
    // Etiquetas
    tags: ['Web', 'Utilidad', 'Comunidad'],
    // URL
    url: 'https://github.com/djSaBaS/directorio-viso-san-juan'
  },
  // Proyecto VoxFlow
  {
    // Título
    title: 'VoxFlow — Texto a voz',
    // Descripción
    desc: 'Proyecto de texto a voz (TTS) orientado a uso práctico e integración.',
    // Etiquetas
    tags: ['Python', 'TTS', 'Audio'],
    // URL
    url: 'https://github.com/djSaBaS/VoxFlow'
  },
  // Plugin CF7
  {
    // Título
    title: 'CF7 Limitador de Opciones',
    // Descripción
    desc: 'Plugin WordPress para limitar opciones en Contact Form 7 con enfoque robusto.',
    // Etiquetas
    tags: ['WordPress', 'PHP', 'Plugin'],
    // URL
    url: 'https://github.com/djSaBaS/CF7-Limitador-de-Opciones'
  },
  // OCR PDF
  {
    // Título
    title: 'OCR para PDF',
    // Descripción
    desc: 'Herramienta para extraer texto de PDFs mediante OCR, orientada a productividad.',
    // Etiquetas
    tags: ['Python', 'OCR', 'PDF'],
    // URL
    url: 'https://github.com/djSaBaS/OCR-para-PDF'
  },
  // Proyecto privado fútbol
  {
    // Título
    title: 'Estadísticas de fútbol (privado)',
    // Descripción
    desc: 'Registro en tiempo real de eventos y evolución hacia automatización con cámaras.',
    // Etiquetas
    tags: ['Deporte', 'Datos', 'Automatización'],
    // URL
    url: 'https://www.linkedin.com/in/juanantoniosanchezplaza/'
  }
];

// Datos de webs
const SITES = [
  // Legamar
  {
    // Título
    title: 'Colegio Legamar',
    // Descripción
    desc: 'Sitio web corporativo del centro educativo.',
    // Etiquetas
    tags: ['Web', 'Educación'],
    // URL
    url: 'https://www.colegiolegamar.com'
  },
  // Torrejón
  {
    // Título
    title: 'Colegio HBS Torrejón',
    // Descripción
    desc: 'Sitio web del centro educativo.',
    // Etiquetas
    tags: ['Web', 'Educación'],
    // URL
    url: 'https://www.humanitastorrejon.com'
  },
  // Humanitas
  {
    // Título
    title: 'Humanitas Centros Educativos',
    // Descripción
    desc: 'Web corporativa del grupo.',
    // Etiquetas
    tags: ['Web', 'Educación'],
    // URL
    url: 'https://www.humanitaseducacion.com'
  }
];

// Render de tarjetas genéricas (sin innerHTML para evitar riesgos)
function renderCards(containerId, items) {
  // Obtiene contenedor
  const container = document.getElementById(containerId);

  // Valida existencia del contenedor
  if (!container) {
    // Sale si no existe
    return;
  }

  // Recorre elementos
  items.forEach((item) => {
    // Crea tarjeta
    const card = document.createElement('div');
    // Asigna clase
    card.className = 'card';

    // Crea título
    const title = document.createElement('h3');
    // Texto título
    title.textContent = item.title;

    // Crea descripción
    const desc = document.createElement('p');
    // Clase texto secundario
    desc.className = 'muted';
    // Texto descripción
    desc.textContent = item.desc;

    // Crea enlace
    const link = document.createElement('a');
    // URL
    link.href = item.url;
    // Nueva pestaña
    link.target = '_blank';
    // Seguridad
    link.rel = 'noopener';
    // Texto enlace
    link.textContent = 'Ver';

    // Crea contenedor badges
    const badges = document.createElement('div');
    // Clase badges
    badges.className = 'badges';

    // Render badges
    (item.tags || []).forEach((t) => {
      // Crea badge
      const b = document.createElement('span');
      // Clase badge
      b.className = 'badge';
      // Texto badge
      b.textContent = t;
      // Añade badge
      badges.appendChild(b);
    });

    // Añade título
    card.appendChild(title);
    // Añade descripción
    card.appendChild(desc);
    // Añade enlace
    card.appendChild(link);
    // Añade badges
    card.appendChild(badges);

    // Inserta tarjeta
    container.appendChild(card);
  });
}

// Calcula porcentaje seguro
function toPercent(current, target) {
  // Evita división por cero
  if (!target || target <= 0) {
    // Retorna 0 si objetivo inválido
    return 0;
  }
  // Calcula ratio
  const ratio = current / target;
  // Limita a 0..1
  const clamped = Math.max(0, Math.min(1, ratio));
  // Devuelve porcentaje
  return Math.round(clamped * 100);
}

// Crea un rosco (donut) en el DOM
function createDonut(metric) {
  // Calcula porcentaje final
  const finalPercent = toPercent(metric.current, metric.target);

  // Contenedor principal
  const root = document.createElement('div');
  // Clase de rosco
  root.className = 'donut';

  // Contenedor del anillo
  const ring = document.createElement('div');
  // Clase del anillo
  ring.className = 'donut__ring';
  // Aplica acento si se define
  ring.style.setProperty('--donut-accent', metric.accent || 'var(--accent)');

  // Centro del rosco
  const center = document.createElement('div');
  // Clase del centro
  center.className = 'donut__center';

  // Texto porcentaje
  const percentEl = document.createElement('div');
  // Clase porcentaje
  percentEl.className = 'donut__percent';
  // Valor inicial
  percentEl.textContent = '0%';

  // Texto valor
  const valueEl = document.createElement('div');
  // Clase valor
  valueEl.className = 'donut__value';
  // Texto valor con objetivo
  valueEl.textContent = `${metric.current} / ${metric.target}`;

  // Label
  const labelEl = document.createElement('div');
  // Clase label
  labelEl.className = 'donut__label';
  // Texto label
  labelEl.textContent = metric.label;

  // Hint
  const hintEl = document.createElement('div');
  // Clase hint
  hintEl.className = 'donut__hint';
  // Texto hint
  hintEl.textContent = metric.hint;

  // Monta centro
  center.appendChild(percentEl);
  // Monta centro
  center.appendChild(valueEl);
  // Inserta centro dentro del anillo
  ring.appendChild(center);

  // Inserta anillo
  root.appendChild(ring);
  // Inserta label
  root.appendChild(labelEl);
  // Inserta hint
  root.appendChild(hintEl);

  // Devuelve nodo y elementos para animación
  return { root, ring, percentEl, finalPercent, accent: metric.accent || 'var(--accent)' };
}

// Aplica el gradiente del rosco según porcentaje
function setDonutAngle(ring, percent, accent) {
  // Convierte porcentaje a grados
  const deg = Math.round((percent / 100) * 360);
  // Aplica conic-gradient
  ring.style.background = `conic-gradient(${accent} ${deg}deg, rgba(255,255,255,0.08) 0deg)`;
}

// Anima rosco hasta el porcentaje final
function animateDonut(ring, percentEl, finalPercent, accent) {
  // Duración aproximada
  const durationMs = 900;
  // Marca inicio
  const start = performance.now();

  // Paso de animación
  function step(now) {
    // Calcula progreso 0..1
    const t = Math.min(1, (now - start) / durationMs);
    // Easing suave
    const eased = 1 - Math.pow(1 - t, 3);
    // Porcentaje actual
    const current = Math.round(eased * finalPercent);

    // Actualiza texto
    percentEl.textContent = `${current}%`;
    // Actualiza anillo
    setDonutAngle(ring, current, accent);

    // Continua si no ha terminado
    if (t < 1) {
      // Solicita frame
      requestAnimationFrame(step);
    }
  }

  // Inicia animación
  requestAnimationFrame(step);
}

// Renderiza métricas
function renderMetrics() {
  // Contenedor métricas
  const container = document.getElementById('metrics');

  // Valida existencia
  if (!container) {
    // Sale si no existe
    return;
  }

  // Limpia contenido
  container.textContent = '';

  // Crea y anima cada rosco
  METRICS.forEach((m) => {
    // Crea rosco
    const donut = createDonut(m);
    // Inserta rosco
    container.appendChild(donut.root);
    // Establece a 0 inicialmente
    setDonutAngle(donut.ring, 0, donut.accent);
    // Anima hasta porcentaje final
    animateDonut(donut.ring, donut.percentEl, donut.finalPercent, donut.accent);
  });
}

// Renderiza página
function init() {
  // Render métricas
  renderMetrics();
  // Render proyectos
  renderCards('projects', PROJECTS);
  // Render webs
  renderCards('sites', SITES);
}

// Inicia al cargar DOM
document.addEventListener('DOMContentLoaded', init);
