/**
 * tech-view.js
 * Renderizador de la Vista Técnica (Mapa de Metro interactivo).
 * Implementa una visualización tipo Metro con ramas por especialidad.
 */

class TechRenderer {
    // Constructor con configuraciones base del canvas
    constructor() {
        // ID del contenedor HTML donde se dibujará el SVG
        this.canvasId = 'canvas-tech';
        // Instancia del dibujo de SVG.js
        this.draw = null;
        // Almacén de eventos (trabajos y formación)
        this.events = [];
        // Almacén de habilidades
        this.skills = {};
        // Márgenes internos del área de dibujo
        this.margin = { top: 84, right: 130, bottom: 90, left: 120 };
        // Año de inicio para la escala temporal
        this.minYear = 1995;
        // Año de fin para la escala temporal (proyectado)
        this.maxYear = 2027;
        // Ancho total del canvas (ajustado por el tiempo)
        this.totalWidth = 4200;
        // Altura total del canvas
        this.totalHeight = 760;

        // Definición de las "líneas de metro" (ramas) y sus posiciones Y
        this.branchY = {
            specialization: 110,
            main: 255,
            education: 420,
            legacy: 575,
        };

        // Colores vibrantes para cada línea de metro (Sincronizado con style.css)
        this.branchColors = {
            specialization: '#8b5cf6',
            main: '#34d399',
            education: '#6ee7ff',
            legacy: '#fb7185',
        };

        // Estado inicial de filtros (todos visibles por defecto)
        this.activeFilters = new Set(Object.keys(this.branchColors));
    }

    // Inicialización con datos del DataLoader
    init(data) {
        // Guardamos los eventos normalizados
        this.events = data.events;
        // Guardamos las skills
        this.skills = data.skills;
        // Construimos los botones de filtro HTML
        this.buildFilters();
        // Disparamos el renderizado
        this.render();
        // Configuramos el arrastre del contenedor
        this.setupDrag();
    }

    // Construye los botones HTML interactivos de filtro
    buildFilters() {
        const filterContainer = document.getElementById('tech-filters');
        if (!filterContainer) return;

        filterContainer.innerHTML = '';
        const labels = {
            main: 'Experiencia Principal',
            specialization: 'Especializaciones',
            education: 'Educación Central',
            legacy: 'Legado / Antiguo',
        };

        Object.keys(this.branchColors).forEach((branchId) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn active';
            btn.dataset.branch = branchId;
            btn.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${this.branchColors[branchId]};margin-right:6px;box-shadow:0 0 5px ${this.branchColors[branchId]};"></span>${labels[branchId] || branchId}`;

            btn.addEventListener('click', () => {
                if (this.activeFilters.has(branchId)) {
                    this.activeFilters.delete(branchId);
                    btn.classList.remove('active');
                } else {
                    this.activeFilters.add(branchId);
                    btn.classList.add('active');
                }
                this.render();
            });

            filterContainer.appendChild(btn);
        });
    }

    // Calcula la coordenada X proporcional al año y mes
    getX(year, month = 1) {
        const safeYear = Math.min(Math.max(Number(year) || this.minYear, this.minYear), this.maxYear);
        const safeMonth = Math.min(Math.max(Number(month) || 1, 1), 12);
        const progress = (safeYear - this.minYear + (safeMonth - 1) / 12) / (this.maxYear - this.minYear);
        return this.margin.left + progress * (this.totalWidth - this.margin.left - this.margin.right);
    }

    // Determina en qué carril va el evento
    getTrack(event) {
        if (event.kind === 'work' && event.featured) return 'main';
        if (event.category === 'máster' || event.stage === 'python-ai') return 'specialization';
        if (event.stage === 'legacy' || (event.year_start && event.year_start < 2010)) return 'legacy';
        return 'education';
    }

    // Función principal de renderizado
    render() {
        const container = document.getElementById(this.canvasId);
        if (!container) return;
        container.innerHTML = '';

        this.draw = SVG().addTo(`#${this.canvasId}`).size(this.totalWidth, this.totalHeight);

        this.drawGrid();
        this.drawMetroLines();
        this.drawStations();
    }

    // Dibuja las líneas de fondo y etiquetas de años
    drawGrid() {
        for (let year = this.minYear; year <= this.maxYear; year += 1) {
            const x = this.getX(year, 1);
            if (year % 5 !== 0) continue;
            this.draw.line(x, this.margin.top - 35, x, this.totalHeight - this.margin.bottom + 32)
                .stroke({ color: '#ffffff', width: 1, opacity: 0.1 });
            this.draw.text(year.toString())
                .move(x, this.margin.top - 56)
                .font({ family: 'Outfit', size: 18, weight: 800 })
                .fill({ color: '#ffffff', opacity: 0.3 })
                .attr('text-anchor', 'middle');
        }
    }

    // Dibuja trazados continuos por rama, pasando por todos sus nodos
    drawMetroLines() {
        const tracks = ['specialization', 'main', 'education', 'legacy'];

        tracks.forEach((track) => {
            if (!this.activeFilters.has(track)) return;
            const events = this.events
                .filter((event) => this.getTrack(event) === track)
                .sort((a, b) => a.sortStart.localeCompare(b.sortStart));
            if (!events.length) return;

            const y = this.branchY[track];
            const color = this.branchColors[track];
            const stations = events.map((event) => this.getX(event.year_start, event.month_start));
            const path = this.buildSmoothPath(stations, y);

            this.draw.path(path)
                .fill('none')
                .stroke({ color, width: 7, linecap: 'round', linejoin: 'round', opacity: 0.5 });
        });

        this.drawTransfers();
    }

    // Construye una ruta suave sin invertir el tiempo
    buildSmoothPath(stations, y) {
        if (!stations.length) return '';
        let path = `M ${stations[0]} ${y}`;
        for (let index = 1; index < stations.length; index += 1) {
            const prev = stations[index - 1];
            const curr = stations[index];
            const control = prev + (curr - prev) / 2;
            path += ` C ${control} ${y}, ${control} ${y}, ${curr} ${y}`;
        }
        return path;
    }

    // Dibuja curvas de transferencia entre ramas
    drawTransfers() {
        const transferTargets = ['specialization', 'education', 'legacy'];
        transferTargets.forEach((track) => {
            if (!this.activeFilters.has(track) || !this.activeFilters.has('main')) return;
            const branchEvents = this.events
                .filter((event) => this.getTrack(event) === track)
                .sort((a, b) => a.sortStart.localeCompare(b.sortStart));
            if (!branchEvents.length) return;
            const transferX = this.getX(branchEvents[0].year_start, branchEvents[0].month_start);
            const startY = this.branchY.main;
            const endY = this.branchY[track];
            const c1 = startY + (endY - startY) * 0.35;
            const c2 = startY + (endY - startY) * 0.65;
            this.draw.path(`M ${transferX} ${startY} C ${transferX} ${c1}, ${transferX} ${c2}, ${transferX} ${endY}`)
                .fill('none')
                .stroke({ color: this.branchColors[track], width: 4, linecap: 'round', opacity: 0.45 });
        });
    }

    // Dibuja cada estación
    drawStations() {
        const laneUsage = new Map();

        this.events
            .slice()
            .sort((a, b) => a.sortStart.localeCompare(b.sortStart))
            .forEach((event) => {
                const track = this.getTrack(event);
                if (!this.activeFilters.has(track)) return;

                const y = this.branchY[track];
                const xStart = this.getX(event.year_start, event.month_start);
                const xEnd = this.getX(event.year_end || this.maxYear, event.month_end || 12);
                const color = this.branchColors[track];
                const group = this.draw.group().addClass('tech-station').attr('cursor', 'pointer');

                if (event.kind === 'work') {
                    const laneKey = `${track}:${Math.round(xStart / 22)}`;
                    const laneIndex = laneUsage.get(laneKey) || 0;
                    laneUsage.set(laneKey, laneIndex + 1);
                    const offsetY = y - 94 - laneIndex * 90;
                    const width = Math.max(170, xEnd - xStart);

                    group.rect(width, 74).move(xStart, offsetY).radius(12)
                        .fill({ color: '#0d111e', opacity: 0.96 })
                        .stroke({ color, width: 2 });

                    group.line(xStart, y, xStart, offsetY + 74)
                        .stroke({ color: '#d1d5db', width: 1, opacity: 0.55 });
                    group.line(xEnd, y, xEnd, offsetY + 74)
                        .stroke({ color: '#d1d5db', width: 1, opacity: 0.55 });

                    group.circle(9).center(xStart, y).fill('#ffffff').stroke({ color, width: 2 });
                    group.circle(9).center(xEnd, y).fill('#ffffff').stroke({ color, width: 2 });

                    group.text(event.title).move(xStart + 10, offsetY + 10)
                        .font({ family: 'Outfit', size: 13, weight: 700 }).fill('#ffffff');
                    group.text(`${event.dateLabel} · ${event.entity}`).move(xStart + 10, offsetY + 34)
                        .font({ family: 'Inter', size: 11, weight: 500 }).fill('#94a3b8');
                } else {
                    const orbit = group.circle(34).center(xStart, y).fill({ color, opacity: 0.14 });
                    const station = group.circle(18).center(xStart, y).fill('#0b1020').stroke({ color, width: 3 });
                    orbit.back();
                    station.front();

                    group.text(event.icon === 'sparkles' ? '✨' : '🎓')
                        .center(xStart, y + 1)
                        .font({ size: 11 });

                    const labelText = event.hours ? `${event.title} (${event.hours}h)` : event.title;
                    group.element('title').words(labelText);
                }

                group.on('click', () => {
                    if (window.openModal) window.openModal(event.id);
                });
                group.on('mouseover', function () {
                    this.animate(160, '>').transform({ scale: 1.03 });
                });
                group.on('mouseout', function () {
                    this.animate(160, '<').transform({ scale: 1 });
                });
            });
    }

    // Configura el arrastre del contenedor
    setupDrag() {
        const viewport = document.querySelector('.timeline-viewport');
        if (!viewport) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        viewport.addEventListener('mousedown', (event) => {
            isDown = true;
            viewport.classList.add('grabbing');
            startX = event.pageX - viewport.offsetLeft;
            scrollLeft = viewport.scrollLeft;
        });

        viewport.addEventListener('mouseleave', () => {
            isDown = false;
            viewport.classList.remove('grabbing');
        });

        viewport.addEventListener('mouseup', () => {
            isDown = false;
            viewport.classList.remove('grabbing');
        });

        viewport.addEventListener('mousemove', (event) => {
            if (!isDown) return;
            event.preventDefault();
            const x = event.pageX - viewport.offsetLeft;
            const walk = (x - startX) * 1.6;
            viewport.scrollLeft = scrollLeft - walk;
        });
    }
}

// Registro global de la instancia
window.techRenderer = new TechRenderer();
