/**
 * main.js
 * Orquestador principal de la aplicación.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('view-loader');
    const viewSwitcher = document.getElementById('viewSwitcher');
    const techView = document.getElementById('view-tech');
    const rrhhView = document.getElementById('view-rrhh');
    const buttons = viewSwitcher.querySelectorAll('button');

    // Mostrar loader al inicio
    loader.classList.remove('d-none');

    try {
        // Cargar datos
        const data = await window.dataLoader.loadAll();
        
        // Inicializar Vistas (Render inicial)
        window.techRenderer.init(data);
        window.rrhhRenderer.init(data);

        // Ocultar loader
        loader.classList.add('d-none');

        // Manejar Cambio de Vistas
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                
                // Actualizar UI del Switcher
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Cambiar Visibilidad de Contenedores
                if (view === 'tech') {
                    techView.classList.remove('d-none');
                    rrhhView.classList.add('d-none');
                    // Re-render o ajuste si es necesario
                    window.techRenderer.render();
                } else {
                    techView.classList.add('d-none');
                    rrhhView.classList.remove('d-none');
                    window.rrhhRenderer.render();
                }
            });
        });

        // Manejar Resize Responsivo
        window.addEventListener('resize', () => {
            if (!techView.classList.contains('d-none')) {
                window.techRenderer.render();
            }
        });

    } catch (error) {
        loader.innerHTML = `<p class="text-danger">Error al cargar la trayectoria. Por favor, recarga la página.</p>`;
        console.error("Error en la inicialización:", error);
    }
});
