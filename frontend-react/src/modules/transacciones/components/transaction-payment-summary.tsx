import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionPaymentSummaryProps {
    validItemCount: number;
    total: number;
    showPayment: boolean;
    setShowPayment: (show: boolean) => void;
    metodoPago: "efectivo" | "qr";
    setMetodoPago: (metodo: "efectivo" | "qr") => void;
    montoPago: number;
    setMontoPago: (monto: number) => void;
    montoRecibido: number;
    setMontoRecibido: (monto: number) => void;
    cambio: number;
}

export function TransactionPaymentSummary({
    validItemCount,
    total,
    showPayment,
    setShowPayment,
    metodoPago,
    setMetodoPago,
    montoPago,
    setMontoPago,
    montoRecibido,
    setMontoRecibido,
    cambio,
}: TransactionPaymentSummaryProps) {
    if (validItemCount === 0) return null;

    return (
        <Card className={cn(
            "border-2 transition-all duration-300",
            showPayment ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"
        )}>
            <CardHeader className="pb-4 py-4 space-y-0 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="pay-now" 
                        checked={showPayment}
                        onCheckedChange={(checked) => setShowPayment(!!checked)}
                        className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <div className="grid gap-0.5 leading-none">
                        <Label 
                            htmlFor="pay-now" 
                            className="text-base font-bold cursor-pointer select-none text-foreground"
                        >
                            Pagar al hacer el pedido
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {showPayment ? "Registrar cobro inmediatamente" : "Guardar como pedido pendiente"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm font-medium text-muted-foreground block">Total a Pagar</span>
                    <span className="text-2xl font-black text-primary">Bs {total.toFixed(2)}</span>
                </div>
            </CardHeader>
            
            {showPayment && (
                <CardContent className="pt-0 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Método de Pago</Label>
                                <Select
                                    value={metodoPago}
                                    onValueChange={(v: "efectivo" | "qr") =>
                                        setMetodoPago(v)
                                    }
                                >
                                    <SelectTrigger className="h-12 border-2 focus:ring-primary/20 bg-background text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="efectivo">
                                            <div className="flex items-center gap-3 py-1 font-medium">
                                                <div className="bg-success-bg text-success p-1.5 rounded-md">
                                                    <Banknote className="h-4 w-4" />
                                                </div>
                                                <span className="text-foreground">Efectivo</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="qr">
                                            <div className="flex items-center gap-3 py-1 font-medium">
                                                <div className="bg-info-bg text-info p-1.5 rounded-md">
                                                    <CreditCard className="h-4 w-4" />
                                                </div>
                                                <span className="text-foreground">QR / Transferencia</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Monto a Cobrar</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Bs</span>
                                    <Input
                                        type="number"
                                        value={montoPago}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setMontoPago(parseFloat(e.target.value) || 0)
                                        }
                                        min="0"
                                        max={total}
                                        className="h-12 pl-10 border-2 font-bold text-lg bg-background text-foreground"
                                        readOnly={metodoPago === "qr"}
                                    />
                                </div>
                            </div>
                        </div>

                        {metodoPago === "efectivo" ? (
                            <div className="bg-muted/30 p-4 rounded-xl border-2 border-dashed border-border flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Monto Recibido</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Bs</span>
                                        <Input
                                            type="number"
                                            value={montoRecibido}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setMontoRecibido(
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="h-12 pl-10 border-2 border-primary/20 bg-background font-bold text-lg focus:border-primary text-foreground"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-success-bg rounded-lg border border-success-border">
                                    <span className="font-bold text-foreground">Cambio:</span>
                                    <span className={cn(
                                        "text-xl font-black",
                                        cambio < 0 ? "text-destructive" : "text-success"
                                    )}>
                                        Bs {cambio.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-info-bg/50 p-6 rounded-xl border-2 border-dashed border-info-border flex flex-col items-center justify-center text-center space-y-2">
                                <div className="bg-info text-info-foreground p-3 rounded-full mb-2">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-foreground">Pago por QR</h4>
                                <p className="text-xs text-muted-foreground max-w-[200px]">
                                    El monto de {total.toFixed(2)} se registrará automáticamente como pagado vía transferencia.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
