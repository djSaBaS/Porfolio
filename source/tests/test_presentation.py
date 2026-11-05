# Se comprueban límites de publicación y escape de contenido editorial.
import unittest
# Se inspecciona el HTML como marcado, sin ejecutar scripts.
from html.parser import HTMLParser
# Se importa el renderer sin construir ni publicar el sitio.
from presentation import case_body, case_card, case_path
# Se reúne exclusivamente marcado ejecutable o enlaces externos de prueba.
class MarkupProbe(HTMLParser):
    # Se inicializan colecciones aisladas para cada caso de ensayo.
    def __init__(self):
        # Se utiliza el parser estándar con entidades decodificadas.
        super().__init__()
        # Se recogen etiquetas y enlaces efectivamente interpretados como HTML.
        self.tags, self.links = [], []
    # Se inspecciona cada etiqueta del fragmento generado.
    def handle_starttag(self, tag, attrs):
        # Se conserva el nombre real de etiqueta, no su texto escapado.
        self.tags.append(tag)
        # Se recopilan href para verificar las fronteras de publicación.
        self.links.extend(value for key, value in attrs if key == 'href')
# Se ensayan propiedades que protegen la salida estática del renderer.
class PresentationBoundaryTests(unittest.TestCase):
    # Se prepara un caso ficticio que contiene marcado adversarial como texto.
    def setUp(self):
        # Se incluyen comillas y etiquetas que no deben convertirse en ejecución.
        payload = '<script>alert("prueba")</script>'
        # Se evita utilizar información personal o corporativa real en las pruebas.
        self.case = {'id': 'caso-ficticio', 'title': payload, 'eyebrow': payload, 'status': payload, 'stack': [payload], 'hr': payload, 'tech': payload, 'blocks': [{'heading': payload, 'text': payload, 'items': [payload], 'flow': [payload]}]}
    # Se verifica el escape en tarjetas y en páginas completas de casos.
    def test_editorial_markup_remains_text(self):
        # Se analizan ambas superficies generadas con el mismo contenido adversarial.
        parser = MarkupProbe()
        # Se procesa marcado producido sin visitar destinos externos.
        parser.feed(case_card(self.case, 'tech') + case_body(self.case, []))
        # Se exige que no aparezca una etiqueta script efectiva.
        self.assertNotIn('script', parser.tags)
    # Se bloquea la construcción de rutas que salgan del catálogo público.
    def test_case_path_rejects_traversal(self):
        # Se ensayan separadores, fragmentos y formatos de URL no permitidos.
        for value in ['../privado', 'caso/otro', 'caso?x=1', 'caso#x', 'https://example.test']:
            # Se exige rechazo explícito antes de crear un archivo.
            with self.subTest(value=value), self.assertRaises(ValueError):
                # Se cambia solo el identificador de la fuente ficticia.
                case_path({**self.case, 'id': value})
    # Se impide que una descripción corporativa genere enlaces a repositorios.
    def test_corporate_case_has_no_repository_link(self):
        # Se simula un catálogo con un proyecto público ajeno a este caso.
        projects = [{'repo': 'publico', 'url': 'https://github.com/djSaBaS/publico', 'verifiedPublic': True}]
        # Se inspeccionan los destinos realmente presentes en el caso corporativo.
        parser = MarkupProbe()
        # Se genera un caso sin propiedad repo autorizada.
        parser.feed(case_body(self.case, projects))
        # Se exige que sus enlaces permanezcan dentro del sitio.
        self.assertTrue(all(link.startswith('/') for link in parser.links))
    # Se rechazan destinos manipulados incluso si comparten un prefijo visual.
    def test_public_repository_destination_is_exact(self):
        # Se simula un cambio accidental de origen o de ruta en el catálogo.
        project = {'repo': 'publico', 'url': 'https://github.com/djSaBaS/../otro', 'verifiedPublic': True}
        # Se requiere que la publicación se detenga antes de insertar ese enlace.
        with self.assertRaises(ValueError):
            # Se construye el caso asociado a ese proyecto de prueba.
            case_body({**self.case, 'repo': 'publico'}, [project])
# Se permite ejecutar este archivo como comprobación independiente.
if __name__ == '__main__':
    # Se entrega un resultado determinista al sistema de validación.
    unittest.main()
