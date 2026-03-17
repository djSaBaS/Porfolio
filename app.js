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
  const altImageUrl = new URL("assets/avatar_zoom.jpg", document.baseURI).toString();

  /* Defino la clave que guarda si la experiencia final ya se desbloqueó. */
  const FINAL_UNLOCK_KEY = "portfolioFinalExperienceUnlocked";

  /* Defino el ratio de scroll para considerar que se llegó al final del recorrido. */
  const FINAL_BOTTOM_RATIO = 0.98;

  /* Defino el mínimo de desplazamiento hacia arriba para disparar el desbloqueo. */
  const FINAL_UPWARD_SCROLL_PX = 36;

  /* Guardo si el usuario ya interactuó para desbloquear la experiencia progresiva. */
  let hasMeaningfulInteraction = false;

  /* Defino los comandos estáticos de la terminal para no recrear el objeto en cada ejecución. */
  const TERMINAL_COMMANDS = {
    help: [
      "Comandos disponibles: help, whoami, skills, projects, automation, ai, clear",
    ],
    whoami: [
      "Soy Juan Antonio Sánchez Plaza, desarrollador Full Stack.",
      "Conecto negocio y tecnología para reducir tareas manuales con soluciones mantenibles.",
    ],
    skills: [
      "Stack principal: JavaScript, PHP, Python, SQL, HTML y CSS.",
      "Trabajo con automatización de procesos, APIs, WordPress y herramientas de IA aplicada.",
    ],
    projects: [
      "Proyectos destacados: automatizaciones con impacto operativo, herramientas internas y productos web reales.",
      "Puedes verlos en la sección Proyectos con enfoque RRHH o técnico.",
    ],
    automation: [
      "Mi foco: convertir flujos repetitivos en procesos simples, medibles y rápidos.",
      "Resultado habitual: menos errores, menos tiempo y más capacidad del equipo.",
    ],
    ai: [
      "Uso IA para acelerar desarrollo, documentar mejor y mejorar procesos internos.",
      "Siempre con validación humana y control de calidad.",
    ],
    clear: ["__CLEAR__"],
  };

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

    /* Sincronizo la experiencia final para respetar siempre la vista activa. */
    syncFinalExperienceView();
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

  /* Pinto la formación desde JSON con buscador + filtros de tipo/etapa/tags. */
  function renderEducation() {
    const list = document.querySelector("[data-education-list]");
    if (!list) return;

    // Detectar si estamos en subcarpeta para ajustar la ruta
    const isSubfolder = window.location.pathname.includes('/cursos/') || window.location.pathname.includes('/cv/');
    const prefix = isSubfolder ? '../' : '';
    const jsonUrl = `${prefix}assets/json/datos.json`;

    const filtersContainer = document.querySelector("[data-education-filters]");
    const searchInput      = document.querySelector("[data-education-search]");
    const typeSelect       = document.querySelector("[data-education-type]");
    const stageSelect      = document.querySelector("[data-education-stage]");
    const totalHoursNode   = document.querySelector("[data-education-hours-total]");

    fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) {
          list.innerHTML = `<p class="error">Error al cargar datos: ${response.status}</p>`;
          throw new Error(`No se pudo cargar ${jsonUrl}`);
        }
        return response.json();
      })
      .then((allData) => {
        // Filtrar solo los elementos de formación
        const courses = allData.filter(item => item.kind === 'education');

        if (!courses.length) {
          list.innerHTML = `<p class="note">No se encontraron cursos disponibles.</p>`;
          return;
        }

        let activeTag   = "";
        let searchText  = "";
        let activeType  = "all";
        let activeStage = "all";

        const allTypes  = [...new Set(courses.map(c => c.category).filter(Boolean))].sort();
        const allStages = [...new Set(courses.map(c => c.stage).filter(Boolean))].sort();
        const allTags   = [...new Set(courses.flatMap(c => c.tags || []))].sort();

        if (typeSelect) {
          typeSelect.innerHTML = `<option value="all">Todos los tipos</option>${allTypes
            .map(t => `<option value="${t}">${t}</option>`).join("")}`;
        }
        if (stageSelect) {
          stageSelect.innerHTML = `<option value="all">Todas las etapas</option>${allStages
            .map(s => `<option value="${s}">${s}</option>`).join("")}`;
        }

        const paint = () => {
          list.replaceChildren();

          const filtered = courses.filter((c) => {
            const byTag    = !activeTag   || (c.tags || []).includes(activeTag);
            const byType   = activeType   === "all" || c.category === activeType;
            const byStage  = activeStage  === "all" || c.stage === activeStage;
            const bySearch = !searchText  ||
              (c.title  || "").toLowerCase().includes(searchText) ||
              (c.entity || "").toLowerCase().includes(searchText) ||
              (c.tags   || []).join(" ").toLowerCase().includes(searchText);
            return byTag && byType && byStage && bySearch;
          });

          filtered.forEach((course) => {
            const card = document.createElement("article");
            card.className = "card glass";

            const title = document.createElement("h3");
            title.textContent = course.title;

            const meta = document.createElement("p");
            meta.className = "metric-label";
            meta.textContent = `${course.entity || ''} · ${course.dateLabel || course.yearStart || ''} · ${course.hours || 0}h · ${course.category || ''}`;

            const summary = document.createElement("p");
            summary.textContent = course.excerpt || course.summary || "Sin resumen disponible.";

            const badges = document.createElement("div");
            badges.className = "badges";
            (course.tags || []).forEach((tag) => {
              const skillBadge = document.createElement("span");
              skillBadge.className = "badge";
              skillBadge.title = tag;
              skillBadge.setAttribute("aria-label", tag);
              skillBadge.appendChild(safeText(`${getSkillIcon(tag)} ${tag}`));
              badges.appendChild(skillBadge);
            });

            card.append(title, meta, summary, badges);
            list.appendChild(card);
          });

          setView(getView());
        };

        if (totalHoursNode) {
          const totalHours = courses.reduce((sum, c) => sum + Number(c.hours || 0), 0);
          totalHoursNode.textContent = String(totalHours);
        }

        if (searchInput) {
          searchInput.addEventListener("input", () => {
            searchText = searchInput.value.trim().toLowerCase();
            paint();
          });
        }
        if (typeSelect) {
          typeSelect.addEventListener("change", () => { activeType = typeSelect.value || "all"; paint(); });
        }
        if (stageSelect) {
          stageSelect.addEventListener("change", () => { activeStage = stageSelect.value || "all"; paint(); });
        }

        if (filtersContainer) {
          filtersContainer.replaceChildren();
          allTags.forEach((tag) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "filter-btn";
            button.textContent = tag;
            button.setAttribute("aria-pressed", "false");
            button.addEventListener("click", () => {
              const isActive = activeTag === tag;
              activeTag = isActive ? "" : tag;
              filtersContainer.querySelectorAll(".filter-btn").forEach((node) => {
                const pressed = node.textContent === activeTag;
                node.classList.toggle("active", pressed);
                node.setAttribute("aria-pressed", String(pressed));
              });
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
    const normalized = String(skill || "").trim().toLowerCase();
    const map = {
      // Formación y Sectores
      mecanica: "🔧",
      sonido: "🔊",
      "gestion de obra": "🏗️",
      construccion: "🧱",
      "prevencion de riesgos": "🦺",
      fp: "🎓",
      tecnico: "🛠️",
      // Tech & IT
      python: "🐍",
      "lógica de programación": "🧠",
      "estructuras de datos": "🧮",
      "programación modular": "🧩",
      funciones: "ƒ",
      colecciones: "📚",
      "inteligencia artificial": "🤖",
      chatgpt: "💬",
      "desarrollo de software": "💻",
      programación: "⌨️",
      "modelos de lenguaje": "🗣️",
      "herramientas digitales": "🛠️",
      "productividad empresarial": "📈",
      "transformación digital": "🔄",
      git: "🌿",
      html: "🌐",
      css: "🎨",
      javascript: "🟨",
      jquery: "🧷",
      php: "🐘",
      mysql: "🛢️",
      mongodb: "🍃",
      angular: "🅰️",
      symfony: "🎼",
      "node.js": "🟢",
      react: "⚛️",
      "desarrollo web": "🕸️",
      "front-end": "🖼️",
      "back-end": "🧱",
      servidores: "🖥️",
      "tecnologías web": "🔧",
      "programación orientada a objetos": "📦",
      poo: "📦",
      "bases de datos relacionales": "🗃️",
      sql: "🗄️",
      "sistemas informáticos": "💾",
      webmaster: "🧑‍💻",
      "gestión de servidores": "🛡️",
      hosting: "☁️",
      digitalización: "🪄",
      "competencias digitales": "📱",
      datos: "📊",
      "contenidos digitales": "📰",
      pdo: "🔌",
      excepciones: "⚠️",
      autoloading: "📥",
      composer: "🎵",
      frameworks: "🏗️",
      "gestión de redes": "🕸️",
      "soporte informático": "🆘",
      "administración de sistemas": "⚙️",
      "servicios del sistema": "🧰",
      automatización: "⚙️",
      ia: "🤖",
      productividad: "🚀",
      wordpress: "🧩",
      ux: "🧠",
      analítica: "📊",
      data: "📈",
      scrum: "🔁",
      gestión: "🧭",
    };

    return map[normalized] || "•";
  }

  /* Compruebo que una URL sea segura (http/https) antes de pintarla en enlaces. */
  function sanitizeExternalUrl(url) {
    const fallback = "#";

    if (!url || typeof url !== "string") return fallback;

    try {
      const parsed = new URL(url, window.location.href);
      const protocol = parsed.protocol.toLowerCase();
      return protocol === "http:" || protocol === "https:" ? parsed.href : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  /* Pinto timeline combinado: cursos alternados y tramos de trabajo sobre el eje central. */
  function renderCourseTimeline() {
    const timeline = document.querySelector("[data-course-timeline]");

    if (!timeline) return;

    const coursesUrl =
      timeline.getAttribute("data-courses-url") || "../assets/json/formacion.json";
    const worksUrl = timeline.getAttribute("data-works-url") || "../assets/json/trabajos.json";
    const modal = document.querySelector("[data-timeline-modal]");

    Promise.all([
      fetch(coursesUrl).then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar ${coursesUrl}`);
        return response.json();
      }),
      fetch(worksUrl)
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []),
    ])
      .then(([courses, jobs]) => {
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

        const modalTitle = modal ? modal.querySelector("[data-modal-title]") : null;
        const modalMeta = modal ? modal.querySelector("[data-modal-meta]") : null;
        const modalDescription = modal
          ? modal.querySelector("[data-modal-description]")
          : null;
        const modalSkills = modal ? modal.querySelector("[data-modal-skills]") : null;
        const infoBtn = modal ? modal.querySelector("[data-modal-more-info]") : null;
        const certBtn = modal ? modal.querySelector("[data-modal-certificate]") : null;

        const openModal = (course) => {
          if (!modal || !modalTitle || !modalMeta || !modalDescription || !modalSkills) return;

          modal.hidden = false;
          modalTitle.textContent = course.title;
          modalMeta.textContent = `${course.provider} · ${course.year} · ${course.hours}h`;
          modalDescription.textContent =
            course.details || course.techSummary || course.hrSummary || "Sin detalle adicional";

          modalSkills.replaceChildren();
          (course.skills || []).forEach((skill) => {
            modalSkills.appendChild(createBadge(`${getSkillIcon(skill)} ${skill}`));
          });

          if (infoBtn) {
            infoBtn.href = sanitizeExternalUrl(course.courseUrl);
          }

          if (certBtn) {
            certBtn.href = sanitizeExternalUrl(course.certificateUrl);
            certBtn.hidden = !course.certificateUrl;
          }
        };

        const numericCourses = courses
          .filter((course) => course && course.title)
          .map((course) => ({
            ...course,
            numericYear: Number(course.year) || 0,
          }))
          .sort((a, b) => b.numericYear - a.numericYear);

        const yearRows = new Map();
        numericCourses.forEach((course, index) => {
          if (!yearRows.has(course.numericYear)) yearRows.set(course.numericYear, []);
          yearRows.get(course.numericYear).push(index + 1);
        });

        const findNearestRow = (year) => {
          if (!numericCourses.length) return 1;

          let nearestRow = 1;
          let nearestDistance = Infinity;

          numericCourses.forEach((course, index) => {
            const distance = Math.abs(course.numericYear - year);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestRow = index + 1;
            }
          });

          return nearestRow;
        };

        const validJobs = (jobs || [])
          .filter((job) => job && job.company)
          .map((job, index) => {
            const startYear = Number(job.startYear) || Number(job.year) || 0;
            const endYear = Number(job.endYear) || new Date().getFullYear();
            const allRowsInPeriod = Array.from(yearRows.entries())
              .filter(([year]) => year >= startYear && year <= endYear)
              .flatMap(([, rows]) => rows);

            const startRow = allRowsInPeriod.length
              ? Math.min(...allRowsInPeriod)
              : findNearestRow(startYear);
            const endRowBase = allRowsInPeriod.length
              ? Math.max(...allRowsInPeriod)
              : findNearestRow(endYear);

            return {
              ...job,
              startYear,
              endYear,
              rowStart: startRow,
              rowEnd: endRowBase + 1,
              color: job.color || `hsl(${(index * 67) % 360} 70% 55%)`,
            };
          })
          .sort((a, b) => a.startYear - b.startYear);

        validJobs.forEach((job) => {
          const layer = document.createElement("article");
          layer.className = "timeline-workband";
          layer.style.setProperty("--work-color", job.color);
          layer.style.setProperty("--row-start", String(job.rowStart || 1));
          layer.style.setProperty("--row-end", String(job.rowEnd || 2));

          const logo = document.createElement("img");
          logo.className = "timeline-workband__logo";
          logo.loading = "lazy";
          logo.alt = `Logo de ${job.company}`;
          logo.src = job.companyLogo || `https://placehold.co/64x64/0b1220/e9eefb?text=${encodeURIComponent((job.company || "?").slice(0, 2))}`;

          const name = document.createElement("p");
          name.className = "timeline-workband__title";
          name.textContent = job.company;

          const years = document.createElement("p");
          years.className = "timeline-workband__years";
          years.textContent = `${job.startYear || "?"} · ${job.endYear || "Actualidad"}`;

          layer.append(logo, name, years);
          timeline.appendChild(layer);
          observer.observe(layer);
        });

        numericCourses.forEach((course, index) => {
            const item = document.createElement("article");
            item.className = `timeline-item ${index % 2 === 0 ? "left" : "right"}`;
            item.style.gridRow = String(index + 1);

            const point = document.createElement("button");
            point.type = "button";
            point.className = "timeline-point";
            point.addEventListener("click", () => openModal(course));

            const title = document.createElement("h3");
            title.textContent = course.title;

            const meta = document.createElement("p");
            meta.className = "metric-label";
            meta.textContent = `${course.provider} · ${course.year} · ${course.hours}h`;

            const icons = document.createElement("div");
            icons.className = "timeline-icons";
            (course.skills || []).forEach((skill) => {
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

  /* Actualizo automáticamente el año en todos los nodos que lo requieran. */
  function setYear() {
    /* Recorro nodos marcados con data-year. */
    document.querySelectorAll("[data-year]").forEach((yearNode) => {
      /* Inserto el año actual como texto. */
      yearNode.textContent = String(new Date().getFullYear());
    });
  }

  /* Devuelvo true cuando el usuario ya desbloqueó la experiencia final. */
  function isFinalExperienceUnlocked() {
    return localStorage.getItem(FINAL_UNLOCK_KEY) === "true";
  }

  /* Persisto y pinto el estado desbloqueado de la sección final. */
  function unlockFinalExperience() {
    const lockedNode = document.querySelector("[data-final-locked]");
    const contentNode = document.querySelector("[data-final-content]");

    if (!lockedNode || !contentNode) return;

    localStorage.setItem(FINAL_UNLOCK_KEY, "true");
    lockedNode.hidden = true;
    contentNode.hidden = false;
  }

  /* Borro el desbloqueo guardado para reiniciar la sorpresa cuando corresponda. */
  function resetFinalExperienceUnlock() {
    localStorage.removeItem(FINAL_UNLOCK_KEY);
    paintFinalExperienceState();
  }

  /* Sincronizo la visibilidad de la experiencia final según el estado persistido. */
  function paintFinalExperienceState() {
    const lockedNode = document.querySelector("[data-final-locked]");
    const contentNode = document.querySelector("[data-final-content]");

    if (!lockedNode || !contentNode) return;

    const unlocked = isFinalExperienceUnlocked();
    lockedNode.hidden = unlocked;
    contentNode.hidden = !unlocked;
  }

  /* Sincronizo la vista activa en el bloque final y su terminal. */
  function syncFinalExperienceView() {
    const output = document.querySelector("[data-terminal-output]");
    if (!output || output.childElementCount) return;

    printTerminalLines([
      "Terminal de demostración lista.",
      "Escribe help para ver todos los comandos.",
    ]);
  }

  /* Pinto líneas dentro de la terminal simulada de forma segura. */
  function printTerminalLines(lines) {
    const output = document.querySelector("[data-terminal-output]");
    if (!output) return;

    lines.forEach((line) => {
      const row = document.createElement("p");
      row.textContent = line;
      output.appendChild(row);
    });

    output.scrollTop = output.scrollHeight;
  }

  /* Devuelvo la respuesta de la terminal en base al comando introducido. */
  function resolveTerminalCommand(rawCommand) {
    const command = String(rawCommand || "").trim().toLowerCase();

    if (!command) {
      return ["Escribe un comando. Prueba con help."];
    }

    return TERMINAL_COMMANDS[command] || ["Comando no reconocido. Usa help para ver las opciones."];
  }

  /* Configuro la lógica de interacción final (desbloqueo, simulación y terminal). */
  function setupFinalExperience() {
    const finalSection = document.querySelector("[data-final-experience]");
    if (!finalSection) return;

    const runSimulationBtn = document.querySelector("[data-run-simulation]");
    const simulationResult = document.querySelector("[data-hr-result]");
    const terminalForm = document.querySelector("[data-terminal-form]");
    const terminalInput = document.getElementById("terminal-input");
    const terminalOutput = document.querySelector("[data-terminal-output]");


    /* Marco la primera interacción significativa y revalúo desbloqueo al instante. */
    const registerInteraction = () => {
      hasMeaningfulInteraction = true;
      evaluateUnlock();
    };

    /* Guardo el máximo ratio alcanzado para saber si el usuario ya tocó fondo. */
    let maxScrollRatioReached = 0;

    /* Guardo la posición previa para detectar si el usuario sube. */
    let lastScrollY = window.scrollY;

    /* Evito mostrar la alerta de desbloqueo más de una vez por sesión activa. */
    let hasShownUnlockPrompt = false;

    /* Muestro aviso visual con CTA para llevar al usuario a la sección desbloqueada. */
    const showUnlockPrompt = () => {
      if (hasShownUnlockPrompt) return;
      hasShownUnlockPrompt = true;

      const toast = document.createElement("aside");
      toast.className = "unlock-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");

      const message = document.createElement("p");
      message.textContent = "Has desbloqueado algo especial. ¿Quieres verlo?";

      const actions = document.createElement("div");
      actions.className = "actions";

      const cta = document.createElement("button");
      cta.type = "button";
      cta.className = "btn";
      cta.textContent = "Sí, llevarme";
      cta.addEventListener("click", () => {
        finalSection.scrollIntoView({ behavior: "smooth", block: "start" });
        toast.remove();
      });

      const close = document.createElement("button");
      close.type = "button";
      close.className = "btn";
      close.textContent = "Más tarde";
      close.addEventListener("click", () => toast.remove());

      actions.append(cta, close);
      toast.append(message, actions);
      document.body.appendChild(toast);
    };

    /* Pinto confeti ligero sin dependencias externas para celebrar el desbloqueo RRHH. */
    const runConfetti = () => {
      const confettiRoot = document.createElement("div");
      confettiRoot.className = "confetti-root";

      for (let i = 0; i < 28; i += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.background =
          i % 3 === 0 ? "#6ee7ff" : i % 3 === 1 ? "#8b5cf6" : "#34d399";
        confettiRoot.appendChild(piece);
      }

      finalSection.appendChild(confettiRoot);
      window.setTimeout(() => confettiRoot.remove(), 2400);
    };

    /* Evalúo criterios: interacción + tocar fondo + subir en RRHH. */
    const evaluateUnlock = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const currentY = window.scrollY;
      const ratio = currentY / scrollable;

      maxScrollRatioReached = Math.max(maxScrollRatioReached, ratio);

      const scrolledUpEnough = lastScrollY - currentY >= FINAL_UPWARD_SCROLL_PX;
      const reachedBottomBefore = maxScrollRatioReached >= FINAL_BOTTOM_RATIO;
      const isHrViewActive = getView() === "hr";

      if (!isFinalExperienceUnlocked() && hasMeaningfulInteraction && reachedBottomBefore && scrolledUpEnough && isHrViewActive) {
        unlockFinalExperience();
        runConfetti();
        showUnlockPrompt();
      }

      lastScrollY = currentY;
    };

    ["click", "keydown", "pointerover"].forEach((eventName) => {
      document.addEventListener(eventName, registerInteraction, { once: true, passive: true });
    });

    /* Escucho scroll para evaluar el desbloqueo en cada cambio de posición. */
    window.addEventListener("scroll", evaluateUnlock, { passive: true });

    /* Reevalúo al cambiar manualmente RRHH/TECH para respetar prioridad de vista activa. */
    document.querySelectorAll("[data-toggle-view]").forEach((button) => {
      button.addEventListener("click", () => {
        window.setTimeout(evaluateUnlock, 0);
      });
    });

    if (isFinalExperienceUnlocked()) {
      unlockFinalExperience();
      syncFinalExperienceView();
    }

    paintFinalExperienceState();

    /* Reviso estado al cargar por si se entra ya con scroll avanzado. */
    evaluateUnlock();

    /* Al cerrar pestaña o ventana, reseteo el desbloqueo para futura visita. */
    window.addEventListener("beforeunload", resetFinalExperienceUnlock);

    /* Al salir con el ratón del DOM, también reseteo la sorpresa como se solicitó. */
    document.addEventListener("mouseleave", (event) => {
      if (event.relatedTarget === null) {
        resetFinalExperienceUnlock();
        hasShownUnlockPrompt = false;
      }
    });

    if (runSimulationBtn && simulationResult) {
      runSimulationBtn.addEventListener("click", () => {
        const SIMULATION_MANUAL_STEP_DELAY = 700;
        const SIMULATION_AUTO_STEP_DELAY = 250;
        const SIMULATION_RESULT_DELAY = 3200;
        const manualSteps = finalSection.querySelectorAll('[data-lane="manual"] [data-step]');
        const autoSteps = finalSection.querySelectorAll('[data-lane="auto"] [data-step]');

        manualSteps.forEach((step, index) => {
          window.setTimeout(
            () => step.classList.add("is-done"),
            SIMULATION_MANUAL_STEP_DELAY * (index + 1),
          );
        });

        autoSteps.forEach((step, index) => {
          window.setTimeout(
            () => step.classList.add("is-done"),
            SIMULATION_AUTO_STEP_DELAY * (index + 1),
          );
        });

        window.setTimeout(() => {
          simulationResult.textContent =
            "Resultado: la automatización convierte un proceso pesado en una ejecución clara, rápida y fiable.";
        }, SIMULATION_RESULT_DELAY);
      });
    }

    document.querySelectorAll("[data-switch-final]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetView = button.getAttribute("data-switch-final");
        setView(targetView);
      });
    });

    if (terminalForm && terminalInput && terminalOutput) {
      terminalForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const typed = terminalInput.value;
        printTerminalLines([`> ${typed}`]);
        const lines = resolveTerminalCommand(typed);

        if (lines.length === 1 && lines[0] === "__CLEAR__") {
          terminalOutput.replaceChildren();
        } else {
          printTerminalLines(lines);
        }

        terminalInput.value = "";
      });
    }
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

  /* Inicializo el desbloqueo progresivo y la experiencia final. */
  setupFinalExperience();


  /* Inicializo el seteo automático del año en el footer o donde aplique. */
  setYear();
})();
