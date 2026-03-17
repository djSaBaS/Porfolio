/**
 * tech-view.js
 * Renderizador de la Vista Técnica (Mapa de Metro interactivo con línea central y ramas por dominio).
 */

class TechRenderer {
    constructor() {
        this.canvasId = 'canvas-tech';
        this.draw = null;
        this.events = [];
        this.domainFilter = 'all';

        this.margin = { top: 70, right: 120, bottom: 90, left: 90 };
        this.minYear = 1998;
        this.maxYear = 2027;
        this.totalWidth = 4200;
        this.totalHeight = 820;

        this.branchY = {
            main: 390,
            development: 180,
            it: 280,
            creativity: 520,
            construction: 640,
        };

        this.branchColors = {
            main: '#34d399',
            development: '#8b5cf6',
            it: '#38bdf8',
            creativity: '#f472b6',
            construction: '#f59e0b',
        };

        this.branchLabels = {
            main: 'Línea central (vida + formación reglada)',
            development: 'Desarrollo e IA',
            it: 'Informática / sistemas',
            creativity: 'Creatividad / diseño / sonido',
            construction: 'Construcción / oficios / PRL',
        };

        this.activeFilters = new Set(['main', 'development', 'it', 'creativity', 'construction']);
    }

    init(data) {
        this.events = data.events.slice();
        this.buildFilters();
        this.render();
        this.setupDrag();
    }

    setDomainFilter(domain) {
        this.domainFilter = domain || 'all';
        this.render();
    }

    buildFilters() {
        const filterContainer = document.getElementById('tech-filters');
        if (!filterContainer) return;

        filterContainer.innerHTML = '';
        ['main', 'development', 'it', 'creativity', 'construction'].forEach((branchId) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn active';
            btn.dataset.branch = branchId;
            btn.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${this.branchColors[branchId]};margin-right:6px;box-shadow:0 0 5px ${this.branchColors[branchId]};"></span>${this.branchLabels[branchId]}`;
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

    getX(year, month = 1) {
        const safeYear = Math.min(Math.max(Number(year) || this.minYear, this.minYear), this.maxYear);
        const safeMonth = Math.min(Math.max(Number(month) || 1, 1), 12);
        const progress = (safeYear - this.minYear + (safeMonth - 1) / 12) / (this.maxYear - this.minYear);
        return this.margin.left + progress * (this.totalWidth - this.margin.left - this.margin.right);
    }

    getFilteredEvents() {
        const ordered = this.events.slice().sort((a, b) => a.sortStart.localeCompare(b.sortStart));
        if (this.domainFilter === 'all') return ordered;
        return ordered.filter((event) => event.domain === this.domainFilter || event.domain === 'core');
    }

    render() {
        const container = document.getElementById(this.canvasId);
        if (!container) return;
        container.innerHTML = '';

        this.draw = SVG().addTo(`#${this.canvasId}`).size(this.totalWidth, this.totalHeight);

        const events = this.getFilteredEvents();
        this.drawGrid();
        this.drawMainLine(events);
        this.drawBranchLines(events);
        this.drawStations(events);
    }

    drawGrid() {
        for (let year = this.minYear; year <= this.maxYear; year += 1) {
            if (year % 5 !== 0) continue;
            const x = this.getX(year, 1);
            this.draw.line(x, this.margin.top - 25, x, this.totalHeight - this.margin.bottom + 30)
                .stroke({ color: '#ffffff', width: 1, opacity: 0.12 });
            this.draw.text(String(year)).move(x, this.margin.top - 50)
                .font({ family: 'Outfit', size: 24, weight: 800 })
                .fill({ color: '#ffffff', opacity: 0.4 })
                .attr('text-anchor', 'middle');
        }
    }

    drawMainLine(events) {
        if (!this.activeFilters.has('main')) return;
        const y = this.branchY.main;
        this.draw.line(this.margin.left, y, this.totalWidth - this.margin.right, y)
            .stroke({ color: this.branchColors.main, width: 8, linecap: 'round', opacity: 0.65 });

        const coreEvents = events.filter((event) => this.getTrack(event) === 'main');
        coreEvents.forEach((event) => {
            const x = this.getX(event.year_start, event.month_start);
            this.draw.circle(14).center(x, y)
                .fill('#ffffff')
                .stroke({ color: this.branchColors.main, width: 3 });
        });
    }

    getTrack(event) {
        if (event.domain === 'construction') return 'construction';
        if (event.domain === 'creativity') return 'creativity';
        if (event.domain === 'it') return 'it';
        if (event.domain === 'development') return 'development';
        return 'main';
    }

    drawBranchLines(events) {
        const branchIds = ['construction', 'creativity', 'it', 'development'];
        branchIds.forEach((branchId) => {
            if (!this.activeFilters.has(branchId)) return;
            const branchEvents = events.filter((event) => this.getTrack(event) === branchId);
            if (!branchEvents.length) return;

            const yMain = this.branchY.main;
            const yBranch = this.branchY[branchId];
            const color = this.branchColors[branchId];
            const clusters = this.groupByActivityClusters(branchEvents);

            clusters.forEach((cluster) => {
                const startX = this.getX(cluster.start.year_start, cluster.start.month_start);
                const endX = this.getX(cluster.end.year_end || cluster.end.year_start, cluster.end.month_end || cluster.end.month_start);
                const c1 = startX + Math.min(120, (endX - startX) * 0.25);
                const c2 = endX - Math.min(120, (endX - startX) * 0.25);

                this.draw.path(`M ${startX} ${yMain} C ${startX} ${(yMain + yBranch) / 2}, ${c1} ${yBranch}, ${startX} ${yBranch}`)
                    .fill('none')
                    .stroke({ color, width: 6, linecap: 'round', linejoin: 'round', opacity: 0.75 });

                this.draw.path(`M ${startX} ${yBranch} C ${c1} ${yBranch}, ${c2} ${yBranch}, ${endX} ${yBranch}`)
                    .fill('none')
                    .stroke({ color, width: 6, linecap: 'round', linejoin: 'round', opacity: 0.75 });

                this.draw.path(`M ${endX} ${yBranch} C ${endX} ${(yMain + yBranch) / 2}, ${endX} ${(yMain + yBranch) / 2}, ${endX} ${yMain}`)
                    .fill('none')
                    .stroke({ color, width: 6, linecap: 'round', linejoin: 'round', opacity: 0.75 });

                this.draw.circle(12).center(startX, yMain).fill('#ffffff').stroke({ color, width: 3 });
                this.draw.circle(12).center(endX, yMain).fill('#ffffff').stroke({ color, width: 3 });
            });
        });
    }

    groupByActivityClusters(events) {
        const ordered = events.slice().sort((a, b) => a.sortStart.localeCompare(b.sortStart));
        const clusters = [];
        let current = [];

        ordered.forEach((event, index) => {
            if (!current.length) {
                current.push(event);
                return;
            }

            const last = current[current.length - 1];
            const lastEndYear = last.year_end || last.year_start;
            const lastEndMonth = last.month_end || 12;
            const gapInYears = (event.year_start + (event.month_start || 1) / 12) - (lastEndYear + lastEndMonth / 12);

            if (gapInYears > 2) {
                clusters.push({ start: current[0], end: current[current.length - 1], events: current.slice() });
                current = [event];
            } else {
                current.push(event);
            }

            if (index === ordered.length - 1) {
                clusters.push({ start: current[0], end: current[current.length - 1], events: current.slice() });
            }
        });

        if (ordered.length === 1) {
            clusters.push({ start: ordered[0], end: ordered[0], events: [ordered[0]] });
        }

        return clusters;
    }

    drawStations(events) {
        const lanes = new Map();

        events.forEach((event) => {
            const track = this.getTrack(event);
            if (!this.activeFilters.has(track)) return;

            const xStart = this.getX(event.year_start, event.month_start);
            const xEnd = this.getX(event.year_end || event.year_start, event.month_end || 12);
            const y = this.branchY[track];
            const color = this.branchColors[track];
            const group = this.draw.group().addClass('tech-station').attr('cursor', 'pointer');

            if (event.kind === 'work') {
                const laneKey = `${track}:${Math.round(xStart / 180)}`;
                const laneIndex = lanes.get(laneKey) || 0;
                lanes.set(laneKey, laneIndex + 1);

                const baseOffset = track === 'main' ? -112 : -86;
                const cardY = y + baseOffset - laneIndex * 92;
                const cardWidth = Math.max(210, xEnd - xStart);

                group.rect(cardWidth, 78).move(xStart, cardY).radius(14)
                    .fill({ color: '#071028', opacity: 0.96 })
                    .stroke({ color, width: 2.5 });

                group.line(xStart, y, xStart, cardY + 78).stroke({ color: '#dbeafe', width: 1, opacity: 0.6 });
                group.line(xEnd, y, xEnd, cardY + 78).stroke({ color: '#dbeafe', width: 1, opacity: 0.6 });

                group.circle(10).center(xStart, y).fill('#ffffff').stroke({ color, width: 2 });
                group.circle(10).center(xEnd, y).fill('#ffffff').stroke({ color, width: 2 });

                group.text(event.title).move(xStart + 12, cardY + 10)
                    .font({ family: 'Outfit', size: 16, weight: 700 }).fill('#ffffff');
                group.text(`${event.dateLabel} · ${event.entity}`).move(xStart + 12, cardY + 38)
                    .font({ family: 'Inter', size: 12, weight: 500 }).fill('#94a3b8');
            } else {
                group.circle(30).center(xStart, y).fill({ color, opacity: 0.16 });
                group.circle(16).center(xStart, y).fill('#071028').stroke({ color, width: 3 });
                group.text(event.icon === 'sparkles' ? '✨' : '🎓').center(xStart, y + 1).font({ size: 10 });
                const tooltip = event.hours ? `${event.title} (${event.hours}h)` : event.title;
                group.element('title').words(tooltip);
            }

            group.on('click', () => {
                if (window.modalManager) window.modalManager.open(event.id);
            });
        });
    }

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
            const walk = (x - startX) * 1.55;
            viewport.scrollLeft = scrollLeft - walk;
        });
    }
}

window.techRenderer = new TechRenderer();
