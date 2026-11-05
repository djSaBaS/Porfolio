# Se escapan textos y atributos antes de crear fragmentos SVG.
from html import escape
# Se validan fechas y colores del modelo local del recorrido.
import re
# Se comprueba que cada fecha tenga componentes reales del calendario.
from datetime import date
# Se reserva una altura suficiente para separar fichas, vías y formación de IA.
MAP_HEIGHT = 1860
# Se reserva una rampa inferior a un año para dejar los hitos tardíos en el tramo plano.
MAX_RAMP_RUN = 90
# Se calcula el mes de un hito manteniendo la precisión declarada en la fuente.
def month_index(value, end=False):
    # Se admite exclusivamente el formato anual o año-mes del currículum.
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}(?:-\d{2})?', value):
        # Se detiene la construcción cuando se introduce una fecha ambigua.
        raise ValueError('Fecha no válida en el modelo de ramas')
    # Se separan los componentes que sí figuran en la fuente.
    parts = value.split('-')
    # Se interpreta el cierre anual como extremo del año únicamente para dibujar intervalos.
    month = int(parts[1]) if len(parts) == 2 else (12 if end else 1)
    # Se valida el calendario antes de utilizarlo como coordenada.
    date(int(parts[0]), month, 1)
    # Se devuelve un índice mensual comparable sin alterar el texto mostrado.
    return int(parts[0]) * 12 + month - 1
# Se transforma la cronología en posiciones de una escala compartida por el mapa.
def date_x(value, end=False):
    # Se mantiene una escala de 110 píxeles por año desde 1995.
    return round(150 + (month_index(value, end) - 1995 * 12) * 110 / 12, 1)
# Se valida la topología antes de renderizar las rutas.
def graph_routes(data):
    # Se indexan rutas declaradas en la misma fuente profesional.
    routes = {route['id']: route for route in data['graph']['routes']}
    # Se valida también la fecha que representa el presente del mapa.
    present = month_index(data['graph']['asOf'])
    # Se comprueba cada relación y sus periodos explícitos.
    for route in routes.values():
        # Se limita el color a un literal hexadecimal seguro para SVG.
        if not re.fullmatch(r'#[0-9a-fA-F]{6}', route['color']):
            # Se evita interpretar configuraciones arbitrarias como atributos de presentación.
            raise ValueError('Color de rama no válido')
        # Se admite main o una rama cuyo padre exista en el mismo modelo.
        if route['id'] != 'main' and route['parent'] not in routes:
            # Se impide dibujar conexiones con una línea inexistente.
            raise ValueError('Rama sin origen conocido')
        # Se mantiene el eje vertical dentro del lienzo estático.
        if not isinstance(route['y'], int) or not 50 <= route['y'] <= MAP_HEIGHT - 70:
            # Se evita que los datos generen un gráfico fuera de sus límites.
            raise ValueError('Posición de rama fuera del mapa')
        # Se inicia la frontera temporal para detectar periodos que se pisan.
        previous_end = -1
        # Se comprueba cada reapertura de la misma especialidad.
        for period in route['periods']:
            # Se permiten apartaderos cortos próximos a main sin grandes desvíos verticales.
            if 'y' in period and (not isinstance(period['y'], int) or not 50 <= period['y'] <= MAP_HEIGHT - 70):
                # Se rechaza una reapertura situada fuera del lienzo.
                raise ValueError('Posición de etapa fuera del mapa')
            # Se limita el lado de las etiquetas a encima o debajo del apartadero.
            if period.get('labelDirection', -1) not in {-1, 1}:
                # Se impide que una configuración arbitraria desplace las fichas fuera de sus corredores.
                raise ValueError('Lado de etiquetas no válido')
            # Se admite una reincorporación más corta cuando el último hito está cerca del cierre.
            if 'mergeRamp' in period and (not isinstance(period['mergeRamp'], int) or not 1 <= period['mergeRamp'] <= MAX_RAMP_RUN):
                # Se rechazan curvas de regreso sin longitud o fuera del límite del dibujo.
                raise ValueError('Longitud de reincorporación no válida')
            # Se obtiene el inicio real de esta etapa.
            start = month_index(period['start'])
            # Se conserva abierto únicamente el periodo que carece de fecha final.
            end = month_index(period['end'], True) if period['end'] else present
            # Se rechazan intervalos invertidos, solapados o posteriores al presente.
            if start <= previous_end or start > end or end > present:
                # Se solicita corregir el modelo en lugar de inventar otra cronología.
                raise ValueError('Periodos de rama inconsistentes')
            # Se registra el cierre o el presente antes de evaluar una reapertura.
            previous_end = end
    # Se devuelve un modelo validado para dibujo y leyenda.
    return routes
# Se relaciona cada hito con la ruta visual correspondiente.
def event_route(event, routes):
    # Se reserva main para los títulos y certificados oficiales.
    if event['official']:
        # Se evita trasladar una titulación a una rama profesional por su especialidad.
        return routes['main']
    # Se selecciona una ruta por los sectores que integra, incluidos sistemas y desarrollo.
    route = next(route for route in routes.values() if event['branch'] in route['sectors'])
    # Se encuentra la etapa que contiene el inicio de este acontecimiento.
    period = next((period for period in route['periods'] if month_index(period['start']) <= month_index(event['start']) <= (month_index(period['end'], True) if period['end'] else 9999 * 12)), None)
    # Se adapta únicamente la posición visual del apartadero, sin cambiar sector ni fechas.
    return {**route, 'y': period.get('y', route['y']), 'labelDirection': period.get('labelDirection', -1)} if period else route
# Se calcula una rampa que cabe incluso en una etapa breve sin invertir el tiempo.
def ramp_length(start_x, end_x, is_open):
    # Se reserva al menos un tercio del periodo cerrado para el tramo paralelo.
    return min(MAX_RAMP_RUN, (end_x - start_x) / (2 if is_open else 3))
# Se dibuja una etapa con cierre real o continuación abierta según sus datos.
def route_path(start_x, end_x, parent_y, branch_y, is_open, merge_ramp=None):
    # Se adapta la longitud de las salidas y entradas al espacio cronológico disponible.
    ramp = ramp_length(start_x, end_x, is_open)
    # Se mantiene la salida dentro del margen del lienzo, también en la miniatura comprimida.
    departure_ramp = min(ramp, max(0, start_x - 25))
    # Se acorta el regreso sin desplazar el último hito fuera del tramo paralelo.
    return_ramp = min(ramp, merge_ramp) if merge_ramp is not None else ramp
    # Se deja espacio antes del merge para volver a main avanzando hacia la derecha.
    parallel_end = end_x if is_open else end_x - return_ramp
    # Se ordenan los controles horizontales para impedir bucles y contramarchas.
    path = f'M{start_x-departure_ramp} {parent_y} C{start_x-2*departure_ramp/3} {parent_y} {start_x-departure_ramp/3} {branch_y} {start_x} {branch_y} H{parallel_end}'
    # Se vuelve a la línea de origen solo cuando existe una fecha final explícita.
    if not is_open:
        # Se ancla el merge en la fecha de cierre, sin trasladarlo al presente.
        path += f' C{parallel_end+return_ramp/3} {branch_y} {parallel_end+2*return_ramp/3} {parent_y} {end_x} {parent_y}'
    # Se devuelve el recorrido sin cierre cuando la etapa permanece activa.
    return path
# Se representa un periodo y su estado con marcas SVG accesibles.
def route_period(route, period, index, routes, present_x):
    # Se determina el comienzo de la rama en la escala temporal común.
    start_x = date_x(period['start'])
    # Se mantiene la rama activa hasta el presente y una flecha de continuación.
    end_x = date_x(period['end'], True) if period['end'] else present_x + 90
    # Se obtiene la línea desde la que nace esta etapa.
    parent_y = routes[route['parent']]['y']
    # Se acerca una reapertura breve a la vía principal cuando lo declara el modelo.
    branch_y = period.get('y', route['y'])
    # Se utiliza la fecha final como único criterio de cierre del modelo.
    is_open = period['end'] is None
    # Se genera una curva con el destino adecuado a su estado.
    path = route_path(start_x, end_x, parent_y, branch_y, is_open, period.get('mergeRamp'))
    # Se conservan los sectores agrupados para que los filtros destaquen la ruta correcta.
    sectors = escape(' '.join(route['sectors']), quote=True)
    # Se añaden metadatos que permiten comprobar que cada merge respeta su fecha.
    attributes = f'data-graph-branch="{route["id"]}" data-graph-sectors="{sectors}" data-stage="{route["id"]}-{index}" data-stage-state="{"open" if is_open else "merged"}" data-stage-start="{period["start"]}" data-stage-end="{period["end"] or ""}"'
    # Se rotula el periodo sin convertir la rama en un acontecimiento curricular adicional.
    title = f'{route["label"]}: {period["start"]} — {period["end"] or "actualidad · PR abierto"}'
    # Se dibuja la ruta antes de las fichas para que no tape sus textos.
    line = f'<g {attributes}><title>{escape(title)}</title><path d="{path}" fill="none" stroke="{route["color"]}" stroke-width="4" stroke-linecap="round"/><text x="{start_x+18}" y="{branch_y+30}" fill="var(--text)" font-size="11" font-family="Consolas,monospace">{escape(route["code"] + (" · reapertura" if index else ""))}</text>'
    # Se señala explícitamente la continuidad de una rama activa.
    if is_open:
        # Se conserva una flecha de final abierto y una etiqueta de PR pendiente.
        line += f'<path d="M{end_x-10} {route["y"]-7} L{end_x} {route["y"]} L{end_x-10} {route["y"]+7}" fill="none" stroke="{route["color"]}" stroke-width="3"/><text x="{end_x-6}" y="{route["y"]-17}" text-anchor="end" fill="{route["color"]}" font-family="Consolas,monospace" font-size="13">PR abierto · continúa →</text>'
    # Se identifica una etapa terminada sobre su línea de origen.
    else:
        # Se hace visible el cierre en su año o mes documentado.
        line += f'<g data-merge-date="{period["end"]}"><circle cx="{end_x}" cy="{parent_y}" r="6" fill="var(--bg)" stroke="{route["color"]}" stroke-width="3"/><text x="{end_x+12}" y="{parent_y+20}" fill="{route["color"]}" font-family="Consolas,monospace" font-size="10">merge · {period["end"]}</text></g>'
    # Se cierra el grupo para que filtros y estados se apliquen a todo el periodo.
    return line + '</g>'
# Se localiza la vía real bajo una estación, también durante una rampa.
def station_track_y(event, route, routes, as_of):
    # Se mantiene constante la posición del tronco académico.
    if route['id'] == 'main':
        # Se devuelve su ordenada sin buscar periodos de especialidad.
        return route['y']
    # Se usa el inicio documentado como anclaje temporal de la estación.
    x = date_x(event['start'])
    # Se busca el periodo que contiene el hito sin conectar etapas ya cerradas.
    for period in route['periods']:
        # Se calcula el origen de la bifurcación.
        start = date_x(period['start'])
        # Se conserva el extremo abierto que se dibuja en route_period.
        end = date_x(period['end'], True) if period['end'] else date_x(as_of) + 90
        # Se ignoran periodos que no contienen la estación.
        if not start <= x <= end:
            # Se continúa con una posible reapertura posterior.
            continue
        # Se reutiliza la misma geometría que en las curvas del mapa.
        ramp = min(ramp_length(start, end, period['end'] is None), period.get('mergeRamp', MAX_RAMP_RUN))
        # Se mide la incorporación inicial o la reincorporación final.
        progress = 1
        # Se aplica el retorno únicamente a una etapa que realmente termina.
        if period['end'] is not None and x > end - ramp:
            # Se invierte la altura de la rampa de entrada sin invertir su tiempo.
            progress = (end - x) / ramp
        # Se interpola la misma Bézier con abscisas equidistantes del trazado.
        eased = progress * progress * (3 - 2 * progress)
        # Se devuelve la conexión exacta entre la vía padre y la especialidad.
        return routes[route['parent']]['y'] + (route['y'] - routes[route['parent']]['y']) * eased
    # Se rechaza una estación que quedaría desconectada de todas sus etapas.
    raise ValueError('Estación fuera de los periodos de su rama')
# Se dibuja cada estación conservando el identificador que abre su ficha.
def station(event, route, occupied, as_of, routes):
    # Se conserva el inicio del hito o su fecha de expedición como posición horizontal.
    x = date_x(event['start'])
    # Se usa un carril libre para separar rótulos que coinciden en fecha.
    lane = next((index for index, right in enumerate(occupied) if x-16 >= right+18), len(occupied))
    # Se reserva la ficha y, para un trabajo, toda la duración de su banda.
    right = max(x+157, date_x(event['end'] or as_of, True)+8) if event['kind'] == 'work' else x+157
    # Se crea otra fila cuando todas las existentes siguen ocupadas.
    if lane == len(occupied):
        # Se evita reutilizar una fila que provocaría superposición.
        occupied.append(right)
    # Se reutiliza una fila únicamente cuando realmente queda espacio horizontal.
    else:
        # Se actualiza el extremo ocupado después de situar este hito.
        occupied[lane] = right
    # Se separan las fichas de las vías mediante filas de altura constante.
    y = route['y'] + (60 + 54 * lane) * route.get('labelDirection', -1)
    # Se detiene la construcción si una futura ampliación necesita otro corredor.
    if y < 50 or y > MAP_HEIGHT - 70:
        # Se solicita ampliar el mapa en lugar de recortar fichas de forma silenciosa.
        raise ValueError('Faltan filas verticales para las estaciones')
    # Se conserva el anclaje sobre la vía aunque la etiqueta ocupe otra fila.
    track_y = station_track_y(event, route, routes, as_of)
    # Se distinguen los empleos por una estación de mayor tamaño.
    radius = 10 if event['kind'] == 'work' else 6
    # Se conserva el nombre completo en el título y la etiqueta accesible.
    label = event['title'] if len(event['title']) < 26 else event['title'][:24] + '…'
    # Se representa la duración laboral sin cambiar sus fechas por el estado de la rama.
    interval = f'<path d="M{x} {y} H{date_x(event["end"] or as_of, True)}" stroke="{route["color"]}" stroke-width="9" opacity=".18"/>' if event['kind'] == 'work' else ''
    # Se codifica el identificador antes de usarlo como referencia de navegación.
    event_id = escape(event['id'], quote=True)
    # Se codifica también el nombre y periodo completos de la ficha.
    description = escape(event['title'] + ', ' + event['dates'], quote=True)
    # Se reutiliza la ficha textual existente sin añadir un segundo modelo curricular.
    return f'<a href="#{event_id}" data-map-event="{event_id}" aria-label="{description}"><title>{description}</title>{interval}<path d="M{x} {track_y} V{y}" stroke="{route["color"]}" stroke-width="1.5" opacity=".5"/><circle cx="{x}" cy="{track_y}" r="4" fill="var(--bg)" stroke="{route["color"]}" stroke-width="2"/><rect x="{x-16}" y="{y-19}" width="173" height="39" rx="6" fill="var(--bg)" stroke="var(--line)"/><circle cx="{x}" cy="{y}" r="{radius}" fill="var(--bg)" stroke="{route["color"]}" stroke-width="3"/><text x="{x+18}" y="{y-2}" fill="var(--text)" font-size="10" font-family="Segoe UI,Arial,sans-serif">{escape(label)}</text><text x="{x+18}" y="{y+12}" fill="var(--muted)" font-size="9" font-family="Consolas,monospace">{escape(event["start"])}</text></a>'
# Se genera el mapa técnico con cierres, reaperturas y ramas abiertas.
def metro_graph(data):
    # Se obtiene el modelo de etapas antes de producir marcado.
    routes = graph_routes(data)
    # Se fija el presente en una coordenada compartida por todas las líneas.
    present_x = date_x(data['graph']['asOf'])
    # Se sitúa main en el centro como en el esquema aportado por el usuario.
    main_y = routes['main']['y']
    # Se nombra el mapa y se explica su topología de forma accesible.
    parts = [f'<svg class="metro-map" id="metro-map" data-main-y="{main_y}" viewBox="0 0 3900 {MAP_HEIGHT}" role="img" aria-labelledby="map-title map-description" xmlns="http://www.w3.org/2000/svg"><title id="map-title">Trayectoria con ramas cerradas y PR abiertos</title><desc id="map-description">Main representa la formación oficial. Las vías avanzan de izquierda a derecha con salidas y reincorporaciones progresivas. Las etapas concluidas hacen merge en su fecha; las activas continúan con una flecha y PR abierto. Industria y creatividad pueden reabrirse. Inteligencia artificial nace de desarrollo e informática, entre esa vía y main, con formación en filas separadas. Debajo se ofrece toda la trayectoria en texto.</desc>']
    # Se mantienen guías de calendario para relacionar estaciones y cierres.
    for year in range(1995, 2027):
        # Se rotulan los lustros y el presente para no sobrecargar la lectura.
        if year % 5 == 0 or year == 2026:
            # Se conserva la misma escala mensual que los hitos y las ramas.
            x = date_x(str(year))
            # Se diferencian las guías del contenido profesional con una línea discontinua.
            parts.append(f'<path d="M{x} 25 V{MAP_HEIGHT-50}" stroke="var(--line)" stroke-dasharray="3 8"/><text x="{x}" y="22" fill="var(--muted)" font-size="14" font-family="Consolas,monospace">{year}</text>')
    # Se extiende la formación principal sin absorber las especialidades activas.
    parts.append(f'<g data-graph-branch="main" data-graph-sectors="main"><path d="M150 {main_y} H{present_x+90}" stroke="{routes["main"]["color"]}" stroke-width="5"/><text x="155" y="{main_y+31}" fill="var(--text)" font-size="12" font-family="Consolas,monospace">main · formación oficial</text><path d="M{present_x+80} {main_y-7} L{present_x+90} {main_y} L{present_x+80} {main_y+7}" fill="none" stroke="{routes["main"]["color"]}" stroke-width="3"/></g>')
    # Se dibujan todos los periodos antes de superponer las estaciones.
    for route in routes.values():
        # Se permite que una especialidad tenga varias etapas separadas.
        for index, period in enumerate(route['periods']):
            # Se elige un merge o una continuación según la fecha final explícita.
            parts.append(route_period(route, period, index, routes, present_x))
    # Se reserva el seguimiento de rótulos por cada ruta visual compartida.
    occupied = {route_id: [] for route_id in routes}
    # Se mantienen las cuarenta y dos estaciones enlazadas a la fuente común.
    for event in sorted(data['events'], key=lambda item: (item['start'], item['id'])):
        # Se determina main o la especialidad que contiene el acontecimiento.
        route = event_route(event, routes)
        # Se sitúa cada ficha una sola vez conservando las actividades simultáneas.
        parts.append(station(event, route, occupied[route['id']], data['graph']['asOf'], routes))
    # Se explicita el sentido de cada símbolo sin afirmar que toda actividad ha terminado.
    parts.append(f'<text x="155" y="{MAP_HEIGHT-25}" fill="var(--muted)" font-size="12" font-family="Consolas,monospace">○ merge en la fecha de cierre · ↗ reapertura · → PR abierto: etapa que continúa</text></svg>')
    # Se devuelve SVG estático indexable y navegable sin nuevas dependencias.
    return ''.join(parts)
# Se construye una leyenda con los mismos colores y agrupaciones del mapa.
def graph_legend(data):
    # Se mantienen nombres y estados en texto legible incluso en la vista general reducida.
    labels = []
    # Se reaprovecha el modelo validado en lugar de mantener otra lista de especialidades.
    for route in graph_routes(data).values():
        # Se toma la última etapa para indicar su estado actual.
        final = route['periods'][-1] if route['periods'] else None
        # Se omite una etiqueta de cierre para el tronco académico principal.
        state = '' if final is None else (' · PR abierto' if final['end'] is None else f' · merge {final["end"]}')
        # Se incluyen color, especialidad y fecha de cierre o continuidad.
        labels.append(f'<span><svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="{route["color"]}"/></svg>{escape(route["label"] + state)}</span>')
    # Se devuelve una sola leyenda coherente con todos los recorridos dibujados.
    return ''.join(labels)
# Se distribuyen los cambios de vía de la miniatura sin comprimir etapas breves en agujas.
def overview_positions(data, routes):
    # Se conservan los extremos cronológicos del resumen conceptual.
    first, present = 1995 * 12, month_index(data['graph']['asOf'])
    # Se recopilan las etapas y su extremo abierto o cerrado.
    periods = [(month_index(period['start']), month_index(period['end'], True) if period['end'] else present) for route in routes.values() for period in route['periods']]
    # Se ordenan todos los cambios de vía sin inventar estaciones o fechas.
    dates = sorted({first, present} | {point for period in periods for point in period})
    # Se inicia la distribución antes de las etapas profesionales.
    positions = {first: 25}
    # Se avanza de un extremo temporal al siguiente.
    for previous, current in zip(dates, dates[1:]):
        # Se mantiene separación proporcional cuando no hace falta ampliar una etapa.
        position = positions[previous] + (current - previous) * 1.2
        # Se reserva espacio de salida, tramo paralelo y entrada para cada etapa.
        positions[current] = max([position] + [positions[start] + 80 for start, end in periods if end == current])
    # Se ajusta el esquema al ancho de la tarjeta sin presentarlo como escala temporal exacta.
    return {point: 25 + (position - 25) * 480 / (positions[present] - 25) for point, position in positions.items()}
# Se genera una portada conceptual coherente con los estados del recorrido detallado.
def hero_graph(data):
    # Se conservan los periodos reales también en la miniatura conceptual.
    routes = graph_routes(data)
    # Se evita que las etapas de pocos meses formen agujas en el resumen.
    positions = overview_positions(data, routes)
    # Se reducen las posiciones para ofrecer una composición legible en la portada.
    levels = {'main': 185, 'automocion': 225, 'creatividad': 140, 'industria': 280, 'web': 58, 'ia': 110}
    # Se inicia una ilustración que explica el cierre y la continuidad de las ramas.
    parts = ['<svg class="hero-map" viewBox="0 0 530 330" role="img" aria-labelledby="hero-graph-title" xmlns="http://www.w3.org/2000/svg"><title id="hero-graph-title">Las etapas terminadas se integran; desarrollo e IA continúan con PR abiertos</title><path d="M25 185 H505" stroke="#bac8c3" stroke-width="3"/><text x="25" y="174" fill="var(--muted)" font-family="Consolas,monospace" font-size="9">main · formación oficial</text>']
    # Se dibuja cada etapa con la misma relación de parentesco que el mapa.
    for route in routes.values():
        # Se omite main porque su eje ya está representado.
        for period in route['periods']:
            # Se obtiene un inicio temporal reducido al ancho de la portada.
            start_x = round(positions[month_index(period['start'])], 1)
            # Se conserva el cierre o se extiende la rama activa hasta la flecha.
            end_x = round(positions[month_index(period['end'], True)], 1) if period['end'] else 505
            # Se acerca un apartadero breve a su vía padre para evitar desvíos casi verticales.
            depth = min(abs(levels[route['id']] - levels[route['parent']]), (end_x - start_x) * .7) if period['end'] else abs(levels[route['id']] - levels[route['parent']])
            # Se conserva el lado de salida de cada especialidad en el esquema conceptual.
            branch_y = levels[route['parent']] + depth * (1 if levels[route['id']] > levels[route['parent']] else -1)
            # Se dibuja el parentesco entre main, desarrollo y la rama de IA.
            path = route_path(start_x, end_x, levels[route['parent']], branch_y, period['end'] is None)
            # Se representa el periodo con el color del esquema del usuario.
            parts.append(f'<path data-hero-stage="{route["id"]}" d="{path}" fill="none" stroke="{route["color"]}" stroke-width="2.8"/><circle cx="{start_x}" cy="{branch_y}" r="4" fill="var(--surface)" stroke="{route["color"]}" stroke-width="2"/>')
            # Se rotulan las etapas abiertas con un final de continuación explícito.
            if period['end'] is None:
                # Se diferencia la rama abierta de cualquier merge de formación.
                parts.append(f'<path d="M498 {levels[route["id"]]-5} L505 {levels[route["id"]]} L498 {levels[route["id"]]+5}" fill="none" stroke="{route["color"]}" stroke-width="2"/><text x="500" y="{levels[route["id"]]-12}" text-anchor="end" fill="{route["color"]}" font-size="9" font-family="Consolas,monospace">{("Desarrollo" if route["id"] == "web" else "IA")} · PR abierto</text>')
    # Se explica el diagrama con texto en lugar de depender únicamente del color.
    parts.append('<text x="25" y="28" fill="var(--muted)" font-size="9" font-family="Consolas,monospace">1995 → HOY / ETAPAS QUE SE INTEGRAN, RAMAS QUE CONTINÚAN</text><text x="25" y="312" fill="var(--muted)" font-size="10">Sonido y diseño · Automoción · Industria · Desarrollo · IA</text></svg>')
    # Se devuelve la ilustración sin una convergencia artificial de todas las ramas.
    return ''.join(parts)
