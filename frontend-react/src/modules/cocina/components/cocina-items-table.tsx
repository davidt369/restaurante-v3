import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetalleItem } from "@/modules/transacciones/types/transaccion.types";

type CocinaItemsTableProps = {
    items: DetalleItem[];
};
export function CocinaItemsTable({ items }: CocinaItemsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16 text-lg font-bold text-center">
                            Cant.
                        </TableHead>
                        <TableHead className="text-lg font-bold">Item</TableHead>
                        <TableHead className="text-lg font-bold">Detalles</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-black text-3xl text-center text-primary">
                                {Math.floor(parseFloat(item.cantidad.toString()))}
                            </TableCell>

                            <TableCell>
                                <div className="space-y-2">
                                    <div className="font-bold text-xl leading-tight">
                                        {item.nombre || "Item desconocido"}
                                    </div>

                                    {(item.producto_id || item.plato_id) && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs px-2 py-0 font-medium",
                                                item.producto_id && "bg-blue-50 text-blue-700 border-blue-200",
                                                item.plato_id && "bg-orange-50 text-orange-700 border-orange-200"
                                            )}
                                        >
                                            {item.producto_id ? "Producto" : "Plato"}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-3">
                                    {item.notas && (
                                        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                            <div className="text-base">
                                                <span className="font-bold text-destructive">
                                                    NOTA:
                                                </span>{" "}
                                                <span className="font-medium">{item.notas}</span>
                                            </div>
                                        </div>
                                    )}

                                    {item.extras && item.extras.length > 0 && (
                                        <div className="space-y-1">
                                            {item.extras.map((extra) => (
                                                <div
                                                    key={extra.id}
                                                    className="text-base flex items-center gap-1.5"
                                                >
                                                    <span className="text-success font-bold text-lg">
                                                        +
                                                    </span>
                                                    <span className="font-semibold text-muted-foreground/80">
                                                        {extra.descripcion || extra.nombre || extra.ingrediente_nombre || "Extra"}
                                                    </span>
                                                    {extra.cantidad &&
                                                        parseFloat(extra.cantidad.toString()) > 1 && (
                                                            <span className="text-sm font-bold opacity-70">
                                                                (x{Math.floor(parseFloat(extra.cantidad.toString()))})
                                                            </span>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
