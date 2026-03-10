/**
 * data-loader.js
 * Responsable de cargar, normalizar y centralizar la información de la trayectoria.
 */

class DataLoader {
    constructor() {
        this.events = [];
        this.skills = {};
    }

    async loadAll() {
        try {
            // Detectar si estamos en una subcarpeta (como /cv/) para ajustar la ruta
            const isSubfolder = window.location.pathname.includes('/cv/') || window.location.pathname.includes('/cursos/');
            const prefix = isSubfolder ? '../' : '';

            // Carga de archivos JSON (ahora usamos datos.json como fuente principal)
            const [data, skills] = await Promise.all([
                fetch(`${prefix}assets/json/datos.json`).then(res => {
                    if (!res.ok) throw new Error(`Error al cargar datos.json: ${res.status}`);
                    return res.json();
                }),
                fetch(`${prefix}data/skills.json`).then(res => {
                    if (!res.ok) return []; // Opcional
                    return res.json();
                }).catch(() => [])
            ]);

            // Mapear skills por key para acceso rápido O(1)
            skills.forEach(skill => {
                this.skills[skill.key] = skill;
            });

            // Normalizar y combinar eventos desde la fuente unificada
            this.events = data.map(ev => ({
                ...ev,
                tipo: ev.kind === 'work' ? 'trabajo' : 'formacion',
                year_start: ev.yearStart,
                year_end: ev.yearEnd || (ev.isCurrent ? new Date().getFullYear() : ev.yearStart),
                empresa: ev.entity, // Alias para compatibilidad
                centro: ev.entity,  // Alias para compatibilidad
                description: ev.summary || ev.excerpt
            }));

            // Ordenar por año de inicio y luego por campo 'order' si existe
            this.events.sort((a, b) => (a.year_start || 0) - (b.year_start || 0));

            console.log("Datos cargados y normalizados:", this.events);
            
            // Ocultar el cargador siempre al finalizar
            this.hideLoader();

            return { events: this.events, skills: this.skills };
        } catch (error) {
            console.error("Error cargando los datos del porfolio:", error);
            this.hideLoader();
            throw error;
        }
    }

    hideLoader() {
        const loader = document.getElementById('loader') || document.querySelector('.loading-overlay');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }

    getEventById(id) {
        return this.events.find(e => e.id === id);
    }

    getSkillDetails(key) {
        return this.skills[key] || { key, label: key, icon: 'bi-question-circle' };
    }
}

// Exportar instancia global
window.dataLoader = new DataLoader();
