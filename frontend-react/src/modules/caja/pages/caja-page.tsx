import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cajaService } from '../services/caja.service';
import { type CajaTurnoResponse, type GastoCajaResponse } from '../types/caja.types';
import { AbrirCajaForm } from '../components/abrir-caja-form';
import { CajaDashboard } from '../components/caja-dashboard';
import { HistorialCajasTable } from '../components/historial-cajas-table';
import { HistorialGastosTable } from '../components/historial-gastos-table';
import { Archive, DollarSign, History, Lock } from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard-layout';

type TabValue = 'gestion' | 'historial-cajas' | 'historial-gastos';

const tabsConfig = {
  'gestion': { label: 'Caja Actual', icon: DollarSign },
  'historial-cajas': { label: 'Historial Cierres', icon: Archive },
  'historial-gastos': { label: 'Historial Gastos', icon: History },
} as const;

export function CajaPage() {
  const [cajaAbierta, setCajaAbierta] = useState<CajaTurnoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('gestion');

  const [historialCajas, setHistorialCajas] = useState<CajaTurnoResponse[]>([]);
  const [historialGastos, setHistorialGastos] = useState<GastoCajaResponse[]>([]);

  const fetchEstadoCaja = async () => {
    try {
      setLoading(true);
      const data = await cajaService.obtenerCajaAbierta();
      setCajaAbierta(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const [cajas, gastos] = await Promise.all([
        cajaService.obtenerHistorial(),
        cajaService.obtenerHistorialGastos()
      ]);
      setHistorialCajas(cajas);
      setHistorialGastos(gastos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchEstadoCaja();
    loadHistory();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    if (value !== 'gestion') {
      loadHistory();
    }
  };

  const tabOrder: TabValue[] = ['gestion', 'historial-cajas', 'historial-gastos'];

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-5 w-[260px]" />
          </div>
        </div>
        <Skeleton className="h-10 w-full lg:w-[450px]" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestión Financiera</h2>
            <p className="text-muted-foreground">
              Control de caja, turnos y movimientos económicos.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList id="tour-caja-tabs" className="w-full lg:w-auto">
            {tabOrder.map((tab) => {
              const Icon = tabsConfig[tab].icon;
              return (
                <TabsTrigger key={tab} value={tab} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{tabsConfig[tab].label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent id="tour-caja-content" value="gestion" className="space-y-6 focus-visible:outline-none">
            {cajaAbierta ? (
              <CajaDashboard
                caja={cajaAbierta}
                onCajaCerrada={() => {
                  fetchEstadoCaja();
                  loadHistory();
                }}
                onRefreshCaja={fetchEstadoCaja}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">Caja Cerrada</h3>
                  <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">
                    No hay un turno activo en este momento. Inicia el conteo para comenzar.
                  </p>
                  <AbrirCajaForm onCajaOpened={fetchEstadoCaja} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="historial-cajas" className="focus-visible:outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Bitácora de Turnos</CardTitle>
                <CardDescription>Auditoría completa de aperturas y cierres.</CardDescription>
              </CardHeader>
              <CardContent>
                <HistorialCajasTable cajas={historialCajas} isLoading={loadingHistory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial-gastos" className="focus-visible:outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Egresos</CardTitle>
                <CardDescription>Detalle cronológico de todos los gastos de caja.</CardDescription>
              </CardHeader>
              <CardContent>
                <HistorialGastosTable gastos={historialGastos} isLoading={loadingHistory} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
