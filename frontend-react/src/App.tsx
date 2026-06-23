import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/modules/auth/context/auth.context"
import { ProtectedRoute } from "@/modules/auth/components/protected-route"
import { Loader2 } from "lucide-react"

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/modules/auth/pages/login-page"))
const HomePage = lazy(() => import("@/pages/home-page").then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import("@/pages/dashboard-page").then(m => ({ default: m.DashboardPage })))
const UsuariosPage = lazy(() => import("@/modules/usuarios/pages/usuarios-page").then(m => ({ default: m.UsuariosPage })))
const CajaPage = lazy(() => import("@/modules/caja/pages").then(m => ({ default: m.CajaPage })))
const CajaDetallePage = lazy(() => import("@/modules/caja/pages").then(m => ({ default: m.CajaDetallePage })))
const CajaReportePage = lazy(() => import("@/modules/caja/pages").then(m => ({ default: m.CajaReportePage })))
const ProductosPage = lazy(() => import("@/modules/productos").then(m => ({ default: m.ProductosPage })))
const IngredientesPage = lazy(() => import("@/modules/ingredientes").then(m => ({ default: m.IngredientesPage })))
const PlatosPage = lazy(() => import("@/modules/platos").then(m => ({ default: m.PlatosPage })))
const TransaccionesPage = lazy(() => import("@/modules/transacciones/pages/transacciones-page").then(m => ({ default: m.TransaccionesPage })))
const HistorialTransaccionesPage = lazy(() => import("@/modules/transacciones/pages/historial-transacciones-page").then(m => ({ default: m.HistorialTransaccionesPage })))
const CocinaPage = lazy(() => import("@/modules/cocina/pages").then(m => ({ default: m.CocinaPage })))

const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
    <p className="text-sm font-medium animate-pulse">Cargando aplicación...</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Ruta pública */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/usuarios"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caja"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                  <CajaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caja/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                  <CajaDetallePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caja/reporte"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                  <CajaReportePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/productos"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ingredientes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <IngredientesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/platos"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlatosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ventas"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                  <TransaccionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas/historial"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                  <HistorialTransaccionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cocina"
              element={
                <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                  <CocinaPage />
                </ProtectedRoute>
              }
            />

            {/* Ruta por defecto - redirigir a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Toast notifications */}
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
