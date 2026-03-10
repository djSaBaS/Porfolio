/**
 * modal.js
 * Sistema de modal compartida (Vanilla JS) para mostrar detalles de los eventos.
 */

function openModal(id) {
    const event = window.dataLoader.getEventById(id);
    if (!event) return;

    const modal = document.getElementById('event-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    // Construir contenido dinámico
    const color = event.color || '#0ea5e9';
    const tagsHtml = (event.tags || []).map(tag =>
        `<span class="badge-tag">${tag}</span>`
    ).join('');


    content.innerHTML = `
        <div class="modal-header-custom" style="border-left: 4px solid ${color}">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <span class="badge-type" style="background-color: ${color}22; color: ${color}">${event.category || event.tipo || ''}</span>
                    <h3 class="modal-title-text">${event.title || ''}</h3>
                    <p class="modal-subtitle-text">${event.entity || ''}</p>
                </div>
                <div class="modal-date-tag">${event.dateLabel || (event.year_start + ' — ' + (event.year_end || 'Actualidad'))}</div>
            </div>
        </div>
        <div class="modal-body-custom">
            <div class="modal-description-text">${event.summary || event.excerpt || 'Sin descripción disponible.'}</div>
            ${tagsHtml ? `
                <div class="modal-section-title">Tecnologías y Competencias</div>
                <div class="tags-row-modal">${tagsHtml}</div>
            ` : ''}
        </div>
        ${event.link ? `
            <div class="modal-footer-custom">
                <a href="${event.link}" target="_blank" rel="noopener" class="btn-modal-action" style="background-color: ${color}">
                    <i class="bi bi-box-arrow-up-right me-2"></i>Ver más detalles
                </a>
            </div>
        ` : ''}
    `;


    // Mostrar modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Bloquear scroll
}

// Cerrar modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('event-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
});

window.openModal = openModal;
