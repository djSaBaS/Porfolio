/**
 * Modal compartida para ambas vistas.
 * Exporta initModal para inyectar store y openModal(id) para apertura global.
 */
let eventMap = new Map();
let skillsMap = new Map();
let modalInstance = null;

function renderSkillChip(skill) {
  const icon = skill.icon ? `<i class="bi ${skill.icon}"></i>` : "";
  const style = skill.color ? `style="border-color:${skill.color};"` : "";
  return `<span class="skill-chip" ${style}>${icon}<span>${skill.label}</span></span>`;
}

export function initModal({ events, skills }) {
  eventMap = new Map(events.map((event) => [event.id, event]));
  skillsMap = new Map(skills.map((skill) => [skill.key, skill]));

  const modalEl = document.getElementById("eventModal");
  modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);

  // API global exigida para invocación uniforme desde cualquier vista.
  window.openModal = openModal;
}

export function openModal(id) {
  const event = eventMap.get(id);
  if (!event || !modalInstance) return;

  const typeLabel = event.tipo === "trabajo" ? "Experiencia profesional" : "Formación";
  const org = event.empresa || event.centro || "—";
  const range = `${event.fecha_inicio} — ${event.actual ? "Actualidad" : event.fecha_fin}`;
  const actionLabel = event.tipo === "trabajo" ? "Ver empresa / proyecto" : "Ver curso";

  const skillsHtml = (event.skills || [])
    .map((key) => skillsMap.get(key))
    .filter(Boolean)
    .map((skill) => renderSkillChip(skill))
    .join("");

  const tagsHtml = (event.tags || []).map((tag) => `<span class="skill-chip">#${tag}</span>`).join("");

  const actionBtn = event.url
    ? `<a class="btn btn-primary" href="${event.url}" target="_blank" rel="noopener noreferrer">${actionLabel}</a>`
    : "";

  document.getElementById("eventModalLabel").textContent = event.titulo;
  document.getElementById("eventModalBody").innerHTML = `
    <ul class="meta-list">
      <li><strong>Tipo:</strong> ${typeLabel}</li>
      <li><strong>Subtítulo:</strong> ${event.subtitulo || "—"}</li>
      <li><strong>Empresa / Centro:</strong> ${org}</li>
      <li><strong>Fechas:</strong> ${range}</li>
      <li><strong>Categoría:</strong> ${event.categoria}</li>
    </ul>
    <p>${event.descripcion}</p>
    <div class="mb-2"><strong>Skills:</strong><div>${skillsHtml || "<span class='text-secondary'>Sin skills asociadas.</span>"}</div></div>
    <div class="mb-3"><strong>Tags:</strong><div>${tagsHtml || "<span class='text-secondary'>Sin tags.</span>"}</div></div>
    ${event.actual ? '<span class="badge text-bg-success mb-3">Etapa actual</span>' : ""}
    <div class="d-flex gap-2">${actionBtn}</div>
  `;

  modalInstance.show();
}
