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
            // Carga de archivos JSON en paralelo para mayor eficiencia
            const [trabajos, formacion, skills] = await Promise.all([
                fetch('data/trabajos.json').then(res => res.json()),
                fetch('data/formacion.json').then(res => res.json()),
                fetch('data/skills.json').then(res => res.json())
            ]);

            // Mapear skills por key para acceso rápido O(1)
            skills.forEach(skill => {
                this.skills[skill.key] = skill;
            });

            // Normalizar y combinar eventos
            this.events = [
                ...trabajos.map(t => ({ ...t, tipo: 'trabajo' })),
                ...formacion.map(f => ({ ...f, tipo: 'formacion' }))
            ];

            // Ordenar por año de inicio y luego por campo 'order' si existe
            this.events.sort((a, b) => {
                if (a.year_start !== b.year_start) {
                    return a.year_start - b.year_start;
                }
                return (a.order || 0) - (b.order || 0);
            });

            console.log("Datos cargados y normalizados:", this.events);
            return { events: this.events, skills: this.skills };
        } catch (error) {
            console.error("Error cargando los datos del porfolio:", error);
            throw error;
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
