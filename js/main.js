/**
 * main.js
 * Orquestador principal de la aplicación.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Selectores más robustos basados en atributos de datos o clases existentes
    const techTimeline = document.querySelector('[data-tech-timeline]');
    const rrhhTimeline = document.querySelector('[data-rrhh-timeline]');
    
    // Si no estamos en una página con línea de tiempo, salimos discretamente
    if (!techTimeline && !rrhhTimeline) return;

    try {
        // Cargar datos de forma centralizada
        const data = await window.dataLoader.loadAll();
        
        // Inicializar renderers si los contenedores existen
        if (techTimeline) window.techRenderer.init(data);
        if (rrhhTimeline) window.rrhhRenderer.init(data);

        // Escuchar cambios de vista (el toggle lo maneja app.js cambiando data-view en el body)
        // Observamos cambios en el atributo data-view del body para re-renderizar si es necesario
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-view') {
                    const currentView = document.body.getAttribute('data-view');
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
    }
});
