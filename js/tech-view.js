/**
 * tech-view.js
 * Renderizador de la Vista Técnica (Mapa de Metro / Git Flow).
 * Usa SVG.js para el trazado de líneas y nodos interactivos.
 * Compatible con el formato de datos de assets/json/datos.json
 */

class TechRenderer {
    constructor() {
        this.canvasId = 'canvas-tech';  // ID correcto del contenedor
        this.draw = null;
        this.events = [];
        this.skills = {};
        this.margin = { top: 80, right: 80, bottom: 60, left: 80 };

        // Mapeo de 'stage' a rama visual
        this.stageToTrack = {
            'leadership-tech':    'specialization',
            'python-ai':          'specialization',
            'fullstack-web':      'main',
            'backend-data':       'main',
            'systems-cloud':      'main',
            'web-dev':            'main',
            'digital-business':   'education',
            'mobile-design':      'education',
            'security':           'education',
            'it-support':         'education',
            'industry-specialist':'legacy',
            'industrial-foundation':'legacy',
            'audio-creative':     'legacy',
            'safety':             'legacy',
            'academic-foundation':'legacy',
            'creative-design':    'legacy'
        };

        // Eje Y de cada pista
        this.branchY = {
            'specialization': 110,
            'main':           230,
            'education':      360,
            'legacy':         470
        };

        // Colores por pista
        this.branchColors = {
            'specialization': '#8b5cf6',
            'main':           '#0ea5e9',
            'education':      '#10b981',
            'legacy':         '#f59e0b'
        };
    }

    init(data) {
        this.events = data.events;
        this.skills = data.skills;
        this.render();
    }

    // Calcula X según el año
    getX(year, width) {
        const minYear = 1994;
        const maxYear = 2027;
        const innerWidth = width - this.margin.left - this.margin.right;
        const progress = (year - minYear) / (maxYear - minYear);
        return this.margin.left + progress * innerWidth;
    }

    // Devuelve la pista ('specialization', 'main', …) para cada evento
    getTrack(event) {
        return this.stageToTrack[event.stage] || 'education';
    }

    render() {
        const container = document.getElementById(this.canvasId);
        if (!container) return;
        container.innerHTML = '';

        const width  = Math.max(container.offsetWidth || 1100, 1100);
        const height = 600;

        this.draw = SVG().addTo(`#${this.canvasId}`).size(width, height);

        this.drawTimelineGrid(width, height);
        this.drawLegend(width);
        this.drawBranches(width);
        this.drawEvents(width);
    }

    drawTimelineGrid(width, height) {
        const startYear = 1994;
        const endYear   = 2027;

        // Décadas
        [2000, 2010, 2020].forEach(dec => {
            const xLine = this.getX(dec, width);
            this.draw.line(xLine, this.margin.top, xLine, height - this.margin.bottom)
                .stroke({ color: '#ffffff', width: 1, opacity: 0.08 });
            this.draw.text(`${dec}s`)
                .move(xLine + 6, this.margin.top - 22)
                .font({ family: 'Outfit', size: 14, weight: 700 })
                .fill({ color: '#334155', opacity: 0.9 });
        });

        // Años (cada 5 años con etiqueta, cada 2 con lína tenue)
        for (let year = startYear; year <= endYear; year++) {
            const x = this.getX(year, width);
            const isMain = year % 5 === 0;
            if (year % 2 === 0) {
                this.draw.line(x, this.margin.top, x, height - this.margin.bottom)
                    .stroke({ color: '#ffffff', width: 1, opacity: isMain ? 0.06 : 0.02 });
            }
            if (isMain) {
                this.draw.text(year.toString())
                    .font({ family: 'Inter', size: 11, weight: 600 })
                    .fill({ color: '#475569' })
                    .center(x, height - this.margin.bottom + 20);
            }
        }
    }

    drawLegend(width) {
        const items = [
            { label: 'Especialización',        color: this.branchColors.specialization },
            { label: 'Trayectoria Principal',  color: this.branchColors.main },
            { label: 'Formación',              color: this.branchColors.education },
            { label: 'Legacy / Otras áreas',   color: this.branchColors.legacy }
        ];
        let cx = this.margin.left;
        items.forEach(item => {
            this.draw.circle(10).center(cx + 5, 20).fill(item.color);
            this.draw.text(item.label)
                .move(cx + 14, 12)
                .font({ family: 'Inter', size: 11, weight: 600 })
                .fill('#94a3b8');
            cx += 175;
        });
    }

    drawBranches(width) {
        const tracks = ['specialization', 'main', 'education', 'legacy'];
        tracks.forEach(track => {
            const trackEvents = this.events
                .filter(e => this.getTrack(e) === track)
                .sort((a, b) => (a.year_start || 0) - (b.year_start || 0));

            if (trackEvents.length < 1) return;

            const color = this.branchColors[track];
            const y     = this.branchY[track];

            let pathData = '';
            trackEvents.forEach((ev, i) => {
                const x    = this.getX(ev.year_start, width);
                const xEnd = this.getX(Math.min(ev.year_end || ev.year_start, 2027), width);

                if (i === 0) {
                    pathData += `M ${x} ${y}`;
                } else {
                    const prev  = trackEvents[i - 1];
                    const prevX = this.getX(Math.min(prev.year_end || prev.year_start, 2027), width);
                    const cpX   = prevX + (x - prevX) * 0.5;
                    pathData += ` C ${cpX} ${y}, ${cpX} ${y}, ${x} ${y}`;
                }
                // Extensión al año de fin
                if (xEnd > x) pathData += ` L ${xEnd} ${y}`;
            });

            this.draw.path(pathData)
                .fill('none')
                .stroke({ color, width: 7, linecap: 'round', linejoin: 'round', opacity: 0.45 });
        });
    }

    drawEvents(width) {
        this.events.forEach(event => {
            const track = this.getTrack(event);
            const x     = this.getX(event.year_start, width);
            const y     = this.branchY[track];
            if (!y) return;

            const color = event.color || this.branchColors[track] || '#0ea5e9';
            const group = this.draw.group().addClass('tech-node').attr('cursor', 'pointer');

            // Anillos de brillo
            group.circle(48).center(x, y).fill({ color, opacity: 0.08 });
            group.circle(38).center(x, y).fill({ color, opacity: 0.18 });
            const circle = group.circle(28).center(x, y)
                .fill('#0f172a')
                .stroke({ color, width: 2.5 });

            // Iniciales del título como icono
            const initials = (event.title || '').split(' ')
                .slice(0, 2).map(w => w[0]).join('').toUpperCase();
            group.text(initials)
                .font({ family: 'Inter', size: 10, weight: 700 })
                .fill('#f1f5f9')
                .center(x, y);

            // Etiqueta: arriba si es especialización, abajo si no
            const above = track === 'specialization';
            const lY    = above ? y - 50 : y + 38;
            const sY    = above ? y - 36 : y + 52;

            group.text(event.title || '')
                .font({ family: 'Outfit', size: 10, weight: 700 })
                .fill('#f8fafc')
                .center(x, lY);

            group.text(event.entity || '')
                .font({ family: 'Inter', size: 9 })
                .fill('#64748b')
                .center(x, sY);

            // Interactividad
            group.on('click', () => {
                if (window.openModal) window.openModal(event.id);
            });
            group.on('mouseover', () => {
                circle.animate(150).stroke({ width: 4, color: '#fff' });
            });
            group.on('mouseout', () => {
                circle.animate(150).stroke({ width: 2.5, color });
            });
        });
    }
}

window.techRenderer = new TechRenderer();
