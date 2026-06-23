import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { productosService } from "@/modules/productos/services/productos.service";
import { platosService } from "@/modules/platos/services/platos.service";
import { cajaService } from "@/modules/caja/services/caja.service";
import type { Producto } from "@/modules/productos/types/producto.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type {
    CreateTransaccionDto,
    AddItemDto,
    CreatePagoDto,
    ItemRow,
    ItemExtra,
    TransaccionFormValues
} from "../types/transaccion.types";

const transaccionSchema = z.object({
    concepto: z.string().min(1, "El concepto es requerido"),
    mesa: z.string().optional(),
    cliente: z.string().optional(),
    estado: z.enum(["pendiente", "abierto", "cerrado", "anulado"]),
});

interface UseTransactionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (transaccion: CreateTransaccionDto, items: AddItemDto[], pago?: CreatePagoDto) => Promise<void>;
    nextNroReg: number;
}

export function useTransaction({
    open,
    onOpenChange,
    onSubmit,
    nextNroReg,
}: UseTransactionProps) {
    const generateId = () => {
        try {
            return crypto.randomUUID();
        } catch {
            return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        }
    };

    // Data
    const [productos, setProductos] = useState<Producto[]>([]);
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [cajaActual, setCajaActual] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Items table
    const [rows, setRows] = useState<ItemRow[]>([
        {
            id: generateId(),
            tipo: "",
            item_id: "",
            item_nombre: "",
            cantidad: 1,
            precio: 0,
            extras: [],
            notas: "",
            mesa: "",
            subtotal: 0,
        },
    ]);


    // Payment
    const [showPayment, setShowPayment] = useState(true);
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "qr">("efectivo");
    const [montoPago, setMontoPago] = useState<number>(0);
    const [montoRecibido, setMontoRecibido] = useState<number>(0);

    // Refs for keyboard navigation
    const cantidadInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const notasInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const prevTotalRef = useRef<number>(0);

    // Form for transaction header
    const form = useForm<TransaccionFormValues>({
        resolver: zodResolver(transaccionSchema),
        defaultValues: {
            concepto: "Pedido",
            mesa: "",
            cliente: "",
            estado: "abierto",
        },
    });

    const total = rows.reduce((sum, row) => sum + row.subtotal, 0);

    useEffect(() => {
        if (open) {
            fetchData();
            checkCaja();
        }
    }, [open]);

    // Update payment amount when total changes OR method changes OR showPayment changes
    useEffect(() => {
        if (!showPayment) {
            setMontoPago(0);
            return;
        }

        if (metodoPago === "qr") {
            setMontoPago(total);
        } else if (montoPago === 0 || montoPago === prevTotalRef.current || montoPago > total) {
            // Default to total if it's currently 0, in sync with previous total, or invalid
            setMontoPago(total);
        }

        prevTotalRef.current = total;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total, metodoPago, showPayment, montoPago]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productosData, platosData] = await Promise.all([
                productosService.getAll(),
                platosService.getAll(),
            ]);
            setProductos(productosData);
            setPlatos(platosData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const checkCaja = async () => {
        try {
            if (!open) return;
            const caja = await cajaService.obtenerCajaAbierta();
            if (!caja) {
                toast.error("No hay una caja abierta. Debe abrir la caja primero.");
                onOpenChange(false);
            } else {
                setCajaActual(caja.id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al verificar caja");
            onOpenChange(false);
        }
    };

    const calculateSubtotal = (cantidad: number, precio: number, extras: ItemExtra[]) => {
        const qty = Math.max(0, cantidad);
        const basePrice = Math.max(0, precio);
        const extrasTotal = extras.reduce((sum, extra) => sum + (Math.max(0, extra.precio) * Math.max(0, extra.cantidad)), 0);
        return (basePrice + extrasTotal) * qty;
    };

    const updateRow = (id: string, updates: Partial<ItemRow>) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id === id) {
                    const updated = { ...row, ...updates };
                    updated.subtotal = calculateSubtotal(updated.cantidad, updated.precio, updated.extras);
                    return updated;
                }
                return row;
            })
        );
    };

    const incrementCantidad = (id: string) => {
        const row = rows.find(r => r.id === id);
        if (row) {
            updateRow(id, { cantidad: row.cantidad + 1 });
        }
    };

    const decrementCantidad = (id: string) => {
        const row = rows.find(r => r.id === id);
        if (row && row.cantidad > 1) {
            updateRow(id, { cantidad: row.cantidad - 1 });
        }
    };

    const selectItem = (rowId: string, itemId: string) => {
        const producto = productos.find((p) => p.id === itemId);
        const plato = platos.find((p) => p.id === itemId);

        if (producto) {
            updateRow(rowId, {
                tipo: "producto",
                item_id: producto.id,
                item_nombre: producto.nombre,
                precio: Number(producto.precio),
            });
        } else if (plato) {
            updateRow(rowId, {
                tipo: "plato",
                item_id: plato.id,
                item_nombre: plato.nombre,
                precio: Number(plato.precio),
            });
        }
    };

    const addNewRow = () => {
        const newRow: ItemRow = {
            id: generateId(),
            tipo: "",
            item_id: "",
            item_nombre: "",
            cantidad: 1,
            precio: 0,
            extras: [],
            notas: "",
            mesa: "",
            subtotal: 0,
        };
        setRows([...rows, newRow]);
    };

    const resetForm = () => {
        form.reset();
        setRows([
            {
                id: generateId(),
                tipo: "",
                item_id: "",
                item_nombre: "",
                cantidad: 1,
                precio: 0,
                extras: [],
                notas: "",
                mesa: "",
                subtotal: 0,
            },
        ]);
        setMontoPago(0);
        setMontoRecibido(0);
        setShowPayment(true);
    };

    const removeRow = (id: string) => {
        if (rows.length === 1) {
            // Si es la única fila, reiniciamos todo el formulario
            resetForm();
            return;
        }

        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    // Extras management functions
    const addExtraToRow = (rowId: string, precio: number, descripcion: string) => {
        const newExtra: ItemExtra = {
            id: generateId(),
            tipo: "custom",
            descripcion: descripcion || "Extra",
            precio,
            cantidad: 1,
        };

        setRows((prev) =>
            prev.map((row) => {
                if (row.id === rowId) {
                    const updatedExtras = [...row.extras, newExtra];
                    const subtotal = calculateSubtotal(row.cantidad, row.precio, updatedExtras);
                    return { ...row, extras: updatedExtras, subtotal };
                }
                return row;
            })
        );

        toast.success("Extra agregado");
    };

    const removeExtraFromRow = (rowId: string, extraId: string) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id === rowId) {
                    const updatedExtras = row.extras.filter((e) => e.id !== extraId);
                    const subtotal = calculateSubtotal(row.cantidad, row.precio, updatedExtras);
                    return { ...row, extras: updatedExtras, subtotal };
                }
                return row;
            })
        );
        toast.success("Extra eliminado");
    };

    const handleKeyDown = (
        e: KeyboardEvent,
        rowId: string,
        rowIndex: number,
        cell: "cantidad" | "notas"
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();

            // If we're on the last row and it has an item selected, add a new row
            if (rowIndex === rows.length - 1 && rows[rowIndex].item_id) {
                addNewRow();
            } else if (rowIndex < rows.length - 1) {
                // Move to the same cell in the next row
                const nextRowId = rows[rowIndex + 1].id;
                setTimeout(() => {
                    const input =
                        cell === "cantidad"
                            ? cantidadInputRefs.current[nextRowId]
                            : notasInputRefs.current[nextRowId];
                    if (input) input.focus();
                }, 50);
            }
        } else if (e.key === "Tab" && !e.shiftKey) {
            if (cell === "cantidad") {
                e.preventDefault();
                notasInputRefs.current[rowId]?.focus();
            } else if (cell === "notas" && rowIndex < rows.length - 1) {
                e.preventDefault();
                const nextRowId = rows[rowIndex + 1].id;
                cantidadInputRefs.current[nextRowId]?.focus();
            }
        }
    };

    const handleSubmitTransaction = async (values: TransaccionFormValues) => {
        const validRows = rows.filter((row) => row.item_id && row.cantidad > 0);

        if (validRows.length === 0) {
            toast.error("Agregue al menos un item al pedido");
            return;
        }

        // Determinar si se registra un pago
        let pagoDto: CreatePagoDto | undefined;
        let estadoFinal = values.estado;

        // Si el monto recibido es <= 0 en efectivo, consideramos que no ha pagado (pedido pendiente)
        const pagoOmitido = metodoPago === "efectivo" && montoRecibido <= 0;

        if (showPayment && montoPago > 0 && !pagoOmitido) {
            // Validar monto recibido en efectivo
            if (metodoPago === "efectivo" && montoRecibido < montoPago) {
                toast.error("Debe ingresar un monto recibido válido (mínimo " + montoPago.toFixed(2) + " Bs)");
                return;
            }

            pagoDto = {
                metodo_pago: metodoPago,
                monto: montoPago,
                monto_recibido: metodoPago === "efectivo" ? montoRecibido : undefined,
                referencia_qr: undefined,
            };

            // Si el pago cubre el total, la transacción se marca como cerrada
            if (montoPago >= total) {
                estadoFinal = "cerrado";
            }
        } else {
            // Si no hay pago, la transacción debe permanecer abierta
            estadoFinal = "abierto";
        }

        const itemsDto: AddItemDto[] = validRows.map((row) => {
            // Incorporar la ubicación de la fila en las notas para que llegue a cocina
            // ya que el backend no soporta mesa por item directamente
            let finalNotas = row.notas || "";
            if (row.mesa) {
                finalNotas = `[${row.mesa.trim()}] ${finalNotas}`.trim();
            }

            return {
                producto_id: row.tipo === "producto" ? row.item_id : undefined,
                plato_id: row.tipo === "plato" ? row.item_id : undefined,
                cantidad: row.cantidad,
                notas: finalNotas || undefined,
                extras: row.extras.map(e => ({
                    descripcion: e.descripcion,
                    precio: e.precio,
                    cantidad: e.cantidad,
                    ingrediente_id: e.ingrediente_id || undefined
                }))
            };
        });

        // La mesa de la transacción será la de la primera fila que tenga una definida
        const transaccionMesa = validRows.find(r => r.mesa)?.mesa?.trim();

        const transaccionDto: CreateTransaccionDto = {
            nro_reg: nextNroReg,
            concepto: "Pedido", // Concepto fijo requerido por el backend
            mesa: transaccionMesa || undefined,
            cliente: values.cliente || undefined,
            estado: estadoFinal,
            caja_id: cajaActual || undefined,
        };

        try {
            setSubmitting(true);
            await onSubmit(transaccionDto, itemsDto, pagoDto);
            toast.success("Transacción creada exitosamente");
            onOpenChange(false);
            // resetForm es llamado después del cierre para limpiar el estado interno
            setTimeout(resetForm, 100);
        } catch (error) {
            console.error(error);
            toast.error("Error al crear transacción");
        } finally {
            setSubmitting(false);
        }
    };

    const ubicacion = ["Mesa", "Para llevar", "Auto", "Sala"];
    const validItemCount = rows.filter((row) => row.item_id).length;
    const cambio = metodoPago === "efectivo" ? Math.max(0, montoRecibido - montoPago) : 0;

    const handleSetMontoPago = (monto: number) =>
        setMontoPago(Math.max(0, monto));
    const handleSetMontoRecibido = (monto: number) =>
        setMontoRecibido(Math.max(0, monto));

    return {
        // Data
        productos,
        platos,
        cajaActual,
        loading,
        submitting,

        // State
        rows,
        showPayment,
        setShowPayment,
        metodoPago,
        setMetodoPago,
        montoPago,
        setMontoPago: handleSetMontoPago,
        montoRecibido,
        setMontoRecibido: handleSetMontoRecibido,

        // Refs
        cantidadInputRefs,
        notasInputRefs,

        // Form
        form,

        // Actions
        updateRow,
        incrementCantidad,
        decrementCantidad,
        selectItem,
        addNewRow,
        removeRow,
        addExtraToRow,
        removeExtraFromRow,
        handleKeyDown,
        handleSubmitTransaction,
        resetForm,

        // Computed
        total,
        validItemCount,
        cambio,
        ubicacion,
    };
}
