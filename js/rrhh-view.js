/**
 * rrhh-view.js
 * Renderizador de la Vista RRHH (Trayectoria Vertical Clásica).
 * Genera elementos DOM para una lectura limpia y profesional.
 */

class RRHHRenderer {
    constructor() {
        this.containerId = 'canvas-rrhh';
        this.events = [];
    }

    init(data) {
        this.events = data.events;
        // Ordenar explícitamente de más reciente a más antiguo para lectura RRHH
        this.events.sort((a, b) => b.year_start - a.year_start);
    }

    render() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = ''; // Limpiar previo

        let leftSide = true;

        this.events.forEach(event => {
            if (event.tipo === 'trabajo') {
                const card = this.createJobCard(event, leftSide);
                container.appendChild(card);
                leftSide = !leftSide; // Alternar lado
            } else {
                const eduItem = this.createEduItem(event);
                container.appendChild(eduItem);
                // No alternamos lado en educación, son bullets centrales
            }
        });

        // Asegurar que el contenedor limpie los floats
        const clearfix = document.createElement('div');
        clearfix.style.clear = 'both';
        container.appendChild(clearfix);
    }

    /**
     * Crea una tarjeta de empleo para la vista vertical.
     */
    createJobCard(event, isLeft) {
        const wrapper = document.createElement('div');
        wrapper.className = `rrhh-card ${isLeft ? 'left' : 'right'}`;
        
        const inner = document.createElement('div');
        inner.className = 'card-inner';
        
        inner.innerHTML = `
            <div class="d-flex align-items-center mb-2 ${isLeft ? 'justify-content-end' : ''}">
                <span class="badge mb-0 me-2" style="background-color: ${event.color || '#0ea5e9'}">${event.categoria}</span>
                <small class="text-secondary fw-bold">${event.fecha_inicio} - ${event.fecha_fin || 'Presente'}</small>
            </div>
            <h4 class="h5 fw-bold mb-1">${event.titulo}</h4>
            <div class="text-primary small fw-bold mb-2">${event.empresa}</div>
            <p class="small text-secondary mb-0 line-clamp-2">${event.summary}</p>
        `;

        wrapper.appendChild(inner);
        wrapper.addEventListener('click', () => window.openModal(event.id));
        
        return wrapper;
    }

    /**
     * Crea un ítem de formación (punto central en la línea temporal).
     */
    createEduItem(event) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rrhh-edu-item';

        const bullet = document.createElement('div');
        bullet.className = 'rrhh-edu-bullet';
        bullet.innerHTML = `
            <i class="bi bi-mortarboard-fill me-2" style="color: ${event.color || '#8b5cf6'}"></i>
            <strong>${event.titulo}</strong> 
            <span class="mx-2 text-opacity-25 opacity-50">|</span> 
            <small class="text-secondary">${event.fecha_inicio}</small>
        `;

        wrapper.appendChild(bullet);
        wrapper.addEventListener('click', () => window.openModal(event.id));

        return wrapper;
    }
}

// Registro global
window.rrhhRenderer = new RRHHRenderer();
