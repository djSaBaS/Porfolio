/**
 * main.js
 * Orquestador principal de la aplicación.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Selectores más robustos basados en atributos de datos o clases existentes
    const techTimeline = document.querySelector('[data-tech-timeline]');
    const rrhhTimeline = document.querySelector('[data-rrhh-timeline]');
    const loader = document.getElementById('view-loader');

    // Función local para sincronizar la visibilidad real de paneles en la página CV.
    const syncCvTimelineVisibility = () => {
        // Leemos la vista activa global aplicada por app.js.
        const currentView = document.body.getAttribute('data-view');

        // Tomamos referencias a los paneles específicos de CV.
        const techViewPane = document.getElementById('tech-view');
        const rrhhViewPane = document.getElementById('rrhh-view');
        const filtersPane = document.getElementById('tech-filters-container');

        // Si no existen los paneles, salimos para no afectar otras páginas.
        if (!techViewPane || !rrhhViewPane || !filtersPane) return;

        // Cuando la vista es técnica, mostramos panel técnico y filtros.
        if (currentView === 'tech') {
            techViewPane.classList.remove('d-none');
            rrhhViewPane.classList.add('d-none');
            filtersPane.classList.remove('d-none');
            return;
        }

        // En cualquier otro caso, mostramos RRHH y ocultamos panel/filtros técnicos.
        rrhhViewPane.classList.remove('d-none');
        techViewPane.classList.add('d-none');
        filtersPane.classList.add('d-none');
    };
    
    // Si no estamos en una página con línea de tiempo, salimos discretamente
    if (!techTimeline && !rrhhTimeline) return;

    // Mostrar loader si existe
    if (loader) loader.classList.remove('d-none');

    try {
        if (!window.dataLoader) throw new Error("DataLoader no encontrado");

        // Cargar datos de forma centralizada
        const data = await window.dataLoader.loadAll();
        
        // Inicializar renderers si los contenedores existen
        if (techTimeline) window.techRenderer.init(data);
        if (rrhhTimeline) window.rrhhRenderer.init(data);

        // Sincronizar estado inicial de visibilidad de paneles al cargar CV.
        syncCvTimelineVisibility();

        // Ocultar loader al finalizar
        if (loader) loader.classList.add('d-none');

        // Escuchar cambios de vista (el toggle lo maneja app.js cambiando data-view en el body)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-view') {
                    const currentView = document.body.getAttribute('data-view');

                    // Sincronizamos clases de visibilidad en los paneles de CV.
                    syncCvTimelineVisibility();

                    if (currentView === 'tech' && techTimeline) {
                        window.techRenderer.render();
                    } else if (currentView === 'hr' && rrhhTimeline) {
                        window.rrhhRenderer.render();
                    }
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        // Manejar Resize Responsivo
        window.addEventListener('resize', () => {
            const currentView = document.body.getAttribute('data-view');
            if (currentView === 'tech' && techTimeline) {
                window.techRenderer.render();
            }
        });

    } catch (error) {
        console.error("Error en la inicialización de la línea de tiempo:", error);
        if (loader) {
            loader.innerHTML = `<p class="text-danger small">Error al cargar datos. Comprueba la consola.</p>`;
        }
    }
});
