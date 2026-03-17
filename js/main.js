/**
 * main.js
 * Orquestador principal de la aplicación.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const techTimeline = document.querySelector('[data-tech-timeline]');
    const rrhhTimeline = document.querySelector('[data-rrhh-timeline]');
    const loader = document.getElementById('view-loader');
    const domainFiltersRoot = document.getElementById('domain-filters');

    const syncCvTimelineVisibility = () => {
        const currentView = document.body.getAttribute('data-view');
        const techViewPane = document.getElementById('tech-view');
        const rrhhViewPane = document.getElementById('rrhh-view');
        const filtersPane = document.getElementById('tech-filters-container');

        if (!techViewPane || !rrhhViewPane || !filtersPane) return;

        if (currentView === 'tech') {
            techViewPane.classList.remove('d-none');
            rrhhViewPane.classList.add('d-none');
            filtersPane.classList.remove('d-none');
            return;
        }

        rrhhViewPane.classList.remove('d-none');
        techViewPane.classList.add('d-none');
        filtersPane.classList.add('d-none');
    };

    const setDomainFilter = (domain) => {
        window.cvTimelineDomain = domain;
        if (window.techRenderer) window.techRenderer.setDomainFilter(domain);
        if (window.rrhhRenderer) window.rrhhRenderer.setDomainFilter(domain);

        if (!domainFiltersRoot) return;
        domainFiltersRoot.querySelectorAll('button[data-domain]').forEach((button) => {
            const active = button.dataset.domain === domain;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    };

    const buildDomainFilters = () => {
        if (!domainFiltersRoot) return;

        const domains = [
            { id: 'all', label: 'Todo' },
            { id: 'construction', label: 'Construcción' },
            { id: 'it', label: 'Informática' },
            { id: 'creativity', label: 'Diseño / Sonido' },
            { id: 'development', label: 'Desarrollo / IA' },
        ];

        domainFiltersRoot.innerHTML = domains.map((domain) => `
            <button type="button" class="domain-filter-btn" data-domain="${domain.id}" aria-pressed="false">
                ${domain.label}
            </button>
        `).join('');

        domainFiltersRoot.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-domain]');
            if (!button) return;
            setDomainFilter(button.dataset.domain || 'all');
        });

        setDomainFilter(window.cvTimelineDomain || 'all');
    };

    if (!techTimeline && !rrhhTimeline) return;
    if (loader) loader.classList.remove('d-none');

    try {
        if (!window.dataLoader) throw new Error('DataLoader no encontrado');

        const data = await window.dataLoader.loadAll();

        if (techTimeline && window.techRenderer) window.techRenderer.init(data);
        if (rrhhTimeline && window.rrhhRenderer) window.rrhhRenderer.init(data);
        if (window.modalManager) window.modalManager.init(data);

        buildDomainFilters();
        syncCvTimelineVisibility();

        if (loader) loader.classList.add('d-none');

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName !== 'data-view') return;
                const currentView = document.body.getAttribute('data-view');
                syncCvTimelineVisibility();
                if (currentView === 'tech' && techTimeline && window.techRenderer) window.techRenderer.render();
                if (currentView === 'hr' && rrhhTimeline && window.rrhhRenderer) window.rrhhRenderer.render();
            });
        });

        observer.observe(document.body, { attributes: true });

        window.addEventListener('resize', () => {
            const currentView = document.body.getAttribute('data-view');
            if (currentView === 'tech' && techTimeline && window.techRenderer) window.techRenderer.render();
        });
    } catch (error) {
        console.error('Error en la inicialización de la línea de tiempo:', error);
        if (loader) {
            loader.innerHTML = '<p class="text-danger small">Error al cargar datos. Comprueba la consola.</p>';
        }
    }
});
