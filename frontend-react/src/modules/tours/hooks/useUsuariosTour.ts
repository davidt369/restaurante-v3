import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function useUsuariosTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        { element: '#tour-usuarios-btn-nuevo', popover: { title: '1. Crear Nuevo Usuario', description: 'Haz clic aquí para agregar un nuevo usuario al sistema. Podrás asignarle un nombre de usuario, contraseña y definir su rol (Administrador o Cajero).' } },
        { element: '#tour-usuarios-btn-actualizar', popover: { title: '2. Refrescar Lista', description: 'Usa este botón para actualizar la tabla si crees que alguien más ha hecho cambios o agregado usuarios recientemente.' } },
        { element: '#tour-usuarios-tabla', popover: { title: '3. Lista de Usuarios', description: 'Aquí se muestran todos los usuarios registrados en el sistema, junto con sus roles y fechas de creación.' } },
        { element: '#tour-usuarios-acciones', popover: { title: '4. Acciones Individuales', description: 'En cada fila verás este menú de opciones. Al hacer clic, podrás Editar la información del usuario o Eliminarlo por completo del sistema.' } },
      ]
    });
    
    driverObj.drive();
  }

  return { startTour }
}
