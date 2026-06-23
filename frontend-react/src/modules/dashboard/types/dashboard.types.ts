export interface ActividadItem {
  id: number
  concepto: string
  mesa: string | null
  estado: string
  monto_total: string
  hora: string
}

export interface ChartDataPoint {
  fecha: string
  ingresos: number
  gastos: number
  ganancia: number
  ventas: number
}

export interface DistributionItem {
  nombre: string
  valor: number
}

export interface DashboardStats {
  totalUsuarios: number
  totalProductos: number
  totalPlatos: number
  transaccionesPeriodo: number
  ordenesAbiertas: number
  ingresosPeriodo: string
  gastosPeriodo: string
  gananciaNeta: string
  actividadReciente: ActividadItem[]
  charts: {
    dailyPerformance: ChartDataPoint[]
    paymentMethods: DistributionItem[]
    topItems: DistributionItem[]
  }
}
