import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function usePlatosTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: '#tour-platos-btn-nuevo', popover: { title: '1. Agregar Plato al Menú', description: 'Usa este botón para crear un nuevo plato. Deberás ingresar su nombre, una descripción corta y el precio de venta al público.' } },
        { element: '#tour-platos-tabla', popover: { title: '2. Listado de Platos', description: 'Aquí verás todos los platos que actualmente ofreces. En la columna "Ingredientes", si pasas el ratón por encima del icono de cubiertos, verás rápidamente la receta.' } },
        { element: '#tour-platos-hover-ingredientes', popover: { title: '3. Vista Rápida', description: '¡Pasa el ratón sobre este ícono para ver una previsualización de los ingredientes asociados a este plato sin tener que entrar a editarlo!' } },
        { element: '#tour-platos-ingredientes-btn', popover: { title: '4. Construir la Receta', description: '¡Este botón es crucial! Haz clic aquí para definir qué ingredientes (y en qué cantidades) componen este plato. Cada vez que vendas este plato, el sistema descontará automáticamente esos ingredientes de tu inventario.' } },
        { element: '#tour-platos-acciones', popover: { title: '5. Acciones Generales', description: 'Además de gestionar los ingredientes, desde aquí puedes Editar el nombre o el precio del plato, y Eliminarlo si ya no lo venderás más.' } },
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
