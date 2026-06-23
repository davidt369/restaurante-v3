import { useState } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/layouts/dashboard-layout";
import {
  Users,
  ClipboardList,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Calendar as CalendarIcon,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/modules/dashboard/hooks/use-dashboard-stats";
import { format, startOfMonth, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const estadoBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendiente: "secondary",
  abierto: "default",
  cerrado: "outline",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl shadow-slate-900/10 min-w-[150px]">
        <p className="text-xs font-bold mb-2 text-muted-foreground uppercase tracking-wider">
          {label ? format(new Date(label + "T12:00:00"), "EEEE dd 'de' MMMM", { locale: es }) : ''}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-[11px] font-medium opacity-80 capitalize">{entry.name}:</span>
              </div>
              <span className="text-[11px] font-bold">
                {entry.name === 'ventas' ? entry.value : `Bs ${Number(entry.value).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { usuario } = useAuth();

  // Rango de fechas por defecto: Últimos 30 días
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { stats, isLoading, refetch } = useDashboardStats({
    startDate: format(dateRange.from, "yyyy-MM-dd"),
    endDate: format(dateRange.to, "yyyy-MM-dd"),
  });

  const statCards = [
    {
      title: "Ventas Totales (Dinero)",
      value: `Bs ${Number(stats?.ingresosPeriodo ?? 0).toFixed(2)}`,
      description: "Total de dinero recaudado por ventas finalizadas",
      icon: DollarSign,
      trend: "revenue",
    },
    {
      title: "Gastos (Salidas)",
      value: `Bs ${Number(stats?.gastosPeriodo ?? 0).toFixed(2)}`,
      description: "Suma de todos los egresos y compras del periodo",
      icon: ArrowDownRight,
      trend: "expense",
    },
    {
      title: "Ganancia Real (Bolsillo)",
      value: `Bs ${Number(stats?.gananciaNeta ?? 0).toFixed(2)}`,
      description: "Dinero neto tras restar gastos a las ventas",
      icon: Wallet,
      trend: "profit",
    },
    {
      title: "Cantidad de Ventas",
      value: stats?.transaccionesPeriodo ?? 0,
      description: "Número total de clientes atendidos/notas cerradas",
      icon: ClipboardList,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header con Filtro de Fecha */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Analítica del Restaurante
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Visualiza el crecimiento y la rentabilidad real de tu restaurante.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">

            <Popover>
              <PopoverTrigger asChild>
                <Button id="tour-dashboard-datepicker" variant="outline" className="w-[280px] justify-start text-left font-normal border-indigo-100 hover:border-indigo-300 transition-colors">
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd LLL", { locale: es })} -{" "}
                        {format(dateRange.to, "dd LLL, yyyy", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, yyyy", { locale: es })
                    )
                  ) : (
                    <span>Seleccionar periodo</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-2 border-b flex justify-between gap-2 overflow-x-auto">
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: new Date(), to: new Date() })}>Hoy</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}>7d</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: startOfMonth(new Date()), to: new Date() })}>Mes</Button>
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => range && setDateRange({ from: range.from || dateRange.from, to: range.to || range.from || dateRange.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              id="tour-dashboard-refresh"
              variant="default"
              size="icon"
              onClick={refetch}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Métrica Headline - Dinero Real */}
        <div id="tour-dashboard-stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <div className={cn(
                "h-1.5 w-full",
                stat.trend === 'profit' && "bg-emerald-500",
                stat.trend === 'expense' && "bg-rose-500",
                stat.trend === 'revenue' && "bg-indigo-500",
                !stat.trend && "bg-slate-200"
              )} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn(
                  "h-5 w-5",
                  stat.trend === 'profit' && "text-emerald-500",
                  stat.trend === 'expense' && "text-rose-500",
                  stat.trend === 'revenue' && "text-indigo-500",
                  !stat.trend && "text-slate-400"
                )} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos Principales */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Gráfico 1: Ganancia Neta (Área) */}
          <Card id="tour-dashboard-chart-flujo" className="lg:col-span-2 shadow-sm border-indigo-50/50">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl italic font-bold">Flujo de Dinero</CardTitle>
                  <CardDescription className="text-indigo-600 font-medium">Comparativa detallada de cuánto entra y cuánto sale</CardDescription>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold text-indigo-700">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-rose-700">Gastos</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] mt-4">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.charts.dailyPerformance ?? []}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="fecha"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickFormatter={(val) => format(new Date(val + "T12:00:00"), "dd MMM", { locale: es })}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickFormatter={(val) => `Bs ${val}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="ingresos" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                    <Area type="monotone" dataKey="gastos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico 2: Cantidad de Ventas (Volumen) */}
          <Card id="tour-dashboard-chart-volumen" className="shadow-sm border-indigo-50/50">
            <CardHeader>
              <CardTitle className="text-xl italic font-bold">Volumen de Ventas</CardTitle>
              <CardDescription className="text-violet-600 font-medium">Cantidad de notas/ventas finalizadas por día</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts.dailyPerformance ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="fecha"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickFormatter={(val) => format(new Date(val + "T12:00:00"), "dd", { locale: es })}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ventas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico 3: Top Productos (Pareto) */}
          <Card id="tour-dashboard-chart-productos" className="lg:col-span-1 shadow-sm border-indigo-50/50">
            <CardHeader>
              <CardTitle className="text-xl italic font-bold">Productos Estrella</CardTitle>
              <CardDescription className="text-blue-600 font-medium">Los 5 productos más vendidos este periodo</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts.topItems} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="nombre" type="category" width={80} axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '500' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} fill="#6366f1" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico 4: Ganancia Neta Real (Utilidad Bar) */}
          <Card id="tour-dashboard-chart-utilidad" className="lg:col-span-2 shadow-sm border-indigo-50/50">
            <CardHeader>
              <CardTitle className="text-xl italic font-bold text-emerald-700">Utilidad Real (Ganancia)</CardTitle>
              <CardDescription className="text-emerald-600 font-medium text-sm">Lo que queda libre tras pagar todos los gastos de cada día</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts.dailyPerformance ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="fecha"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickFormatter={(val) => format(new Date(val + "T12:00:00"), "dd", { locale: es })}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ganancia" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer: Operador e Historial */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Información del usuario */}
          <Card id="tour-dashboard-operador" className="shadow-sm border-none bg-indigo-50/20">
            <CardHeader>
              <CardTitle className="text-lg italic font-bold">Operador Actual</CardTitle>
              <CardDescription className="text-indigo-600 font-medium text-xs">Sesión de trabajo activa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg uppercase border border-indigo-200">
                  {usuario?.nombre?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-primary">{usuario?.nombre}</p>
                  <p className="text-[10px] text-primary uppercase tracking-widest font-semibold">@{usuario?.nombre_usuario}</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground">Cargo:</span>
                  <Badge className="bg-secondary1 capitalize py-0 px-2 text-[10px]">
                    {usuario?.rol}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground">Estado:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En línea
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Ventas */}
          <Card id="tour-dashboard-historial" className="md:col-span-2 shadow-sm overflow-hidden border-indigo-100">
            <CardHeader >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg italic font-bold text-primary">Historial Detallado del Periodo</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-xs">
                    Listado de notas cerradas en el rango de fechas
                  </CardDescription>
                </div>
                <Users className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full" />
                  ))}
                </div>
              ) : (stats?.actividadReciente?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm italic">Sin transacciones registradas</p>
                </div>
              ) : (
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {stats?.actividadReciente.map((actividad) => (
                    <div
                      key={actividad.id}
                      className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-700 truncate">
                          {actividad.concepto}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {actividad.mesa && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight border border-indigo-100">
                              {actividad.mesa}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground italic">
                            {format(new Date(actividad.hora), "dd/MM HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <Badge
                          variant={
                            estadoBadgeVariant[actividad.estado] ?? "secondary"
                          }
                          className={cn(
                            "capitalize text-[10px] px-2 py-0 min-w-[70px] justify-center",
                            actividad.estado === 'cerrado' && "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50"
                          )}
                        >
                          {actividad.estado}
                        </Badge>
                        <span className="text-base font-bold text-slate-900 tabular-nums">
                          Bs {Number(actividad.monto_total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
