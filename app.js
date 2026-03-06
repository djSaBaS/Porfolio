/* Aíslo todo el script para no contaminar el scope global. */
(function () {
  /* Defino la clave de localStorage para guardar la vista seleccionada (hr/tech). */
  const VIEW_KEY = "portfolioAudienceView";

  /* Defino la vista por defecto cuando no hay preferencia guardada. */
  const DEFAULT_VIEW = "hr";

  /* Usuario de GitHub para recuperar proyectos de forma automática. */
  const GITHUB_USER = "djSaBaS";

  /* Selecciono el contenedor del avatar donde quiero activar la lupa. */
  const avatarBox = document.querySelector(".js-avatar");

  /* Selecciono la imagen base dentro del contenedor del avatar (si existe). */
  const baseImg = avatarBox ? avatarBox.querySelector("img") : null;

  /* Defino la imagen alternativa (de mayor detalle) que se verá dentro de la lupa. */
  const altImageUrl = "assets/avatar_zoom.jpg";

  /* Creo el elemento HTML que actuará como lupa solo cuando hay avatar. */
  const lens = avatarBox && baseImg ? document.createElement("div") : null;

  /* Defino el tamaño del círculo (en píxeles) para cálculos de centrado. */
  const lensSize = 220;

  /* Defino el nivel de zoom (2 equivale a 200%). */
  const zoom = 1;

  if (lens && avatarBox) {
    /* Asigno la clase CSS responsable del estilo y posicionamiento de la lupa. */
    lens.className = "avatar-lens";

    /* Establezco la imagen alternativa como fondo del círculo de lupa. */
    lens.style.backgroundImage = `url("${altImageUrl}")`;

    /* Inserto el elemento lupa dentro del contenedor para posicionarlo relativo al avatar. */
    avatarBox.appendChild(lens);
  }

  /* Limito un número a un rango (reutilizable en varias partes del script). */
  function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  }

  /* Actualizo el tamaño del background para simular el zoom con la imagen alternativa. */
  const updateBackgroundSize = () => {
    if (!baseImg || !lens) return;

    /* Obtengo el tamaño renderizado actual de la imagen base (responsive-friendly). */
    const rect = baseImg.getBoundingClientRect();

    /* Calculo el ancho del fondo escalado aplicando el factor de zoom. */
    const bgW = rect.width * zoom;

    /* Calculo el alto del fondo escalado aplicando el factor de zoom. */
    const bgH = rect.height * zoom;

    /* Aplico el tamaño del fondo para que se note la ampliación dentro del círculo. */
    lens.style.backgroundSize = `${bgW}px ${bgH}px`;
  };

  /* Posiciono la lupa y sincronizo el punto ampliado con la posición del ratón. */
  const moveLens = (event) => {
    if (!baseImg || !lens) return;

    /* Obtengo el rectángulo actual de la imagen base para calcular coordenadas relativas. */
    const rect = baseImg.getBoundingClientRect();

    /* Calculo la coordenada X del ratón relativa al borde izquierdo de la imagen. */
    const x = event.clientX - rect.left;

    /* Calculo la coordenada Y del ratón relativa al borde superior de la imagen. */
    const y = event.clientY - rect.top;

    /* Limito X para que nunca quede fuera del área visible de la imagen. */
    const clampedX = clamp(x, 0, rect.width);

    /* Limito Y para que nunca quede fuera del área visible de la imagen. */
    const clampedY = clamp(y, 0, rect.height);

    /* Posiciono la lupa centrada en el cursor (CSS translate(-50%, -50%)). */
    lens.style.left = `${clampedX}px`;

    /* Posiciono la lupa centrada en el cursor (CSS translate(-50%, -50%)). */
    lens.style.top = `${clampedY}px`;

    /* Calculo el desplazamiento del fondo para alinear el detalle con el punto del cursor. */
    const bgX = -(clampedX * zoom - lensSize / 2);

    /* Calculo el desplazamiento del fondo para alinear el detalle con el punto del cursor. */
    const bgY = -(clampedY * zoom - lensSize / 2);

    /* Aplico la posición del fondo para que la lupa muestre el área correcta. */
    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
  };

  if (avatarBox && lens) {
    /* Al entrar el ratón en el avatar, preparo y muestro la lupa. */
    avatarBox.addEventListener("mouseenter", () => {
      /* Recalculo tamaños por si el avatar cambió por responsive o por fuentes/cargas. */
      updateBackgroundSize();

      /* Marco la lupa como visible (controlado por CSS). */
      lens.classList.add("is-visible");
    });

    /* Al mover el ratón por el avatar, actualizo posición y contenido de la lupa. */
    avatarBox.addEventListener("mousemove", (event) => {
      moveLens(event);
    });

    /* Al salir el ratón del avatar, oculto la lupa. */
    avatarBox.addEventListener("mouseleave", () => {
      lens.classList.remove("is-visible");
    });

    /* En redimensionado de ventana, recalculo el tamaño del fondo para mantener zoom correcto. */
    window.addEventListener("resize", () => {
      updateBackgroundSize();
    });
  }

  /* Leo la vista guardada y devuelvo un valor válido (hr o tech). */
  function getView() {
    /* Recupero el valor desde localStorage. */
    const stored = localStorage.getItem(VIEW_KEY);

    /* Devuelvo "tech" solo si coincide exactamente; si no, uso el default. */
    return stored === "tech" ? "tech" : DEFAULT_VIEW;
  }

  /* Aplico la vista actual al DOM y sincronizo accesibilidad en los botones. */
  function setView(view) {
    /* Normalizo el valor para evitar estados inconsistentes. */
    const normalized = view === "tech" ? "tech" : "hr";

    /* Escribo el estado en el body para que CSS pueda mostrar/ocultar por audiencia. */
    document.body.setAttribute("data-view", normalized);

    /* Persisto la preferencia del usuario. */
    localStorage.setItem(VIEW_KEY, normalized);

    /* Recorro botones de toggle para marcar aria-pressed correctamente. */
    document.querySelectorAll("[data-toggle-view]").forEach((button) => {
      /* Compruebo si este botón representa la vista activa. */
      const pressed = button.getAttribute("data-toggle-view") === normalized;

      /* Seteo aria-pressed como string para accesibilidad. */
      button.setAttribute("aria-pressed", String(pressed));
    });
  }

  /* Preparo el cambio de vista por botones y aplico la vista inicial. */
  function setupAudienceToggle() {
    /* Asigno listener a cada botón de cambio de vista. */
    document.querySelectorAll("[data-toggle-view]").forEach((button) => {
      /* Cambio la vista al hacer click leyendo el valor desde el atributo. */
      button.addEventListener("click", () =>
        setView(button.getAttribute("data-toggle-view")),
      );
    });

    /* Aplico la vista guardada (o default) en el primer render. */
    setView(getView());
  }

  /* Convierto un valor real en un porcentaje de gauge con margen visual. */
  function gaugePercent(element, value) {
    /* Si existe objetivo manual, lo uso para controlar el giro real del gauge. */
    const manualTarget = Number(element.getAttribute("data-target") || "0");

    /* Permito definir un máximo explícito para calcular porcentaje de forma exacta. */
    const max = Number(element.getAttribute("data-max") || "0");

    /* Si hay data-target válida, priorizo ese valor. */
    if (manualTarget > 0) {
      return clamp(manualTarget, 0, 100);
    }

    /* Si hay max explícito, calculo porcentaje real contra ese máximo. */
    if (max > 0) {
      return clamp((value / max) * 100, 0, 100);
    }

    /* Fallback visual si faltan datos de configuración. */
    return 75;
  }

  /* Animo los gauges cuando entran en el viewport (mejor rendimiento). */
  function animateGauges() {
    /* Obtengo todos los gauges que tengan data-value. */
    const gauges = document.querySelectorAll(".gauge[data-value]");

    /* Si no hay gauges, salgo sin hacer nada. */
    if (!gauges.length) return;

    /* Creo un IntersectionObserver para disparar la animación al ser visible. */
    const observer = new IntersectionObserver(
      (entries) => {
        /* Recorro las entradas observadas. */
        entries.forEach((entry) => {
          /* Si no está visible lo suficiente, no hago nada. */
          if (!entry.isIntersecting) return;

          /* Referencio el elemento gauge. */
          const el = entry.target;

          /* Leo el valor numérico del data-value de forma segura. */
          const value = Number(el.getAttribute("data-value") || "0");

          /* Calculo el objetivo de porcentaje para este gauge. */
          const target = gaugePercent(el, value);

          /* Inicio el contador desde 0 para la animación. */
          let current = 0;

          /* Defino el paso de animación usando requestAnimationFrame. */
          const step = () => {
            /* Incremento el progreso de forma suave. */
            current += 2;

            /* Actualizo la variable CSS consumida por el componente visual del gauge. */
            el.style.setProperty("--percent", String(Math.min(current, target)));

            /* Continúo animando hasta llegar al objetivo. */
            if (current < target) requestAnimationFrame(step);
          };

          /* Disparo la animación. */
          requestAnimationFrame(step);

          /* Dejo de observar el gauge para no repetir animaciones. */
          observer.unobserve(el);
        });
      },
      /* Umbral para disparar cuando al menos el 40% sea visible. */
      { threshold: 0.4 },
    );

    /* Registro todos los gauges en el observer. */
    gauges.forEach((gauge) => observer.observe(gauge));
  }

  /* Normalizo nombres de tecnologías para convertirlos en etiquetas de filtrado. */
  function mapTopicsToTags(topics = []) {
    return topics.map((topic) =>
      topic
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    );
  }

  /* Obtengo metadata local de proyectos para enriquecer la data de GitHub. */
  async function fetchProjectCatalog(catalogUrl) {
    const response = await fetch(catalogUrl);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${catalogUrl} (${response.status})`);
    }

    return response.json();
  }

  /* Recupero repositorios públicos del perfil para evitar mantenimiento manual. */
  async function fetchGithubProjects() {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
    );

    if (!response.ok) {
      throw new Error(`GitHub API devolvió ${response.status}`);
    }

    return response.json();
  }

  /* Mezclo datos de GitHub con metadata local orientada al portfolio. */
  function buildProjectCards(repos, catalog) {
    const metadata = catalog?.repos || {};

    const fromGithub = repos
      .filter((repo) => !repo.fork)
      .map((repo) => {
        const local = metadata[repo.name] || {};
        const tags = local.tags?.length ? local.tags : mapTopicsToTags(repo.topics);

        return {
          name: local.name || repo.name,
          url: local.url || repo.homepage || repo.html_url,
          repo: repo.html_url,
          hrSummary:
            local.hrSummary ||
            "Proyecto real publicado y mantenido con foco en utilidad para negocio.",
          techNotes:
            local.techNotes ||
            repo.description ||
            "Repositorio técnico con evolución iterativa y buenas prácticas.",
          tags: tags.length ? tags : ["Proyecto"],
          featured: Boolean(local.featured),
          updatedAt: repo.updated_at,
        };
      });

    const fromCatalogOnly = Object.entries(metadata)
      .filter(([repoName]) => !repos.some((repo) => repo.name === repoName))
      .map(([repoName, local], index) => ({
        name: local.name || repoName,
        url: local.url || "#",
        repo: local.repo || "",
        hrSummary:
          local.hrSummary ||
          "Caso real orientado a resolver una necesidad operativa o de negocio.",
        techNotes:
          local.techNotes || "Implementación técnica mantenible y documentada.",
        tags: local.tags?.length ? local.tags : ["Proyecto"],
        featured: Boolean(local.featured),
        updatedAt: local.updatedAt || new Date(Date.now() - index * 1000).toISOString(),
      }));

    const templates = (catalog?.templates || []).map((template, index) => ({
      name: template.name || `Proyecto ejemplo ${index + 1}`,
      url: template.url || "#",
      repo: template.repo || "",
      hrSummary:
        template.hrSummary ||
        "Plantilla de proyecto pensada para mostrar estructura, entregables y valor de negocio.",
      techNotes:
        template.techNotes ||
        "Base técnica de ejemplo para visualizar arquitectura, stack y próximos pasos.",
      tags: template.tags?.length ? template.tags : ["Plantilla"],
      featured: Boolean(template.featured),
      updatedAt: template.updatedAt || new Date().toISOString(),
    }));

    return [...templates, ...fromCatalogOnly, ...fromGithub].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }

  /* Pinto un conjunto de tarjetas reutilizable para home y página de proyectos. */
  function drawProjectList(list, projects) {
    list.replaceChildren();

    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "card";

      const title = document.createElement("h3");
      title.textContent = project.name;

      const summary = document.createElement("p");
      summary.setAttribute("data-audience", "hr");
      summary.textContent = project.hrSummary;

      const techSummary = document.createElement("p");
      techSummary.setAttribute("data-audience", "tech");
      techSummary.textContent = project.techNotes;

      const actions = document.createElement("div");
      actions.className = "actions project-card-actions";

      const detail = document.createElement("a");
      detail.className = "btn";
      detail.href = project.url;
      detail.textContent = "Ver caso";
      actions.appendChild(detail);

      if (project.repo) {
        const repo = document.createElement("a");
        repo.className = "btn";
        repo.href = project.repo;
        repo.target = "_blank";
        repo.rel = "noopener";
        repo.textContent = "Repositorio";
        actions.appendChild(repo);
      }

      const badgeWrap = document.createElement("div");
      badgeWrap.className = "badges";
      project.tags.forEach((tag) => badgeWrap.appendChild(createBadge(tag)));

      card.append(title, summary, techSummary, badgeWrap, actions);
      list.appendChild(card);
    });

    setView(getView());
  }

  /* Creo un nodo de texto seguro (evita inyectar HTML). */
  function safeText(text) {
    return document.createTextNode(text);
  }

  /* Creo un badge de tag de forma segura y consistente. */
  function createBadge(tag) {
    /* Creo el contenedor del badge. */
    const span = document.createElement("span");

    /* Aplico clase CSS del badge. */
    span.className = "badge";

    /* Inserto texto seguro dentro del badge. */
    span.appendChild(safeText(tag));

    /* Devuelvo el badge listo para render. */
    return span;
  }

  /* Renderizo las tarjetas de proyectos leyendo datos desde JSON remoto/local. */
  async function renderProjects() {
    const list = document.querySelector("[data-project-list]");
    const featuredList = document.querySelector("[data-featured-project-list]");

    if (!list && !featuredList) return;

    try {
      const catalogUrl =
        (list && list.getAttribute("data-catalog-url")) ||
        (featuredList && featuredList.getAttribute("data-catalog-url")) ||
        "projects/catalog.json";

      const catalog = await fetchProjectCatalog(catalogUrl);
      let repos = [];

      try {
        repos = await fetchGithubProjects();
      } catch (githubError) {
        console.warn("GitHub no disponible, se usará catálogo local", githubError);
      }

      const projects = buildProjectCards(repos, catalog);

      if (list) {
        const filtersContainer = document.querySelector("[data-project-filters]");
        const allTags = [...new Set(projects.flatMap((project) => project.tags))];
        let activeTag = "Todos";

        const paint = () => {
          const filtered = projects.filter(
            (project) => activeTag === "Todos" || project.tags.includes(activeTag),
          );
          drawProjectList(list, filtered);
        };

        if (filtersContainer) {
          ["Todos", ...allTags].forEach((tag) => {
            const btn = document.createElement("button");
            btn.className = "filter-btn" + (tag === "Todos" ? " active" : "");
            btn.type = "button";
            btn.textContent = tag;
            btn.addEventListener("click", () => {
              activeTag = tag;
              filtersContainer
                .querySelectorAll(".filter-btn")
                .forEach((item) => item.classList.remove("active"));
              btn.classList.add("active");
              paint();
            });
            filtersContainer.appendChild(btn);
          });
        }

        paint();
      }

      if (featuredList) {
        const featuredBase = projects.filter((project) => project.featured);
        const pickFrom = featuredBase.length ? featuredBase : projects;
        const count = Number(featuredList.getAttribute("data-count") || catalog.featuredCount || 4);
        const shuffled = [...pickFrom].sort(() => Math.random() - 0.5);
        drawProjectList(featuredList, shuffled.slice(0, clamp(count, 3, 4)));
      }
    } catch (error) {
      console.error("No se pudieron cargar los proyectos", error);
    }
  }

  /* Pinto la formación desde JSON con filtro por skills. */
  function renderEducation() {
    const list = document.querySelector("[data-education-list]");

    if (!list) return;

    const jsonUrl = list.getAttribute("data-json-url") || "../assets/json/formacion.json";
    const filtersContainer = document.querySelector("[data-education-filters]");
    const searchInput = document.querySelector("[data-education-search]");
    const totalHoursNode = document.querySelector("[data-education-hours-total]");

    fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar ${jsonUrl}`);
        }

        return response.json();
      })
      .then((courses) => {
        let activeSkill = "Todas";
        let searchText = "";
        const allSkills = [...new Set(courses.flatMap((course) => course.skills || []))];

        const paint = () => {
          list.replaceChildren();

          const filtered = courses.filter((course) => {
            const bySkill = activeSkill === "Todas" || course.skills.includes(activeSkill);
            const bySearch =
              !searchText ||
              course.title.toLowerCase().includes(searchText) ||
              course.provider.toLowerCase().includes(searchText) ||
              (course.skills || []).join(" ").toLowerCase().includes(searchText);
            return bySkill && bySearch;
          });

          filtered.forEach((course) => {
            const card = document.createElement("article");
            card.className = "card";

            const title = document.createElement("h3");
            title.textContent = course.title;

            const meta = document.createElement("p");
            meta.className = "metric-label";
            meta.textContent = `${course.provider} · ${course.year} · ${course.hours}h`;

            const hrText = document.createElement("p");
            hrText.setAttribute("data-audience", "hr");
            hrText.textContent = course.hrSummary;

            const techText = document.createElement("p");
            techText.setAttribute("data-audience", "tech");
            techText.textContent = course.techSummary;

            const badges = document.createElement("div");
            badges.className = "badges";
            (course.skills || []).forEach((skill) => badges.appendChild(createBadge(skill)));

            card.append(title, meta, hrText, techText, badges);
            list.appendChild(card);
          });

          setView(getView());
        };

        if (totalHoursNode) {
          const totalHours = courses.reduce((sum, course) => sum + Number(course.hours || 0), 0);
          totalHoursNode.textContent = String(totalHours);
        }

        if (searchInput) {
          searchInput.addEventListener("input", () => {
            searchText = searchInput.value.trim().toLowerCase();
            paint();
          });
        }

        if (filtersContainer) {
          ["Todas", ...allSkills].forEach((skill) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "filter-btn" + (skill === "Todas" ? " active" : "");
            button.textContent = skill;
            button.addEventListener("click", () => {
              activeSkill = skill;
              filtersContainer
                .querySelectorAll(".filter-btn")
                .forEach((node) => node.classList.remove("active"));
              button.classList.add("active");
              paint();
            });
            filtersContainer.appendChild(button);
          });
        }

        paint();
      })
      .catch((error) => console.error("No se pudo cargar la formación", error));
  }


  /* Devuelvo un icono simple para cada skill del timeline. */
  function getSkillIcon(skill) {
    const map = {
      Python: "🐍",
      Automatización: "⚙️",
      "Data Processing": "🧮",
      IA: "🤖",
      "Prompt Engineering": "💬",
      Productividad: "🚀",
      PHP: "🐘",
      JavaScript: "🟨",
      MySQL: "🛢️",
      HTML: "🌐",
      CSS: "🎨",
      WordPress: "🧩",
      UX: "🧠",
      SQL: "🗃️",
      Analítica: "📊",
      Data: "📈",
      Scrum: "🔁",
      Gestión: "🧭",
    };

    return map[skill] || "•";
  }

  /* Pinto timeline de cursos con alternancia izquierda/derecha y modal de detalle. */
  function renderCourseTimeline() {
    const timeline = document.querySelector("[data-course-timeline]");

    if (!timeline) return;

    const jsonUrl = timeline.getAttribute("data-json-url") || "../assets/json/formacion.json";
    const modal = document.querySelector("[data-timeline-modal]");

    fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar ${jsonUrl}`);
        return response.json();
      })
      .then((courses) => {
        timeline.replaceChildren();

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.25 },
        );

        const openModal = (course) => {
          if (!modal) return;

          modal.hidden = false;
          modal.querySelector("[data-modal-title]").textContent = course.title;
          modal.querySelector("[data-modal-meta]").textContent = `${course.provider} · ${course.year} · ${course.hours}h`;
          modal.querySelector("[data-modal-description]").textContent =
            course.details || course.techSummary || course.hrSummary || "Sin detalle adicional";

          const skills = modal.querySelector("[data-modal-skills]");
          skills.replaceChildren();
          (course.skills || []).forEach((skill) => {
            skills.appendChild(createBadge(`${getSkillIcon(skill)} ${skill}`));
          });

          const infoBtn = modal.querySelector("[data-modal-more-info]");
          infoBtn.href = course.courseUrl || "#";

          const certBtn = modal.querySelector("[data-modal-certificate]");
          certBtn.href = course.certificateUrl || "#";
          certBtn.style.display = course.certificateUrl ? "inline-flex" : "none";
        };

        courses.forEach((course, index) => {
          const item = document.createElement("article");
          item.className = `timeline-item ${index % 2 === 0 ? "left" : "right"}`;

          const point = document.createElement("button");
          point.type = "button";
          point.className = "timeline-point";
          point.addEventListener("click", () => openModal(course));

          const title = document.createElement("h3");
          title.textContent = course.title;

          const meta = document.createElement("p");
          meta.className = "metric-label";
          meta.textContent = `${course.year}`;

          const icons = document.createElement("div");
          icons.className = "timeline-icons";
          (course.skills || []).slice(0, 5).forEach((skill) => {
            const icon = document.createElement("span");
            icon.className = "timeline-icon";
            icon.title = skill;
            icon.textContent = getSkillIcon(skill);
            icons.appendChild(icon);
          });

          point.append(title, meta, icons);
          item.appendChild(point);
          timeline.appendChild(item);
          observer.observe(item);
        });

        if (modal) {
          modal.querySelectorAll("[data-close-timeline-modal]").forEach((node) => {
            node.addEventListener("click", () => {
              modal.hidden = true;
            });
          });
        }
      })
      .catch((error) => console.error("No se pudo cargar la línea de tiempo", error));
  }

  /* Pinto un timeline de trabajos preparado para el siguiente paso de contenido real. */
  function renderWorkTimeline() {
    const timeline = document.querySelector("[data-work-timeline]");

    if (!timeline) return;

    const jsonUrl = timeline.getAttribute("data-json-url") || "../assets/json/trabajos.json";

    fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar ${jsonUrl}`);
        return response.json();
      })
      .then((jobs) => {
        timeline.replaceChildren();

        const validJobs = jobs.filter((job) => job.company || job.role);

        if (!validJobs.length) {
          const empty = document.createElement("p");
          empty.className = "metric-label";
          empty.textContent = "Pendiente de completar con tu vida laboral.";
          timeline.appendChild(empty);
          return;
        }

        validJobs.forEach((job, index) => {
          const item = document.createElement("article");
          item.className = `timeline-item ${index % 2 === 0 ? "left" : "right"}`;

          const body = document.createElement("div");
          body.className = "timeline-point timeline-point--work";

          const title = document.createElement("h3");
          title.textContent = `${job.role} · ${job.company}`;

          const meta = document.createElement("p");
          meta.className = "metric-label";
          meta.textContent = `${job.startYear || "?"} - ${job.endYear || "Actualidad"}`;

          body.append(title, meta);
          item.appendChild(body);
          timeline.appendChild(item);
        });
      })
      .catch((error) => console.error("No se pudo cargar el timeline de trabajos", error));
  }

  /* Actualizo automáticamente el año en todos los nodos que lo requieran. */
  function setYear() {
    /* Recorro nodos marcados con data-year. */
    document.querySelectorAll("[data-year]").forEach((yearNode) => {
      /* Inserto el año actual como texto. */
      yearNode.textContent = String(new Date().getFullYear());
    });
  }

  /* Inicializo el toggle de audiencia (hr/tech). */
  setupAudienceToggle();

  /* Inicializo la animación de gauges bajo demanda (cuando se ven). */
  animateGauges();

  /* Inicializo el render dinámico de proyectos desde JSON. */
  renderProjects();

  /* Inicializo el render dinámico de formación con filtros por skills. */
  renderEducation();

  /* Inicializo la línea de tiempo de cursos con interacción. */
  renderCourseTimeline();

  /* Inicializo la línea de tiempo de trabajos (estructura preparada). */
  renderWorkTimeline();

  /* Inicializo el seteo automático del año en el footer o donde aplique. */
  setYear();
})();
