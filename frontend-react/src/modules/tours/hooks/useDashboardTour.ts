import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useDashboardTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: '#tour-dashboard-datepicker', popover: { title: 'Filtro de Fechas', description: 'Aquí puedes elegir el rango de fechas (Hoy, 7 días, o un mes específico) para ver las estadísticas de ese periodo.' } },
        { element: '#tour-dashboard-refresh', popover: { title: 'Actualizar Datos', description: 'Haz clic aquí para refrescar la información si has registrado ventas recientes.' } },
        { element: '#tour-dashboard-stats', popover: { title: 'Resumen Financiero', description: 'Estas tarjetas te muestran rápidamente tus ingresos totales, los gastos realizados y, lo más importante, tu ganancia neta o real.' } },
        { element: '#tour-dashboard-chart-flujo', popover: { title: 'Flujo de Dinero', description: 'En este gráfico puedes comparar día a día cuánto dinero entró y cuánto salió de tu restaurante.' } },
        { element: '#tour-dashboard-chart-volumen', popover: { title: 'Volumen de Ventas', description: 'Aquí verás la cantidad de tickets o clientes atendidos por cada día del periodo seleccionado.' } },
        { element: '#tour-dashboard-chart-productos', popover: { title: 'Productos Estrella', description: 'Descubre cuáles son los 5 platos o bebidas más vendidos.' } },
        { element: '#tour-dashboard-chart-utilidad', popover: { title: 'Utilidad Real', description: 'Este gráfico te muestra la ganancia pura de cada día (Ingresos menos Gastos).' } },
        { element: '#tour-dashboard-operador', popover: { title: 'Operador Actual', description: 'Muestra quién está usando el sistema en este momento (tu perfil).' } },
        { element: '#tour-dashboard-historial', popover: { title: 'Actividad Reciente', description: 'Aquí puedes ver las últimas notas cerradas y el monto de cada venta en tiempo real.' } },
      ]
    });
    
    driverObj.drive();
  }

  return { startTour }
}
