/**
 * data-loader.js
 * Encargado de cargar, normalizar y servir los datos del CV.
 */

class DataLoader {
    constructor() {
        // Rutas a los archivos JSON base (corregidas según estructura real)
        this.jsonPaths = {
            events: '../assets/json/datos.json',
            skills: '../data/skills.json'
        };
        // Datos procesados
        this.data = {
            events: [],
            skills: {}
        };
    }

    /**
     * Carga todos los recursos y los normaliza para los renderizadores
     */
    async loadAll() {
        console.log("DataLoader: Iniciando carga de JSON...", this.jsonPaths);
        try {
            // Intentamos cargar dinámicamente vía fetch
            const [eventsRes, skillsRes] = await Promise.all([
                fetch(this.jsonPaths.events),
                fetch(this.jsonPaths.skills)
            ]);

            // Si los archivos se encuentran y el servidor responde correctamente
            if (eventsRes.ok && skillsRes.ok) {
                const rawEvents = await eventsRes.json();
                const rawSkills = await skillsRes.json();
                this.data.events = rawEvents.map(ev => this.normalizeEvent(ev));
                this.data.skills = rawSkills;
                console.log(`DataLoader: ${this.data.events.length} eventos cargados vía Fetch.`);
                return this.data;
            }
            // Si el fetch falla (ej. 404), lanzamos error para ir al catch/fallback
            throw new Error("Respuesta de red no válida");

        } catch (error) {
            console.warn('DataLoader: Fetch fallido o bloqueado por CORS. Intentando fallback local...', error);
            
            // FALLBACK: Verificamos si los datos están disponibles como constantes globales
            // (Útil para previsualización local sin servidor)
            if (window.CV_DATA && window.SKILLS_DATA) {
                console.log("DataLoader: Usando datos de respaldo (Fallback JS).");
                this.data.events = window.CV_DATA.map(ev => this.normalizeEvent(ev));
                this.data.skills = window.SKILLS_DATA;
                return this.data;
            }

            console.error('DataLoader Error Crítico: No se han podido cargar los datos.');
            return { events: [], skills: {} };
        }
    }

    /**
     * Normaliza un objeto de evento para asegurar consistencia entre vistas
     */
    normalizeEvent(ev) {
        // Normalización manual del tipo para lógica interna
        let kind = 'education';
        const rawType = (ev.kind || ev.tipo || '').toLowerCase();
        if (rawType === 'work' || rawType === 'trabajo' || rawType === 'puesto') {
            kind = 'work';
        }

        return {
            id: (ev.id || Math.random()).toString(),
            title: ev.title || ev.titulo || 'Sin título',
            entity: ev.entity || ev.empresa || ev.centro || '—',
            kind: kind, // Normalizado a 'work' o 'education'
            category: ev.category || ev.categoria || 'General',
            year_start: parseInt(ev.year_start || ev.yearStart || ev.fecha_inicio || ev.dateStart?.split('-')[0] || 0),
            month_start: parseInt(ev.month_start || ev.monthStart || ev.dateStart?.split('-')[1] || '1'),
            year_end: ev.year_end || ev.yearEnd || ev.fecha_fin || ev.dateEnd ? parseInt(ev.year_end || ev.yearEnd || ev.fecha_fin || ev.dateEnd?.split('-')[0]) : null,
            month_end: parseInt(ev.month_end || ev.monthEnd || ev.dateEnd?.split('-')[1] || '12'),
            dateLabel: ev.dateLabel || `${ev.year_start || ev.yearStart || ev.fecha_inicio} — ${ev.year_end || ev.yearEnd || ev.fecha_fin || 'Presente'}`,
            summary: ev.summary || ev.excerpt || ev.descripcion || '',
            description: ev.description || ev.descripcion || '',
            tags: ev.tags || ev.skills || [],
            color: ev.color || this.getDefaultColor(ev, kind),
            featured: ev.featured || ev.actual || false,
            hours: ev.hours || ev.horas || null,
            icon: ev.icon || null,
            link: ev.link || ev.url || null,
            stage: ev.stage || 'general',
            sortStart: ev.sortStart || `${ev.year_start || ev.yearStart || 0}-${String(ev.month_start || ev.monthStart || ev.dateStart?.split('-')[1] || 1).padStart(2, '0')}`,
            sortEnd: ev.sortEnd || `${ev.year_end || ev.yearEnd || 9999}-${String(ev.month_end || ev.monthEnd || ev.dateEnd?.split('-')[1] || 12).padStart(2, '0')}`
        };
    }

    /**
     * Asigna un color por defecto basado en el tipo de evento si no existe
     */
    getDefaultColor(ev, kind) {
        if (kind === 'work') return '#34d399';
        if (ev.category === 'máster' || ev.categoria === 'máster') return '#c084fc';
        return '#38bdf8';
    }

    /**
     * Helper para obtener un evento por ID
     */
    getEventById(id) {
        return this.data.events.find(e => e.id === id.toString());
    }
}

// Registro global
window.dataLoader = new DataLoader();
