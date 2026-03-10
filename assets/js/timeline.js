"use strict";

/**
 * Gestiona la visualización de trayectoria del CV en dos modos:
 * - RRHH: timeline vertical clásica
 * - Tech: workflow por ramas inspirado en Git
 */
class CvTimeline {
  constructor(root) {
    this.root = root;
    this.container = root.querySelector('[data-timeline="container"]');
    this.kindElement = root.querySelector('[data-filter="kind"]');
    this.stageElement = root.querySelector('[data-filter="stage"]');
    this.searchElement = root.querySelector('[data-filter="search"]');
    this.tagsElement = root.querySelector('[data-filter="tags"]');
    this.counterElement = root.querySelector('[data-timeline="count"]');
    this.defaultDataUrl = "../assets/json/datos.json";
    this.dataUrl = this.resolveDataUrl(root.dataset.jsonUrl);

    this.items = [];
    this.filtered = [];
    this.filters = { kind: "all", stage: "all", search: "", tag: "" };
  }

  async init() {
    this.items = this.sortByDate(await this.fetchData());
    this.buildStageFilter();
    this.buildTagFilter();
    this.bindEvents();
    this.update();
  }

  async fetchData() {
    const response = await fetch(this.dataUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`No se pudo cargar ${this.dataUrl}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("datos.json no contiene un array válido.");
    return data;
  }

  resolveDataUrl(rawUrl) {
    const candidate = String(rawUrl || this.defaultDataUrl).trim();

    try {
      const parsed = new URL(candidate, window.location.href);
      const isSameOrigin = parsed.origin === window.location.origin;
      const isAllowedPath = /^\/assets\/json\/[\w./-]+\.json$/i.test(parsed.pathname);
      if (isSameOrigin && isAllowedPath) return parsed.href;
    } catch (error) {
      console.warn("URL de datos inválida; se usará la ruta por defecto.", error);
    }

    return new URL(this.defaultDataUrl, window.location.href).href;
  }

  sortByDate(items) {
    return [...items].sort((a, b) => {
      const aDate = a.sortStart || a.dateStart || "";
      const bDate = b.sortStart || b.dateStart || "";
      return bDate.localeCompare(aDate);
    });
  }

  bindEvents() {
    this.kindElement?.addEventListener("change", (event) => {
      this.filters.kind = event.target.value || "all";
      this.update();
    });

    this.stageElement?.addEventListener("change", (event) => {
      this.filters.stage = event.target.value || "all";
      this.update();
    });

    this.searchElement?.addEventListener("input", (event) => {
      this.filters.search = (event.target.value || "").trim();
      this.update();
    });

    this.tagsElement?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tag]");
      if (!button) return;
      const clickedTag = button.dataset.tag || "";
      this.filters.tag = this.filters.tag === clickedTag ? "" : clickedTag;
      this.syncTagState();
      this.update();
    });

    document.querySelectorAll("[data-toggle-view]").forEach((button) => {
      button.addEventListener("click", () => {
        window.requestAnimationFrame(() => this.render());
      });
    });
  }

  buildStageFilter() {
    if (!this.stageElement) return;
    const stages = [...new Set(this.items.map((item) => item.stage).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    this.stageElement.innerHTML = `<option value="all">Todas las etapas</option>${stages
      .map((stage) => `<option value="${this.escape(stage)}">${this.stageLabel(stage)}</option>`)
      .join("")}`;
  }

  buildTagFilter() {
    if (!this.tagsElement) return;
    const tags = [...new Set(this.items.flatMap((item) => (Array.isArray(item.tags) ? item.tags : [])))]
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    this.tagsElement.innerHTML = tags
      .map((tag) => `<button type="button" class="timeline-tag-filter" data-tag="${this.escape(tag)}">${this.escape(tag)}</button>`)
      .join("");
  }

  syncTagState() {
    this.tagsElement?.querySelectorAll("[data-tag]").forEach((button) => {
      const active = button.dataset.tag === this.filters.tag;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  update() {
    const search = this.normalize(this.filters.search);
    const selectedTag = this.normalize(this.filters.tag);

    this.filtered = this.items.filter((item) => {
      const matchesKind = this.filters.kind === "all" || item.kind === this.filters.kind;
      const matchesStage = this.filters.stage === "all" || item.stage === this.filters.stage;
      const sourceText = this.normalize([
        item.title,
        item.entity,
        item.summary,
        item.excerpt,
        item.category,
        item.stage,
        ...(item.tags || []),
      ].join(" "));
      const matchesSearch = !search || sourceText.includes(search);
      const matchesTag =
        !selectedTag || (item.tags || []).some((tag) => this.normalize(tag) === selectedTag);

      return matchesKind && matchesStage && matchesSearch && matchesTag;
    });

    if (this.counterElement) this.counterElement.textContent = String(this.filtered.length);
    this.render();
  }

  render() {
    const mode = document.body.getAttribute("data-view") === "tech" ? "tech" : "hr";

    if (!this.filtered.length) {
      this.container.innerHTML = `<div class="timeline-empty"><p class="timeline-empty__title">No hay resultados</p><p class="timeline-empty__text">Prueba a cambiar filtros o búsqueda.</p></div>`;
      return;
    }

    this.container.className = `cv-timeline-container cv-timeline-container--${mode}`;
    this.container.innerHTML =
      mode === "tech" ? this.renderTechWorkflow(this.filtered) : this.renderHrTimeline(this.filtered);
  }

  renderHrTimeline(items) {
    return `<div class="cv-hr-timeline">${items
      .map(
        (item) => `<article class="cv-hr-card cv-hr-card--${this.escape(item.kind)}">
          <span class="cv-hr-card__dot" style="--item-color:${this.escape(item.color || "#22d3ee")}"></span>
          <p class="cv-hr-card__meta">${item.kind === "work" ? "Experiencia" : "Formación"} · ${this.escape(item.dateLabel || "")}</p>
          <h3>${this.renderTitle(item)}</h3>
          <p class="cv-hr-card__entity">${this.escape(item.entity || "")}</p>
          <p>${this.escape(item.summary || "")}</p>
          ${item.excerpt ? `<p class="cv-hr-card__excerpt">${this.escape(item.excerpt)}</p>` : ""}
          <ul class="cv-hr-card__tags">${(item.tags || []).map((tag) => `<li>${this.escape(tag)}</li>`).join("")}</ul>
        </article>`,
      )
      .join("")}</div>`;
  }

  renderTechWorkflow(items) {
    const ordered = [...items].sort((a, b) => (a.sortStart || "").localeCompare(b.sortStart || ""));

    return `<div class="cv-tech-workflow">
      ${ordered
        .map((item) => {
          const lane = item.kind === "work" ? "main" : "branch";
          return `<article class="cv-tech-node cv-tech-node--${lane}" style="--item-color:${this.escape(item.color || "#60a5fa")}">
            <p class="cv-tech-node__date">${this.escape(item.dateLabel || "")}</p>
            <h3>${this.renderTitle(item)}</h3>
            <p class="cv-tech-node__entity">${this.escape(item.entity || "")}</p>
            <p>${this.escape(item.summary || "")}</p>
            <ul class="cv-tech-node__tags">${(item.tags || []).slice(0, 6).map((tag) => `<li>${this.escape(tag)}</li>`).join("")}</ul>
          </article>`;
        })
        .join("")}
    </div>`;
  }

  renderTitle(item) {
    const title = this.escape(item.title || "Sin título");
    if (!item.link) return title;
    return `<a href="${this.escape(item.link)}" target="_blank" rel="noopener noreferrer">${title}</a>`;
  }

  stageLabel(stage) {
    return String(stage || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.querySelector("[data-timeline-root]");
  if (!root) return;

  try {
    const timeline = new CvTimeline(root);
    await timeline.init();
  } catch (error) {
    console.error("Error al inicializar la timeline del CV:", error);
  }
});
