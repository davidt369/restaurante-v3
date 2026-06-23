import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useAppTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: 'header h1', popover: { title: 'Bienvenido', description: 'Este es tu panel principal. Aquí verás el título de la sección en la que te encuentras.', side: "bottom", align: 'start' } },
        { element: '#tour-nav-theme-toggle', popover: { title: 'Modo Oscuro', description: 'Cambia entre el modo claro y oscuro de la aplicación según tu preferencia.' } },
        { element: '#tour-nav-user-menu', popover: { title: 'Tu Perfil', description: 'Aquí puedes ver tu nombre de usuario y rol. Al dar clic se abre un menú con el botón para Cerrar Sesión.' } },
        { element: '#tour-nav-dashboard', popover: { title: 'Panel de Control', description: 'Aquí puedes ver el resumen estadístico de tu negocio.' } },
        { element: '#tour-nav-caja', popover: { title: 'Control de Caja', description: 'Abre o cierra tu caja y gestiona el dinero ingresado.' } },
        { element: '#tour-nav-dashboard-usuarios', popover: { title: 'Usuarios', description: 'Crea y gestiona los accesos de tus empleados (Cajeros, etc).' } },
        { element: '#tour-nav-dashboard-productos', popover: { title: 'Productos', description: 'Gestiona productos que vendes directamente (como jugos o Coca cola).' } },
        { element: '#tour-nav-dashboard-ingredientes', popover: { title: 'Ingredientes', description: 'Controla el stock de los ingredientes que usas para cocinar.' } },
        { element: '#tour-nav-dashboard-platos', popover: { title: 'Platos o Recetas', description: 'Crea tu menú, establece precios y asigna los ingredientes que consume cada plato.' } },
        { element: '#tour-nav-dashboard-ventas', popover: { title: 'Punto de Venta', description: 'Pantalla principal para tomar los pedidos de tus clientes.' } },
        { element: '#tour-nav-dashboard-cocina', popover: { title: 'Monitor de Cocina', description: 'Pantalla en vivo para que los cocineros vean los pedidos entrantes.' } },
        { element: '#tour-nav-ventas-historial', popover: { title: 'Historial de Ventas', description: 'Consulta tickets anteriores y cuadre de tus ventas pasadas.' } },

      ]
    });

    driverObj.drive();
  }

  return { startTour }
}
