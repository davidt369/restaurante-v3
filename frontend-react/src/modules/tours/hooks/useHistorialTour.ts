import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useHistorialTour() {
  const startTour = () => {
    const allSteps = [
      { element: '#tour-historial-exportar-todo', popover: { title: '1. Exportar Todo', description: 'Usa este botón si tu contador te pide un reporte masivo. Generará un PDF gigantesco con el historial completo de todas tus cajas y ventas.' } },
      { element: '#tour-historial-resumen-tarjetas', popover: { title: '2. Tarjetas de Resumen', description: 'Un vistazo rápido a tus números globales: cuántas cajas tienes, total de dinero que ha ingresado y salido, y la sumatoria de tus fondos iniciales.' } },
      { element: '#tour-historial-tabs', popover: { title: '3. Vistas Disponibles', description: 'Puedes elegir ver tu historial agrupado "Por Caja" (ideal para arqueos) o "Por Fecha" (ideal para ver cómo le fue al restaurante en un día específico).' } },
      { element: '#tour-historial-caja-fila', popover: { title: '4. Fila de Caja (Turno)', description: 'Cada bloque de estos representa un turno entero. Puedes hacer CLIC en cualquier parte de la fila para expandirla y ver a detalle TODO lo que ocurrió en ese turno.' } },
      { element: '#tour-historial-caja-finanzas', popover: { title: '5. Resumen Financiero del Turno', description: 'Al expandir una caja, verás exactamente con cuánto dinero abrió, cuánto entró por Efectivo o QR, y los Gastos que se hicieron. Te dice cuánto "Efectivo Esperado" debió haber al cierre.' } },
      { element: '#tour-historial-caja-platos', popover: { title: '6. Productos Más Vendidos', description: 'Aquí te mostramos el top de ventas de ese turno. Útil para saber qué platos o bebidas salieron más rápido.' } },
      { element: '#tour-historial-caja-exportar', popover: { title: '7. Exportar Turno (PDF)', description: 'Este botón de impresora te permite descargar un PDF súper detallado ÚNICAMENTE de este turno (Caja). Incluye desde las ventas hasta los ingredientes más usados. ¡Es perfecto para el cierre diario!' } },
      { element: '#tour-historial-fecha-fila', popover: { title: '8. Vista Por Fecha', description: 'Si cambiaste a la pestaña "Por Fecha", verás las ventas agrupadas por día calendario. Aquí no importa cuántos cajeros hubo, verás la sumatoria total del día.' } },
      { element: '#tour-historial-fecha-exportar', popover: { title: '9. Reporte Diario (PDF)', description: 'Con este botón, generas un reporte de TODAS las cajas y movimientos que ocurrieron en esa fecha específica.' } },
    ];

    const activeSteps = allSteps.filter(step => document.querySelector(step.element) !== null);

    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: activeSteps
    });
    
    driverObj.drive();
  }

  return { startTour }
}
