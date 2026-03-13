/**
 * modal.js
 * Gestión del modal de detalle para eventos de la línea de tiempo.
 */

class ModalManager {
    // Constructor con elementos base
    constructor() {
        // ID del elemento modal en el HTML
        this.modalId = 'event-modal';
        // Elemento del DOM
        this.modalEl = null;
        // Mapa de eventos para acceso rápido
        this.eventMap = new Map();
    }

    // Inicializa el modal con los datos cargados
    init(data) {
        // Guardamos los eventos en el mapa por su ID
        this.eventMap = new Map(data.events.map(ev => [ev.id, ev]));
        // Obtenemos el elemento del DOM
        this.modalEl = document.getElementById(this.modalId);
        
        // Configuramos el cierre del modal
        this.setupClose();
        
        // Exponemos la función de apertura globalmente
        window.openModal = (id) => this.open(id);
    }

    // Configura los eventos de cierre (botón X y click fuera)
    setupClose() {
        if (!this.modalEl) return;
        
        // Botón de cierre (X)
        const closeBtn = this.modalEl.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        // Cierre al pulsar fuera de la ventana blanca
        this.modalEl.onclick = (e) => {
            if (e.target === this.modalEl) this.close();
        };

        // Cierre al pulsar la tecla Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    // Abre el modal con la información del evento especificado
    open(id) {
        // Buscamos el evento en el mapa
        const event = this.eventMap.get(id);
        if (!event || !this.modalEl) return;

        // Limpiamos contenido anterior y llenamos el nuevo HTML
        const content = this.modalEl.querySelector('#modal-content');
        if (!content) return;

        // Construimos la estructura de la información
        content.innerHTML = `
            <!-- Encabezado del modal -->
            <div class="modal-header-premium">
                <span class="modal-badge-type" style="background: ${event.color}20; color: ${event.color}">
                    ${(event.kind === 'work' ? 'Trayectoria Profesional' : 'Formación Académica').toUpperCase()}
                </span>
                <h2 class="modal-title-premium">${event.title}</h2>
                <div class="modal-subtitle-premium">
                    <i class="bi bi-geo-alt"></i> ${event.entity} | <i class="bi bi-calendar3"></i> ${event.dateLabel}
                </div>
            </div>

            <!-- Cuerpo con descripción -->
            <div class="modal-body-premium">
                <p class="modal-description-full">${event.description || event.summary || 'Sin descripción adicional disponible.'}</p>
                
                ${event.hours ? `<div class="modal-hours"><strong>Duración:</strong> ${event.hours} horas totales.</div>` : ''}

                <!-- Sección de habilidades destacadas con iconos -->
                <div class="modal-skills-section">
                    <h4>Habilidades relacionadas</h4>
                    <div class="modal-skills-grid">
                        ${(event.tags || []).map(tag => `
                            <div class="modal-skill-item" title="Skill: ${tag}">
                                <span class="modal-skill-icon">${this.getIcon(tag)}</span>
                                <span class="modal-skill-label">${tag}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Pie con enlaces si existen -->
            ${event.link ? `
                <div class="modal-footer-premium">
                    <a href="${event.link}" target="_blank" class="btn primary">Ver más detalles <i class="bi bi-box-arrow-up-right"></i></a>
                </div>
            ` : ''}
        `;

        // Mostramos el modal variando la opacidad y visibilidad
        this.modalEl.style.display = 'flex';
        // Pequeño timeout para permitir la transición CSS
        setTimeout(() => this.modalEl.classList.add('active'), 10);
        // Deshabilitamos el scroll del body
        document.body.style.overflow = 'hidden';
    }

    // Cierra el modal de forma animada
    close() {
        if (!this.modalEl) return;
        // Eliminamos la clase activa para disparar la animación de salida
        this.modalEl.classList.remove('active');
        // Esperamos a que termine la transición antes de ocultar
        setTimeout(() => {
            this.modalEl.style.display = 'none';
            // Devolvemos el scroll al body
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Mapeo detallado de iconos por palabra clave
    getIcon(skill) {
        const s = skill.toLowerCase();
        if (s.includes('php')) return '🐘';
        if (s.includes('js') || s.includes('javascript')) return '🟨';
        if (s.includes('mysql') || s.includes('sql')) return '🛢️';
        if (s.includes('ia') || s.includes('inteligencia')) return '🤖';
        if (s.includes('python')) return '🐍';
        if (s.includes('wordpress')) return '🧩';
        if (s.includes('react')) return '⚛️';
        if (s.includes('html')) return '🌐';
        if (s.includes('css')) return '🎨';
        if (s.includes('git')) return '🌿';
        if (s.includes('mecanica')) return '🔧';
        if (s.includes('sonido')) return '🔊';
        return '•';
    }
}

// Inyectamos la instancia en window para uso global
window.modalManager = new ModalManager();
