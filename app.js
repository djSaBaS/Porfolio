/* Aíslo todo el script para no contaminar el scope global. */
(function () {
  /* Defino la clave de localStorage para guardar la vista seleccionada (hr/tech). */
  const VIEW_KEY = "portfolioAudienceView";

  /* Defino la vista por defecto cuando no hay preferencia guardada. */
  const DEFAULT_VIEW = "hr";

  /* Selecciono el contenedor del avatar donde quiero activar la lupa. */
  const avatarBox = document.querySelector(".js-avatar");

  /* Si no existe el contenedor, salgo sin fallar el resto del script. */
  if (!avatarBox) {
    return;
  }

  /* Selecciono la imagen base dentro del contenedor del avatar. */
  const baseImg = avatarBox.querySelector("img");

  /* Si no hay imagen base, salgo sin fallar el resto del script. */
  if (!baseImg) {
    return;
  }

  /* Defino la imagen alternativa (de mayor detalle) que se verá dentro de la lupa. */
  const altImageUrl = "assets/avatar_zoom.jpg";

  /* Creo el elemento HTML que actuará como lupa. */
  const lens = document.createElement("div");

  /* Asigno la clase CSS responsable del estilo y posicionamiento de la lupa. */
  lens.className = "avatar-lens";

  /* Establezco la imagen alternativa como fondo del círculo de lupa. */
  lens.style.backgroundImage = `url("${altImageUrl}")`;

  /* Inserto el elemento lupa dentro del contenedor para posicionarlo relativo al avatar. */
  avatarBox.appendChild(lens);

  /* Defino el tamaño del círculo (en píxeles) para cálculos de centrado. */
  const lensSize = 220;

  /* Defino el nivel de zoom (2 equivale a 200%). */
  const zoom = 2;

  /* Limito un número a un rango (reutilizable en varias partes del script). */
  function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  }

  /* Actualizo el tamaño del background para simular el zoom con la imagen alternativa. */
  const updateBackgroundSize = () => {
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
  function gaugePercent(value) {
    /* Defino un máximo virtual para que la barra no llegue al 100% visual. */
    const virtualMax = value * 1.1;

    /* Calculo el porcentaje en base al máximo virtual. */
    const percent = (value / virtualMax) * 100;

    /* Limito el porcentaje para evitar llenar completamente el gauge. */
    return clamp(percent, 0, 95);
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
          const target = gaugePercent(value);

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
  function renderProjects() {
    /* Selecciono el contenedor donde se pintan los proyectos. */
    const list = document.querySelector("[data-project-list]");

    /* Si no existe contenedor, salgo sin fallar el resto del script. */
    if (!list) return;

    /* Obtengo la URL del JSON o uso una ruta por defecto. */
    const jsonUrl = list.getAttribute("data-json-url") || "projects/data.json";

    /* Solicito el JSON con fetch. */
    fetch(jsonUrl)
      .then((res) => {
        /* Valido respuesta HTTP para evitar errores silenciosos en .json(). */
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} al cargar ${jsonUrl}`);
        }

        /* Convierto la respuesta a JSON. */
        return res.json();
      })
      .then((projects) => {
        /* Selecciono el contenedor opcional para los filtros de tags. */
        const filtersContainer = document.querySelector("[data-project-filters]");

        /* Construyo un listado único de tags a partir de los proyectos. */
        const allTags = [...new Set(projects.flatMap((project) => project.tags))];

        /* Defino el filtro activo inicial. */
        let activeTag = "Todos";

        /* Dibujo el listado de proyectos aplicando el filtro activo. */
        const drawList = () => {
          /* Limpio el contenedor para repintar sin residuos. */
          list.replaceChildren();

          /* Filtro por tag si aplica y recorro los proyectos resultantes. */
          projects
            .filter(
              (project) => activeTag === "Todos" || project.tags.includes(activeTag),
            )
            .forEach((project) => {
              /* Creo la tarjeta del proyecto. */
              const card = document.createElement("article");

              /* Aplico clase visual de tarjeta. */
              card.className = "card";

              /* Creo el título del proyecto. */
              const title = document.createElement("h3");

              /* Inserto el nombre del proyecto como texto. */
              title.textContent = project.name;

              /* Creo el resumen orientado a RRHH. */
              const summary = document.createElement("p");

              /* Marco audiencia para CSS (hr). */
              summary.setAttribute("data-audience", "hr");

              /* Inserto el resumen hr como texto. */
              summary.textContent = project.hrSummary;

              /* Creo el resumen orientado a perfil técnico. */
              const techSummary = document.createElement("p");

              /* Marco audiencia para CSS (tech). */
              techSummary.setAttribute("data-audience", "tech");

              /* Inserto las notas técnicas como texto. */
              techSummary.textContent = project.techNotes;

              /* Creo contenedor de acciones (botones/links). */
              const actions = document.createElement("div");

              /* Aplico clases para layout y estilos. */
              actions.className = "actions project-card-actions";

              /* Creo el enlace al caso. */
              const detail = document.createElement("a");

              /* Aplico clase botón. */
              detail.className = "btn";

              /* Asigno URL del proyecto. */
              detail.href = project.url;

              /* Asigno texto del botón. */
              detail.textContent = "Ver caso";

              /* Inserto el botón en acciones. */
              actions.appendChild(detail);

              /* Si hay repositorio, creo el botón adicional. */
              if (project.repo) {
                /* Creo el enlace al repositorio. */
                const repo = document.createElement("a");

                /* Aplico clase botón. */
                repo.className = "btn";

                /* Asigno URL del repo. */
                repo.href = project.repo;

                /* Abro en nueva pestaña por UX. */
                repo.target = "_blank";

                /* Evito acceso al window.opener por seguridad. */
                repo.rel = "noopener";

                /* Asigno texto del botón. */
                repo.textContent = "Repositorio";

                /* Inserto el botón en acciones. */
                actions.appendChild(repo);
              }

              /* Creo el contenedor de badges de tags. */
              const badgeWrap = document.createElement("div");

              /* Aplico clase de layout. */
              badgeWrap.className = "badges";

              /* Inserto un badge por tag. */
              project.tags.forEach((tag) => badgeWrap.appendChild(createBadge(tag)));

              /* Inserto elementos en la tarjeta en el orden deseado. */
              card.append(title, summary, techSummary, badgeWrap, actions);

              /* Inserto la tarjeta en el listado. */
              list.appendChild(card);
            });

          /* Reaplico la vista actual para que el filtro de audiencia afecte al nuevo DOM. */
          setView(getView());
        };

        /* Si existe contenedor de filtros, genero botones de filtrado por tag. */
        if (filtersContainer) {
          /* Creo el array con "Todos" y el resto de tags. */
          const tags = ["Todos", ...allTags];

          /* Creo un botón por tag. */
          tags.forEach((tag) => {
            /* Creo el botón. */
            const btn = document.createElement("button");

            /* Aplico clase y estado activo inicial. */
            btn.className = "filter-btn" + (tag === "Todos" ? " active" : "");

            /* Defino el tipo para no enviar formularios por accidente. */
            btn.type = "button";

            /* Seteo el texto visible del botón. */
            btn.textContent = tag;

            /* Cambio el filtro activo y repinto el listado al hacer click. */
            btn.addEventListener("click", () => {
              /* Actualizo el tag activo. */
              activeTag = tag;

              /* Limpio estado active del resto de botones. */
              filtersContainer
                .querySelectorAll(".filter-btn")
                .forEach((b) => b.classList.remove("active"));

              /* Marco el botón actual como activo. */
              btn.classList.add("active");

              /* Repinto listado con el nuevo filtro. */
              drawList();
            });

            /* Inserto el botón en el contenedor de filtros. */
            filtersContainer.appendChild(btn);
          });
        }

        /* Pinto la lista inicial al cargar. */
        drawList();
      })
      .catch((error) => {
        /* Logueo el error para diagnóstico sin romper la UI. */
        console.error("No se pudieron cargar los proyectos", error);
      });
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

  /* Inicializo el seteo automático del año en el footer o donde aplique. */
  setYear();
})();
