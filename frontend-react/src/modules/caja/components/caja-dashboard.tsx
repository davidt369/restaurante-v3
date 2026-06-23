import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CajaTurnoResponse, ResumenCierre } from '../types/caja.types';
import { cajaService } from '../services/caja.service';
import { RegistrarGastoDialog } from './registrar-gasto-dialog';
import { RegistrarConteoCard } from './registrar-conteo-card';
import { ArrowDownCircle, ArrowUpCircle, Wallet, CreditCard, RefreshCw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { transaccionesService } from '../../transacciones/services/transacciones.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate, formatTime } from '@/utils/date-format';

interface DineroValues {
  b200?: number;
  b100?: number;
  b50?: number;
  b20?: number;
  b10?: number;
  b5?: number;
  m2?: number;
  m1?: number;
  m050?: number;
  m020?: number;
  m010?: number;
}

interface CajaDashboardProps {
  caja: CajaTurnoResponse;
  onCajaCerrada: () => void;
  onRefreshCaja: () => void;
}

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subValue?: string | React.ReactNode;
  highlight?: boolean;
  className?: string;
}

function StatusCard({ title, value, icon, subValue, highlight, className }: StatusCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
          Bs {value.toFixed(2)}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground mt-1">
            {subValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

export function CajaDashboard({ caja, onCajaCerrada, onRefreshCaja }: CajaDashboardProps) {
  const [resumen, setResumen] = useState<ResumenCierre | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const navigate = useNavigate();

  const fetchResumen = async () => {
    try {
      setLoading(true);
      const [data, transacciones] = await Promise.all([
        cajaService.obtenerResumenCierre(),
        transaccionesService.getByCaja(caja.id),
      ]);
      setResumen(data);
      // Verifica pedidos pendientes en tiempo real para habilitar/deshabilitar cierre
      setHasPendingOrders(
        transacciones.some(
          t =>
            t.estado !== 'anulado' && // Ignorar anulados
            (
              t.estado === 'abierto' ||
              (t.estado === 'pendiente' && Number(t.monto_total) > 0) || // Solo si tiene monto
              Number(t.monto_pendiente) > 0.01 || // Diferencia por decimales
              t.estado_cocina === 'pendiente'
            ),
        ),
      );
    } catch (error) {
      console.error('Error al cargar resumen', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, [caja.id]);

  type CerrarCajaPayload = {
    b200?: number; b100?: number; b50?: number; b20?: number; b10?: number;
    b5?: number; m2?: number; m1?: number; m050?: number; m020?: number; m010?: number;
    cierre_obs?: string;
  };

  const handleCerrarCaja = async (valores: CerrarCajaPayload) => {
    try {
      await cajaService.cerrarCaja({
        b200: valores.b200 ?? 0,
        b100: valores.b100 ?? 0,
        b50: valores.b50 ?? 0,
        b20: valores.b20 ?? 0,
        b10: valores.b10 ?? 0,
        b5: valores.b5 ?? 0,
        m2: valores.m2 ?? 0,
        m1: valores.m1 ?? 0,
        m050: valores.m050 ?? 0,
        m020: valores.m020 ?? 0,
        m010: valores.m010 ?? 0,
        cierre_obs: valores.cierre_obs,
      });
      onCajaCerrada();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message ?? 'Error al cerrar la caja';
      // Re-lanzamos para que el componente hijo lo maneje con toast
      throw new Error(msg);
    }
  };

  const handleConteoGuardado = async (values: DineroValues, total: number) => {
    try {
      setLoading(true);
      await cajaService.guardarArqueo(caja.id, values);
      toast.success('Arqueo guardado exitosamente', {
        description: `Total contado: Bs ${total.toFixed(2)}`
      });
      fetchResumen();
      onRefreshCaja();
    } catch (error) {
      console.error('Error al guardar arqueo', error);
      toast.error('No se pudo guardar el arqueo');
    } finally {
      setLoading(false);
    }
  };

  if (!resumen && loading) return <DashboardSkeleton />;

  if (!resumen) return <div>Error al cargar información de la caja.</div>;

  const { resumen: datos, gastos } = resumen;

  const yaArqueado =
    caja.b200 !== null || caja.b100 !== null || caja.b50 !== null ||
    caja.b20 !== null || caja.b10 !== null || caja.b5 !== null ||
    caja.m2 !== null || caja.m1 !== null || caja.m050 !== null ||
    caja.m020 !== null || caja.m010 !== null;

  const valoresIniciales: DineroValues = {
    b200: caja.b200 ?? 0,
    b100: caja.b100 ?? 0,
    b50: caja.b50 ?? 0,
    b20: caja.b20 ?? 0,
    b10: caja.b10 ?? 0,
    b5: caja.b5 ?? 0,
    m2: caja.m2 ?? 0,
    m1: caja.m1 ?? 0,
    m050: caja.m050 ?? 0,
    m020: caja.m020 ?? 0,
    m010: caja.m010 ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Caja Abierta</h2>
            <Badge variant="default" className="bg-success">Activa</Badge>
            {yaArqueado && <Badge variant="secondary" className="bg-info-bg text-info border-info-border">Arqueada</Badge>}
          </div>
          <p className="text-muted-foreground capitalize mt-1">
            {formatDate(caja.fecha)} • Hora apertura: {formatTime(caja.hora_apertura)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div id="tour-caja-gastos-btn">
            <RegistrarGastoDialog onGastoRegistrado={fetchResumen} />
          </div>
          <Button id="tour-caja-btn-reporte" variant="outline" onClick={() => navigate('/caja/reporte')} className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Reporte</span>
          </Button>
          <Button id="tour-caja-btn-actualizar" variant="outline" onClick={fetchResumen} className="gap-2" disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

        </div>
      </div>

      <div id="tour-caja-dashboard-stats" className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Fondo Inicial"
          value={datos.monto_inicial}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatusCard
          title="Ventas Efectivo"
          value={datos.ventas_efectivo}
          icon={<ArrowUpCircle className="h-4 w-4 text-success" />}
          subValue={`+ ${datos.ventas_qr.toFixed(2)} QR`}
        />
        <StatusCard
          title="Gastos/Salidas"
          value={datos.total_gastos}
          icon={<ArrowDownCircle className="h-4 w-4 text-destructive" />}
          className="border-destructive/20 dark:border-destructive/40"
        />
        <StatusCard
          title="Efectivo Esperado"
          value={datos.efectivo_esperado}
          icon={<Wallet className="h-4 w-4 text-primary" />}
          highlight
        />
      </div>



      <div className="grid gap-4 lg:grid-cols-2">
        <Card id="tour-caja-movimientos">
          <CardHeader>
            <CardTitle>Movimientos Recientes (Gastos)</CardTitle>
            <CardDescription>Últimos gastos registrados en este turno.</CardDescription>
          </CardHeader>
          <CardContent>
            {gastos.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No hay gastos registrados hoy.
              </p>
            ) : (
              <div className="space-y-3">
                {gastos.slice(0, 5).map((gasto) => (
                  <div key={gasto.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{gasto.descripcion}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={gasto.metodo_pago === 'efectivo' ? 'secondary' : 'outline'} className="text-[10px] h-5 px-1">
                          {gasto.metodo_pago === 'efectivo' ? 'Efectivo' : 'QR'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(gasto.creado_en)}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-destructive">
                      - Bs {gasto.monto.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="tour-caja-resumen">
          <CardHeader>
            <CardTitle>Resumen Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ventas Totales</span>
              <span className="font-bold">Bs {datos.total_del_dia.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Efectivo (Inicial + Ventas)</span>
                <span>{(datos.monto_inicial + datos.ventas_efectivo).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Gastos Efectivo</span>
                <span>- {datos.gastos_efectivo.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Debe haber en Caja</span>
                <span className="text-primary">Bs {datos.efectivo_esperado.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-2"><CreditCard className="w-3 h-3" /> Total QR</span>
                <span>{datos.total_qr.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div id="tour-caja-cerrar-conteo">
        <RegistrarConteoCard
          efectivoEsperado={datos.efectivo_esperado}
        onGuardar={handleConteoGuardado}
        onCerrarCaja={handleCerrarCaja}
        valoresIniciales={valoresIniciales}
        yaArqueado={yaArqueado}
        hasPendingOrders={hasPendingOrders}
        />
      </div>
    </div>
  );
}
