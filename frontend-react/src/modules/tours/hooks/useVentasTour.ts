import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useVentasTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: '#tour-ventas-nueva', popover: { title: '1. Nueva Venta / Pedido', description: 'Usa este botón para registrar una nueva orden. Podrás seleccionar la mesa, asignar el cliente y añadir todos los platos que desee.' } },
        { element: '#tour-ventas-historial', popover: { title: '2. Historial General', description: 'Si necesitas buscar una venta de un día anterior o un turno cerrado, aquí encontrarás todo el registro histórico.' } },
        { element: '#tour-ventas-tabs', popover: { title: '3. Flujo de Trabajo (Kanban)', description: 'El corazón del sistema. Aquí se organizan todas las órdenes activas en tiempo real, divididas en etapas para que no pierdas el control de ninguna mesa.' } },
        { element: '#tour-ventas-tab-pendiente', popover: { title: '4. Pendientes', description: 'Aquí aparecen los pedidos recién creados. Estos pedidos aún no han sido cobrados ni están siendo preparados por la cocina.' } },
        { element: '#tour-ventas-tab-cocina', popover: { title: '5. Vista de Cocina', description: 'Esta pestaña es especial para el Chef. Muestra cronómetros y alertas en rojo si un pedido está tardando mucho. Desde aquí el cocinero pulsa "Terminar" cuando el plato está listo.' } },
        { element: '#tour-ventas-cocina-terminar', popover: { title: '6. Terminar Pedido', description: 'Botón exclusivo de la vista Cocina. El Chef presiona este botón para marcar que la orden está lista, moviendo el pedido automáticamente a la pestaña de "Abiertos".' } },
        { element: '#tour-ventas-tab-abierto', popover: { title: '7. Abiertos (Comiendo)', description: 'Aquí se mueven automáticamente los pedidos que ya salieron de la cocina. Son mesas que están consumiendo y que en cualquier momento pedirán la cuenta.' } },
        { element: '#tour-ventas-tab-cerrado', popover: { title: '8. Cerrados (Pagados)', description: 'Una vez que una mesa paga la cuenta, el pedido se mueve aquí. Estos ya no requieren ninguna acción y son parte del ingreso del día.' } },
        { element: '#tour-ventas-tab-todos', popover: { title: '9. Todos los Pedidos', description: 'Si necesitas buscar algo específico sin importar su estado actual, esta pestaña te muestra la lista completa de pedidos del turno activo.' } },
        { element: '#tour-ventas-acciones', popover: { title: '10. Acciones Rápidas', description: 'En cada fila de pedido, tienes una columna de acciones directas. Veamos cada botón en detalle...' } },
        { element: '#tour-ventas-btn-ver', popover: { title: '11. Ver Detalles (Ojo)', description: 'Abre una vista completa donde puedes ver qué pidió la mesa, agregar "Extras" (ej: Sin cebolla, extra queso) y ver el estado individual de cada plato.' } },
        { element: '#tour-ventas-btn-pagar', popover: { title: '12. Pagar Cuenta', description: '¡El botón más importante! Te permite cobrar la mesa total o parcialmente con múltiples métodos (Efectivo, Tarjeta, QR, etc.).' } },
        { element: '#tour-ventas-btn-editar', popover: { title: '13. Editar Venta (Lápiz)', description: 'Si el mesero olvidó agregar un plato, puede entrar aquí para sumar más cosas a la orden activa de la mesa.' } },
        { element: '#tour-ventas-btn-eliminar', popover: { title: '14. Eliminar Venta (Basurero)', description: 'En caso de que el pedido haya sido un error total y deba anularse, usa este botón. Quedará un registro interno de que fue anulado.' } },
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
