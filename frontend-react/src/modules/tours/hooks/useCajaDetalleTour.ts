import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useCajaDetalleTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: '#tour-detalle-tabs', popover: { title: 'Pestañas de Detalle', description: 'Aquí puedes revisar el Resumen General, las Ventas individuales realizadas y los Gastos registrados durante este turno.' } },
        { element: '#tour-detalle-flujo', popover: { title: 'Flujo de Efectivo', description: 'Muestra cuánto dinero tenías al inicio, qué entró y qué salió en EFECTIVO. La diferencia te indica si te sobra o falta dinero según el sistema.' } },
        { element: '#tour-detalle-qr', popover: { title: 'Pagos Digitales', description: 'Aquí se reflejan todas las transacciones realizadas por QR o Transferencia bancaria.' } },
        { element: '#tour-detalle-estado', popover: { title: 'Estado del Turno', description: 'Te muestra si esta caja ya fue cerrada, incluyendo la hora exacta y las observaciones dejadas por el cajero.' } },
        { element: '#tour-detalle-arqueo', popover: { title: 'Arqueo de Caja', description: 'Detalle exacto de los billetes y monedas contados al momento del cierre. Este monto es el Efectivo Real que tenías físicamente.' } },
      ]
    });

    const activeSteps = driverObj.getConfig().steps?.filter(step => {
      if (typeof step === 'string') return document.querySelector(step) !== null;
      return step.element && document.querySelector(step.element as string) !== null;
    }) || [];

    const dynamicDriver = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: activeSteps
    });
    
    dynamicDriver.drive();
  }

  return { startTour }
}
