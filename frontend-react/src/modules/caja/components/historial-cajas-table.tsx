import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaTurnoResponse } from "../types/caja.types";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime } from "@/utils/date-format";

interface HistorialCajasTableProps {
  cajas: CajaTurnoResponse[];
  isLoading?: boolean;
}

export function HistorialCajasTable({ cajas, isLoading = false }: HistorialCajasTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (cajaId: number) => {
    navigate(`/caja/${cajaId}`);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead>Inicial</TableHead>
              <TableHead>Ventas</TableHead>
              <TableHead>Salidas</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (cajas.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay historial de cajas.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Apertura</TableHead>
            <TableHead>Cierre</TableHead>
            <TableHead>Inicial</TableHead>
            <TableHead>Ventas</TableHead>
            <TableHead>Salidas</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cajas.map((caja) => (
            <TableRow
              key={caja.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(caja.id)}
            >
              <TableCell className="font-medium">
                {formatDate(caja.fecha)}
              </TableCell>
              <TableCell>
                {formatTime(caja.hora_apertura)}
              </TableCell>
              <TableCell>
                {formatTime(caja.hora_cierre)}
              </TableCell>
              <TableCell>Bs {caja.monto_inicial.toFixed(2)}</TableCell>
              <TableCell className="text-success font-semibold">
                Bs {(caja.ventas_efectivo + caja.ventas_qr).toFixed(2)}
              </TableCell>
              <TableCell className="text-destructive">
                Bs {caja.total_salidas.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={caja.cerrada ? "default" : "destructive"}>
                    {caja.cerrada ? "Cerrada" : "Abierta"}
                  </Badge>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
