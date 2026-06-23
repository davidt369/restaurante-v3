import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GastoCajaResponse } from "../types/caja.types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/utils/date-format";

interface HistorialGastosTableProps {
  gastos: GastoCajaResponse[];
  isLoading?: boolean;
}

export function HistorialGastosTable({ gastos, isLoading = false }: HistorialGastosTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (gastos.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay gastos registrados.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos.map((gasto) => (
            <TableRow key={gasto.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {formatDateTime(gasto.creado_en)}
              </TableCell>
              <TableCell>{gasto.descripcion}</TableCell>
              <TableCell>
                <Badge variant={gasto.metodo_pago === 'efectivo' ? 'secondary' : 'outline'}>
                  {gasto.metodo_pago.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                 {gasto.usuario_id || 'N/A'}
              </TableCell>
              <TableCell className="text-right font-bold text-destructive">
                - {gasto.monto.toFixed(2)} Bs
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
