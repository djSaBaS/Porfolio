/**
 * rrhh-view.js
 * Renderizador de la Vista RRHH (Trayectoria Vertical Clásica).
 * Compatible con el formato de datos de assets/json/datos.json
 */

class RRHHRenderer {
    constructor() {
        this.containerId = 'canvas-rrhh';
        this.events = [];
    }

    init(data) {
        this.events = data.events.slice().sort((a, b) => (b.year_start || 0) - (a.year_start || 0));
        this.render();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        container.innerHTML = '';

        // Línea vertical central
        const line = document.createElement('div');
        line.className = 'rrhh-timeline-line';
        container.appendChild(line);

        let leftSide = true;

        this.events.forEach(event => {
            const isWork = event.tipo === 'trabajo';
            const el = isWork
                ? this.createJobCard(event, leftSide)
                : this.createEduItem(event);
            container.appendChild(el);
            if (isWork) leftSide = !leftSide;
        });
    }

    /** Tarjeta de empleo con barra de acento y fila de habilidades */
    createJobCard(event, isLeft) {
        const wrapper = document.createElement('div');
        wrapper.className = `rrhh-card-wrapper ${isLeft ? 'left' : 'right'}`;

        const card = document.createElement('article');
        card.className = 'rrhh-card card glass';
        card.style.setProperty('--accent-color', event.color || '#0ea5e9');

        // Encabezado
        const header = document.createElement('div');
        header.className = 'rrhh-card-header';
        header.innerHTML = `
            <span class="rrhh-badge" style="background:${event.color || '#0ea5e9'}25; color:${event.color || '#0ea5e9'}; border:1px solid ${event.color || '#0ea5e9'}40">${event.category || 'Empleo'}</span>
            <span class="rrhh-date">${event.dateLabel || (event.year_start + ' – ' + (event.year_end || 'Actualidad'))}</span>
        `;

        // Cuerpo
        const body = document.createElement('div');
        body.className = 'rrhh-card-body';
        body.innerHTML = `
            <h3 class="rrhh-title">${event.title || ''}</h3>
            <span class="rrhh-entity">${event.entity || ''}</span>
            <p class="rrhh-summary">${event.summary || ''}</p>
        `;

        // Fila de habilidades (tags)
        const tags = event.tags || [];
        if (tags.length) {
            const skillRow = document.createElement('div');
            skillRow.className = 'rrhh-skills-row';
            tags.slice(0, 6).forEach(tag => {
                const chip = document.createElement('span');
                chip.className = 'rrhh-skill-chip';
                chip.textContent = tag;
                skillRow.appendChild(chip);
            });
            body.appendChild(skillRow);
        }

        card.appendChild(header);
        card.appendChild(body);
        wrapper.appendChild(card);

        wrapper.addEventListener('click', () => {
            if (window.openModal) window.openModal(event.id);
        });

        return wrapper;
    }

    /** Ítem de formación (bullet central en la línea temporal) */
    createEduItem(event) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rrhh-edu-item';

        wrapper.innerHTML = `
            <span class="rrhh-edu-icon" style="color:${event.color || '#8b5cf6'}">🎓</span>
            <div class="rrhh-edu-body">
                <strong>${event.title || ''}</strong>
                <small>${event.dateLabel || event.year_start || ''}</small>
            </div>
        `;

        wrapper.addEventListener('click', () => {
            if (window.openModal) window.openModal(event.id);
        });

        return wrapper;
    }
}

// Registro global
window.rrhhRenderer = new RRHHRenderer();
