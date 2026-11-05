# Se comprueban los contratos visuales que distinguen etapas cerradas y activas.
import unittest
# Se leen los datos reales normalizados sin depender de servicios de red.
import json
# Se ubica el proyecto respecto al archivo de pruebas.
from pathlib import Path
# Se permite importar el renderer local desde el directorio de pruebas.
import sys
# Se analiza el SVG como XML para verificar estructura y ausencia de marcado inyectado.
import xml.etree.ElementTree as ET
# Se permite alterar un ejemplo de prueba sin modificar la fuente curricular.
from copy import deepcopy
# Se extraen exclusivamente las coordenadas de los trazados de vía que se comprueban.
import re
# Se comparan parejas de fichas para detectar colisiones reales del mapa.
from itertools import combinations
# Se fija la raíz de la copia independiente de Sites.
ROOT = Path(__file__).resolve().parents[1]
# Se incorpora únicamente el módulo del propio proyecto.
sys.path.insert(0, str(ROOT))
# Se importan las funciones públicas del renderer que recibe la fuente común.
from graph import metro_graph, hero_graph, date_x, graph_routes, ramp_length, event_route, station_track_y
# Se agrupan pruebas relacionadas con la semántica solicitada por el usuario.
class BranchLifecycleTests(unittest.TestCase):
    # Se carga una fuente nueva para que cada caso sea independiente.
    def setUp(self):
        # Se conservan todos los hitos existentes y el modelo de rutas de esta revisión.
        self.data = json.loads((ROOT / 'src/career.json').read_text(encoding='utf-8'))
        # Se analiza la salida real, no una representación manual del algoritmo.
        self.svg = ET.fromstring(metro_graph(self.data))
        # Se indexan periodos por su identificador estable de etapa.
        self.stages = {node.attrib['data-stage']: node for node in self.svg.iter() if 'data-stage' in node.attrib}
    # Se verifica la regresión original que cerraba todas las ramas en el presente.
    def test_closed_stages_merge_at_their_own_dates(self):
        # Se comprueban ejemplos separados por varias décadas y una reapertura corta.
        expected = {'automocion-0': '1999', 'creatividad-0': '2001', 'industria-1': '2023-03'}
        # Se verifica tanto la fecha declarada como la geometría del marcador de cierre.
        for stage_id, end in expected.items():
            # Se inspecciona el periodo que representa cada cierre real.
            stage = self.stages[stage_id]
            # Se exige un estado cerrado y un marcador propio de merge.
            self.assertEqual(stage.attrib['data-stage-state'], 'merged')
            # Se comprueba que el cierre no se haya trasladado al presente.
            marker = next(node for node in stage.iter() if 'data-merge-date' in node.attrib)
            # Se verifica la fecha con la precisión que figura en el modelo.
            self.assertEqual(marker.attrib['data-merge-date'], end)
            # Se comprueba que la coordenada temporal del cierre coincide con la fecha.
            circle = next(node for node in marker if node.tag.endswith('circle'))
            # Se tolera únicamente el redondeo de representación decimal.
            self.assertAlmostEqual(float(circle.attrib['cx']), date_x(end, True), places=1)
    # Se verifica que desarrollo e IA no hagan merge al llegar al presente.
    def test_active_stages_remain_open(self):
        # Se comprueban las dos especialidades activas del modelo.
        for stage_id in ['web-0', 'ia-0']:
            # Se toma el periodo abierto correspondiente.
            stage = self.stages[stage_id]
            # Se exige la marca explícita de continuidad.
            self.assertEqual(stage.attrib['data-stage-state'], 'open')
            # Se impide introducir un cierre sin fecha final.
            self.assertFalse(any('data-merge-date' in node.attrib for node in stage.iter()))
            # Se exige una explicación textual además de la flecha visual.
            self.assertIn('PR abierto', ''.join(stage.itertext()))
    # Se comprueba que una rama que reaparece no quede dibujada como actividad continua.
    def test_industry_reopens_after_a_closed_period(self):
        # Se mantienen dos periodos independientes para industria.
        stages = [stage for key, stage in self.stages.items() if key.startswith('industria-')]
        # Se evita recuperar la línea única que atravesaba todos los años intermedios.
        self.assertEqual(len(stages), 2)
        # Se verifica el retorno de la colaboración posterior al primer cierre.
        self.assertEqual(stages[0].attrib['data-stage-end'], '2015')
        # Se conserva el inicio de las formaciones preventivas de 2020 ahora documentadas.
        self.assertEqual(stages[1].attrib['data-stage-start'], '2020-05')
    # Se comprueba el parentesco de IA que aparece en el dibujo del titular.
    def test_ai_forks_from_development(self):
        # Se obtiene la línea real de origen a partir del modelo validado.
        routes = graph_routes(self.data)
        # Se exige que IA salga de desarrollo, no directamente de main.
        self.assertEqual(routes['ia']['parent'], 'web')
        # Se inspecciona el primer punto de la curva generada.
        path = next(node for node in self.stages['ia-0'] if node.tag.endswith('path'))
        # Se comprueba el origen vertical de la bifurcación y su fecha.
        ramp = ramp_length(date_x('2024-11'), date_x(self.data['graph']['asOf']) + 90, True)
        # Se exige que la salida termine antes de la primera formación específica de IA.
        self.assertTrue(path.attrib['d'].startswith(f'M{date_x("2024-11")-ramp} {routes["web"]["y"]} '))
    # Se mantienen los cursos y trabajos en los tramos paralelos de sus propias vías.
    def test_courses_and_jobs_are_on_flat_tracks(self):
        # Se utiliza la misma relación entre hitos y etapas del mapa real.
        routes = graph_routes(self.data)
        # Se comprueban todos los cursos y trabajos, también los primeros de cada rama.
        for event in self.data['events']:
            # Se excluye únicamente el reconocimiento, que conserva su fecha propia de cierre.
            if event['kind'] in {'education', 'work'}:
                # Se obtiene el carril correspondiente a esta etapa del hito.
                route = event_route(event, routes)
                # Se exige que su anclaje coincida con la ordenada del tramo plano.
                self.assertAlmostEqual(station_track_y(event, route, routes, self.data['graph']['asOf']), route['y'], msg=event['id'])
    # Se protege la correspondencia entre mapa y currículum al reagrupar sectores.
    def test_every_event_stays_linked_once(self):
        # Se obtienen los identificadores de todas las estaciones reales.
        stations = [node.attrib['data-map-event'] for node in self.svg.iter() if 'data-map-event' in node.attrib]
        # Se exige una representación única de cada acontecimiento.
        self.assertEqual(sorted(stations), sorted(event['id'] for event in self.data['events']))
        # Se comprueba que la ruta común responde también al filtro de sistemas.
        self.assertIn('sistemas', self.stages['web-0'].attrib['data-graph-sectors'].split())
    # Se impide reintroducir curvas omega en cualquiera de los dos mapas.
    def test_tracks_never_reverse_in_time(self):
        # Se reúnen los periodos detallados y el mismo resumen que usa la portada.
        paths = [next(node for node in stage if node.tag.endswith('path')) for stage in self.stages.values()]
        # Se incluyen las etapas conceptuales, sin confundirlas con flechas de continuidad.
        paths += [node for node in ET.fromstring(hero_graph(self.data)).iter() if 'data-hero-stage' in node.attrib]
        # Se verifica cada segmento y sus puntos de control, no solo sus extremos.
        for path in paths:
            # Se separan las únicas órdenes utilizadas para las vías.
            segments = re.findall(r'([MCH])([^MCH]+)', path.attrib['d'])
            # Se conserva el extremo horizontal de cada segmento precedente.
            previous = float('-inf')
            # Se examinan también los controles interiores de cada Bézier.
            for command, coordinates in segments:
                # Se convierten las coordenadas del trazado real a números comparables.
                values = [float(value) for value in coordinates.split()]
                # Se distingue la única abscisa de H de los pares de M y C.
                xs = values if command == 'H' else values[::2]
                # Se exige avance horizontal para todos los controles del recorrido.
                for x in xs:
                    # Se admite únicamente la precisión decimal de la representación.
                    self.assertGreaterEqual(x + 1e-7, previous)
                    # Se registra el control para impedir contramarchas dentro de la curva.
                    previous = x
    # Se evita que adelantar una salida recorte una rama por el borde del resumen.
    def test_overview_departures_stay_inside_canvas(self):
        # Se inspecciona la misma miniatura que se publica en la portada técnica.
        for node in ET.fromstring(hero_graph(self.data)).iter():
            # Se seleccionan únicamente las vías de las especialidades.
            if 'data-hero-stage' in node.attrib:
                # Se lee la abscisa inicial antes de la primera curva.
                start_x = float(node.attrib['d'].split()[0][1:])
                # Se conserva el margen izquierdo y el tronco principal visibles.
                self.assertGreaterEqual(start_x, 25)
    # Se protege la legibilidad de todos los rótulos, incluidos los de informática.
    def test_station_cards_do_not_overlap(self):
        # Se toman las cajas efectivas del SVG, con sus posiciones y dimensiones finales.
        boxes = [tuple(float(node.attrib[key]) for key in ['x', 'y', 'width', 'height']) for node in self.svg.iter() if node.tag.endswith('rect')]
        # Se compara cada pareja sin depender del algoritmo que asigna las filas.
        for first, second in combinations(boxes, 2):
            # Se detecta intersección horizontal entre las dos fichas.
            overlaps_x = first[0] < second[0] + second[2] and second[0] < first[0] + first[2]
            # Se detecta intersección vertical entre las dos fichas.
            overlaps_y = first[1] < second[1] + second[3] and second[1] < first[1] + first[3]
            # Se impide publicar dos rótulos que se tapen entre sí.
            self.assertFalse(overlaps_x and overlaps_y, (first, second))
    # Se mantiene IA entre informática y main, junto con espacio para su formación.
    def test_ai_has_its_own_corridor(self):
        # Se consulta la geometría declarada en el modelo común.
        routes = graph_routes(self.data)
        # Se exige el orden de las tres vías solicitado por el titular.
        self.assertLess(routes['web']['y'], routes['ia']['y'])
        # Se conserva main al otro lado de la formación de IA.
        self.assertLess(routes['ia']['y'], routes['main']['y'])
        # Se examinan las cajas reales de los tres cursos de esa rama.
        ids = {event['id'] for event in self.data['events'] if event['branch'] == 'ia'}
        # Se comprueban márgenes respecto a las otras vías, además de evitar solapamientos.
        for node in self.svg.iter():
            # Se seleccionan solo las estaciones de formación de IA.
            if node.attrib.get('data-map-event') in ids:
                # Se obtiene la ficha del curso sin asumir un orden visual concreto.
                box = next(child for child in node if child.tag.endswith('rect'))
                # Se mantiene la ficha fuera del corredor de informática.
                self.assertGreater(float(box.attrib['y']), routes['web']['y'] + 40)
                # Se conserva margen antes de alcanzar el eje académico.
                self.assertLess(float(box.attrib['y']) + float(box.attrib['height']), routes['main']['y'] - 40)
    # Se evita que una colaboración breve cree un desvío vertical desproporcionado.
    def test_reopened_siding_stays_close_to_main(self):
        # Se toma la reapertura documentada de construcción e industria.
        routes = graph_routes(self.data)
        # Se conserva la fecha real sin ensanchar artificialmente su duración en el mapa detallado.
        period = routes['industria']['periods'][1]
        # Se compara su longitud temporal con el desplazamiento del apartadero.
        span = date_x(period['end'], True) - date_x(period['start'])
        # Se exige un desvío moderado que permita salida y reincorporación progresivas.
        self.assertLess(abs(period['y'] - routes['main']['y']), span / 2)
    # Se verifica la salida contextual del renderer al recibir texto con caracteres de marcado.
    def test_station_text_is_escaped(self):
        # Se prepara un dato ficticio únicamente dentro de la copia en memoria.
        sample = deepcopy(self.data)
        # Se utiliza texto literal que no debe convertirse en elementos del documento.
        sample['events'][0]['title'] = 'UTQA </title><script>test</script> & "texto"'
        # Se comprueba que la salida continúe siendo XML válido.
        svg = ET.fromstring(metro_graph(sample))
        # Se exige que no aparezca ningún nodo ejecutable procedente del título.
        self.assertFalse(any(node.tag.endswith('script') for node in svg.iter()))
        # Se conserva el texto literal del visitante de prueba dentro de su contexto textual.
        self.assertIn(sample['events'][0]['title'], ''.join(svg.itertext()))
    # Se rechazan cierres incoherentes antes de generar una cronología engañosa.
    def test_invalid_period_is_rejected(self):
        # Se prepara un intervalo invertido en una copia ficticia.
        sample = deepcopy(self.data)
        # Se sitúa el cierre antes del inicio para comprobar el error del modelo.
        sample['graph']['routes'][1]['periods'][0]['end'] = '1990'
        # Se exige un fallo controlado en vez de publicar un recorrido inválido.
        with self.assertRaises(ValueError):
            # Se intenta renderizar exclusivamente el dato ficticio del caso.
            metro_graph(sample)
# Se permite ejecutar las pruebas como script o mediante unittest discovery.
if __name__ == '__main__':
    # Se devuelven resultados estándar y código de salida útil para empaquetar.
    unittest.main()
