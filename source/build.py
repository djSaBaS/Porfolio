# Se utiliza un generador estándar sin dependencias de producción.
import json
# Se escapa todo contenido profesional antes de insertarlo en HTML o SVG.
import html
# Se delega el recorrido de etapas en el modelo de ramas con cierres y reaperturas.
from graph import metro_graph, hero_graph, graph_legend
# Se trabaja con rutas locales determinadas por el propio proyecto.
from pathlib import Path
# Se generan casos y resúmenes desde datos editoriales escapados.
from presentation import cases_section, contribution_section, education_selection, case_body, case_path
# Se fija la raíz de esta implementación independiente.
ROOT = Path(__file__).resolve().parent
# Se determina el directorio que Sites servirá de forma estática.
DIST = ROOT / 'dist'
# Se lee la fuente profesional común que alimenta todas las vistas.
DATA = json.loads((ROOT / 'src/career.json').read_text(encoding='utf-8'))
# Se carga contenido editorial autorizado para las dos audiencias.
PRESENTATION = json.loads((ROOT / 'src/presentation.json').read_text(encoding='utf-8'))
# Se conserva el origen devuelto por el registro real de Sites.
ORIGIN = 'https://juan-antonio-sanchez-plaza-trayectoria.woodywood1.chatgpt.site'
# Se indexan las ramas para evitar búsquedas y definiciones duplicadas.
BRANCHES = {branch['id']: branch for branch in DATA['branches']}
# Se ordenan los hitos respetando la precisión disponible de sus fechas.
EVENTS = sorted(DATA['events'], key=lambda event: (event['start'], event['kind'], event['id']))
# Se centraliza el escape de valores de texto y atributos.
def escape(value):
    # Se convierten los valores a texto antes de codificar caracteres especiales.
    return html.escape(str(value), quote=True)
# Se generan etiquetas de habilidades sin interpretar el texto como marcado.
def tags(skills):
    # Se limita el número de etiquetas visibles para preservar la legibilidad.
    return '<div class="tags">' + ''.join(f'<span>{escape(skill)}</span>' for skill in skills[:6]) + '</div>'
# Se calcula un extremo temporal comparable sin alterar las fechas mostradas.
def boundary(date, end=False):
    # Se representa el presente por la fecha de revisión del contenido.
    if date is None:
        # Se evita inferir que un empleo actual sigue abierto indefinidamente.
        return '2026-11'
    # Se amplían los años únicamente para comprobar solapamientos de calendario.
    return date + ('-12' if end else '-01') if len(date) == 4 else date
# Se identifican experiencias que coinciden en el calendario de cada hito.
def concurrent(event):
    # Se respetan los periodos, incluyendo actividades freelance simultáneas.
    return [other for other in EVENTS if other['id'] != event['id'] and other['kind'] == 'work' and boundary(event['start']) <= boundary(other['end'], True) and boundary(other['start']) <= boundary(event['end'], True)]
# Se prepara información detallada para un diálogo sin nuevas consultas de red.
def event_detail(event):
    # Se diferencia estudio, trabajo y reconocimiento mediante su denominación explícita.
    fields = [('Entidad', event['entity']), ('Periodo', event['dates']), ('Tipo', event['category']), ('Sector', BRANCHES[event['branch']]['label']), ('Descripción', event['summary'])]
    # Se publican horas solo cuando existe una duración documentada.
    if event['hours'] is not None:
        # Se evita mostrar cero horas como duración de una formación.
        fields.append(('Duración documentada', f"{event['hours']} horas"))
    # Se añaden los solapamientos profesionales como contexto, sin sumar antigüedad.
    overlaps = concurrent(event)
    # Se muestran las actividades que coexistieron con este periodo.
    if overlaps:
        # Se aclara que la coincidencia se interpreta con la precisión temporal de las fuentes.
        fields.append(('Coincidencias de calendario', '; '.join(f"{other['entity']} · {other['dates']}" for other in overlaps)))
    # Se incluye la procedencia sin afirmar autenticación independiente de títulos.
    fields.append(('Estado de la información', event['status']))
    # Se compone una ficha semántica con escape contextual.
    return f'<h2>{escape(event["title"])}</h2><dl class="dialog-detail">' + ''.join(f'<dt>{escape(label)}</dt><dd>{escape(value)}</dd>' for label, value in fields) + f'</dl>{tags(event["skills"])}<a class="text-link" href="{escape(event["source"])}" target="_blank" rel="noopener noreferrer">Ver fuente ↗</a>'
# Se crea una ficha cronológica reutilizada por ambos modos.
def timeline_row(event):
    # Se marca el solapamiento mediante una nota textual y no solo por color.
    overlap = '<span class="overlap-note">Actividad simultánea con otras etapas ↔</span>' if event['kind'] == 'work' and concurrent(event) else ''
    # Se reserva el resumen extenso para los empleos de mayor contexto.
    summary = f'<p>{escape(event["summary"])}</p>' if event['kind'] == 'work' else ''
    # Se añaden atributos de filtro con valores normalizados de la fuente común.
    attributes = f'data-event="{escape(event["id"])}" data-branch="{event["branch"]}" data-kind="{event["kind"]}" data-start="{event["start"]}" data-end="{boundary(event["end"], True)}" data-official="{str(event["official"]).lower()}"'
    # Se devuelve una estación con alternativa nativa de detalles cuando falta JavaScript.
    return f'<!-- Se presenta el hito {escape(event["id"])} con datos contrastados. -->\n<article class="timeline-row {event["kind"]}" id="{event["id"]}" {attributes}><div class="timeline-card"><span class="event-kind">{escape(event["category"])}</span><div class="event-meta">{escape(event["dates"])}</div><h3>{escape(event["title"])}</h3><p>{escape(event["entity"])}</p>{summary}{overlap}<details class="event-details"><summary class="event-open">Ver ficha completa <span aria-hidden="true">↗</span></summary><div class="detail-source">{event_detail(event)}</div></details></div></article>'
# Se genera una lista de estudios con metadatos consistentes para sus filtros locales.
def education_row(event):
    # Se distingue el carácter de la formación de su denominación comercial.
    category = 'Oficial · ' + event['category'] if event['official'] else event['category']
    # Se muestra la duración o una indicación explícita de información no disponible.
    hours = f'{event["hours"]} h' if event['hours'] is not None else 'Sin horas documentadas'
    # Se presenta la formación en HTML completo sin llamadas a APIs.
    return f'<!-- Se identifica un curso sin duplicarlo por aparecer en varias fuentes. -->\n<article class="education-row" data-education-id="{event["id"]}" data-official="{str(event["official"]).lower()}" data-hours="{event["hours"] or 0}" data-date="{event["start"]}"><span class="education-date">{escape(event["dates"])}</span><div><h3>{escape(event["title"])}</h3><p>{escape(event["entity"])}</p></div><span class="education-type">{escape(category)}</span><span class="education-hours">{hours}</span></article>'
# Se construyen fichas de proyectos verificadas como públicas.
def project_card(project):
    # Se crean carátulas abstractas para evitar publicar capturas de sistemas privados.
    return f'<!-- Se publica únicamente el repositorio confirmado {escape(project["repo"])}. -->\n<article class="project-card {project["color"]}"><div class="project-art" aria-hidden="true"><strong>{escape(project["symbol"])}</strong><span>{escape(project["stack"][0].upper())}</span></div><div class="project-content"><h3>{escape(project["title"])}</h3><p>{escape(project["summary"])}</p>{tags(project["stack"])}<p class="project-tech tech-only">{escape(project["detail"])}</p><a class="text-link" href="{escape(project["url"])}" target="_blank" rel="noopener noreferrer">Explorar repositorio <span aria-hidden="true">↗</span></a></div></article>'
# Se compone el contenido compartido de las dos rutas de audiencia.
def build_page(mode):
    # Se carga la plantilla HTML para mantener separadas presentación y datos.
    template = (ROOT / 'src/page.html').read_text(encoding='utf-8')
    # Se elige una prioridad editorial diferente para cada audiencia.
    section_order = ['experience', 'cases', 'selected', 'trajectory', 'projects'] if mode == 'hr' else ['cases', 'experience', 'selected', 'trajectory', 'projects']
    # Se preparan los bloques nuevos desde la misma fuente de casos.
    editorial = {'cases': cases_section(PRESENTATION, mode), 'selected': education_selection(EVENTS)}
    # Se cargan los fragmentos que conservan filtros, fichas y enlaces públicos.
    fragments = [editorial[name] if name in editorial else (ROOT / 'src/sections' / (name + '.html')).read_text(encoding='utf-8') for name in section_order]
    # Se compone el cuerpo antes de sustituir sus marcadores de contenido.
    template = template.replace('{{AUDIENCE_SECTIONS}}', ''.join(fragments))
    # Se distingue la URL canónica de cada experiencia.
    canonical = ORIGIN + ('/tech/' if mode == 'tech' else '/')
    # Se estructura el perfil real con enlaces a sus dos cuentas públicas.
    person = {'@type': 'Person', '@id': ORIGIN + '/#person', 'name': DATA['profile']['name'], 'alternateName': ['Sabas', 'djSaBaS'], 'jobTitle': DATA['profile']['role'], 'url': ORIGIN + '/', 'sameAs': [DATA['profile']['github'], DATA['profile']['linkedin']], 'knowsAbout': ['Desarrollo PHP y MySQL', 'Desarrollo web', 'Automatización de procesos', 'Sistemas informáticos', 'Python']}
    # Se describe cada página de perfil sin utilizar propiedades de ofertas laborales.
    schema = {'@context': 'https://schema.org', '@type': 'ProfilePage', 'url': canonical, 'dateModified': '2026-11-05', 'mainEntity': person}
    # Se usa un título inequívoco y específico para cada audiencia.
    title = 'Juan Antonio Sánchez Plaza · Sabas | ' + ('PHP, Python y casos de desarrollo' if mode == 'tech' else 'Responsable de desarrollo web · PHP y automatización')
    # Se mantiene la descripción limitada a especialidades respaldadas por las fuentes.
    description = 'Casos de desarrollo de Juan Antonio Sánchez Plaza: evolución de aplicaciones PHP, automatización Python, WordPress y código público. Alcance y estado de cada proyecto.' if mode == 'tech' else 'Juan Antonio Sánchez Plaza, responsable de desarrollo web. Desarrollo PHP, automatización Python y coordinación con sistemas, RR. HH. y marketing. Experiencia y CV.'
    # Se presenta la misma cronología con un envoltorio adecuado a cada vista.
    timeline = '<div class="timeline-labels"><span>FORMACIÓN Y APRENDIZAJE</span><span>EXPERIENCIA PROFESIONAL</span></div><div class="timeline" id="timeline">' + ''.join(timeline_row(event) for event in EVENTS) + '</div>'
    # Se añade una alternativa textual explícita al mapa técnico.
    timeline_section = '<details class="text-alternative" open><summary>Consultar la trayectoria en formato textual y accesible</summary>' + timeline + '</details>' if mode == 'tech' else timeline
    # Se construyen las opciones de filtrado desde la misma definición de ramas.
    branch_options = '<option value="all">Todos los sectores</option>' + ''.join(f'<option value="{branch["id"]}">{escape(branch["label"])}</option>' for branch in DATA['branches'])
    # Se genera un mapa técnico con desplazamiento nativo y zoom opcional.
    graph_section = '<div class="graph-panel"><div class="graph-toolbar"><span class="mono">life / graph</span><div class="date-jumps js-only" aria-label="Ir a una fecha"><span>Ir a</span>' + ''.join(f'<button type="button" data-jump="{year}">{label}</button>' for year, label in [('1995', '1995'), ('2010', '2010'), ('2020', '2020'), ('2026', 'Hoy')]) + '</div><div class="zoom-controls js-only"><button type="button" id="zoom-out" aria-label="Reducir zoom">−</button><output id="zoom-level" aria-live="polite">100%</output><button type="button" id="zoom-in" aria-label="Aumentar zoom">+</button><button type="button" id="zoom-reset">Ajustar</button></div></div><div class="graph-viewport" id="graph-viewport" tabindex="0" aria-label="Mapa desplazable con estaciones; usa las flechas para recorrerlo">' + metro_graph(DATA) + '</div><div class="graph-legend">' + graph_legend(DATA) + '</div></div><p class="section-note">El tiempo avanza de izquierda a derecha. Un merge cierra una etapa en su fecha; una flecha con PR abierto indica continuidad. Las bandas laborales conservan sus propios periodos. Una misma rama puede reabrirse. Usa el desplazamiento horizontal y vertical o consulta la versión textual.</p>' if mode == 'tech' else ''
    # Se ordenan las experiencias por actualidad sin alterar la cronología central.
    work = sorted([event for event in EVENTS if event['kind'] == 'work'], key=lambda event: event['start'], reverse=True)
    # Se priorizan los tres puestos tecnológicos recientes sin perder otras experiencias.
    recent_work = [event for event in work if event['branch'] in {'web', 'sistemas'}][:3]
    # Se mantienen las experiencias restantes en su orden cronológico inverso.
    ordered_work = recent_work + [event for event in work if event not in recent_work]
    # Se ofrece un acordeón nativo por experiencia y se abre el puesto actual.
    experience_cards = [f'<details class="experience-card" {"open" if index == 0 else ""}><summary>{escape(event["title"])}<span>{escape(event["entity"])} · {escape(event["dates"])}</span></summary><p>{escape(event["summary"])}</p>{tags(event["skills"])}</details>' for index, event in enumerate(ordered_work)]
    # Se deja accesible la experiencia anterior sin ocupar la primera selección.
    experience = ''.join(experience_cards[:3]) + '<details class="earlier-experience"><summary>Ver experiencia anterior · industria, sistemas y trabajo freelance</summary>' + ''.join(experience_cards[3:]) + '</details>'
    # Se mantiene la terminal como una mejora optativa y local.
    terminal = '<section class="container terminal-section"><p class="eyebrow section-index">EXTRA / PARA QUIEN EXPLORA</p><details class="terminal"><summary class="terminal-heading"><span>⌘ sabas@life:~</span><span>Terminal simulada · sin ejecución real</span></summary><pre class="terminal-output" id="terminal-output" role="log" aria-live="polite">Hola. Puedes escribir help para explorar este repositorio de vida.</pre><form class="terminal-form js-only" id="terminal-form"><label for="terminal-input">sabas $</label><input id="terminal-input" name="command" type="text" maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="help"><button type="submit">Enviar</button></form><noscript><p>La terminal requiere JavaScript; el currículum completo está disponible en esta página.</p></noscript></details></section>' if mode == 'tech' else ''
    # Se mantiene el gráfico Git exclusivamente en TECH y un retrato editorial en RR. HH.
    hr_visual = '<div class="hero-portrait"><img src="/assets/juan-antonio.jpg" alt="Juan Antonio Sánchez Plaza, responsable de desarrollo web" width="530" height="350"><div class="portrait-caption"><span>EXPERIENCIA QUE CONECTA</span><strong>Industria. Sistemas.<br>Desarrollo web.</strong></div></div>'
    # Se fijan todos los valores de plantilla en un único paso de construcción.
    replacements = {'MODE': mode, 'TITLE': title, 'DESCRIPTION': description, 'CANONICAL': canonical, 'ORIGIN': ORIGIN, 'SCHEMA': json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c'), 'HR_CURRENT': 'aria-current="page"' if mode == 'hr' else '', 'TECH_CURRENT': 'aria-current="page"' if mode == 'tech' else '', 'HERO_TITLE': 'Cada etapa suma.<br><span class="accent">Todo conecta.</span>' if mode == 'hr' else 'Una trayectoria.<br><span class="accent">Muchas ramas.</span>', 'HERO_DESCRIPTION': 'Del mundo industrial al desarrollo web. Combino experiencia práctica, sistemas y programación para transformar necesidades en soluciones digitales.' if mode == 'hr' else 'PHP, MySQL, JavaScript y Python. Explora las decisiones, los aprendizajes y los proyectos públicos que conectan mi recorrido profesional.', 'HERO_GRAPH': hero_graph(DATA), 'TRAJECTORY_TITLE': 'Un recorrido que sigue sumando.' if mode == 'hr' else 'El repositorio de mi vida.', 'TRAJECTORY_DESCRIPTION': 'Formación a la izquierda. Experiencia a la derecha. Un mismo eje para entender cómo se conecta todo.' if mode == 'hr' else 'Formación oficial en main. Las etapas concluidas hacen merge en su fecha; desarrollo e IA continúan con PR abiertos.', 'EVENT_COUNT': str(len(EVENTS)), 'BRANCH_OPTIONS': branch_options, 'GRAPH_SECTION': graph_section, 'TIMELINE_SECTION': timeline_section, 'EXPERIENCE': experience, 'EDUCATION': ''.join(education_row(event) for event in reversed(EVENTS) if event['kind'] == 'education'), 'PROJECTS': ''.join(project_card(project) for project in DATA['projects']), 'TERMINAL': terminal}
    # Se sitúa la especialidad profesional en el encabezado principal.
    replacements.update({'HERO_TITLE': 'Responsable de<br>desarrollo web.<br><span class="accent">PHP y automatización.</span>' if mode == 'hr' else 'Aplicaciones PHP.<br>Automatización Python.<br><span class="accent">Trabajo real.</span>', 'HERO_DESCRIPTION': escape(PRESENTATION['heroTech'] if mode == 'tech' else PRESENTATION['heroHr']), 'PROFILE_SUMMARY': escape(PRESENTATION['profile']), 'CONTRIBUTIONS': contribution_section(PRESENTATION), 'HERO_ACTIONS': '<a class="button primary" href="/assets/cv-juan-antonio-sanchez-plaza.pdf" download>Descargar CV breve ↧</a><a class="button secondary" href="#contacto">Contactar ↗</a>' if mode == 'hr' else '<a class="button primary" href="#casos">Ver casos técnicos ↓</a><a class="button secondary" href="#proyectos">Consultar código ↗</a>'})
    # Se adapta la presentación de cada audiencia sin introducir gráficos Git en RR. HH.
    replacements.update({'VISUAL_HEADER': 'life.repository' if mode == 'tech' else 'Juan Antonio Sánchez Plaza', 'VISUAL_CAPTION': 'La experiencia también hace merge.' if mode == 'tech' else 'Experiencia práctica. Aprendizaje continuo.', 'HERO_GRAPH': hero_graph(DATA) if mode == 'tech' else hr_visual})
    # Se sustituyen solo marcadores conocidos de la plantilla local.
    for key, value in replacements.items():
        # Se mantienen los atributos y contenidos ya escapados por sus componentes.
        template = template.replace('{{' + key + '}}', value)
    # Se elige una carpeta por audiencia para facilitar enlaces limpios e indexación.
    target = DIST / ('tech/index.html' if mode == 'tech' else 'index.html')
    # Se prepara la carpeta de la ruta sin modificar archivos ajenos.
    target.parent.mkdir(parents=True, exist_ok=True)
    # Se guarda HTML completo para buscadores, lectores y navegadores sin JavaScript.
    target.write_text(template, encoding='utf-8', newline='\r\n')
# Se ofrece una plantilla reducida para el CV y la información de transparencia.
def document_page(title, body, path, description=None):
    # Se utiliza el resumen propio cuando se proporciona.
    description = description or title + ' de Juan Antonio Sánchez Plaza.'
    # Se identifica al profesional por su nombre completo en la pestaña del navegador.
    document_title = title if title == DATA['profile']['name'] else title + ' · ' + DATA['profile']['name']
    # Se mantienen SEO básico y estilos compartidos también en páginas secundarias.
    content = f'<!-- Se sirve una página estática accesible. -->\n<!doctype html>\n<!-- Se identifica el idioma del documento. -->\n<html lang="es">\n<!-- Se declaran metadatos del documento. -->\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(document_title)}</title><meta name="description" content="{escape(description)}"><link rel="canonical" href="{ORIGIN}/{path}/"><link rel="stylesheet" href="/assets/site.css"><link rel="icon" href="/assets/favicon.svg"></head>\n<!-- Se mantiene un diseño sencillo adecuado para lectura e impresión. -->\n<body><main class="document-page"><a class="text-link" href="/?view=hr">← Volver al currículum interactivo</a><h1>{escape(title)}</h1>{body}</main></body>\n<!-- Se cierra el documento informativo. -->\n</html>'
    # Se garantiza que cada ruta dispone de su propia carpeta estática.
    target = DIST / path / 'index.html'
    # Se crea únicamente el contenedor necesario para el documento.
    target.parent.mkdir(parents=True, exist_ok=True)
    # Se escribe contenido completo y legible sin JavaScript.
    target.write_text(content, encoding='utf-8', newline='\r\n')
# Se generan ambas audiencias a partir de los mismos acontecimientos.
for audience in ['hr', 'tech']:
    # Se construye una ruta única y canónica para cada modo.
    build_page(audience)
# Se generan casos enlazables con estado y fuentes explícitos.
for case in PRESENTATION['cases']:
    # Se valida la ruta antes de crear el documento de cada caso.
    document_page(case['title'], case_body(case, DATA['projects']), case_path(case).strip('/'), case['hr'])
# Se publica el catálogo formativo completo fuera de las páginas principales para mantenerlas compactas.
education_body = '<p>Formación oficial, certificados profesionales y aprendizaje complementario reunidos en una sola página. La portada muestra únicamente una selección relacionada con el trabajo actual.</p><div class="education-list">' + ''.join(education_row(event) for event in reversed(EVENTS) if event['kind'] == 'education') + '</div><p class="section-note">Los cursos de Azure, Oracle/MySQL y Python se presentan como formación o credenciales de curso; no como exámenes de certificación profesional. El máster de INESEM se identifica como formación privada.</p>'
# Se crea una ruta estable y enlazable para consultar toda la formación.
document_page('Formación y cursos', education_body, 'formacion', 'Formación oficial, certificados profesionales y cursos de Juan Antonio Sánchez Plaza.')
# Se prepara una lectura clásica del CV adecuada para selección y sistemas ATS.
cv_body = '<p>Responsable de Desarrollo Web · Madrid, España</p><p>PHP · MySQL/MariaDB · JavaScript · WordPress · Sistemas · Python y automatización</p><p><a href="mailto:juanantoniosanchezplaza@hotmail.com">juanantoniosanchezplaza@hotmail.com</a><br>LinkedIn: https://www.linkedin.com/in/juanantoniosanchezplaza/<br>GitHub: https://github.com/djSaBaS</p><p><a class="button primary" href="/assets/cv-juan-antonio-sanchez-plaza.pdf" download>Descargar CV en PDF</a></p><p>Esta versión puede imprimirse mediante el menú del navegador. <a href="/assets/cv-completo-juan-antonio-sanchez-plaza.pdf">Descargar PDF completo</a>.</p><h2>Perfil profesional</h2><p>Desarrollo directo en PHP, automatización con Python y coordinación de mejoras con sistemas de los centros, Recursos Humanos y marketing. Decisiones sobre tecnologías, implementación, lógica y plugins WordPress.</p><h2>Experiencia profesional</h2>'
# Se presentan los empleos completos con sus intervalos y descripciones autorizadas.
for event in sorted([item for item in EVENTS if item['kind'] == 'work'], key=lambda item: item['start'], reverse=True):
    # Se conserva una estructura de una columna para facilitar extracción de texto.
    cv_body += f'<article class="cv-entry"><h3>{escape(event["title"])}</h3><p>{escape(event["entity"])} | {escape(event["dates"])}</p><p>{escape(event["summary"])}</p></article>'
# Se separan títulos y formación oficial de los cursos complementarios.
for formal, heading in [(True, 'Formación oficial y certificados profesionales'), (False, 'Formación complementaria')]:
    # Se añade un encabezado semántico por categoría.
    cv_body += f'<h2>{heading}</h2>'
    # Se evita duplicar credenciales o convertir cursos en títulos oficiales.
    for event in reversed(EVENTS):
        # Se selecciona la categoría educativa del apartado actual.
        if event['kind'] == 'education' and event['official'] == formal:
            # Se conserva la duración individual cuando está documentada.
            cv_body += f'<article class="cv-entry"><h3>{escape(event["title"])}</h3><p>{escape(event["entity"])} | {escape(event["dates"])} | {escape(event["category"])}{(" | " + str(event["hours"]) + " h") if event["hours"] else ""}</p></article>'
# Se enlazan proyectos públicos en la versión imprimible.
cv_body += '<h2>Proyectos públicos</h2>' + ''.join(f'<article class="cv-entry"><h3>{escape(project["title"])}</h3><p>{escape(project["summary"])}</p><a href="{escape(project["url"])}">{escape(project["url"])}</a></article>' for project in DATA['projects'])
# Se escribe el CV clásico en una ruta limpia independiente.
document_page('Juan Antonio Sánchez Plaza', cv_body, 'cv')
# Se publica una explicación de privacidad ajustada al funcionamiento real de la página.
document_page('Privacidad', '<p>Este sitio presenta el currículum profesional de Juan Antonio Sánchez Plaza.</p><h2>Datos y preferencias</h2><p>No hay formularios de recogida de datos, analítica, publicidad ni cookies de seguimiento añadidas por este sitio. Las preferencias de tema y vista se guardan en el almacenamiento local de tu navegador y pueden eliminarse desde sus ajustes.</p><h2>Contacto</h2><p>El enlace de correo abre tu aplicación de email. Los mensajes se envían únicamente cuando decides hacerlo desde esa aplicación. LinkedIn y GitHub aplican sus propias políticas de privacidad.</p><h2>Alojamiento</h2><p>El alojamiento se presta mediante Sites. La plataforma puede tratar datos técnicos necesarios para servir el sitio conforme a sus propias condiciones.</p><h2>Consulta</h2><p>Para consultas relacionadas con el contenido, escribe a <a href="mailto:juanantoniosanchezplaza@hotmail.com">juanantoniosanchezplaza@hotmail.com</a>.</p>', 'privacidad')
# Se documentan las fuentes sin divulgar el texto privado completo aportado por el usuario.
document_page('Fuentes y criterios de contenido', '<p>Contenido revisado el 5 de noviembre de 2026 a partir del perfil de LinkedIn, aclaraciones profesionales facilitadas por su titular y repositorios públicos de GitHub.</p><p><a class="text-link" href="https://www.linkedin.com/in/juanantoniosanchezplaza/">Perfil de LinkedIn</a><br><a class="text-link" href="https://github.com/djSaBaS/Porfolio">Portfolio público original</a><br><a class="text-link" href="https://github.com/djSaBaS">Repositorios públicos</a></p><h2>Criterios</h2><p>Se han eliminado datos de ejemplo y entradas repetidas. La formación privada, los cursos y las acreditaciones históricas se distinguen de los títulos oficiales. La formación DP-900 no se presenta como examen de certificación superado. Los badges de Python no equivalen a certificaciones PCEP o PCAP.</p><p>Los certificados profesionales de octubre de 2023 se representan por su fecha de expedición, no como cursos realizados íntegramente en un mes. Sus horas incluyen el total indicado en el perfil.</p><p>Para el curso de bases de datos de 2020 existen meses contradictorios entre la ficha y el texto de diploma: se conserva únicamente el año. La coincidencia de periodos no implica dedicación exclusiva ni continuidad contractual entre actividades diferentes.</p><h2>Confidencialidad</h2><p>El titular autoriza describir Prometeo/Hermes y utilidades corporativas sin enlazar sus repositorios privados. Se omiten código interno, datos de alumnado o personal, documentos privados y métricas no respaldadas. El análisis de tutorías se identifica como beta con validación pendiente. Los repositorios enlazados fueron comprobados como públicos el 4 de noviembre de 2026.</p><p>La información curricular se contrasta con los datos aportados por el titular. Este sitio no constituye una validación independiente de diplomas por sus entidades emisoras.</p>', 'fuentes')
# Se proporciona una página de error útil para rutas inexistentes.
(DIST / '404.html').write_text('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Página no encontrada · Sabas</title><link rel="stylesheet" href="/assets/site.css"></head><body><main class="document-page"><h1>Esta estación no existe.</h1><p>Puedes volver al recorrido principal.</p><a class="button primary" href="/">Volver al currículum</a></main></body></html>', encoding='utf-8', newline='\r\n')
# Se publica un sitemap con las rutas canónicas realmente generadas.
paths = ['', 'tech/', 'formacion/', 'cv/', 'privacidad/', 'fuentes/'] + [case_path(case).lstrip('/') for case in PRESENTATION['cases']]
# Se permite que los buscadores descubran páginas sin interpretar JavaScript.
(DIST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{ORIGIN}/{path}</loc><lastmod>2026-11-05</lastmod></url>' for path in paths) + '</urlset>\n', encoding='utf-8', newline='\r\n')
# Se declara la ubicación de sitemap sin bloquear el contenido profesional.
(DIST / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {ORIGIN}/sitemap.xml\n', encoding='utf-8', newline='\r\n')
# Se crea un favicon vectorial propio con una bifurcación conceptual.
(DIST / 'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#101719"/><path d="M22 14 V50 M22 37 C22 25 43 34 43 17" fill="none" stroke="#b7e4c0" stroke-width="5"/><g fill="#101719" stroke="#b7e4c0" stroke-width="4"><circle cx="22" cy="14" r="5"/><circle cx="22" cy="50" r="5"/><circle cx="43" cy="17" r="5"/></g></svg>', encoding='utf-8', newline='\r\n')
# Se informa del contenido generado sin imprimir datos de contacto innecesarios.
print(json.dumps({'pages': len(list(DIST.rglob('*.html'))), 'events': len(EVENTS), 'education': sum(event['kind'] == 'education' for event in EVENTS), 'projects': len(DATA['projects'])}))
