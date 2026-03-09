// Activa el modo estricto para evitar errores silenciosos y reforzar buenas prácticas.
"use strict";

// Define la clase principal encargada de cargar, ordenar, filtrar y pintar la timeline.
class TimelineManager {
  // Crea una nueva instancia del gestor de timeline.
  constructor(options = {}) {
    // Guarda el selector del contenedor principal donde se renderizarán las tarjetas.
    this.containerSelector = options.containerSelector || '[data-timeline="container"]';

    // Guarda el selector del filtro por tipo de elemento.
    this.kindSelector = options.kindSelector || '[data-filter="kind"]';

    // Guarda el selector del filtro por etapa profesional o formativa.
    this.stageSelector = options.stageSelector || '[data-filter="stage"]';

    // Guarda el selector del filtro por texto libre o skills.
    this.searchSelector = options.searchSelector || '[data-filter="search"]';

    // Guarda el selector del contenedor de etiquetas rápidas de skills.
    this.tagsSelector = options.tagsSelector || '[data-filter="tags"]';

    // Guarda el selector del elemento que muestra el total de resultados.
    this.counterSelector = options.counterSelector || '[data-timeline="count"]';

    // Guarda la URL del JSON remoto si se desea cargar desde fichero.
    this.dataUrl = options.dataUrl || null;

    // Guarda los datos iniciales si se inyectan directamente desde JavaScript.
    this.initialData = Array.isArray(options.data) ? options.data : [];

    // Inicializa la colección completa de elementos.
    this.items = [];

    // Inicializa la colección filtrada de elementos.
    this.filteredItems = [];

    // Inicializa el estado de filtros con valores neutros.
    this.filters = {
      kind: "all",
      stage: "all",
      search: "",
      tag: ""
    };

    // Localiza el contenedor principal en el DOM.
    this.container = document.querySelector(this.containerSelector);

    // Localiza el filtro por tipo en el DOM.
    this.kindElement = document.querySelector(this.kindSelector);

    // Localiza el filtro por etapa en el DOM.
    this.stageElement = document.querySelector(this.stageSelector);

    // Localiza el filtro de búsqueda en el DOM.
    this.searchElement = document.querySelector(this.searchSelector);

    // Localiza el contenedor de etiquetas en el DOM.
    this.tagsElement = document.querySelector(this.tagsSelector);

    // Localiza el contador de resultados en el DOM.
    this.counterElement = document.querySelector(this.counterSelector);
  }

  // Inicializa la timeline completa y registra los eventos necesarios.
  async init() {
    // Valida que exista el contenedor principal antes de continuar.
    if (!this.container) {
      // Lanza un error claro si no se encuentra el nodo principal.
      throw new Error('No se encontró el contenedor de la timeline.');
    }

    // Carga los datos desde JSON remoto o desde memoria.
    this.items = await this.loadData();

    // Ordena los elementos para mostrarlos de forma consistente.
    this.items = this.sortItems(this.items);

    // Rellena los filtros dinámicos de etapas y tags.
    this.buildDynamicFilters();

    // Registra los eventos de interacción de los filtros.
    this.bindEvents();

    // Aplica los filtros iniciales.
    this.applyFilters();

    // Renderiza por primera vez la timeline.
    this.render();
  }

  // Carga los datos desde la fuente configurada.
  async loadData() {
    // Devuelve los datos locales si ya vienen embebidos.
    if (this.initialData.length > 0) {
      // Retorna una copia defensiva para evitar mutaciones externas.
      return [...this.initialData];
    }

    // Valida que exista una URL de datos cuando no hay datos embebidos.
    if (!this.dataUrl) {
      // Lanza un error si no existe ninguna fuente de datos disponible.
      throw new Error('No se ha definido dataUrl ni data inicial.');
    }

    // Realiza la petición al recurso JSON remoto.
    const response = await fetch(this.dataUrl, {
      // Define el método HTTP explícitamente.
      method: "GET",
      // Indica que se esperan datos JSON.
      headers: {
        // Informa al servidor del formato esperado.
        Accept: "application/json"
      }
    });

    // Comprueba si la respuesta HTTP ha sido correcta.
    if (!response.ok) {
      // Lanza un error con el código recibido para facilitar depuración.
      throw new Error(`Error al cargar timeline.json: ${response.status}`);
    }

    // Convierte la respuesta a estructura JavaScript.
    const data = await response.json();

    // Valida que el contenido sea un array.
    if (!Array.isArray(data)) {
      // Lanza un error si el JSON no tiene la estructura esperada.
      throw new Error("El JSON de la timeline no contiene un array válido.");
    }

    // Devuelve el array cargado desde el fichero.
    return data;
  }

  // Ordena los elementos por fecha de inicio descendente y fecha de fin descendente.
  sortItems(items) {
    // Devuelve una copia ordenada para no mutar el array original.
    return [...items].sort((a, b) => {
      // Obtiene la fecha de inicio del primer elemento.
      const startA = a.sortStart || a.dateStart || "";

      // Obtiene la fecha de inicio del segundo elemento.
      const startB = b.sortStart || b.dateStart || "";

      // Compara la fecha de inicio de forma descendente.
      const byStart = startB.localeCompare(startA);

      // Devuelve el resultado si la fecha de inicio no es igual.
      if (byStart !== 0) {
        // Retorna la comparación resuelta por inicio.
        return byStart;
      }

      // Obtiene la fecha de fin del primer elemento.
      const endA = a.sortEnd || a.dateEnd || "";

      // Obtiene la fecha de fin del segundo elemento.
      const endB = b.sortEnd || b.dateEnd || "";

      // Compara la fecha de fin de forma descendente.
      return endB.localeCompare(endA);
    });
  }

  // Construye los filtros dinámicos a partir de los datos disponibles.
  buildDynamicFilters() {
    // Rellena el filtro de etapas si el selector existe.
    if (this.stageElement) {
      // Obtiene las etapas únicas presentes en los datos.
      const stages = [...new Set(this.items.map((item) => item.stage).filter(Boolean))];

      // Genera el HTML de opciones del selector de etapas.
      const stageOptions = [
        // Añade la opción genérica para no filtrar.
        '<option value="all">Todas las etapas</option>',
        // Transforma cada etapa en una opción de selector.
        ...stages.map((stage) => `<option value="${this.escapeHtml(stage)}">${this.formatStageLabel(stage)}</option>`)
      ].join("");

      // Inserta las opciones en el selector.
      this.stageElement.innerHTML = stageOptions;
    }

    // Rellena el bloque de tags si el contenedor existe.
    if (this.tagsElement) {
      // Obtiene todas las etiquetas del dataset en un único array.
      const allTags = this.items.flatMap((item) => Array.isArray(item.tags) ? item.tags : []);

      // Elimina duplicados y ordena alfabéticamente ignorando mayúsculas.
      const uniqueTags = [...new Set(allTags)].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

      // Genera el HTML de botones de etiquetas.
      const tagsHtml = uniqueTags.map((tag) => {
        // Escapa el texto para evitar problemas de render o seguridad.
        const safeTag = this.escapeHtml(tag);

        // Devuelve el botón individual con atributos semánticos.
        return `<button type="button" class="timeline-tag-filter" data-tag="${safeTag}">${safeTag}</button>`;
      }).join("");

      // Inserta todos los botones en el contenedor.
      this.tagsElement.innerHTML = tagsHtml;
    }
  }

  // Registra todos los eventos de cambio y clic necesarios para los filtros.
  bindEvents() {
    // Registra el cambio del filtro por tipo si existe el elemento.
    if (this.kindElement) {
      // Escucha el cambio del selector de tipo.
      this.kindElement.addEventListener("change", (event) => {
        // Actualiza el estado interno del filtro.
        this.filters.kind = event.target.value || "all";

        // Reaplica filtros y repinta resultados.
        this.update();
      });
    }

    // Registra el cambio del filtro por etapa si existe el elemento.
    if (this.stageElement) {
      // Escucha el cambio del selector de etapa.
      this.stageElement.addEventListener("change", (event) => {
        // Actualiza el estado interno del filtro.
        this.filters.stage = event.target.value || "all";

        // Reaplica filtros y repinta resultados.
        this.update();
      });
    }

    // Registra la escritura en el campo de búsqueda si existe el elemento.
    if (this.searchElement) {
      // Escucha cambios en tiempo real del input.
      this.searchElement.addEventListener("input", (event) => {
        // Guarda el texto normalizado eliminando espacios sobrantes.
        this.filters.search = String(event.target.value || "").trim();

        // Reaplica filtros y repinta resultados.
        this.update();
      });
    }

    // Registra el clic delegado sobre el contenedor de tags si existe.
    if (this.tagsElement) {
      // Escucha clics en cualquier botón interno.
      this.tagsElement.addEventListener("click", (event) => {
        // Busca el botón de tag más cercano al punto pulsado.
        const button = event.target.closest("[data-tag]");

        // Sale del flujo si no se pulsó un botón válido.
        if (!button) {
          // Finaliza sin hacer nada.
          return;
        }

        // Obtiene la etiqueta pulsada.
        const selectedTag = button.dataset.tag || "";

        // Alterna la etiqueta activa si ya estaba seleccionada.
        this.filters.tag = this.filters.tag === selectedTag ? "" : selectedTag;

        // Actualiza el estado visual de los botones.
        this.updateTagButtons();

        // Reaplica filtros y repinta resultados.
        this.update();
      });
    }
  }

  // Centraliza la actualización tras cualquier interacción del usuario.
  update() {
    // Aplica los filtros activos sobre la colección principal.
    this.applyFilters();

    // Actualiza el contador visible de resultados.
    this.updateCounter();

    // Pinta la colección resultante en pantalla.
    this.render();
  }

  // Aplica todos los filtros activos sobre la colección de datos.
  applyFilters() {
    // Normaliza el texto de búsqueda a minúsculas.
    const searchTerm = this.normalizeText(this.filters.search);

    // Normaliza la etiqueta seleccionada a minúsculas.
    const selectedTag = this.normalizeText(this.filters.tag);

    // Genera la colección filtrada a partir de todos los elementos.
    this.filteredItems = this.items.filter((item) => {
      // Comprueba si el tipo coincide o si no hay filtro activo.
      const matchesKind = this.filters.kind === "all" || item.kind === this.filters.kind;

      // Comprueba si la etapa coincide o si no hay filtro activo.
      const matchesStage = this.filters.stage === "all" || item.stage === this.filters.stage;

      // Construye un bloque de texto indexable para la búsqueda libre.
      const searchableText = this.normalizeText([
        item.entity,
        item.title,
        item.summary,
        item.excerpt,
        item.location,
        item.category,
        item.stage,
        ...(Array.isArray(item.tags) ? item.tags : [])
      ].join(" "));

      // Comprueba si el texto libre coincide o si está vacío.
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

      // Comprueba si la etiqueta seleccionada existe en las tags del elemento.
      const matchesTag = !selectedTag || (Array.isArray(item.tags) && item.tags.some((tag) => this.normalizeText(tag) === selectedTag));

      // Devuelve el resultado conjunto de todos los filtros.
      return matchesKind && matchesStage && matchesSearch && matchesTag;
    });
  }

  // Actualiza el contador visual de elementos filtrados.
  updateCounter() {
    // Sale si no existe el elemento de contador.
    if (!this.counterElement) {
      // Finaliza el método sin más acciones.
      return;
    }

    // Inserta el total actual de resultados visibles.
    this.counterElement.textContent = String(this.filteredItems.length);
  }

  // Actualiza el estado visual del grupo de botones de etiquetas.
  updateTagButtons() {
    // Sale si no existe el contenedor de tags.
    if (!this.tagsElement) {
      // Finaliza el método sin más acciones.
      return;
    }

    // Obtiene todos los botones de tag renderizados.
    const buttons = this.tagsElement.querySelectorAll("[data-tag]");

    // Recorre cada botón para marcar su estado.
    buttons.forEach((button) => {
      // Calcula si el botón actual es el seleccionado.
      const isActive = button.dataset.tag === this.filters.tag;

      // Activa o desactiva la clase visual correspondiente.
      button.classList.toggle("is-active", isActive);

      // Añade un atributo accesible indicando el estado del botón.
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  // Renderiza la lista filtrada dentro del contenedor principal.
  render() {
    // Muestra un estado vacío si no hay resultados.
    if (this.filteredItems.length === 0) {
      // Inserta el mensaje de ausencia de resultados.
      this.container.innerHTML = this.renderEmptyState();

      // Finaliza tras pintar el estado vacío.
      return;
    }

    // Genera el HTML completo de todas las tarjetas filtradas.
    const html = this.filteredItems.map((item) => this.renderCard(item)).join("");

    // Inserta el contenido generado en el contenedor principal.
    this.container.innerHTML = html;
  }

  // Genera el HTML de una tarjeta individual de la timeline.
  renderCard(item) {
    // Calcula la etiqueta visual del tipo de elemento.
    const kindLabel = item.kind === "work" ? "Experiencia" : "Formación";

    // Calcula la visibilidad de la insignia de elemento destacado.
    const featuredBadge = item.featured ? '<span class="timeline-badge timeline-badge--featured">Destacado</span>' : "";

    // Calcula la visibilidad de la insignia de elemento actual.
    const currentBadge = item.isCurrent ? '<span class="timeline-badge timeline-badge--current">Actualidad</span>' : "";

    // Genera el HTML de la lista de tags.
    const tagsHtml = Array.isArray(item.tags) && item.tags.length > 0
      ? item.tags.map((tag) => `<li class="timeline-card__tag">${this.escapeHtml(tag)}</li>`).join("")
      : "";

    // Define el contenido del enlace principal si existe URL.
    const titleHtml = item.link
      ? `<a class="timeline-card__title-link" href="${this.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(item.title)}</a>`
      : `<span class="timeline-card__title-link">${this.escapeHtml(item.title)}</span>`;

    // Devuelve el HTML completo de la tarjeta.
    return `
      <article class="timeline-card timeline-card--${this.escapeHtml(item.kind)}" data-kind="${this.escapeHtml(item.kind)}" data-stage="${this.escapeHtml(item.stage || "")}" data-slug="${this.escapeHtml(item.slug || "")}">
        <div class="timeline-card__header">
          <div class="timeline-card__logo-wrapper">
            <img class="timeline-card__logo" src="${this.escapeHtml(item.logo || "")}" alt="${this.escapeHtml(item.entity)}" loading="lazy" />
          </div>
          <div class="timeline-card__meta">
            <div class="timeline-card__badges">
              <span class="timeline-badge timeline-badge--kind">${kindLabel}</span>
              ${featuredBadge}
              ${currentBadge}
            </div>
            <h3 class="timeline-card__title">${titleHtml}</h3>
            <p class="timeline-card__entity">${this.escapeHtml(item.entity || "")}</p>
            <p class="timeline-card__date">${this.escapeHtml(item.dateLabel || "")}</p>
            <p class="timeline-card__location">${this.escapeHtml(item.location || "")}</p>
          </div>
        </div>
        <div class="timeline-card__body">
          <p class="timeline-card__summary">${this.escapeHtml(item.summary || "")}</p>
          ${item.excerpt ? `<p class="timeline-card__excerpt">${this.escapeHtml(item.excerpt)}</p>` : ""}
          ${typeof item.hours === "number" && item.hours > 0 ? `<p class="timeline-card__hours"><strong>Horas:</strong> ${item.hours}</p>` : ""}
          ${tagsHtml ? `<ul class="timeline-card__tags">${tagsHtml}</ul>` : ""}
        </div>
      </article>
    `;
  }

  // Genera el HTML del estado vacío cuando no hay coincidencias.
  renderEmptyState() {
    // Devuelve un bloque simple y claro para ausencia de resultados.
    return `
      <div class="timeline-empty">
        <p class="timeline-empty__title">No hay resultados</p>
        <p class="timeline-empty__text">Prueba a cambiar los filtros o a buscar con otro término.</p>
      </div>
    `;
  }

  // Convierte un identificador técnico de etapa en una etiqueta legible.
  formatStageLabel(stage) {
    // Reemplaza guiones por espacios para mejorar la lectura.
    const text = String(stage || "").replace(/-/g, " ");

    // Convierte la primera letra de cada palabra en mayúscula.
    return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // Normaliza un texto para facilitar búsquedas y comparaciones.
  normalizeText(value) {
    // Convierte el valor a cadena segura.
    const text = String(value || "");

    // Elimina tildes y diacríticos para comparar sin fricción.
    const withoutAccents = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Convierte a minúsculas y recorta espacios laterales.
    return withoutAccents.toLowerCase().trim();
  }

  // Escapa caracteres especiales para evitar inyecciones HTML.
  escapeHtml(value) {
    // Convierte el valor en cadena segura.
    const text = String(value || "");

    // Reemplaza los caracteres especiales por sus entidades HTML.
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

// Expone una función de inicialización reutilizable para proyectos sencillos.
async function initTimeline(options = {}) {
  // Crea una nueva instancia del gestor de timeline.
  const timeline = new TimelineManager(options);

  // Inicializa la instancia y espera a que termine su carga.
  await timeline.init();

  // Devuelve la instancia para permitir extensiones futuras.
  return timeline;
}

// Espera a que el DOM esté listo antes de inicializar automáticamente.
document.addEventListener("DOMContentLoaded", async () => {
  // Intenta iniciar la timeline usando la configuración por defecto.
  try {
    // Lanza la inicialización automática leyendo el fichero timeline.json.
    await initTimeline({
      // Define la ruta del JSON de datos.
      dataUrl: "./timeline.json"
    });
  } catch (error) {
    // Escribe el error en consola para facilitar la depuración.
    console.error("Error al inicializar la timeline:", error);
  }
});