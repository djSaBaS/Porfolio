/**
 * rrhh-view.js
 * Renderizador de la Vista RRHH (Trayectoria Vertical Clásica).
 * Foco en legibilidad, limpieza y profesionalidad para reclutadores.
 */

class RRHHRenderer {
    // Constructor de la clase
    constructor() {
        // ID del contenedor de la vista RRHH
        this.containerId = 'canvas-rrhh';
        // Almacén local de eventos
        this.events = [];
    }

    // Inicialización con datos normalizados
    init(data) {
        // Ordenamos los eventos por fecha de inicio descendente (lo más nuevo arriba)
        this.events = data.events.slice().sort((a, b) => (b.year_start || 0) - (a.year_start || 0));
        // Ejecutamos el renderizado
        this.render();
    }

    // Función principal de renderizado
    render() {
        // Obtenemos el contenedor del DOM
        const container = document.getElementById(this.containerId);
        // Si no existe, salimos
        if (!container) return;
        // Limpiamos contenido previo
        container.innerHTML = '';

        // Creamos el contenedor principal de la línea de tiempo
        const timeline = document.createElement('div');
        // Asignamos la clase para estilos CSS
        timeline.className = 'rrhh-timeline';

        // Variable para alternar el lado de las tarjetas (izquierda/derecha)
        let isLeft = true;

        // Recorremos los eventos para crear las tarjetas
        this.events.forEach((event, index) => {
            // Creamos el envoltorio del ítem de la línea de tiempo
            const item = document.createElement('div');
            // Clase base y clase alternada según el lado
            item.className = `rrhh-timeline-item ${isLeft ? 'left' : 'right'}`;

            // Si es un trabajo (normalizado a 'work'), creamos una tarjeta detallada
            if (event.kind === 'work') {
                item.appendChild(this.createJobCard(event));
                // Alternamos el lado para la siguiente tarjeta
                isLeft = !isLeft;
            } else {
                // Si es formación, creamos un ítem más compacto
                item.appendChild(this.createEduCard(event));
                // También alternamos para mantener el equilibrio visual
                isLeft = !isLeft;
            }

            // Añadimos el ítem a la línea de tiempo
            timeline.appendChild(item);
        });

        // Añadimos la línea de tiempo completa al contenedor principal
        container.appendChild(timeline);
    }

    /**
     * Crea una tarjeta de empleo premium
     */
    createJobCard(event) {
        // Creamos el elemento de la tarjeta
        const card = document.createElement('article');
        // Añadimos clases de estilo (premium/glass)
        card.className = 'rrhh-card glass-premium';
        // Establecemos el color de acento dinámico para la barra lateral
        card.style.borderLeft = `4px solid ${event.color || '#0ea5e9'}`;

        // Construimos el HTML interno de la tarjeta
        card.innerHTML = `
            <!-- Cabecera con fecha y categoría -->
            <div class="rrhh-card-meta">
                <span class="rrhh-date-pill">${event.dateLabel}</span>
                <span class="rrhh-category-tag" style="color: ${event.color}">${event.category.toUpperCase()}</span>
            </div>
            <!-- Título del puesto -->
            <h3 class="rrhh-card-title">${event.title}</h3>
            <!-- Entidad / Empresa -->
            <div class="rrhh-card-entity">
                <i class="bi bi-building"></i> ${event.entity}
            </div>
            <!-- Resumen de responsabilidades -->
            <p class="rrhh-card-summary">${event.summary}</p>
            <!-- Fila de skills (etiquetas) -->
            <div class="rrhh-card-skills">
                ${(event.tags || []).slice(0, 5).map(tag => `
                    <span class="rrhh-skill-badge" title="${tag}">
                        ${this.getSkillIcon(tag)} ${tag}
                    </span>
                `).join('')}
            </div>
        `;

        // Añadimos listener para abrir el modal de detalle
        card.addEventListener('click', () => {
            if (window.openModal) window.openModal(event.id);
        });

        // Devolvemos la tarjeta
        return card;
    }

    /**
     * Crea una tarjeta de formación compacta
     */
    createEduCard(event) {
        // Creamos el elemento de la tarjeta de educación
        const card = document.createElement('div');
        // Clases específicas para formación
        card.className = 'rrhh-card rrhh-card-edu glass-premium';
        
        // HTML simplificado para educación
        card.innerHTML = `
            <div class="rrhh-edu-grid">
                <!-- Icono de graduación con color de la etapa -->
                <div class="rrhh-edu-icon-box" style="background: ${event.color}15; color: ${event.color}">
                    <i class="bi bi-mortarboard"></i>
                </div>
                <div class="rrhh-edu-info">
                    <!-- Título del curso -->
                    <h4 class="rrhh-edu-title">${event.title}</h4>
                    <!-- Entidad y Año -->
                    <span class="rrhh-edu-meta">${event.entity} · ${event.yearStart} ${event.hours ? `(${event.hours}h)` : ''}</span>
                </div>
            </div>
        `;

        // Atajo al modal
        card.addEventListener('click', () => {
            if (window.openModal) window.openModal(event.id);
        });

        // Devolvemos el elemento
        return card;
    }

    /**
     * Devuelve un emoji o icono representativo de la skill
     * (Reutilizado o adaptado según la necesidad de la vista RRHH)
     */
    getSkillIcon(tag) {
        // Mapeo simple de iconos para la vista RRHH
        const map = {
            'php': '🐘', 'javascript': '🟨', 'mysql': '🛢️', 'ia': '🤖', 'wordpress': '🧩',
            'react': '⚛️', 'python': '🐍', 'git': '🌿', 'html': '🌐', 'css': '🎨'
        };
        // Devolvemos el icono o un punto por defecto
        return map[tag.toLowerCase()] || '•';
    }
}

// Inyectamos la instancia en el objeto window para acceso global
window.rrhhRenderer = new RRHHRenderer();
