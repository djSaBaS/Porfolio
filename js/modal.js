/**
 * modal.js
 * Sistema de modal compartida para mostrar detalles de los eventos.
 */

function openModal(id) {
    const event = window.dataLoader.getEventById(id);
    if (!event) return;

    const modalTitle = document.getElementById('eventModalLabel');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalEntity = document.getElementById('modal-entity');
    const modalDates = document.getElementById('modal-dates');
    const modalDescription = document.getElementById('modal-description');
    const modalBadge = document.getElementById('modal-badge');
    const modalSkills = document.getElementById('modal-skills');
    const modalTags = document.getElementById('modal-tags');
    const modalIconBox = document.getElementById('modal-iconbox');
    const modalActionBtn = document.getElementById('modal-action-btn');

    // Títulos y textos básicos
    modalTitle.innerText = event.titulo;
    modalSubtitle.innerText = event.subtitulo || (event.tipo === 'trabajo' ? 'Experiencia Laboral' : 'Formación Académica');
    modalEntity.innerText = event.empresa || event.centro || '';
    modalDates.innerText = `${event.fecha_inicio} — ${event.fecha_fin || 'Actualidad'}`;
    modalDescription.innerHTML = event.descripcion || event.summary || '';

    // Badge de categoría
    modalBadge.innerText = event.categoria;
    modalBadge.className = 'badge rounded-pill fw-light';
    modalBadge.style.backgroundColor = event.color || '#0ea5e9';

    // Icono / Logo Box
    modalIconBox.style.backgroundColor = (event.color || '#0ea5e9') + '22'; // 14% de opacidad
    modalIconBox.style.color = event.color || '#0ea5e9';
    modalIconBox.style.border = `1px solid ${event.color || '#0ea5e9'}44`;
    modalIconBox.innerHTML = event.logo ? `<img src="${event.logo}" alt="Logo" style="width: 28px;">` : `<span>${event.initial || '•'}</span>`;

    // Skills Chips
    modalSkills.innerHTML = '';
    if (event.skills && event.skills.length > 0) {
        event.skills.forEach(skillKey => {
            const skill = window.dataLoader.skills[skillKey] || { label: skillKey, icon: 'bi-check' };
            const chip = document.createElement('div');
            chip.className = 'skill-chip';
            chip.innerHTML = `<i class="${skill.icon}"></i> ${skill.label}`;
            modalSkills.appendChild(chip);
        });
    }

    // Tags
    modalTags.innerHTML = '';
    if (event.tags && event.tags.length > 0) {
        event.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 fw-normal';
            span.innerText = tag;
            modalTags.appendChild(span);
        });
    }

    // Botón de Acción (URL)
    if (event.url) {
        modalActionBtn.classList.remove('d-none');
        modalActionBtn.href = event.url;
        modalActionBtn.innerHTML = `<i class="bi bi-box-arrow-up-right me-2"></i>Ver ${event.tipo === 'trabajo' ? 'Empresa' : 'Curso'}`;
    } else {
        modalActionBtn.classList.add('d-none');
    }

    // Abrir Modal con Bootstrap
    const modalElement = document.getElementById('eventModal');
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    bsModal.show();
}

// Hacer global como solicita el USER
window.openModal = openModal;
