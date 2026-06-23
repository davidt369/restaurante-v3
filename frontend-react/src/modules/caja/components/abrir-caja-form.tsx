import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';

import { toast } from 'sonner';
import { cajaService } from '../services/caja.service';
import { useState, useEffect } from 'react';
import { History, Banknote, Coins } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const abrirCajaSchema = z.object({
  b200: z.number().min(0).optional(),
  b100: z.number().min(0).optional(),
  b50: z.number().min(0).optional(),
  b20: z.number().min(0).optional(),
  b10: z.number().min(0).optional(),
  b5: z.number().min(0).optional(),
  m2: z.number().min(0).optional(),
  m1: z.number().min(0).optional(),
  m050: z.number().min(0).optional(),
  m020: z.number().min(0).optional(),
  m010: z.number().min(0).optional(),
});

type AbrirCajaFormValues = z.infer<typeof abrirCajaSchema>;

type DineroKey = 'b200' | 'b100' | 'b50' | 'b20' | 'b10' | 'b5' | 'm2' | 'm1' | 'm050' | 'm020' | 'm010';

type DineroExtra = {
  key: DineroKey;
  label: string;
  valor: number;
};

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

interface UltimoCierre {
  fecha: string;
  monto_inicial: number;
  ventas_efectivo: number;
  ventas_qr: number;
  total_gastos: number;
  efectivo_esperado: number;
  efectivo_contado?: number;
  diferencia?: number;
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

interface AbrirCajaFormProps {
  onCajaOpened: () => void;
}

export function AbrirCajaForm({ onCajaOpened }: AbrirCajaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ultimoCierre, setUltimoCierre] = useState<UltimoCierre | null>(null);
  const [loadingLast, setLoadingLast] = useState(true);
  const [applyLastData, setApplyLastData] = useState(true);

  const form = useForm<AbrirCajaFormValues>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    },
  });

  useEffect(() => {
    let mounted = true;
    const fetchLastBox = async () => {
      try {
        setLoadingLast(true);
        const historial = await cajaService.obtenerHistorial(1);
        if (mounted && historial && historial.length > 0) {
          const lastCaja = historial[0];

          if (lastCaja.cerrada) {
            const detalle = await cajaService.obtenerDetalleCaja(lastCaja.id);
            setUltimoCierre({
              fecha: lastCaja.fecha,
              monto_inicial: lastCaja.monto_inicial,
              ventas_efectivo: detalle.resumen.ventas_efectivo,
              ventas_qr: detalle.resumen.ventas_qr,
              total_gastos: detalle.resumen.total_gastos,
              efectivo_esperado: detalle.resumen.efectivo_esperado,
              b200: lastCaja.b200 || 0,
              b100: lastCaja.b100 || 0,
              b50: lastCaja.b50 || 0,
              b20: lastCaja.b20 || 0,
              b10: lastCaja.b10 || 0,
              b5: lastCaja.b5 || 0,
              m2: lastCaja.m2 || 0,
              m1: lastCaja.m1 || 0,
              m050: lastCaja.m050 || 0,
              m020: lastCaja.m020 || 0,
              m010: lastCaja.m010 || 0,
            });

            if (applyLastData) {
              form.reset({
                b200: lastCaja.b200 || 0,
                b100: lastCaja.b100 || 0,
                b50: lastCaja.b50 || 0,
                b20: lastCaja.b20 || 0,
                b10: lastCaja.b10 || 0,
                b5: lastCaja.b5 || 0,
                m2: lastCaja.m2 || 0,
                m1: lastCaja.m1 || 0,
                m050: lastCaja.m050 || 0,
                m020: lastCaja.m020 || 0,
                m010: lastCaja.m010 || 0,
              });
            }
          } else {
            setUltimoCierre({
              fecha: lastCaja.fecha,
              monto_inicial: lastCaja.monto_inicial,
              ventas_efectivo: 0,
              ventas_qr: 0,
              total_gastos: 0,
              efectivo_esperado: lastCaja.monto_inicial,
            });
          }
        }
      } catch (error) {
        console.error("Error obteniendo la última caja:", error);
      } finally {
        if (mounted) setLoadingLast(false);
      }
    };
    fetchLastBox();
    return () => { mounted = false; };
  }, [form, applyLastData]);

  const watchedValues = form.watch();

  const calcularTotal = () => {
    let total = 0;
    [...BILLETES, ...MONEDAS].forEach(({ key, valor }) => {
      const cantidad = watchedValues[key as keyof AbrirCajaFormValues] || 0;
      total += cantidad * valor;
    });
    return total;
  };

  const onSubmit = async (values: AbrirCajaFormValues) => {
    try {
      setIsSubmitting(true);
      await cajaService.abrirCaja(values);
      toast.success('Caja abierta exitosamente');
      onCajaOpened();
    } catch (error: unknown) {
      // Extraer el mensaje real devuelto por el backend (409 Conflict, etc.)
      const axiosError = error as { response?: { data?: { message?: string } } };
      const mensajeServidor = axiosError?.response?.data?.message;
      toast.error(mensajeServidor ?? 'Error al abrir la caja. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = calcularTotal();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header fuera del card para dar aire */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight">Apertura de Turno</h2>
        <p className="text-muted-foreground text-sm">
          Prepara tu caja registrando el fondo inicial disponible.
        </p>
      </div>

      {ultimoCierre && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <History className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider">Último Cierre Registrado</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader className="p-3 pb-0">
                <CardDescription className="text-[10px] uppercase font-bold text-primary/70">Ventas Digitales</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-lg font-bold tabular-nums text-info">Bs {ultimoCierre.ventas_qr.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader className="p-3 pb-0">
                <CardDescription className="text-[10px] uppercase font-bold text-primary/70">Gastos Realizados</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-lg font-bold tabular-nums text-destructive">Bs {ultimoCierre.total_gastos.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="p-3 pb-0">
                <CardDescription className="text-[10px] uppercase font-bold text-primary">Saldo en Caja Anterior</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-xl font-black tabular-nums text-primary underline underline-offset-4 decoration-primary/30">Bs {ultimoCierre.efectivo_esperado.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none bg-muted/30 shadow-none">
            <CardContent className="p-3">
              <div id="tour-caja-abrir-checkbox" className="flex items-center gap-3">
                <Checkbox
                  id="apply-last-data"
                  checked={applyLastData}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    setApplyLastData(isChecked);
                    if (isChecked && ultimoCierre) {
                      form.reset({
                        b200: ultimoCierre.b200 || 0,
                        b100: ultimoCierre.b100 || 0,
                        b50: ultimoCierre.b50 || 0,
                        b20: ultimoCierre.b20 || 0,
                        b10: ultimoCierre.b10 || 0,
                        b5: ultimoCierre.b5 || 0,
                        m2: ultimoCierre.m2 || 0,
                        m1: ultimoCierre.m1 || 0,
                        m050: ultimoCierre.m050 || 0,
                        m020: ultimoCierre.m020 || 0,
                        m010: ultimoCierre.m010 || 0,
                      });
                    } else {
                      form.reset({
                        b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
                        b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
                      });
                    }
                  }}
                />
                <label htmlFor="apply-last-data" className="text-sm font-medium leading-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  Iniciar con el saldo del cierre anterior
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div id="tour-caja-abrir-fondo" className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
              {/* Card Billetes */}
              <Card className="shadow-sm overflow-hidden border-muted-foreground/10">
                <CardHeader className="bg-muted/30 py-3 border-b border-muted-foreground/10">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xs uppercase tracking-widest font-bold">Billetes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {BILLETES.map(({ key, label, valor }) => (
                    <div key={key} className="flex items-center justify-between group transition-all">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          {...form.register(key as DineroKey, { valueAsNumber: true })}
                          className="w-14 h-8 text-center border-none bg-muted/50 rounded-md text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary transition-all tabular-nums"
                          placeholder="0"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground/60 w-16 text-right tabular-nums">
                          Bs {((watchedValues[key as DineroKey] || 0) * valor).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Card Monedas */}
              <Card className="shadow-sm overflow-hidden border-muted-foreground/10">
                <CardHeader className="bg-muted/30 py-3 border-b border-muted-foreground/10">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xs uppercase tracking-widest font-bold">Monedas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {MONEDAS.map(({ key, label, valor }) => (
                    <div key={key} className="flex items-center justify-between group transition-all">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          {...form.register(key as DineroKey, { valueAsNumber: true })}
                          className="w-14 h-8 text-center border-none bg-muted/50 rounded-md text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary transition-all tabular-nums"
                          placeholder="0"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground/60 w-16 text-right tabular-nums">
                          Bs {((watchedValues[key as DineroKey] || 0) * valor).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Resumen Final y Acción */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xs uppercase tracking-widest font-bold text-primary-foreground/70">Total en Efectivo</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pb-6">
                  <p className="text-4xl font-black tabular-nums">Bs {total.toFixed(2)}</p>
                  {ultimoCierre && applyLastData && (
                    <div className="mt-3 py-1 px-2 bg-white/10 rounded-md inline-block">
                      <p className="text-[10px] font-medium text-primary-foreground/80">
                        {total === ultimoCierre.efectivo_esperado
                          ? "✓ Cuadrado con el cierre"
                          : `Dif. Cierre: Bs ${(total - ultimoCierre.efectivo_esperado).toFixed(2)}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  id="tour-caja-abrir-btn"
                  type="submit"
                  className="w-full h-14 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={isSubmitting || loadingLast}
                  size="lg"
                >
                  {isSubmitting ? 'Abriendo Turno...' : 'Abrir Caja Ahora'}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground px-4">
                  Al confirmar, se iniciará el registro de todas las transacciones bajo tu usuario para este turno.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
