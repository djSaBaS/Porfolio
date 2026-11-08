# Se generan secciones editoriales sin dependencias ni ejecución en el navegador.
from html import escape
# Se valida cada identificador antes de convertirlo en una ruta pública.
import re
# Se limita el formato de rutas a nombres locales sencillos.
CASE_ID = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
# Se obtiene una ruta interna sin permitir navegación fuera del catálogo.
def case_path(case):
    # Se comprueba el identificador completo de la fuente local.
    if not CASE_ID.fullmatch(case['id']):
        # Se detiene la construcción ante una ruta no permitida.
        raise ValueError('Identificador de caso no permitido')
    # Se conserva una URL estable y enlazable para cada caso.
    return '/casos/' + case['id'] + '/'
# Se crean etiquetas con texto escapado, nunca marcado aportado como dato.
def labels(values):
    # Se mantiene un grupo semántico de tecnologías y contexto.
    return '<div class="tags">' + ''.join('<span>' + escape(value) + '</span>' for value in values) + '</div>'
# Se compone una tarjeta editorial con el resumen propio de cada audiencia.
def case_card(case, mode):
    # Se adapta la longitud y el contenido sin cambiar hechos entre vistas.
    summary = case['tech'] if mode == 'tech' else case['hr']
    # Se expresa el estado con texto además del color visual.
    state = 'beta' if case['id'] == 'tutorias-beta' else 'corporate' if 'repo' not in case else 'public'
    # Se construye el enlace local desde un identificador validado.
    path = case_path(case)
    # Se ofrece lectura del caso sin enlaces ficticios a código privado.
    return f'<!-- Se presenta un caso con su estado y alcance reales. -->\n<article class="case-card {state}"><p class="eyebrow">{escape(case["eyebrow"])}</p><h3>{escape(case["title"])}</h3><p class="case-status">{escape(case["status"])}</p><p>{escape(summary)}</p>{labels(case["stack"])}<a class="text-link" href="{path}">Leer caso <span class="sr-only">{escape(case["title"])}</span><span aria-hidden="true">↗</span></a></article>'
# Se reúne trabajo corporativo y código abierto en una sección inicial.
def cases_section(presentation, mode):
    # Se ajusta el encabezado a la intención de lectura del visitante.
    heading = 'Trabajo real.<br><span class="accent">Decisiones concretas.</span>' if mode == 'tech' else 'Aplicaciones que acompañan<br>el trabajo de los equipos.'
    # Se invita a comprobar el alcance antes de profundizar en la trayectoria.
    return '<!-- Se priorizan evidencias profesionales sobre la biografía completa. -->\n<section class="container section-space" id="casos" aria-labelledby="casos-title"><div class="section-heading"><div><p class="eyebrow section-index">CASOS / APLICACIONES Y AUTOMATIZACIÓN</p><h2 id="casos-title">' + heading + '</h2></div><p>Mi aportación, el funcionamiento y el estado de cada proyecto. Código público cuando está disponible.</p></div><div class="case-grid">' + ''.join(case_card(case, mode) for case in presentation['cases']) + '</div></section>'
# Se muestran aportaciones cualitativas sin inventar contadores de impacto.
def contribution_section(presentation):
    # Se construyen tres resúmenes comprensibles en una primera selección.
    cards = ''.join('<article><h3>' + escape(item['title']) + '</h3><p>' + escape(item['text']) + '</p></article>' for item in presentation['contributions'])
    # Se identifican los aportes sin presentarlos como métricas auditadas.
    return '<!-- Se resumen aportaciones declaradas con alcance cualitativo. -->\n<section class="container contributions" aria-label="Aportaciones profesionales"><div class="contribution-grid">' + cards + '</div></section>'
# Se seleccionan credenciales relevantes sin ocultar la formación completa.
def education_selection(events):
    # Se destacan certificados tecnológicos y formación PHP y Python.
    selected = {'edu-ifcd0210', 'edu-ifct0509', 'edu-php-avanzada-adr', 'edu-python-essentials-2'}
    # Se conservan denominaciones, categorías y fechas originales.
    cards = ''.join('<article><p class="eyebrow">' + escape(event['category']) + '</p><h3>' + escape(event['title']) + '</h3><p>' + escape(event['entity'] + ' · ' + event['dates']) + '</p></article>' for event in reversed(events) if event['id'] in selected)
    # Se enlaza el catálogo completo de 31 acciones sin duplicar sus controles.
    return '<!-- Se ofrece una selección pertinente antes del historial completo. -->\n<section class="container selected-education" aria-labelledby="seleccion-title"><div class="section-heading"><div><p class="eyebrow section-index">FORMACIÓN / SELECCIÓN</p><h2 id="seleccion-title">Formación para el trabajo actual.</h2></div><a class="text-link" href="/Porfolio/formacion/">Ver toda la formación ↗</a></div><div class="credential-grid">' + cards + '</div></section>'
# Se construye el cuerpo de una página de caso con datos escapados.
def case_body(case, projects):
    # Se publica el estado junto al título para evitar falsas expectativas.
    body = '<p class="eyebrow">' + escape(case['eyebrow']) + '</p><p class="case-status">' + escape(case['status']) + '</p>' + labels(case['stack'])
    # Se explica el flujo del prototipo sin simular datos o evaluaciones de alumnos.
    if case['id'] == 'tutorias-beta':
        # Se dibuja una secuencia semántica legible sin gráficos ni JavaScript.
        body += '<ol class="case-flow" aria-label="Flujo del prototipo"><li>Textos de tutorías</li><li>Diccionario y puntuaciones</li><li>Semáforos y radar</li><li>Contraste profesional pendiente</li></ol>'
    # Se recorre el contenido editorial mantenido en la fuente compartida.
    for block in case['blocks']:
        # Se abre una sección con una jerarquía accesible de encabezados.
        body += '<section><h2>' + escape(block['heading']) + '</h2>'
        # Se presenta una explicación narrativa cuando existe.
        if 'text' in block:
            # Se evita interpretar los textos como HTML o scripts.
            body += '<p>' + escape(block['text']) + '</p>'
        # Se presentan acciones paralelas como una lista semántica.
        if 'items' in block:
            # Se escapa cada elemento de forma independiente.
            body += '<ul>' + ''.join('<li>' + escape(item) + '</li>' for item in block['items']) + '</ul>'
        # Se representa el proceso de trabajo como una secuencia accesible sin datos internos.
        if 'flow' in block:
            # Se conserva el escape del texto y se reutiliza el componente visual existente.
            body += '<ol class="case-flow">' + ''.join('<li>' + escape(step) + '</li>' for step in block['flow']) + '</ol>'
        # Se finaliza la sección sin depender del navegador para cerrarla.
        body += '</section>'
    # Se toma un enlace público solo del catálogo verificado de proyectos.
    project = next((item for item in projects if item['repo'] == case.get('repo') and item['verifiedPublic']), None)
    # Se ofrece acceso a código únicamente cuando existe evidencia pública.
    if project:
        # Se restringe el destino al repositorio público conocido del titular.
        if not re.fullmatch(r'[A-Za-z0-9_-]+', project['repo']) or project['url'] != 'https://github.com/djSaBaS/' + project['repo']:
            # Se bloquea un cambio accidental del origen autorizado.
            raise ValueError('Origen de repositorio no permitido')
        # Se evita que una pestaña externa pueda controlar la página de origen.
        body += '<p><a class="button primary" href="' + escape(project['url'], quote=True) + '" target="_blank" rel="noopener noreferrer">Consultar repositorio público ↗</a></p>'
    # Se facilita cambiar de profundidad y contactar desde cualquier caso.
    return body + '<nav class="case-navigation" aria-label="Continuar explorando"><a class="text-link" href="/tech/#casos">Ver todos los casos ↗</a><a class="text-link" href="/?view=hr#contacto">Contactar ↗</a></nav><p class="source-note">Descripción profesional facilitada por el titular. Los enlaces públicos permiten revisar la documentación disponible; esta página no certifica el código de los proyectos.</p>'
