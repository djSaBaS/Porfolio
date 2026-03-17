/**
 * rrhh-view.js
 * Renderizador de la Vista RRHH con eje central y columnas completas sin solape.
 */

class RRHHRenderer {
    constructor() {
        this.containerId = 'canvas-rrhh';
        this.events = [];
        this.domainFilter = 'all';
    }

    init(data) {
        this.events = data.events.slice().sort((a, b) => b.sortStart.localeCompare(a.sortStart));
        this.render();
    }

    setDomainFilter(domain) {
        this.domainFilter = domain || 'all';
        this.render();
    }

    getFilteredEvents() {
        if (this.domainFilter === 'all') return this.events;
        return this.events.filter((event) => event.domain === this.domainFilter || event.domain === 'core');
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        container.innerHTML = '';

        const timeline = document.createElement('div');
        timeline.className = 'rrhh-timeline';

        const events = this.getFilteredEvents();
        events.forEach((event) => {
            const item = document.createElement('div');
            const side = event.kind === 'work' ? 'right' : 'left';
            item.className = `rrhh-timeline-item ${side}`;
            const card = event.kind === 'work' ? this.createJobCard(event) : this.createEduCard(event);
            item.appendChild(card);

            item.addEventListener('click', () => {
                if (window.modalManager) window.modalManager.open(event.id);
            });

            timeline.appendChild(item);
        });

        container.appendChild(timeline);
    }

    // Crea una tarjeta de empleo
    createJobCard(event) {
        const card = document.createElement('article');
        card.className = 'rrhh-card rrhh-card--work glass-premium';
        card.style.borderLeft = `4px solid ${event.color || '#0ea5e9'}`;

        card.innerHTML = `
            <div class="rrhh-card-meta">
                <span class="rrhh-date-pill">${event.dateLabel}</span>
                <span class="rrhh-category-tag" style="color:${event.color}">${event.category.toUpperCase()}</span>
            </div>
            <h3 class="rrhh-card-title">${event.title}</h3>
            <div class="rrhh-card-entity"><i class="bi bi-building"></i> ${event.entity}</div>
            <p class="rrhh-card-summary">${event.summary}</p>
            <div class="rrhh-card-skills">
                ${(event.tags || []).slice(0, 6).map((tag) => `<span class="rrhh-skill-badge" title="${tag}">${this.getSkillIcon(tag)} ${tag}</span>`).join('')}
            </div>
        `;

        return card;
    }

    // Crea una tarjeta de formación compacta
    createEduCard(event) {
        const card = document.createElement('article');
        card.className = 'rrhh-card rrhh-card--edu glass-premium';

        card.innerHTML = `
            <div class="rrhh-edu-grid">
                <div class="rrhh-edu-icon-box" style="background:${event.color}15;color:${event.color}">
                    <i class="bi bi-mortarboard"></i>
                </div>
                <div class="rrhh-edu-info">
                    <h4 class="rrhh-edu-title">${event.title}</h4>
                    <span class="rrhh-edu-meta">${event.entity} · ${event.dateLabel}${event.hours ? ` (${event.hours}h)` : ''}</span>
                </div>
            </div>
        `;

        return card;
    }

    // Devuelve icono representativo de skill
    getSkillIcon(tag) {
        const map = {
            php: '🐘', javascript: '🟨', mysql: '🛢️', ia: '🤖', wordpress: '🧩',
            react: '⚛️', python: '🐍', git: '🌿', html: '🌐', css: '🎨',
        };
        return map[String(tag || '').toLowerCase()] || '•';
    }
}

window.rrhhRenderer = new RRHHRenderer();
