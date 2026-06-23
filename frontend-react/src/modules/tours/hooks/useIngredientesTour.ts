import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useIngredientesTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: '#tour-ingredientes-btn-nuevo', popover: { title: '1. Agregar Ingrediente', description: 'Usa este botón para registrar un nuevo ingrediente en el inventario. Deberás indicar su nombre, cantidad actual, unidad de medida (kg, lt, etc.) y su cantidad mínima permitida.' } },
        { element: '#tour-ingredientes-tabla', popover: { title: '2. Tabla de Inventario', description: 'Aquí podrás ver todos los ingredientes. Presta especial atención a la columna de "Estado", la cual te avisará automáticamente si algún ingrediente está por debajo de su cantidad mínima (Bajo Stock).' } },
        { element: '#tour-ingredientes-acciones', popover: { title: '3. Acciones Rápidas', description: 'Desde estos botones puedes Editar rápidamente la cantidad de un ingrediente después de una compra, o Eliminarlo si ya no se utilizará en el restaurante.' } },
      ]
    });
    
    driverObj.drive();
  }

  return { startTour }
}
