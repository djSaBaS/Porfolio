// Se conserva el efecto de retrato sin añadir variables al ámbito global.
(() => {
  // Se activa cada retrato de forma independiente, sin cambiar preferencias persistentes.
  document.querySelectorAll('.portrait-swap').forEach(button => {
    // Se permite alternar también mediante teclado y pantallas táctiles.
    button.addEventListener('click', () => {
      // Se invierte únicamente el estado visual de este retrato.
      const showPixel = button.getAttribute('aria-pressed') !== 'true';
      // Se comunica el estado del control a las tecnologías de apoyo.
      button.setAttribute('aria-pressed', String(showPixel));
      // Se actualiza la acción disponible sin alterar el texto del currículum.
      button.setAttribute('aria-label', showPixel ? 'Ver fotografía original' : 'Ver retrato en pixelart');
    // Se cierra el manejador local del retrato.
    });
  // Se finaliza el registro de los retratos existentes.
  });
// Se ejecuta la mejora una vez cargado el documento.
})();
