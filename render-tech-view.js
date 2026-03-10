/**
 * Render Tech View: SVG horizontal en desktop y semivertical en móvil.
 * Comentarios orientados a mantenimiento y evolución del layout.
 */

const BRANCH_Y = {
  legacy: 320,
  sound: 260,
  construction: 220,
  transition: 165,
  tech: 110,
  specialization: 75,
  ai: 45,
};

function getEventColor(event) {
  return event.color || "#0ea5e9";
}

/**
 * Escala temporal consistente: mapea año normalizado a coordenada X.
 * Permite rangos amplios y evita desplazamientos aleatorios.
 */
function mapYearToX(year, minYear, maxYear, width, padding) {
  const span = Math.max(1, maxYear - minYear);
  const ratio = (year - minYear) / span;
  return padding + ratio * (width - padding * 2);
}

/**
 * En móvil evitamos dependencia de scroll horizontal: mismo concepto de ramas,
 * pero el tiempo avanza en eje Y para maximizar legibilidad táctil.
 */
function mapYearToYMobile(year, minYear, maxYear, height, padding) {
  const span = Math.max(1, maxYear - minYear);
  const ratio = (year - minYear) / span;
  return padding + ratio * (height - padding * 2);
}

/**
 * Genera curva Bézier suave entre rama principal y rama secundaria.
 * Se usa para representar forks/merges sin ángulos bruscos.
 */
function branchCurvePath(x1, y1, x2, y2) {
  const cx1 = x1 + (x2 - x1) * 0.35;
  const cx2 = x1 + (x2 - x1) * 0.7;
  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
}

/**
 * Overlaps: dibuja dos líneas paralelas de 3px cuando hay eventos laborales solapados.
 */
function drawParallelOverlap(svg, x1, x2, y, colorA, colorB) {
  const ns = "http://www.w3.org/2000/svg";
  const line1 = document.createElementNS(ns, "line");
  const line2 = document.createElementNS(ns, "line");
  [line1, line2].forEach((line, idx) => {
    line.setAttribute("x1", x1);
    line.setAttribute("x2", x2);
    line.setAttribute("y1", y + (idx === 0 ? -2 : 2));
    line.setAttribute("y2", y + (idx === 0 ? -2 : 2));
    line.setAttribute("stroke", idx === 0 ? colorA : colorB);
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  });
}

export function renderTechView(container, events) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const sorted = [...events].sort((a, b) => a.year_start - b.year_start || (a.order || 0) - (b.order || 0));

  const minYear = Math.min(...sorted.map((e) => e.year_start));
  const maxYear = Math.max(...sorted.map((e) => e.year_end));

  const width = 1200;
  const height = isMobile ? 560 : 460;
  const padding = 52;

  container.innerHTML = `<div class="tech-canvas-wrap"><svg class="tech-svg" viewBox="0 0 ${width} ${height}" aria-label="Vista técnica de trayectoria"></svg></div>`;
  const svg = container.querySelector("svg");
  const ns = "http://www.w3.org/2000/svg";

  const baseY = isMobile ? 64 : BRANCH_Y.tech;

  // Línea principal (6px) que define la narrativa técnica global.
  const mainLine = document.createElementNS(ns, "line");
  mainLine.setAttribute("x1", isMobile ? 90 : padding);
  mainLine.setAttribute("x2", isMobile ? 90 : width - padding);
  mainLine.setAttribute("y1", isMobile ? padding : baseY);
  mainLine.setAttribute("y2", isMobile ? height - padding : baseY);
  mainLine.setAttribute("stroke", "#0ea5e9");
  mainLine.setAttribute("stroke-width", "6");
  mainLine.setAttribute("stroke-linecap", "round");
  svg.appendChild(mainLine);

  // Marcadores de años para anclar lectura temporal.
  for (let year = minYear; year <= maxYear; year += 2) {
    const t = document.createElementNS(ns, "text");
    if (isMobile) {
      t.setAttribute("x", "16");
      t.setAttribute("y", mapYearToYMobile(year, minYear, maxYear, height, padding) + 4);
    } else {
      t.setAttribute("x", mapYearToX(year, minYear, maxYear, width, padding) - 8);
      t.setAttribute("y", "30");
    }
    t.setAttribute("class", "tech-year");
    t.textContent = String(year);
    svg.appendChild(t);
  }

  const workEvents = sorted.filter((e) => e.tipo === "trabajo");
  for (let i = 0; i < workEvents.length - 1; i += 1) {
    const a = workEvents[i];
    const b = workEvents[i + 1];
    if (a.year_end >= b.year_start) {
      const x1 = isMobile ? 90 : mapYearToX(b.year_start, minYear, maxYear, width, padding);
      const x2 = isMobile ? 90 : mapYearToX(Math.min(a.year_end, b.year_end), minYear, maxYear, width, padding);
      const y = isMobile ? mapYearToYMobile(b.year_start, minYear, maxYear, height, padding) : baseY;
      if (!isMobile) drawParallelOverlap(svg, x1, x2, y, getEventColor(a), getEventColor(b));
    }
  }

  sorted.forEach((event, index) => {
    const x = isMobile ? 90 : mapYearToX(event.year_start, minYear, maxYear, width, padding);
    const yBase = BRANCH_Y[event.branch] || BRANCH_Y.tech;
    const y = isMobile
      ? mapYearToYMobile(event.year_start, minYear, maxYear, height, padding)
      : yBase + ((index % 3) - 1) * 6; // offset anticolisión para alta densidad.

    if (!isMobile && event.branch !== "tech") {
      const branch = document.createElementNS(ns, "path");
      branch.setAttribute("d", branchCurvePath(x - 70, BRANCH_Y.tech, x, y));
      branch.setAttribute("stroke", getEventColor(event));
      branch.setAttribute("stroke-width", "3.5");
      branch.setAttribute("fill", "none");
      branch.setAttribute("opacity", "0.8");
      svg.appendChild(branch);
    }

    const group = document.createElementNS(ns, "g");
    group.setAttribute("class", "tech-node");
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${event.titulo}. Abrir detalle.`);

    const node = document.createElementNS(ns, "circle");
    node.setAttribute("cx", x);
    node.setAttribute("cy", y);
    node.setAttribute("r", event.tipo === "trabajo" ? "13" : "10");
    node.setAttribute("fill", "#0e1528");
    node.setAttribute("stroke", getEventColor(event));
    node.setAttribute("stroke-width", event.tipo === "trabajo" ? "4" : "3");
    group.appendChild(node);

    const initial = document.createElementNS(ns, "text");
    initial.setAttribute("x", x - 4.5);
    initial.setAttribute("y", y + 4);
    initial.setAttribute("class", "tech-label");
    initial.textContent = event.initial || event.titulo.charAt(0).toUpperCase();
    group.appendChild(initial);

    const title = document.createElementNS(ns, "text");
    title.setAttribute("x", isMobile ? 120 : x - 28);
    title.setAttribute("y", isMobile ? y + 4 : y - 18);
    title.setAttribute("class", "tech-title");
    title.textContent = event.titulo.slice(0, 28);
    svg.appendChild(title);

    group.addEventListener("click", () => window.openModal(event.id));
    group.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.openModal(event.id);
      }
    });

    svg.appendChild(group);
  });
}
