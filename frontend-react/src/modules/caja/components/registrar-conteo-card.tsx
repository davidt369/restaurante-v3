import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Banknote,
  Coins,
  Check,
  AlertTriangle,
  Lock,
  Info,
  CheckCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DineroKey =
  | 'b200'
  | 'b100'
  | 'b50'
  | 'b20'
  | 'b10'
  | 'b5'
  | 'm2'
  | 'm1'
  | 'm050'
  | 'm020'
  | 'm010';

interface DineroExtra {
  key: DineroKey;
  label: string;
  valor: number;
}

const BILLETES: DineroExtra[] = [
  { key: 'b200', label: 'Bs 200', valor: 200 },
  { key: 'b100', label: 'Bs 100', valor: 100 },
  { key: 'b50', label: 'Bs 50', valor: 50 },
  { key: 'b20', label: 'Bs 20', valor: 20 },
  { key: 'b10', label: 'Bs 10', valor: 10 },
];

const MONEDAS: DineroExtra[] = [
  { key: 'b5', label: 'Bs 5', valor: 5 },
  { key: 'm2', label: 'Bs 2', valor: 2 },
  { key: 'm1', label: 'Bs 1', valor: 1 },
  { key: 'm050', label: 'Bs 0.50', valor: 0.5 },
  { key: 'm020', label: 'Bs 0.20', valor: 0.2 },
  { key: 'm010', label: 'Bs 0.10', valor: 0.1 },
];

type ConteoDineroValues = {
  [K in DineroKey]?: number;
};

interface RegistrarConteoCardProps {
  valoresIniciales?: ConteoDineroValues;
  efectivoEsperado: number;
  /** Guarda el arqueo parcial en la BD sin cerrar la caja */
  onGuardar: (valores: ConteoDineroValues, total: number) => Promise<void>;
  /** Cierra la caja definitivamente */
  onCerrarCaja: (valores: ConteoDineroValues & { cierre_obs?: string }) => Promise<void>;
  className?: string;
  yaArqueado?: boolean;
  /** Si hay pedidos pendientes, desactivar el botón de cierre */
  hasPendingOrders?: boolean;
}

export function RegistrarConteoCard({
  valoresIniciales,
  efectivoEsperado,
  onGuardar,
  onCerrarCaja,
  className,
  yaArqueado,
  hasPendingOrders,
}: RegistrarConteoCardProps) {
  const [values, setValues] = useState<ConteoDineroValues>(
    valoresIniciales ?? {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    },
  );
  const [cierreObs, setCierreObs] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (valoresIniciales) setValues(valoresIniciales);
  }, [valoresIniciales]);

  useEffect(() => {
    if (yaArqueado !== undefined) setSaved(yaArqueado);
  }, [yaArqueado]);

  const calcularTotal = () => {
    let total = 0;
    [...BILLETES, ...MONEDAS].forEach(({ key, valor }) => {
      total += (values[key] ?? 0) * valor;
    });
    return total;
  };

  const handleChange = (key: DineroKey, value: string) => {
    setSaved(false);
    setValues(prev => ({
      ...prev,
      [key]: value === '' ? 0 : parseFloat(value) || 0,
    }));
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      const total = calcularTotal();
      await onGuardar(values, total);
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCierre = async () => {
    setIsClosing(true);
    try {
      await onCerrarCaja({ ...values, cierre_obs: cierreObs });
      toast.success('Caja cerrada exitosamente');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message ?? 'Error al cerrar la caja');
    } finally {
      setIsClosing(false);
      setShowConfirmDialog(false);
    }
  };

  const total = calcularTotal();
  const diferencia = total - efectivoEsperado;
  const esExacto = Math.abs(diferencia) < 0.01;
  const esSobrante = diferencia > 0;
  const esFaltante = diferencia < 0;

  return (
    <>
      {/* ── Sección de cuadre ──────────────────────────────── */}
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Cuadre de Caja</CardTitle>
            </div>
            {saved && (
              <Badge variant="outline" className="bg-success-bg text-success border-success-border gap-1">
                <Check className="h-3 w-3" /> Guardado
              </Badge>
            )}
          </div>
          <CardDescription>
            Registra el conteo físico cuantas veces necesites durante el turno.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Referencia efectivo esperado */}
          <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
            <span className="text-muted-foreground font-medium">Efectivo Esperado</span>
            <span className="font-bold text-primary text-base">Bs {efectivoEsperado.toFixed(2)}</span>
          </div>

          {/* Grilla de billetes y monedas */}
          <div id="tour-caja-conteo-billetes" className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billetes</span>
              </div>
              <div className="space-y-2">
                {BILLETES.map(({ key, label, valor }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={values[key] ?? ''}
                        onChange={e => handleChange(key, e.target.value)}
                        className="w-16 h-8 text-center border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                        Bs {((values[key] ?? 0) * valor).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monedas</span>
              </div>
              <div className="space-y-2">
                {MONEDAS.map(({ key, label, valor }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={values[key] ?? ''}
                        onChange={e => handleChange(key, e.target.value)}
                        className="w-16 h-8 text-center border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                        Bs {((values[key] ?? 0) * valor).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resultado del cuadre */}
          <div className={cn(
            'p-4 rounded-lg border',
            esExacto && 'bg-success-bg border-success-border',
            esSobrante && 'bg-info-bg border-info-border',
            esFaltante && 'bg-destructive/5 border-destructive/20',
            !esExacto && !esSobrante && !esFaltante && 'bg-muted border-border',
          )}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">Total Contado</span>
              <Badge
                variant={esExacto ? 'default' : esSobrante ? 'secondary' : 'destructive'}
                className={cn(
                  'gap-1',
                  esExacto && 'bg-success text-success-foreground',
                  esSobrante && 'bg-info text-info-foreground',
                )}
              >
                {esExacto && <CheckCircle className="h-3 w-3" />}
                {esFaltante && <AlertTriangle className="h-3 w-3" />}
                {esSobrante && <Info className="h-3 w-3" />}
                {esExacto ? 'Exacto' : esSobrante ? 'Sobrante' : 'Faltante'}
              </Badge>
            </div>
            <p className="text-3xl font-bold tabular-nums">Bs {total.toFixed(2)}</p>
            <p className={cn(
              'text-sm mt-1 font-medium',
              esExacto && 'text-success',
              esSobrante && 'text-info',
              esFaltante && 'text-destructive',
            )}>
              {esExacto && '¡Cuadre perfecto!'}
              {esSobrante && `Sobrante: +Bs ${diferencia.toFixed(2)}`}
              {esFaltante && `Faltante: -Bs ${Math.abs(diferencia).toFixed(2)}`}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              id="tour-caja-conteo-limpiar"
              variant="outline"
              className="flex-1"
              onClick={() =>
                setValues({ b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0 })
              }
            >
              Limpiar
            </Button>
            <Button
              id="tour-caja-conteo-guardar"
              variant="secondary"
              className="flex-1 gap-2"
              onClick={handleGuardar}
              disabled={saved || isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Conteo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Sección de cierre definitivo ───────────────────── */}
      <Card id="tour-caja-cerrar-definitivo" className="border-t-4 border-t-destructive">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Cierre Definitivo de Caja</CardTitle>
          </div>
          <CardDescription>
            Una vez confirmado, el turno finaliza y no se puede reabrir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen rápido antes del cierre */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs mb-1">Efectivo Esperado</p>
              <p className="font-bold">Bs {efectivoEsperado.toFixed(2)}</p>
            </div>
            <div className={cn(
              'rounded-lg p-3',
              esExacto && 'bg-success-bg',
              esSobrante && 'bg-info-bg',
              esFaltante && 'bg-destructive/5',
              !esExacto && !esSobrante && !esFaltante && 'bg-muted/50',
            )}>
              <p className="text-muted-foreground text-xs mb-1">Total Contado</p>
              <p className={cn(
                'font-bold',
                esExacto && 'text-success',
                esSobrante && 'text-info',
                esFaltante && 'text-destructive',
              )}>Bs {total.toFixed(2)}</p>
            </div>
          </div>

          <Textarea
            placeholder="Observaciones del cierre (opcional). Ej: Sobrante por venta no registrada..."
            className="min-h-[70px] text-sm"
            value={cierreObs}
            onChange={e => setCierreObs(e.target.value)}
          />

          <Button
            id="tour-caja-cerrar-btn"
            variant="destructive"
            className="w-full gap-2"
            onClick={() => setShowConfirmDialog(true)}
            disabled={hasPendingOrders}
            title={hasPendingOrders ? 'Hay pedidos pendientes. Termínalos antes de cerrar.' : undefined}
          >
            <Lock className="h-4 w-4" />
            {hasPendingOrders ? 'Pedidos pendientes — no se puede cerrar' : 'Cerrar Caja Definitivamente'}
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cierre de caja?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción finalizará el turno actual y registrará el arqueo. No se puede deshacer.
              {!esExacto && (
                <span className={cn('block mt-2 font-medium', esSobrante ? 'text-info' : 'text-destructive')}>
                  {esSobrante
                    ? `Sobrante de Bs ${diferencia.toFixed(2)}`
                    : `Faltante de Bs ${Math.abs(diferencia).toFixed(2)}`}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCierre}
              disabled={isClosing}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isClosing ? 'Cerrando...' : 'Confirmar Cierre'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
