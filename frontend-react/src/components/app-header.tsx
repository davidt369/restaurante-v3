import AppUser from "./app-user"
import { SidebarTrigger } from "./ui/sidebar"
import { useLocation } from "react-router-dom"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Sun, Moon, HelpCircle, Compass, LayoutDashboard } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useAppTour } from "@/modules/tours/hooks/useAppTour"
import { useDashboardTour } from "@/modules/tours/hooks/useDashboardTour"
import { useCajaTour } from "@/modules/tours/hooks/useCajaTour"
import { useCajaDetalleTour } from "@/modules/tours/hooks/useCajaDetalleTour"
import { useUsuariosTour } from "@/modules/tours/hooks/useUsuariosTour"
import { useIngredientesTour } from "@/modules/tours/hooks/useIngredientesTour"
import { usePlatosTour } from "@/modules/tours/hooks/usePlatosTour"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
const routeTitles: Record<string, string> = {
  "/dashboard": "Panel de Control",
  "/dashboard/usuarios": "Gestión de Usuarios",
  "/dashboard/productos": "Gestión de Productos",
  "/dashboard/ingredientes": "Gestión de Ingredientes",
  "/dashboard/platos": "Platos y Recetas",
  "/dashboard/mesas": "Gestión de Mesas",
  "/dashboard/ordenes": "Órdenes",
  "/dashboard/configuracion": "Configuración",
  "/caja": "Control de Caja",
  "/caja/reporte": "Reportes de Caja",
  "/dashboard/ventas": "Realizar Ventas",
  "/ventas/historial": "Historial de Ventas",
}

export default function AppHeader() {
  const location = useLocation()
  const title = routeTitles[location.pathname]
  const { theme, toggleTheme } = useTheme()

  const { startTour: startAppTour } = useAppTour()
  const { startTour: startDashboardTour } = useDashboardTour()
  const { startTour: startCajaTour } = useCajaTour()
  const { startTour: startCajaDetalleTour } = useCajaDetalleTour()
  const { startTour: startUsuariosTour } = useUsuariosTour()
  const { startTour: startIngredientesTour } = useIngredientesTour()
  const { startTour: startPlatosTour } = usePlatosTour()

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ver Tutoriales"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tutoriales Interactivos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={startAppTour} className="cursor-pointer">
              <Compass className="mr-2 h-4 w-4" />
              <span>Navegación General</span>
            </DropdownMenuItem>
            
            {location.pathname === "/dashboard" && (
              <DropdownMenuItem onClick={startDashboardTour} className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Métricas del Dashboard</span>
              </DropdownMenuItem>
            )}

            {location.pathname === "/dashboard/usuarios" && (
              <DropdownMenuItem onClick={startUsuariosTour} className="cursor-pointer">
                <Compass className="mr-2 h-4 w-4" />
                <span>Gestión de Usuarios</span>
              </DropdownMenuItem>
            )}

            {location.pathname === "/dashboard/ingredientes" && (
              <DropdownMenuItem onClick={startIngredientesTour} className="cursor-pointer">
                <Compass className="mr-2 h-4 w-4" />
                <span>Inventario de Ingredientes</span>
              </DropdownMenuItem>
            )}

            {location.pathname === "/dashboard/platos" && (
              <DropdownMenuItem onClick={startPlatosTour} className="cursor-pointer">
                <Compass className="mr-2 h-4 w-4" />
                <span>Gestión de Platos y Recetas</span>
              </DropdownMenuItem>
            )}

            {location.pathname === "/caja" && (
              <DropdownMenuItem onClick={startCajaTour} className="cursor-pointer">
                <Compass className="mr-2 h-4 w-4" />
                <span>Gestión de Caja</span>
              </DropdownMenuItem>
            )}

            {location.pathname.startsWith("/caja/") && location.pathname !== "/caja/reporte" && (
              <DropdownMenuItem onClick={startCajaDetalleTour} className="cursor-pointer">
                <Compass className="mr-2 h-4 w-4" />
                <span>Detalles de Cierre</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          id="tour-nav-theme-toggle"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <AppUser />
      </div>
    </header>
  )
}

