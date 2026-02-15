(function () {
  const VIEW_KEY = 'portfolioAudienceView';
  const DEFAULT_VIEW = 'hr';

  function getView() {
    const stored = localStorage.getItem(VIEW_KEY);
    return stored === 'tech' ? 'tech' : DEFAULT_VIEW;
  }

  function setView(view) {
    const normalized = view === 'tech' ? 'tech' : 'hr';
    document.body.setAttribute('data-view', normalized);
    localStorage.setItem(VIEW_KEY, normalized);
    document.querySelectorAll('[data-toggle-view]').forEach((button) => {
      const pressed = button.getAttribute('data-toggle-view') === normalized;
      button.setAttribute('aria-pressed', String(pressed));
    });
  }

  function setupAudienceToggle() {
    document.querySelectorAll('[data-toggle-view]').forEach((button) => {
      button.addEventListener('click', () => setView(button.getAttribute('data-toggle-view')));
    });
    setView(getView());
  }

  function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  }

  function gaugePercent(value) {
    const virtualMax = value * 1.1;
    const percent = (value / virtualMax) * 100;
    return clamp(percent, 0, 95);
  }

  function animateGauges() {
    const gauges = document.querySelectorAll('.gauge[data-value]');
    if (!gauges.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const value = Number(el.getAttribute('data-value') || '0');
        const target = gaugePercent(value);
        let current = 0;
        const step = () => {
          current += 2;
          el.style.setProperty('--percent', String(Math.min(current, target)));
          if (current < target) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });

    gauges.forEach((gauge) => observer.observe(gauge));
  }

  function safeText(text) {
    return document.createTextNode(text);
  }

  function createBadge(tag) {
    const span = document.createElement('span');
    span.className = 'badge';
    span.appendChild(safeText(tag));
    return span;
  }

  function renderProjects() {
    const list = document.querySelector('[data-project-list]');
    if (!list) return;

    const jsonUrl = list.getAttribute('data-json-url') || 'projects/data.json';
    fetch(jsonUrl)
      .then((res) => res.json())
      .then((projects) => {
        const filtersContainer = document.querySelector('[data-project-filters]');
        const allTags = [...new Set(projects.flatMap((project) => project.tags))];
        let activeTag = 'Todos';

        const drawList = () => {
          list.innerHTML = '';
          projects
            .filter((project) => activeTag === 'Todos' || project.tags.includes(activeTag))
            .forEach((project) => {
              const card = document.createElement('article');
              card.className = 'card';

              const title = document.createElement('h3');
              title.textContent = project.name;

              const summary = document.createElement('p');
              summary.setAttribute('data-audience', 'hr');
              summary.textContent = project.hrSummary;

              const techSummary = document.createElement('p');
              techSummary.setAttribute('data-audience', 'tech');
              techSummary.textContent = project.techNotes;

              const actions = document.createElement('div');
              actions.className = 'actions';
              actions.style.marginTop = '.7rem';

              const detail = document.createElement('a');
              detail.className = 'btn';
              detail.href = project.url;
              detail.textContent = 'Ver caso';
              actions.appendChild(detail);

              if (project.repo) {
                const repo = document.createElement('a');
                repo.className = 'btn';
                repo.href = project.repo;
                repo.target = '_blank';
                repo.rel = 'noopener';
                repo.textContent = 'Repositorio';
                actions.appendChild(repo);
              }

              const badgeWrap = document.createElement('div');
              badgeWrap.className = 'badges';
              project.tags.forEach((tag) => badgeWrap.appendChild(createBadge(tag)));

              card.append(title, summary, techSummary, badgeWrap, actions);
              list.appendChild(card);
            });
          setView(getView());
        };

        if (filtersContainer) {
          const tags = ['Todos', ...allTags];
          tags.forEach((tag) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (tag === 'Todos' ? ' active' : '');
            btn.type = 'button';
            btn.textContent = tag;
            btn.addEventListener('click', () => {
              activeTag = tag;
              filtersContainer.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
              drawList();
            });
            filtersContainer.appendChild(btn);
          });
        }

        drawList();
      })
      .catch((error) => {
        console.error('No se pudieron cargar los proyectos', error);
      });
  }

  function setYear() {
    document.querySelectorAll('[data-year]').forEach((yearNode) => {
      yearNode.textContent = String(new Date().getFullYear());
    });
  }

  setupAudienceToggle();
  animateGauges();
  renderProjects();
  setYear();
})();
