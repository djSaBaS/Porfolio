# Se validan contratos reales de navegación del sitio publicado bajo una subcarpeta.
from pathlib import Path
# Se interpreta HTML sin ejecutar scripts o consultar servicios externos.
from html.parser import HTMLParser
# Se separan fragmentos y consultas antes de comprobar archivos locales.
from urllib.parse import urlsplit, unquote
# Se compara la representación con la fuente curricular común.
import json
# Se fija la raíz de los archivos que publica Pages.
ROOT = Path(__file__).resolve().parents[1]
# Se mantiene un inventario explícito de las páginas principales generadas.
PAGES = ['index.html', 'tech/index.html', 'cv/index.html', 'privacidad/index.html', 'fuentes/index.html']
# Se añaden los casos actuales sin duplicar su catálogo.
PAGES += ['casos/' + case['id'] + '/index.html' for case in json.loads((ROOT / 'source/src/presentation.json').read_text(encoding='utf-8'))['cases']]
# Se acumulan errores de todos los documentos antes de emitir el resultado.
errors = []
# Se reúnen enlaces y recursos que realmente aparecen en los atributos del documento.
class PageProbe(HTMLParser):
    # Se inicializan las colecciones de una página aislada.
    def __init__(self):
        # Se utiliza el parser estándar sin dependencias adicionales.
        super().__init__()
        # Se conserva el inventario de referencias e identificadores.
        self.references, self.ids = [], []
    # Se analizan atributos relevantes sin interpretar contenido de scripts.
    def handle_starttag(self, tag, attrs):
        # Se convierten los atributos en un mapa local.
        attrs = dict(attrs)
        # Se recopilan las referencias de navegación y recursos.
        self.references.extend(attrs[key] for key in ['href', 'src'] if key in attrs)
        # Se comprueba también que los identificadores del documento sean únicos.
        if 'id' in attrs:
            # Se registra la referencia declarada por este elemento.
            self.ids.append(attrs['id'])
# Se verifica cada página principal con el mismo prefijo público.
for name in PAGES:
    # Se abre únicamente una ruta conocida del constructor.
    content = (ROOT / name).read_text(encoding='utf-8')
    # Se inspecciona la página generada, no una copia escrita para las pruebas.
    probe = PageProbe()
    # Se extraen sus atributos de navegación.
    probe.feed(content)
    # Se impide publicar IDs repetidos que rompan fichas, filtros o anclas.
    if len(probe.ids) != len(set(probe.ids)):
        # Se identifica la página sin imprimir su contenido profesional.
        errors.append(name + ': identificadores duplicados')
    # Se comprueba que los metadatos principales identifiquen el sitio de GitHub.
    if 'rel="canonical" href="https://djsabas.github.io/Porfolio/' not in content:
        # Se distingue la URL canónica de enlaces de fuente a otros sitios.
        errors.append(name + ': canonical de Pages ausente')
    # Se revisan todas las referencias que apuntan al alojamiento local.
    for reference in probe.references:
        # Se ignoran enlaces externos y anclas internas, que no son rutas de archivo.
        if not reference.startswith('/'):
            # Se continúa con el siguiente recurso de este documento.
            continue
        # Se exige el prefijo del proyecto incluso al alternar de audiencia.
        if not reference.startswith('/Porfolio/'):
            # Se impide navegar accidentalmente al sitio raíz de la cuenta.
            errors.append(name + ': referencia fuera de /Porfolio/')
            # Se evita interpretar como archivo una ruta ya inválida.
            continue
        # Se obtiene una ruta local sin parámetros o fragmentos.
        relative = unquote(urlsplit(reference).path[len('/Porfolio/'):])
        # Se resuelve el archivo dentro de la raíz del repositorio.
        target = (ROOT / relative).resolve()
        # Se protege también la validación frente a referencias con traversal.
        if not target.is_relative_to(ROOT):
            # Se registra el intento sin leer archivos externos.
            errors.append(name + ': ruta fuera del repositorio')
            # Se continúa sin consultar el destino externo al proyecto.
            continue
        # Se interpreta una ruta de sección como su documento index.html.
        target = target / 'index.html' if target.is_dir() else target
        # Se comprueba la existencia del recurso público que se enlaza.
        if not target.is_file():
            # Se identifica un enlace roto sin seguirlo por red.
            errors.append(name + ': recurso no encontrado ' + relative)
# Se comunica un resultado compacto para desarrollo y publicación.
print(json.dumps({'pages': len(PAGES), 'errors': errors}, ensure_ascii=False))
# Se entrega un fallo explícito cuando no se cumplen los contratos.
raise SystemExit(bool(errors))
