// Se encapsula toda la interacción para evitar variables globales accidentales.
(() => {
  // Se obtiene la raíz para activar mejoras progresivas una vez registradas.
  const root = document.documentElement;
  // Se centraliza la lectura de preferencias con recuperación ante almacenamiento bloqueado.
  function readPreference(key) {
    // Se evita que una restricción de privacidad impida consultar el currículum.
    try {
      // Se lee únicamente la preferencia solicitada del navegador local.
      return localStorage.getItem(key);
    // Se interpreta la indisponibilidad del almacenamiento como ausencia de preferencia.
    } catch {
      // Se conserva el funcionamiento sin persistencia cuando el navegador la impide.
      return null;
    // Se finaliza el control de disponibilidad del almacenamiento.
    }
  // Se cierra la función de lectura de preferencias.
  }
  // Se guardan exclusivamente preferencias visuales sin datos personales del visitante.
  function savePreference(key, value) {
    // Se aísla la escritura para que nunca bloquee la navegación.
    try {
      // Se registra la preferencia explícita de tema o audiencia.
      localStorage.setItem(key, value);
      // Se comunica el éxito a posibles extensiones locales del comportamiento.
      return true;
    // Se admite el uso completo del sitio sin almacenamiento persistente.
    } catch {
      // Se devuelve un estado explícito en vez de asumir que la preferencia se guardó.
      return false;
    // Se finaliza el manejo de almacenamiento bloqueado.
    }
  // Se cierra la escritura de preferencias locales.
  }
  // Se consultan los parámetros como datos no confiables, nunca como código.
  const query = new URLSearchParams(location.search);
  // Se recupera la preferencia de audiencia cuando el enlace no elige una de forma explícita.
  const preferredMode = readPreference('sabas-view');
  // Se conserva el modo técnico recordado sin impedir los enlaces expresos de RR. HH.
  if (root.dataset.mode === 'hr' && preferredMode === 'tech' && !query.has('view')) {
    // Se construye un destino local fijo sin redirecciones controladas por el visitante.
    location.replace(`/tech/${location.search}${location.hash}`);
    // Se evita inicializar controles en una página que está cambiando de vista.
    return;
  // Se finaliza la selección inicial de audiencia.
  }
  // Se persiste la audiencia que realmente está mostrando esta ruta.
  savePreference('sabas-view', root.dataset.mode);
  // Se localiza el botón de tema que siempre está presente en las páginas interactivas.
  const themeToggle = document.getElementById('theme-toggle');
  // Se aplica una preferencia validada mediante una lista cerrada de temas.
  function applyTheme(theme) {
    // Se restringe el tema a dos valores conocidos.
    root.dataset.theme = theme === 'light' ? 'light' : 'dark';
    // Se expresa la acción del control con una etiqueta comprensible.
    themeToggle.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro');
  // Se finaliza el cambio de tema.
  }
  // Se recupera el tema sin utilizarlo como HTML o selector dinámico.
  applyTheme(readPreference('sabas-theme'));
  // Se registra una sola interacción de cambio visual.
  themeToggle.addEventListener('click', () => {
    // Se alterna el valor entre los dos temas permitidos.
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    // Se recuerda la elección cuando el navegador lo permite.
    savePreference('sabas-theme', root.dataset.theme);
  // Se cierra el manejador de tema.
  });
  // Se reúnen los elementos cronológicos ya presentes en el HTML indexable.
  const rows = [...document.querySelectorAll('.timeline-row')];
  // Se indexan los identificadores conocidos para validar enlaces profundos y selecciones.
  const rowIndex = new Map(rows.map(row => [row.dataset.event, row]));
  // Se localizan los controles de filtrado de la trayectoria.
  const filters = document.getElementById('trajectory-filters');
  // Se obtiene el filtro de sector como control tipado por opciones HTML.
  const branchFilter = document.getElementById('branch-filter');
  // Se obtiene el intervalo temporal solicitado por el visitante.
  const eraFilter = document.getElementById('era-filter');
  // Se conserva una referencia al tipo de acontecimiento seleccionado.
  const typeFilter = document.getElementById('type-filter');
  // Se localiza la región de anuncios accesibles del resultado.
  const trajectoryStatus = document.getElementById('trajectory-status');
  // Se localiza el estado vacío con su acción de recuperación.
  const trajectoryEmpty = document.getElementById('trajectory-empty');
  // Se identifica el último hito abierto para conservarlo entre audiencias.
  let selectedEvent = null;
  // Se restaura un valor de filtro únicamente si existe en las opciones del control.
  function restoreSelect(select, value) {
    // Se comprueba pertenencia al conjunto cerrado de opciones válidas.
    if ([...select.options].some(option => option.value === value)) {
      // Se aplica el estado compartido sin crear atributos o contenido dinámico.
      select.value = value;
    // Se ignoran valores desconocidos en enlaces manipulados.
    }
  // Se finaliza la restauración segura del filtro.
  }
  // Se recupera el sector solicitado en un enlace compartido.
  restoreSelect(branchFilter, query.get('branch'));
  // Se recupera la década solicitada únicamente entre opciones conocidas.
  restoreSelect(eraFilter, query.get('era'));
  // Se restaura el tipo de acontecimiento seleccionado.
  restoreSelect(typeFilter, query.get('type'));
  // Se evalúa el tipo del hito sin confundir reconocimientos y cursos.
  function matchesType(row) {
    // Se obtiene el valor actual del control normalizado.
    const type = typeFilter.value;
    // Se permite consultar toda la información de manera predeterminada.
    if (type === 'all') return true;
    // Se restringe la selección oficial a los registros educativos identificados.
    if (type === 'official') return row.dataset.official === 'true';
    // Se separa la formación complementaria del trabajo y los reconocimientos.
    if (type === 'complementary') return row.dataset.kind === 'education' && row.dataset.official !== 'true';
    // Se comparan los tipos restantes con el conjunto de categorías estáticas.
    return row.dataset.kind === type;
  // Se cierra la comprobación del tipo de hito.
  }
  // Se calcula si un periodo se cruza con la década seleccionada.
  function matchesEra(row) {
    // Se evita restringir el calendario cuando se elige toda la trayectoria.
    if (eraFilter.value === 'all') return true;
    // Se transforma la década de una opción controlada en un número entero.
    const decade = Number(eraFilter.value);
    // Se incluyen intervalos que empiezan antes pero siguen activos dentro de la década.
    return Number(row.dataset.start.slice(0, 4)) <= decade + 9 && Number(row.dataset.end.slice(0, 4)) >= decade;
  // Se finaliza la comparación de intervalos.
  }
  // Se preserva la posibilidad de filtrar la rama académica principal.
  function matchesBranch(row) {
    // Se obtiene el sector seleccionado en el control.
    const branch = branchFilter.value;
    // Se representa main mediante todos los títulos y certificados oficiales.
    if (branch === 'main') return row.dataset.official === 'true' || row.dataset.branch === 'main';
    // Se compara el sector profesional manteniendo todos los tipos de hito.
    return branch === 'all' || row.dataset.branch === branch;
  // Se finaliza la selección del sector.
  }
  // Se generan parámetros de enlace solo con estados normalizados de los controles.
  function stateQuery(mode) {
    // Se inicia un conjunto de parámetros independiente del texto recibido en la URL.
    const params = new URLSearchParams();
    // Se hace explícita la elección de RR. HH. para respetar enlaces compartidos.
    if (mode === 'hr') params.set('view', 'hr');
    // Se añaden exclusivamente filtros activos para mantener enlaces breves.
    [['branch', branchFilter.value], ['era', eraFilter.value], ['type', typeFilter.value]].forEach(([key, value]) => {
      // Se omite el valor predeterminado de cada filtro.
      if (value !== 'all') params.set(key, value);
    // Se finaliza la inclusión de filtros conocidos.
    });
    // Se conserva el hito abierto cuando existe en el índice local.
    if (selectedEvent && rowIndex.has(selectedEvent)) params.set('hito', selectedEvent);
    // Se devuelve una serialización segura de los parámetros.
    return params.toString();
  // Se finaliza el estado compartible de la vista.
  }
  // Se mantienen sincronizados los enlaces y la URL después de cada filtro.
  function syncLinks() {
    // Se conserva el ancla actual de la sección al cambiar de audiencia.
    const anchor = location.hash || '#contenido';
    // Se actualizan únicamente los dos enlaces de audiencia definidos en la plantilla.
    document.querySelectorAll('[data-mode-link]').forEach(link => {
      // Se toma la audiencia de un atributo fijo del documento.
      const mode = link.dataset.modeLink;
      // Se elige un destino local conocido sin aceptar URLs externas del visitante.
      const path = mode === 'tech' ? '/tech/' : '/';
      // Se preservan sección, filtros e hito entre ambas visualizaciones.
      link.href = `${path}?${stateQuery(mode)}${anchor}`;
    // Se finaliza la sincronización de enlaces de audiencia.
    });
    // Se crea un estado navegable con la ruta original y valores validados.
    const params = stateQuery(root.dataset.mode);
    // Se actualiza el enlace sin recargar ni reemplazar contenido del documento.
    history.replaceState(null, '', `${location.pathname}${params ? `?${params}` : ''}${location.hash}`);
  // Se finaliza la sincronización de navegación.
  }
  // Se aplican filtros tanto a la cronología como a las estaciones del mapa.
  function filterTrajectory() {
    // Se obtiene el conjunto exacto de acontecimientos visibles.
    const visible = new Set();
    // Se filtran los artículos sin eliminar contenido del HTML de origen.
    rows.forEach(row => {
      // Se combinan sector, intervalo y naturaleza del hito.
      const matches = matchesBranch(row) && matchesEra(row) && matchesType(row);
      // Se oculta la fila completa para no dejar estaciones desconectadas en la cronología.
      row.hidden = !matches;
      // Se registra el identificador para reutilizar el mismo criterio en el gráfico.
      if (matches) visible.add(row.dataset.event);
    // Se termina la selección de filas cronológicas.
    });
    // Se mantienen las estaciones SVG sincronizadas con las tarjetas del mismo acontecimiento.
    document.querySelectorAll('[data-map-event]').forEach(station => {
      // Se evita usar hidden en SVG porque su compatibilidad no es uniforme.
      station.style.display = visible.has(station.dataset.mapEvent) ? '' : 'none';
    // Se finaliza la actualización de estaciones visibles.
    });
    // Se atenúan los recorridos ajenos al sector seleccionado para preservar contexto.
    document.querySelectorAll('[data-graph-branch]').forEach(branch => {
      // Se consideran también las líneas que agrupan varios sectores del mismo recorrido.
      const sectors = (branch.dataset.graphSectors || branch.dataset.graphBranch).split(' ');
      // Se mantienen main y el origen de IA como referencias de sus relaciones.
      const isContext = branch.dataset.graphBranch === 'main' || (branchFilter.value === 'ia' && branch.dataset.graphBranch === 'web');
      // Se destaca la ruta correcta aunque informática y desarrollo compartan una línea.
      branch.style.opacity = branchFilter.value === 'all' || sectors.includes(branchFilter.value) || isContext ? '1' : '.16';
    // Se termina la actualización de ramas del gráfico.
    });
    // Se anuncia el número real de coincidencias sin métricas profesionales añadidas.
    trajectoryStatus.textContent = `${visible.size} de ${rows.length} hitos. Selecciona una estación para abrir su ficha.`;
    // Se muestra una alternativa recuperable si la combinación de filtros no tiene resultados.
    trajectoryEmpty.hidden = visible.size !== 0;
    // Se permite compartir el resultado con el mismo estado.
    syncLinks();
  // Se cierra la actualización de la trayectoria.
  }
  // Se filtra después de cambios explícitos de opciones.
  filters.addEventListener('change', filterTrajectory);
  // Se impide que Enter en los controles recargue la página innecesariamente.
  filters.addEventListener('submit', event => event.preventDefault());
  // Se define una salida común para filtros contradictorios o vacíos.
  function resetTrajectory() {
    // Se restauran los valores predeterminados de los tres controles.
    [branchFilter, eraFilter, typeFilter].forEach(select => { select.value = 'all'; });
    // Se recalculan los resultados después de restaurar el estado.
    filterTrajectory();
  // Se cierra el restablecimiento de trayectoria.
  }
  // Se intercepta el reset nativo para mantener sincronizados mapa y URL.
  filters.addEventListener('reset', event => {
    // Se evita que el navegador aplique los valores después de haber recalculado el filtro.
    event.preventDefault();
    // Se usa la recuperación común para ambas acciones de restablecimiento.
    resetTrajectory();
  // Se termina la acción del formulario de filtros.
  });
  // Se registra la salida del estado vacío.
  document.querySelector('[data-reset]').addEventListener('click', resetTrajectory);
  // Se obtiene el diálogo nativo con gestión de foco y cierre mediante Escape.
  const dialog = document.getElementById('event-dialog');
  // Se localiza el contenedor que recibirá contenido estático clonado.
  const dialogContent = document.getElementById('dialog-content');
  // Se abre únicamente un acontecimiento presente en el índice de datos permitido.
  function openEvent(id) {
    // Se valida el identificador antes de consultar su contenido.
    const row = rowIndex.get(id);
    // Se preserva el comportamiento nativo cuando el diálogo no está soportado.
    if (!row || typeof dialog.showModal !== 'function') return;
    // Se obtiene la ficha ya escapada durante la construcción estática.
    const source = row.querySelector('.detail-source');
    // Se clonan nodos locales sin interpretar entradas del visitante como HTML.
    dialogContent.replaceChildren(...[...source.children].map(child => child.cloneNode(true)));
    // Se asocia el nombre del diálogo a su título visible.
    dialogContent.querySelector('h2').id = 'dialog-title';
    // Se conserva la selección para enlaces de cambio de audiencia.
    selectedEvent = id;
    // Se actualiza el enlace profundo de la estación seleccionada.
    syncLinks();
    // Se evita abrir de nuevo un diálogo que ya está activo.
    if (!dialog.open) dialog.showModal();
  // Se cierra la apertura de ficha profesional.
  }
  // Se interceptan los enlaces de estaciones y los resúmenes de ficha desde un único manejador.
  document.addEventListener('click', event => {
    // Se identifica la estación o el resumen accionado sin usar selectores creados por el visitante.
    const trigger = event.target.closest('[data-map-event], .event-details > summary');
    // Se conserva la interacción normal en elementos que no abren fichas.
    if (!trigger || typeof dialog.showModal !== 'function') return;
    // Se evita el desplazamiento o acordeón cuando está disponible la ficha modal.
    event.preventDefault();
    // Se obtiene el identificador a partir de un elemento estático de la misma página.
    openEvent(trigger.dataset.mapEvent || trigger.closest('.timeline-row').dataset.event);
  // Se finaliza la delegación de eventos de las fichas.
  });
  // Se habilita el botón de cierre además de Escape.
  document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
  // Se elimina el estado modal del enlace cuando el visitante cierra la ficha.
  dialog.addEventListener('close', () => {
    // Se conserva la sección actual, pero se deja de compartir una ficha cerrada.
    selectedEvent = null;
    // Se actualiza la URL y los dos enlaces de audiencia.
    syncLinks();
  // Se finaliza el cierre del diálogo.
  });
  // Se mantienen los enlaces de modo alineados con la sección visitada.
  window.addEventListener('hashchange', syncLinks);
  // Se localiza el formulario independiente de búsqueda académica.
  const educationFilters = document.getElementById('education-filters');
  // Se conserva el contenedor de resultados para ordenar nodos existentes.
  const educationList = document.getElementById('education-list');
  // Se capturan las filas preconstruidas de formación como única base de filtrado.
  const educationRows = [...educationList.querySelectorAll('.education-row')];
  // Se normaliza texto de búsqueda sin insertarlo nunca como HTML.
  function normalize(value) {
    // Se permite buscar sin distinguir mayúsculas, acentos o espacios de borde.
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
  // Se termina la normalización de texto.
  }
  // Se evalúa el filtro de duración como un criterio de presentación.
  function matchesHours(row, duration) {
    // Se interpreta la ausencia documentada de horas mediante un valor de reserva.
    const hours = Number(row.dataset.hours);
    // Se diferencia duración desconocida de una formación corta.
    if (duration === 'unknown') return hours === 0;
    // Se consideran cortos únicamente cursos con horas conocidas.
    if (duration === 'short') return hours > 0 && hours <= 50;
    // Se permiten comparar cursos largos sin sumar acciones independientes.
    if (duration === 'long') return hours > 50;
    // Se muestran todas las duraciones en la opción predeterminada.
    return true;
  // Se finaliza la comparación de horas.
  }
  // Se ordenan los resultados existentes sin generar marcado desde la búsqueda.
  function sortEducation(order) {
    // Se obtiene una copia para no alterar el orden de referencia de la fuente estática.
    const sorted = [...educationRows].sort((first, second) => {
      // Se permite ordenar horas sin mezclar cursos sin duración con valores positivos.
      if (order === 'hours') return Number(second.dataset.hours) - Number(first.dataset.hours);
      // Se respeta la precisión temporal disponible en cada registro.
      return order === 'oldest' ? first.dataset.date.localeCompare(second.dataset.date) : second.dataset.date.localeCompare(first.dataset.date);
    // Se completa la ordenación por el criterio seleccionado.
    });
    // Se mueven los nodos originales manteniendo su contenido escapado.
    educationList.append(...sorted);
  // Se cierra la ordenación de formación.
  }
  // Se aplica una búsqueda académica independiente de la trayectoria profesional.
  function filterEducation() {
    // Se restringe la consulta a una longitud razonable incluso si se altera el atributo HTML.
    const search = normalize(document.getElementById('education-query').value.slice(0, 160));
    // Se obtiene la categoría oficial o complementaria seleccionada.
    const type = document.getElementById('education-type').value;
    // Se obtiene el intervalo de duración seleccionado.
    const duration = document.getElementById('education-hours').value;
    // Se cuenta únicamente la formación que satisface todos los criterios.
    let count = 0;
    // Se filtran filas completas para mantener una lectura de resultados coherente.
    educationRows.forEach(row => {
      // Se separa la oficialidad del título de la búsqueda por nombre y centro.
      const categoryMatches = type === 'all' || (type === 'official') === (row.dataset.official === 'true');
      // Se combina búsqueda de texto con categoría y horas documentadas.
      const matches = normalize(row.textContent).includes(search) && categoryMatches && matchesHours(row, duration);
      // Se preserva el contenido original mientras se cambia su visibilidad.
      row.hidden = !matches;
      // Se actualiza el número de resultados visibles.
      if (matches) count += 1;
    // Se finaliza la búsqueda de coincidencias educativas.
    });
    // Se aplica el orden que el visitante ha elegido explícitamente.
    sortEducation(document.getElementById('education-sort').value);
    // Se informa de resultados vacíos junto a la acción de recuperación.
    document.getElementById('education-status').textContent = count ? `${count} formaciones encontradas.` : 'Sin resultados. Pulsa Limpiar para volver a ver toda la formación.';
  // Se cierra la búsqueda de formación.
  }
  // Se actualizan resultados al escribir, con una colección local pequeña y acotada.
  educationFilters.addEventListener('input', filterEducation);
  // Se atienden cambios de filtros para navegadores que no emiten input en select.
  educationFilters.addEventListener('change', filterEducation);
  // Se evita navegación accidental al enviar el buscador.
  educationFilters.addEventListener('submit', event => event.preventDefault());
  // Se restaura de forma explícita para evitar recalcular antes de la acción nativa del navegador.
  educationFilters.addEventListener('reset', event => {
    // Se cancela el restablecimiento diferido que provocaba resultados desincronizados.
    event.preventDefault();
    // Se vacía la consulta sin interpretar ni conservar texto anterior.
    document.getElementById('education-query').value = '';
    // Se restablecen las opciones iniciales de categoría y duración.
    ['education-type', 'education-hours'].forEach(id => { document.getElementById(id).value = 'all'; });
    // Se recupera el orden más reciente utilizado en la presentación inicial.
    document.getElementById('education-sort').value = 'recent';
    // Se sincronizan todas las filas y el mensaje de estado en la misma acción.
    filterEducation();
  // Se finaliza la recuperación del buscador académico.
  });
  // Se configura el mapa solo en las páginas que lo contienen.
  function setupGraph() {
    // Se comprueba que la audiencia técnica dispone de un gráfico real.
    const viewport = document.getElementById('graph-viewport');
    // Se omite esta mejora en RR. HH. sin generar errores de selectores.
    if (!viewport) return;
    // Se conserva la referencia al SVG que se ampliará o reducirá.
    const map = document.getElementById('metro-map');
    // Se separan conectores y estaciones para que ninguna línea atraviese visualmente una tarjeta.
    if (!map.querySelector('[data-map-background]')) {
      // Se crea una única capa SVG situada antes de todas las fichas interactivas.
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      // Se identifica la capa para no repetir el proceso si la inicialización vuelve a ejecutarse.
      background.setAttribute('data-map-background', 'true');
      // Se localiza la primera estación para insertar los conectores inmediatamente antes de las tarjetas.
      const firstStation = map.querySelector('a[data-map-event]');
      // Se mantiene el mapa intacto cuando no existen estaciones renderizadas.
      if (firstStation) {
        // Se coloca la capa de conectores por debajo de todas las tarjetas.
        map.insertBefore(background, firstStation);
        // Se procesa cada estación sin alterar sus textos, enlaces ni nodos visibles.
        map.querySelectorAll('a[data-map-event]').forEach(station => {
          // Se toma el rectángulo como frontera entre geometría de conexión y contenido de tarjeta.
          const card = station.querySelector('rect');
          // Se evita modificar una estación incompleta.
          if (!card) return;
          // Se copian los elementos anteriores a la tarjeta para moverlos a la capa de fondo.
          const elements = Array.from(station.children);
          // Se recorren únicamente los elementos gráficos que preceden al rectángulo.
          for (const element of elements) {
            // Se detiene el traslado al alcanzar la tarjeta.
            if (element === card) break;
            // Se conserva el título accesible dentro del enlace.
            if (element.tagName.toLowerCase() === 'title') continue;
            // Se mueve el conector y sus marcas manteniendo sus atributos originales.
            background.appendChild(element);
          }
        });
      }
    }
    // Se utiliza el ancho definido en el viewBox de construcción.
    const baseWidth = 3900;
    // Se mantiene un zoom local que no afecta a la fuente profesional.
    let zoom = 1;
    // Se modifica el tamaño preservando la zona central del mapa.
    function setZoom(value) {
      // Se calcula la posición relativa para no perder el contexto horizontal.
      const center = (viewport.scrollLeft + viewport.clientWidth / 2) / (baseWidth * zoom);
      // Se limita el zoom para evitar tamaños de DOM incontrolados.
      zoom = Math.max(0.25, Math.min(1.8, value));
      // Se aplica un ancho numérico calculado exclusivamente desde límites conocidos.
      map.style.width = `${Math.round(baseWidth * zoom)}px`;
      // Se expresa el nivel de ampliación mediante una salida accesible.
      document.getElementById('zoom-level').textContent = `${Math.round(zoom * 100)}%`;
      // Se conserva aproximadamente la misma fecha en el centro de la ventana.
      viewport.scrollLeft = center * baseWidth * zoom - viewport.clientWidth / 2;
    // Se finaliza el cambio de ampliación.
    }
    // Se permite reducir el mapa mediante un control explícito.
    document.getElementById('zoom-out').addEventListener('click', () => setZoom(zoom - 0.15));
    // Se permite ampliar el mapa hasta un límite razonable.
    document.getElementById('zoom-in').addEventListener('click', () => setZoom(zoom + 0.15));
    // Se ofrece una visión general ajustada al ancho del contenedor.
    document.getElementById('zoom-reset').addEventListener('click', () => {
      // Se calcula el tamaño necesario para presentar la trayectoria completa.
      setZoom(viewport.clientWidth / baseWidth);
      // Se vuelve al inicio para que el ajuste no deje fechas fuera de la ventana.
      viewport.scrollTo({left: 0, top: 0, behavior: 'instant'});
    // Se finaliza la acción de visión general.
    });
    // Se registran accesos temporales con valores definidos en el HTML estático.
    document.querySelectorAll('[data-jump]').forEach(button => {
      // Se utiliza navegación local para cambiar de fecha dentro del mapa.
      button.addEventListener('click', () => {
        // Se obtiene el año a partir del atributo del botón generado en construcción.
        const year = Number(button.dataset.jump);
        // Se recupera un tamaño legible al saltar desde la vista general a una fecha.
        if (zoom < 0.8) setZoom(1);
        // Se obtiene el eje académico desde el SVG para adaptarse al espacio entre corredores.
        const mainY = Number(map.dataset.mainY);
        // Se sitúa el tronco académico o el corredor técnico en una zona visible al saltar.
        const targetTop = year >= 2010 ? 80 : Math.max(0, mainY - 160);
        // Se conserva la escala temporal y se evita saltar a una zona vacía del nuevo lienzo.
        viewport.scrollTo({left: (150 + (year - 1995) * 110) * zoom - 100, top: targetTop * zoom, behavior: 'instant'});
      // Se finaliza el acceso a la fecha seleccionada.
      });
    // Se finaliza el registro de accesos por fecha.
    });
    // Se presenta primero la topología completa para entender cierres y continuaciones.
    setZoom(viewport.clientWidth / baseWidth);
    // Se evita que el centrado del zoom oculte el comienzo de la trayectoria.
    viewport.scrollTo({left: 0, top: 0, behavior: 'instant'});
    // Se muestra la versión textual por defecto en móvil para facilitar la exploración.
    const textAlternative = document.querySelector('.text-alternative');
    // Se conserva la alternativa expandida cuando la pantalla es pequeña.
    textAlternative.open = window.matchMedia('(max-width: 600px)').matches;
  // Se cierra la inicialización del gráfico.
  }
  // Se prepara la terminal opcional sin ejecutar órdenes del sistema.
  function setupTerminal() {
    // Se localiza el formulario solo cuando se muestra la audiencia técnica.
    const form = document.getElementById('terminal-form');
    // Se evita añadir manejadores a una consola ausente en RR. HH.
    if (!form) return;
    // Se conserva una salida textual con límite de tamaño.
    const output = document.getElementById('terminal-output');
    // Se construyen respuestas explícitas mediante una lista cerrada de comandos.
    const commands = new Map([
      // Se explica el repertorio permitido sin ofrecer ejecución arbitraria.
      ['help', 'Comandos: help · whoami · git log · git branch · git merge · skills · contact · sudo hire me · clear'],
      // Se responde con un resumen respaldado por las fuentes del currículum.
      ['whoami', 'Juan Antonio Sánchez Plaza / Sabas. Responsable de Desarrollo Web. Industria, creatividad, sistemas y programación: todo lo aprendido viaja conmigo.'],
      // Se presenta una selección de hitos reales del recorrido profesional.
      ['git log', '2025 · Humanitas — Responsable de Desarrollo Web\n2023 · Coordinación de proyectos web y certificados profesionales\n2016 · Programador web\n2014 · Soporte informático\n2011 · Diseño y desarrollo freelance\n1999 · Industria y calorifugado'],
      // Se describen ramas conceptuales sin acceder a un repositorio real.
      ['git branch', 'main · formación oficial\nfeature/automocion\nfeature/industria\nfeature/creatividad\nfeature/sistemas\nfeature/desarrollo-web\nfeature/automatizacion-ia'],
      // Se refuerza el sentido de integración de competencias del mapa.
      ['git merge', 'Merge conceptual completado.\nExperiencia industrial + creatividad + sistemas + desarrollo = una forma de resolver con contexto.\nLos conocimientos se integran; la historia no se borra.'],
      // Se distingue práctica laboral de tecnologías que figuran solo en formación.
      ['skills', 'Trabajo: PHP, MySQL/MariaDB, JavaScript, WordPress, Git, sistemas, Python e IA aplicada.\nFormación complementaria: Azure, desarrollo full stack y fundamentos de Python.\nConsulta las estaciones para conocer el contexto de cada tecnología.'],
      // Se ofrecen exclusivamente los canales expresamente autorizados.
      ['contact', 'LinkedIn: linkedin.com/in/juanantoniosanchezplaza\nGitHub: github.com/djSaBaS\nEmail: juanantoniosanchezplaza@hotmail.com'],
      // Se introduce un detalle divertido sin simular un efecto externo real.
      ['sudo hire me', 'Permiso concedido para iniciar una conversación.\nEl siguiente commit podemos hablarlo por LinkedIn o email. ☕'],
      // Se incorpora un guiño discreto a la faceta creativa del alias.
      ['dj', '🎧 Mezcla preparada: una pista de industria, otra de creatividad y mucho desarrollo. Sin perder el ritmo.']
    // Se termina la lista explícita de respuestas locales.
    ]);
    // Se atiende el envío sin crear solicitudes de red.
    form.addEventListener('submit', event => {
      // Se evita la recarga o envío de datos al alojamiento.
      event.preventDefault();
      // Se localiza la entrada con su etiqueta accesible.
      const input = document.getElementById('terminal-input');
      // Se normaliza y limita la orden como texto de consulta.
      const command = input.value.trim().toLocaleLowerCase('es').slice(0, 100);
      // Se admite limpiar únicamente la salida de la simulación.
      if (command === 'clear') {
        // Se restablece la bienvenida como texto plano.
        output.textContent = 'Terminal preparada. Escribe help.';
      // Se procesan los demás comandos solo mediante el mapa de respuestas.
      } else {
        // Se utiliza un mensaje seguro para cualquier entrada desconocida.
        const response = commands.get(command) || 'Comando no reconocido. Escribe help para consultar las opciones.';
        // Se acota la salida acumulada para evitar crecimiento ilimitado del documento.
        output.textContent = `${output.textContent}\n\n$ ${command}\n${response}`.slice(-6000);
      // Se finaliza la selección de respuesta de la simulación.
      }
      // Se vacía la entrada para facilitar la siguiente consulta.
      input.value = '';
      // Se deja visible la respuesta más reciente sin desplazar toda la página.
      output.scrollTop = output.scrollHeight;
    // Se finaliza el envío de consulta a la terminal local.
    });
  // Se termina la configuración de la simulación técnica.
  }
  // Se configura la demostración ilustrativa de procesos cuando está presente.
  const simulationButton = document.getElementById('simulation-play');
  // Se evita depender de este elemento opcional en la vista técnica.
  if (simulationButton) {
    // Se localizan las dos secuencias dentro de la demostración correspondiente.
    const simulation = document.querySelector('.simulation');
    // Se conserva una sola lista de temporizadores para poder reiniciar sin duplicar avances.
    let simulationTimers = [];
    // Se actualizan estados discretos que siguen siendo visibles con movimiento reducido.
    function showSimulationProgress(lane, completed) {
      // Se selecciona exclusivamente el carril solicitado de esta demostración.
      const track = simulation.querySelector(`[data-simulation-lane="${lane}"]`);
      // Se marcan tareas completadas sin depender de keyframes CSS.
      track.querySelectorAll('i').forEach((task, index) => task.classList.toggle('is-complete', index < completed));
      // Se ofrece el mismo avance como texto para no depender únicamente del color.
      simulation.querySelector(`[data-simulation-count="${lane}"]`).textContent = `${completed}/5`;
    // Se finaliza la actualización de un carril ilustrativo.
    }
    // Se cancelan los avances anteriores antes de repetir o abandonar la demostración.
    function cancelSimulation() {
      // Se eliminan todos los callbacks pendientes de esta ejecución local.
      simulationTimers.forEach(timer => clearTimeout(timer));
      // Se evita acumular referencias después de cada reinicio.
      simulationTimers = [];
    // Se finaliza la cancelación de la ejecución anterior.
    }
    // Se registra un único disparador voluntario, repetible y sin efectos externos.
    simulationButton.addEventListener('click', () => {
      // Se garantiza que pulsaciones repetidas no mezclen dos ejecuciones.
      cancelSimulation();
      // Se restablece primero el proceso secuencial.
      showSimulationProgress('manual', 0);
      // Se restablece también el proceso coordinado.
      showSimulationProgress('automated', 0);
      // Se identifica la ejecución mediante feedback accesible inmediato.
      simulation.querySelector('[data-simulation-status]').textContent = 'Demostración en marcha: cinco tareas secuenciales frente a cinco coordinadas.';
      // Se permite reiniciar expresamente mientras el ejemplo sigue avanzando.
      simulationButton.textContent = 'Reiniciar demostración';
      // Se representa una ejecución coordinada de tareas puramente ilustrativas.
      simulationTimers.push(setTimeout(() => showSimulationProgress('automated', 5), 350));
      // Se completan las tareas manuales una a una con una secuencia acotada.
      for (let step = 1; step <= 5; step += 1) {
        // Se conserva el número de tarea en el ámbito de este temporizador.
        simulationTimers.push(setTimeout(() => {
          // Se muestra el progreso secuencial sin introducir movimiento obligatorio.
          showSimulationProgress('manual', step);
          // Se comunica el final únicamente después de la quinta tarea manual.
          if (step === 5) {
            // Se explica el resultado sin atribuir ahorros reales al ejemplo.
            simulation.querySelector('[data-simulation-status]').textContent = 'Ejemplo completado: el flujo coordinado terminó sus cinco tareas antes. Los tiempos son ilustrativos.';
            // Se identifica la posibilidad de repetir el recorrido completo.
            simulationButton.textContent = 'Repetir demostración';
          // Se finaliza el feedback de cierre.
          }
        // Se programa la siguiente tarea en un intervalo fijo y limitado.
        }, step * 450));
      // Se finaliza la programación de las cinco tareas locales.
      }
    // Se finaliza el control de repetición de la demostración.
    });
    // Se impide que queden callbacks activos al abandonar esta página.
    window.addEventListener('pagehide', cancelSimulation);
  // Se termina la configuración de la simulación para reclutadores.
  }
  // Se inicializa el gráfico cuando existe en la ruta actual.
  setupGraph();
  // Se inicializan las respuestas de la terminal opcional.
  setupTerminal();
  // Se calculan los resultados académicos con el estado inicial de sus controles.
  filterEducation();
  // Se aplica la selección compartida al mapa y a la cronología.
  filterTrajectory();
  // Se habilitan controles únicamente cuando sus comportamientos están registrados.
  root.classList.add('js');
  // Se restaura la selección de hito solo si corresponde a un identificador existente.
  if (rowIndex.has(query.get('hito'))) openEvent(query.get('hito'));
// Se cierra la encapsulación de las interacciones del currículum.
})();
