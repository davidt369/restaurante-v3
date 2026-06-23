import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useCajaTour() {
  const startTour = () => {
    const isClosed = document.getElementById('tour-caja-abrir-btn') !== null;
    const isOpen = document.getElementById('tour-caja-dashboard-stats') !== null;

    let steps: any[] = [];

    if (isClosed) {
      steps = [
        { element: '#tour-caja-tabs', popover: { title: '1. Pestañas de Navegación', description: 'Aquí puedes ver tu caja actual (para abrirla), o revisar el historial de cierres y gastos pasados.' } },
        { element: '#tour-caja-abrir-fondo', popover: { title: '2. Panel de Billetes y Monedas', description: 'Para iniciar tu turno, debes registrar exactamente cuántos billetes y monedas tienes físicamente en la caja para poder dar cambio a los clientes.' } },
        { element: '#tour-caja-abrir-checkbox', popover: { title: '3. Saldo Anterior', description: 'Si estás recibiendo la caja exactamente con el mismo dinero que dejó el turno anterior, puedes marcar esta casilla para que el sistema rellene los billetes automáticamente.' } },
        { element: '#tour-caja-abrir-btn', popover: { title: '4. Abrir Turno', description: 'Haz clic aquí para oficializar la apertura. A partir de este momento, todas las ventas nuevas se registrarán bajo tu nombre.' } },
      ];
    } else if (isOpen) {
      steps = [
        { element: '#tour-caja-tabs', popover: { title: '1. Navegación Principal', description: 'Usa estas pestañas en cualquier momento para ver tu turno actual o buscar en el historial.' } },
        { element: '#tour-caja-gastos-btn', popover: { title: '2. Botón Registrar Gasto', description: 'Haz clic aquí CADA VEZ que saques dinero físico de la caja (ej. para pagar un proveedor, comprar insumos, etc.). Es vital para que tu cierre cuadre.' } },
        { element: '#tour-caja-btn-reporte', popover: { title: '3. Botón Reporte', description: 'Abre un informe detallado listo para imprimir, mostrando todas las ventas y movimientos de tu turno.' } },
        { element: '#tour-caja-btn-actualizar', popover: { title: '4. Botón Actualizar', description: 'Refresca los datos en la pantalla para asegurarte de estar viendo la última información.' } },
        { element: '#tour-caja-dashboard-stats', popover: { title: '5. Resumen en Tiempo Real', description: 'Estas cuatro tarjetas te muestran: tu fondo inicial, las ventas en efectivo, el total de gastos que has registrado y el EFECTIVO ESPERADO (lo que deberías tener físicamente en la gaveta ahora mismo).' } },
        { element: '#tour-caja-movimientos', popover: { title: '6. Movimientos Recientes', description: 'Una lista rápida de los últimos gastos que has registrado durante este turno.' } },
        { element: '#tour-caja-resumen', popover: { title: '7. Resumen Global', description: 'Un desglose claro que suma el efectivo inicial más las ventas, resta los gastos, y te da el total neto. También muestra el dinero que ha entrado por QR.' } },
        { element: '#tour-caja-conteo-billetes', popover: { title: '8. Cuadre (Paso 1: Conteo Físico)', description: 'AL FINALIZAR TU TURNO: Empieza a contar tus billetes y monedas físicos e ingrésalos uno por uno en estas casillas.' } },
        { element: '#tour-caja-conteo-limpiar', popover: { title: '9. Botón Limpiar', description: 'Si te equivocas contando, usa este botón para borrar todas las casillas y empezar de cero.' } },
        { element: '#tour-caja-conteo-guardar', popover: { title: '10. Botón Guardar Conteo', description: 'Haz clic aquí para guardar tu progreso de conteo. El sistema comparará tu total con el Efectivo Esperado y te dirá si te sobra o falta dinero.' } },
        { element: '#tour-caja-cerrar-definitivo', popover: { title: '11. Cierre Definitivo', description: 'En esta sección, podrás dejar una observación si hubo algún problema, faltante o sobrante de dinero.' } },
        { element: '#tour-caja-cerrar-btn', popover: { title: '12. Botón Final: Cerrar Caja', description: 'Una vez que todo cuadre y el conteo esté guardado, pulsa este botón rojo. ¡Tu turno habrá terminado oficialmente y nadie más podrá registrar ventas!' } },
      ];
    } else {
      steps = [
        { element: '#tour-caja-tabs', popover: { title: 'Pestañas de Navegación', description: 'Usa estas pestañas para alternar entre tu turno actual, el historial de cajas cerradas y el historial general de gastos.' } },
      ];
    }

    const activeSteps = steps.filter(step => {
      if (typeof step === 'string') return document.querySelector(step) !== null;
      return step.element && document.querySelector(step.element as string) !== null;
    });

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
