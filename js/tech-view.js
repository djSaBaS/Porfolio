/**
 * tech-view.js
 * Renderizador de la Vista Técnica (Mapa de Metro / Git Flow).
 * Utiliza SVG.js para el trazado de líneas y nodos interactivos.
 */

class TechRenderer {
    constructor() {
        this.canvasId = 'canvas-tech';
        this.draw = null;
        this.events = [];
        this.skills = {};
        this.margin = { top: 60, right: 100, bottom: 60, left: 100 };
        
        // Configuración de Ramas (Eje Y)
        this.branchY = {
            'specialization': 120,
            'main': 250,
            'education': 380,
            'legacy': 480
        };

        // Colores de Rama
        this.branchColors = {
            'specialization': '#8b5cf6', // Violeta
            'main': '#0ea5e9',           // Azul
            'education': '#10b981',      // Verde / Formación
            'legacy': '#f59e0b'          // Naranja / Construcción
        };
    }

    init(data) {
        this.events = data.events;
        this.skills = data.skills;
        this.render();
    }

    /**
     * Calcula la coordenada X basada en el año.
     * @param {number} year - Año del evento.
     * @param {number} width - Ancho total del canvas.
     * @returns {number} Coordenada X escalada.
     */
    getX(year, width) {
        const minYear = 1996;
        const maxYear = 2026;
        const innerWidth = width - this.margin.left - this.margin.right;
        const progress = (year - minYear) / (maxYear - minYear);
        return this.margin.left + (progress * innerWidth);
    }

    render() {
        const container = document.getElementById(this.canvasId);
        container.innerHTML = ''; // Limpiar previo
        
        const width = Math.max(container.offsetWidth, 1000); // Mínimo de 1000px para legibilidad horizontal
        const height = 600;

        this.draw = SVG().addTo(`#${this.canvasId}`).size(width, height);

        this.drawBackground(width, height);
        this.drawBranches(width);
        this.drawEvents(width);
    }

    drawBackground(width, height) {
        // Líneas de tiempo (años) en el fondo
        for (let year = 1996; year <= 2026; year += 2) {
            const x = this.getX(year, width);
            this.draw.line(x, 40, x, height - 40)
                .stroke({ color: '#ffffff', width: 1, opacity: 0.05, dasharray: '5,5' });
            
            this.draw.text(year.toString())
                .move(x, height - 30)
                .font({ family: 'Inter', size: 12, weight: 600 })
                .fill({ color: '#64748b' })
                .center(x, height - 25);
        }
    }

    /**
     * Dibuja las conexiones entre eventos usando curvas de Bézier.
     * Simula el flujo de Git / Metro.
     */
    drawBranches(width) {
        // Agrupar eventos por rama para trazar la línea continua
        const branches = ['main', 'specialization', 'education', 'legacy'];
        
        branches.forEach(branchName => {
            const branchEvents = this.events.filter(e => e.branch === branchName);
            if (branchEvents.length < 1) return;

            const color = this.branchColors[branchName] || '#94a3b8';
            let pathData = '';

            branchEvents.forEach((event, index) => {
                const x = this.getX(event.year_start, width);
                const y = this.branchY[event.branch];

                if (index === 0) {
                    pathData += `M ${x} ${y}`;
                } else {
                    const prevEvent = branchEvents[index - 1];
                    const prevX = this.getX(prevEvent.year_start, width);
                    const prevY = this.branchY[prevEvent.branch];
                    
                    // Curva de Bézier suave entre nodos
                    const cp1x = prevX + (x - prevX) * 0.5;
                    pathData += ` C ${cp1x} ${prevY}, ${cp1x} ${y}, ${x} ${y}`;
                }

                // Si el evento tiene duración (year_end), dibujamos línea recta hasta el final
                if (event.year_end && event.year_end > event.year_start) {
                    const xEnd = this.getX(event.year_end, width);
                    pathData += ` L ${xEnd} ${y}`;
                }
            });

            this.draw.path(pathData)
                .fill('none')
                .stroke({ color: color, width: 6, linecap: 'round', linejoin: 'round', opacity: 0.6 });
        });
    }

    drawEvents(width) {
        this.events.forEach(event => {
            const x = this.getX(event.year_start, width);
            const y = this.branchY[event.branch];
            const color = event.color || '#0ea5e9';

            // Grupo para el nodo
            const group = this.draw.group().addClass('tech-node').attr('cursor', 'pointer');
            
            // Halo de brillo sutil
            group.circle(36).center(x, y).fill({ color: color, opacity: 0.15 });

            // Círculo principal
            const circle = group.circle(28).center(x, y)
                .fill({ color: '#0f172a' })
                .stroke({ color: color, width: 3 });

            // Icono o Inicial
            if (event.initial) {
                group.text(event.initial)
                    .move(x, y)
                    .font({ family: 'Outfit', size: 10, weight: 700 })
                    .fill({ color: '#fff' })
                    .center(x, y);
            }

            // Etiqueta de Título (solo desktop o espaciados)
            const label = group.text(event.titulo)
                .font({ family: 'Inter', size: 10, weight: 600 })
                .fill({ color: '#94a3b8' });
            
            // Posicionar etiqueta arriba o abajo según rama para evitar solapes
            if (event.branch === 'specialization') {
                label.move(x, y - 40).center(x, y - 35);
            } else {
                label.move(x, y + 25).center(x, y + 30);
            }

            // Interactividad
            group.on('click', () => window.openModal(event.id));
            
            group.on('mouseover', () => {
                circle.animate(200).size(34).stroke({ width: 5 });
                label.animate(200).fill({ color: '#fff' });
            });

            group.on('mouseout', () => {
                circle.animate(200).size(28).stroke({ width: 3 });
                label.animate(200).fill({ color: '#94a3b8' });
            });
        });
    }
}

// Registro global
window.techRenderer = new TechRenderer();
