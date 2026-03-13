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
        this.margin = { top: 100, right: 100, bottom: 80, left: 120 };
        // Año de inicio para la escala temporal
        this.minYear = 1995;
        // Año de fin para la escala temporal (proyectado)
        this.maxYear = 2027;
        // Ancho total del canvas (ajustado por el tiempo)
        this.totalWidth = 4000;

        // Definición de las "líneas de metro" (ramas) y sus posiciones Y
        this.branchY = {
            'specialization': 80,
            'main':           240,
            'education':      400,
            'legacy':         520
        };

        // Colores vibrantes para cada línea de metro (Sincronizado con style.css)
        this.branchColors = {
            'specialization': '#8b5cf6', // --secondary
            'main':           '#34d399', // --accent
            'education':      '#6ee7ff', // --primary
            'legacy':         '#fb7185'  // --danger
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
            'main': 'Experiencia Principal',
            'specialization': 'Especializaciones',
            'education': 'Educación Central',
            'legacy': 'Legado / Antiguo'
        };

        Object.keys(this.branchColors).forEach(branchId => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn active';
            btn.dataset.branch = branchId;
            btn.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${this.branchColors[branchId]};margin-right:6px;box-shadow: 0 0 5px ${this.branchColors[branchId]};"></span>${labels[branchId] || branchId}`;
            
            btn.addEventListener('click', () => {
                // Alternar estado activo en el Set de filtros
                if (this.activeFilters.has(branchId)) {
                    this.activeFilters.delete(branchId);
                    btn.classList.remove('active');
                } else {
                    this.activeFilters.add(branchId);
                    btn.classList.add('active');
                }
                // Re-dibujar el SVG por completo para aplicar el filtro
                this.render(); 
            });

            filterContainer.appendChild(btn);
        });
    }

    // Calcula la coordenada X proporcional al año y mes (si disponible)
    getX(year, month = 0) {
        // Obtenemos el progreso decimal del año dentro del rango
        const yearProgress = (year - this.minYear) / (this.maxYear - this.minYear);
        // Añadimos el componente del mes (0-11) para mayor precisión
        const monthOffset = (month / 12) * (1 / (this.maxYear - this.minYear));
        // Devolvemos el píxel X correspondiente
        return this.margin.left + (yearProgress + monthOffset) * (this.totalWidth - this.margin.left - this.margin.right);
    }

    // Determina en qué carril de metro va el evento según su 'stage' o 'kind'
    getTrack(event) {
        // Si es trabajo principal (normalizado a 'work'), va a la rama central
        if (event.kind === 'work' && event.featured) return 'main';
        // Si es máster o IA/Python, va a especialización
        if (event.category === 'máster' || event.stage === 'python-ai') return 'specialization';
        // Si es educación básica o antigua, va a legacy
        if (event.stage === 'legacy' || (event.year_start && event.year_start < 2010)) return 'legacy';
        // Por defecto, educación general
        return 'education';
    }

    // Función principal de renderizado
    render() {
        console.log("TechRenderer: Iniciando renderizado de SVG...");
        // Obtenemos el nodo contenedor
        const container = document.getElementById(this.canvasId);
        // Si no existe, abortamos
        if (!container) return;
        // Limpiamos contenido anterior
        container.innerHTML = '';

        // Creamos el SVG con ancho extendido para el scroll
        this.draw = SVG().addTo(`#${this.canvasId}`).size(this.totalWidth, 650);

        // Dibujamos la cuadrícula de años
        this.drawGrid();
        // Dibujamos las líneas de metro (conexiones)
        this.drawMetroLines();
        // Dibujamos los nodos (estaciones)
        this.drawStations();
    }

    // Dibuja las líneas de fondo y etiquetas de años
    drawGrid() {
        // Recorremos los años de 5 en 5 para etiquetas principales
        for (let year = this.minYear; year <= this.maxYear; year++) {
            // Calculamos X para el año actual
            const x = this.getX(year);
            // Si es un año múltiplo de 5, dibujamos línea y texto
            if (year % 5 === 0) {
                // Línea vertical tenue
                this.draw.line(x, 50, x, 850)
                    .stroke({ color: 'white', width: 1, opacity: 0.1 });
                // Texto del año en la parte superior
                this.draw.text(year.toString())
                    .move(x, 40)
                    .font({ family: 'Outfit', size: 22, weight: 900 })
                    .fill({ color: 'white', opacity: 0.2 })
                    .attr('text-anchor', 'middle');
            }
        }
    }

    // Dibuja los trazados continuos de las líneas de metro
    drawMetroLines() {
        // Lista de tracks a dibujar
        const tracks = ['specialization', 'main', 'education', 'legacy'];
        
        // Para cada track, creamos un trazado
        tracks.forEach(track => {
            // Saltamos el dibujo si el filtro de esta rama está desactivado
            if (!this.activeFilters.has(track)) return;

            // Filtramos eventos de esta rama
            const trackEvents = this.events.filter(e => this.getTrack(e) === track);
            // Si no hay eventos, pasamos a la siguiente
            if (trackEvents.length === 0) return;

            // Ordenamos por fecha
            trackEvents.sort((a, b) => a.year_start - b.year_start);

            // Obtenemos color y posición Y
            const color = this.branchColors[track];
            const y = this.branchY[track];

            // Punto inicial (X del primer evento hasta el final proyectado)
            const startX = this.getX(trackEvents[0].year_start);
            const endX = this.getX(this.maxYear);

            // Dibujamos la línea base (eliminamos el filtro conflictivo en producción)
            this.draw.line(startX, y, endX, y)
                .stroke({ color, width: 8, linecap: 'round', opacity: 0.4 });
        });

        // Dibujamos curvas de transferencia (forks) desde la línea principal
        this.drawTransfers();
    }

    // Dibuja las curvas suaves que conectan ramas
    drawTransfers() {
        // Por simplicidad en este MVP, dibujamos líneas de conexión fijas
        // representadas como curvas Bézier desde el inicio de cada rama a la principal
    }

    // Dibuja cada estación (nodo de evento)
    drawStations() {
        // Recorremos todos los eventos
        this.events.forEach(event => {
            // Obtenemos track y verificamos si se debe dibujar
            const track = this.getTrack(event);
            if (!this.activeFilters.has(track)) return;

            const xSize = (event.year_end - event.year_start) * 100; // Tamaño proporcional opcional
            const x = this.getX(event.year_start);
            const y = this.branchY[track];
            const color = this.branchColors[track];

            // Creamos un grupo para el nodo interactivo
            const group = this.draw.group().addClass('tech-station').attr('cursor', 'pointer');

            // Determinar si es caja (trabajo) o círculo (formación)
            if (event.kind === 'work') {
                // Ancho basado en duración (mínimo 200px)
                const duration = Math.max(1, (event.year_end || 2026) - event.year_start);
                const rectW = 200 + (duration * 20);
                
                // Fondo oscuro de la tarjeta
                group.rect(rectW, 80).move(x - 20, y - 40).radius(15)
                    .fill({ color: '#0d111e', opacity: 0.95 })
                    .stroke({ color, width: 3 });

                // Icono/Texto de categoría
                group.text('💼 ' + (event.category || 'EMPLEO').toUpperCase())
                    .move(x, y - 28)
                    .font({ family: 'Inter', size: 10, weight: 800 })
                    .fill(color);

                // Título del puesto
                group.text(event.title)
                    .move(x, y - 10)
                    .font({ family: 'Outfit', size: 15, weight: 700 })
                    .fill('white');

                // Fecha y empresa
                group.text(`${event.year_start} - ${event.year_end || 'ACT'} · ${event.entity}`)
                    .move(x, y + 12)
                    .font({ family: 'Inter', size: 11 })
                    .fill('#94a3b8');
            } else {
                // Nodo tipo estación circular para formación
                const orbit = group.circle(40).center(x, y).fill({ color, opacity: 0.1 });
                const station = group.circle(24).center(x, y).fill('#0b1020').stroke({ color, width: 4 });
                
                // Icono dentro del nodo
                group.text(event.icon === 'sparkles' ? '✨' : '🎓')
                    .center(x, y + 2)
                    .font({ size: 12 });

                // Etiqueta flotante
                const label = group.text(event.title)
                    .move(x + 20, y - 10)
                    .font({ family: 'Inter', size: 12, weight: 600 })
                    .fill('white');
                
                // Ocultamos etiqueta por defecto y mostramos en hover si hay mucho ruido
                // o añadimos tooltip (horas)
                const hoursText = event.hours ? ` (${event.hours}h)` : '';
                group.element('title').words(`${event.title}${hoursText}`);
            }

            // Click para abrir modal
            group.on('click', () => {
                if (window.openModal) window.openModal(event.id);
            });

            // Efectos visuales en hover
            group.on('mouseover', function() {
                this.animate(200, '>').transform({ scale: 1.05 });
            });
            group.on('mouseout', function() {
                this.animate(200, '<').transform({ scale: 1 });
            });
        });
    }

    // Configura el arrastre táctil y con ratón del contenedor
    setupDrag() {
        // Buscamos el viewport de la línea de tiempo
        const viewport = document.querySelector('.timeline-viewport');
        if (!viewport) return;

        // Variables de estado del arrastre
        let isDown = false;
        let startX;
        let scrollLeft;

        // Inicio del click/toque
        viewport.addEventListener('mousedown', (e) => {
            isDown = true;
            viewport.classList.add('grabbing');
            startX = e.pageX - viewport.offsetLeft;
            scrollLeft = viewport.scrollLeft;
        });

        // Salida del área
        viewport.addEventListener('mouseleave', () => {
            isDown = false;
            viewport.classList.remove('grabbing');
        });

        // Fin del click
        viewport.addEventListener('mouseup', () => {
            isDown = false;
            viewport.classList.remove('grabbing');
        });

        // Movimiento activo
        viewport.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            // Calculamos distancia recorrida
            const x = e.pageX - viewport.offsetLeft;
            const walk = (x - startX) * 2; // Multiplicador de velocidad
            // Aplicamos el scroll
            viewport.scrollLeft = scrollLeft - walk;
        });
    }
}

// Registro global de la instancia
window.techRenderer = new TechRenderer();
