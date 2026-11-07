# Se construye una versión estática del currículum para GitHub Pages.
from pathlib import Path
# Se utiliza el mismo generador editorial sin añadir dependencias de ejecución.
import runpy
# Se copian únicamente archivos estáticos conocidos a las rutas de publicación.
import shutil
# Se reconocen las imágenes autorizadas para conservar su efecto pixelart.
import re
# Se permite al constructor encontrar sus módulos locales de geometría y presentación.
import sys
# Se fija la raíz del repositorio, independientemente del directorio de ejecución.
ROOT = Path(__file__).resolve().parents[1]
# Se mantiene separada la fuente editable de los archivos que sirve Pages.
SOURCE = ROOT / 'source'
# Se declara la URL pública propia del repositorio.
ORIGIN = 'https://djsabas.github.io/Porfolio'
# Se fija el prefijo requerido por las páginas de proyecto de GitHub.
PREFIX = '/Porfolio'
# Se mantiene como dato de migración el origen de la versión de Sites.
SITES_ORIGIN = 'https://juan-antonio-sanchez-plaza-trayectoria.woodywood1.chatgpt.site'
# Se añade un reemplazo de imagen accesible sin modificar los archivos originales.
def portrait(match):
    # Se conserva el alt y el tamaño declarados en la imagen original del documento.
    original = match.group(0).replace('<img ', '<img class="portrait-photo" ', 1)
    # Se añade la ilustración existente como alternativa visual decorativa.
    pixel = f'<img class="portrait-pixel" src="{PREFIX}/assets/avatar_pixel.jpg" alt="" aria-hidden="true" loading="lazy">'
    # Se permite activar el efecto con ratón, teclado o una pulsación.
    return '<button type="button" class="portrait-swap" aria-label="Ver retrato en pixelart" aria-pressed="false" title="Pasa el ratón o pulsa para ver el pixelart">' + original + pixel + '</button>'
# Se adaptan solo enlaces internos y metadatos, conservando los destinos externos autorizados.
def rebase(text):
    # Se utiliza el dominio de Pages en canonical, schema y enlaces sociales.
    text = text.replace(SITES_ORIGIN, ORIGIN)
    # Se conserva la fotografía que ya pertenecía al portfolio de GitHub.
    text = text.replace('/assets/juan-antonio.jpg', '/assets/avatar.jpg')
    # Se corrigen los atributos absolutos para la carpeta del proyecto.
    for attribute in ['href', 'src', 'action']:
        # Se evita enviar la navegación al sitio raíz de la cuenta de GitHub.
        text = text.replace(attribute + '="/', attribute + '="' + PREFIX + '/')
    # Se devuelve únicamente marcado transformado a partir de la fuente local.
    return text
# Se genera primero el HTML desde la fuente normalizada del currículum.
(SOURCE / 'dist/assets').mkdir(parents=True, exist_ok=True)
# Se resuelven únicamente los módulos locales del constructor compartido.
sys.path.insert(0, str(SOURCE))
# Se ejecuta exclusivamente el constructor versionado del propio repositorio.
runpy.run_path(str(SOURCE / 'build.py'), run_name='__main__')
# Se exportan páginas, sitemap, robots y favicon sin copiar configuración de Sites.
for path in (SOURCE / 'dist').rglob('*'):
    # Se omiten directorios y recursos que no genera el constructor compartido.
    if not path.is_file():
        # Se continúa con el siguiente recurso estático.
        continue
    # Se conserva la ruta relativa del documento de origen.
    relative = path.relative_to(SOURCE / 'dist')
    # Se limita la adaptación a los formatos de texto generados.
    if path.suffix not in {'.html', '.xml', '.txt', '.svg'}:
        # Se dejan las imágenes y documentos preconstruidos en assets sin alterarlos.
        continue
    # Se crea el destino bajo la raíz pública de Pages.
    destination = ROOT / relative
    # Se crean únicamente las carpetas necesarias para esta ruta.
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Se adaptan rutas y metadatos propios del alojamiento de proyecto.
    content = rebase(path.read_text(encoding='utf-8'))
    # Se añade el efecto solo en las páginas que contienen retratos.
    if path.suffix == '.html' and f'src="{PREFIX}/assets/avatar.jpg"' in content:
        # Se envuelven las fotografías sin cambiar los archivos gráficos originales.
        content = re.sub(r'<img\b[^>]*src="/Porfolio/assets/avatar\.jpg"[^>]*>', portrait, content)
        # Se carga el controlador de los retratos de forma diferida y desde el mismo origen.
        content = content.replace('</body>', '<!-- Se activa el retrato alternativo sin peticiones a terceros. -->\n<script src="/Porfolio/assets/portrait.js" defer></script>\n</body>')
    # Se escribe la página final con caracteres y saltos de línea consistentes.
    destination.write_text(content, encoding='utf-8', newline='\n')
# Se adapta el único JavaScript compartido a las rutas de GitHub Pages.
script = (SOURCE / 'assets/app.js').read_text(encoding='utf-8')
# Se preserva la redirección de audiencia recordada dentro del proyecto.
script = script.replace('`/tech/${', '`/Porfolio/tech/${')
# Se conservan filtros y anclas al alternar entre las dos vistas.
script = script.replace("? '/tech/' : '/'", "? '/Porfolio/tech/' : '/Porfolio/'")
# Se publica el controlador con las rutas definitivas.
(ROOT / 'assets/app.js').write_text(script, encoding='utf-8', newline='\n')
# Se añade únicamente el estilo del retrato alternativo a la hoja compartida.
styles = (SOURCE / 'assets/site.css').read_text(encoding='utf-8')
# Se incorpora el componente local que conserva foto y pixelart originales.
styles += '\n' + (SOURCE / 'assets/portrait.css').read_text(encoding='utf-8')
# Se publica una única hoja de estilo para el currículum.
(ROOT / 'assets/site.css').write_text(styles, encoding='utf-8', newline='\n')
# Se mantienen enlaces antiguos mediante destinos fijos, sin aceptar redirecciones de visitantes.
redirects = {'rrhh': '?view=hr', 'about': '#sobre-mi', 'cursos': '#formacion', 'projects': '#proyectos', 'projects/cf7-limitador': 'casos/cf7-option-limiter/', 'projects/ocr-pdf': 'casos/ocr-pdf/', 'projects/voxflow': '#proyectos', 'projects/directorio-telefonos': '#proyectos'}
# Se conserva cada ruta histórica que puede estar guardada por un visitante.
for path, target in redirects.items():
    # Se construye un destino conocido dentro de este mismo portfolio.
    url = PREFIX + '/' + target
    # Se identifica la página original que se reemplaza por compatibilidad.
    destination = ROOT / path / 'index.html'
    # Se crea el contenedor de la ruta histórica cuando no existe todavía.
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Se ofrece navegación automática y un enlace alternativo legible sin JavaScript.
    destination.write_text('<!-- Se conserva un enlace histórico del portfolio. -->\n<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Juan Antonio Sánchez Plaza · Currículum</title><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=' + url + '"><link rel="canonical" href="' + ORIGIN + '/"></head><body><p>Esta sección está en el currículum actualizado.</p><a href="' + url + '">Abrir la sección actualizada</a></body></html>\n', encoding='utf-8')
# Se evita que Jekyll cambie el tratamiento de los archivos estáticos del proyecto.
(ROOT / '.nojekyll').write_text('', encoding='utf-8')
# Se comunica el resultado sin imprimir contenido curricular ni datos privados.
print('GitHub Pages generado con dos audiencias, casos, mapas y retratos originales.')
