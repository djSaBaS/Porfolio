/**
 * Render RRHH View: timeline vertical clara y legible.
 * Comparte datos y modal con la vista Tech.
 */

function dateRange(event) {
  return `${event.fecha_inicio} — ${event.actual ? "Actualidad" : event.fecha_fin}`;
}

function skillIcons(event, skillsMap) {
  return (event.skills || [])
    .map((key) => skillsMap.get(key))
    .filter(Boolean)
    .slice(0, 5)
    .map((skill) => `<span class="skill-chip"><i class="bi ${skill.icon || "bi-circle"}"></i>${skill.label}</span>`)
    .join("");
}

export function renderHrView(container, events, skills) {
  const sorted = [...events].sort((a, b) => b.year_start - a.year_start || (a.order || 0) - (b.order || 0));
  const skillsMap = new Map(skills.map((s) => [s.key, s]));

  // Eje vertical de 8px configurable; si hubiese lógica por tramo puede variar por scroll/segmento.
  const html = [`<div class="hr-timeline"><div class="hr-axis" aria-hidden="true"></div>`];

  sorted.forEach((event, index) => {
    if (event.tipo === "trabajo") {
      const sideClass = index % 2 ? "right" : "left";
      html.push(`
        <article class="hr-item ${sideClass}">
          <button class="hr-card text-start" onclick="openModal('${event.id}')" aria-label="Abrir detalle de ${event.titulo}">
            <small class="text-secondary">${dateRange(event)}</small>
            <h3 class="h6 mt-1 mb-1">${event.titulo}</h3>
            <p class="mb-1">${event.subtitulo || ""}</p>
            <p class="mb-2 text-secondary">${event.empresa || event.centro || ""}</p>
            <div>${skillIcons(event, skillsMap)}</div>
          </button>
          <span class="hr-dot" style="background:${event.color}"></span>
        </article>
      `);
    } else {
      html.push(`
        <div class="hr-formacion-mini">
          <button type="button" onclick="openModal('${event.id}')">
            <i class="bi bi-mortarboard"></i> ${event.titulo}
          </button>
        </div>
      `);
    }
  });

  html.push(`</div>`);
  container.innerHTML = html.join("");
}
