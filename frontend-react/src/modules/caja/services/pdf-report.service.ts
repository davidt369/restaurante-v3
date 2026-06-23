import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaccion, DetalleItem, Pago } from "@/modules/transacciones/types/transaccion.types";
import type { GastoCajaResponse } from "@/modules/caja/types/caja.types";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

export interface ResumenItem {
  nombre: string;
  cantidad: number;
  total: number;
  tipo: 'producto' | 'plato';
  precio_unitario?: number;
}

export interface ReporteCajaData {
  caja: {
    id: number;
    fecha: string;
    hora_apertura: string | null;
    hora_cierre: string | null;
    monto_inicial: number;
    cerrada: boolean | null;
    usuario_nombre?: string;
    b200?: number | null;
    b100?: number | null;
    b50?: number | null;
    b20?: number | null;
    b10?: number | null;
    b5?: number | null;
    m2?: number | null;
    m1?: number | null;
    m050?: number | null;
    m020?: number | null;
    m010?: number | null;
    monto_contado?: number;
    diferencia?: number;
    estado_diferencia?: 'exacto' | 'sobrante' | 'faltante';
    cierre_obs?: string | null;
  };
  resumen: {
    monto_inicial: number;
    ventas_efectivo: number;
    ventas_qr: number;
    gastos_efectivo: number;
    gastos_qr: number;
    efectivo_esperado: number;
    total_qr: number;
    total_del_dia: number;
    total_gastos: number;
    ventas_count?: number;
    promedio_venta?: number;
  };
  ventas: Transaccion[];
  gastos: GastoCajaResponse[];
  itemsMasVendidos?: ResumenItem[];
  itemsEliminados?: any[];
  ventasPorMesa?: { mesa: string; cantidad: number; total: number }[];
  ventasDetalladas?: (Transaccion & { items?: DetalleItem[]; pagos: Pago[]; usuario_nombre?: string })[];
  items?: ResumenItem[];
}

function formatTime(dateStr: any): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) {
      if (typeof dateStr === 'string' && dateStr.includes(' ')) {
        const isoDate = new Date(dateStr.replace(' ', 'T'));
        if (isValid(isoDate)) return format(isoDate, "HH:mm:ss");
      }
      return "N/A";
    }
    return format(date, "HH:mm:ss");
  } catch {
    return "N/A";
  }
}

function safeFormatDateTime(dateStr?: any, fmt = "dd/MM HH:mm"): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) {
      if (typeof dateStr === 'string' && dateStr.includes(' ')) {
        const isoDate = new Date(dateStr.replace(' ', 'T'));
        if (isValid(isoDate)) return format(isoDate, fmt);
      }
      return "N/A";
    }
    return format(date, fmt);
  } catch {
    return "N/A";
  }
}

function addPageFooter(doc: jsPDF, pageWidth: number, pageCount: number): void {
  const footerY = 285;
  const slate600: [number, number, number] = [71, 85, 105];
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    doc.setTextColor(...slate600);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento es un reporte oficial del Sistema de Gestión Restaurante V2.", pageWidth / 2, footerY, { align: "center" });
    doc.text(`Página ${i} de ${pageCount}  |  Generado: ${format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es })}`, pageWidth / 2, footerY + 4, { align: "center" });
  }
}

function checkNewPage(doc: jsPDF, currentY: number, minSpace: number): number {
  if (currentY > 275 - minSpace) {
    doc.addPage();
    return 15;
  }
  return currentY;
}

function buildPDF(doc: jsPDF, data: ReporteCajaData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = pageWidth - 15;
  const contentWidth = pageWidth - 30;
  
  const primaryColor: [number, number, number] = [30, 41, 59]; // Slate 800 - Pro / Business
  const secondaryColor: [number, number, number] = [51, 65, 85]; // Slate 600
  const successColor: [number, number, number] = [21, 128, 61]; // Green 700
  const dangerColor: [number, number, number] = [185, 28, 28]; // Red 700
  const warningColor: [number, number, number] = [161, 98, 7]; // Yellow 700
  const lightGray: [number, number, number] = [248, 250, 252]; // Slate 50
  const infoColor: [number, number, number] = [29, 78, 216]; // Blue 700
  const purpleColor: [number, number, number] = [107, 33, 168]; // Purple 700

  // ========== HEADER ==========
  // Background stripe
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE GERENCIAL DE CAJA", marginLeft, 18);
  
  // Company Info (Right)
  doc.setFontSize(10);
  doc.text("RESTAURANTE V2", pageWidth - marginLeft, 18, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Gestión Administrativa y Financiera", pageWidth - marginLeft, 23, { align: "right" });
  doc.text("Oruro - Bolivia", pageWidth - marginLeft, 27, { align: "right" });
  
  // Sub-header info
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 40, pageWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(`CONTROL: ${data.caja.fecha}  |  CAJERO(A): ${data.caja.usuario_nombre || 'SISTEMA'}`, marginLeft, 45.5);
  doc.text(`EMISIÓN: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, pageWidth - marginLeft, 45.5, { align: "right" });

  // ========== INFO BOX ==========
  let currentY = 52;
  doc.setFillColor(...lightGray);
  doc.roundedRect(marginLeft, currentY, contentWidth, 22, 2, 2, "F");
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  
  const labelCol1 = 20;
  const labelCol2 = 70;
  const labelCol3 = 125;
  
  doc.setFont("helvetica", "bold");
  doc.text("Hora Apertura:", labelCol1, currentY + 8);
  doc.text("Hora Cierre:", labelCol2 + 5, currentY + 8);
  doc.text("Cajero:", labelCol3 + 15, currentY + 8);
  
  doc.setFont("helvetica", "normal");
  doc.text(formatTime(data.caja.hora_apertura), labelCol1 + 25, currentY + 8);
  doc.text(data.caja.hora_cierre ? formatTime(data.caja.hora_cierre) : "ABIERTA (En curso)", labelCol2 + 25, currentY + 8);
  doc.text(data.caja.usuario_nombre || "N/A", labelCol3 + 30, currentY + 8);
  
  const isCerrada = data.caja.cerrada === true;
  const estadoColor = isCerrada ? successColor : warningColor;
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Estado:", labelCol1, currentY + 17);
  doc.setFillColor(...estadoColor);
  doc.roundedRect(labelCol1 + 25, currentY + 11, 45, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(isCerrada ? "CERRADA COMPLETADA" : "¡CAJA ABIERTA!", labelCol1 + 27, currentY + 16);

  // ========== RESUMEN GENERAL ==========
  currentY += 30;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN GENERAL", marginLeft, currentY);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, currentY + 2, marginRight, currentY + 2);
  
  currentY += 7;
  
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 24;
  
  // Box 1 - Caja Inicial
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(marginLeft, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("CAJA INICIAL", marginLeft + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.monto_inicial.toFixed(2)}`, marginLeft + boxWidth / 2, currentY + 16, { align: "center" });
  
  // Box 2 - Total Ventas
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(marginLeft + boxWidth + 3, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...successColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL VENTAS", marginLeft + boxWidth + 3 + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.total_del_dia.toFixed(2)}`, marginLeft + boxWidth + 3 + boxWidth / 2, currentY + 16, { align: "center" });
  
  // Box 3 - Total Gastos
  doc.setFillColor(255, 235, 238);
  doc.roundedRect(marginLeft + (boxWidth + 3) * 2, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...dangerColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL GASTOS", marginLeft + (boxWidth + 3) * 2 + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.total_gastos.toFixed(2)}`, marginLeft + (boxWidth + 3) * 2 + boxWidth / 2, currentY + 16, { align: "center" });
  
  // Box 4 - Ventas Count
  doc.setFillColor(237, 231, 246);
  doc.roundedRect(marginLeft + (boxWidth + 3) * 3, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...infoColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("NRO. VENTAS", marginLeft + (boxWidth + 3) * 3 + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  // Real count of sales: favor explicit count if valid, then fallback to collection length
  const realVentasCount = data.resumen.ventas_count || (data.ventasDetalladas?.length) || (data.ventas?.length) || 0;
  doc.text(realVentasCount.toString(), marginLeft + (boxWidth + 3) * 3 + boxWidth / 2, currentY + 16, { align: "center" });

  // ========== METODOS DE PAGO ==========
  currentY += 32;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("METODOS DE PAGO", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  const methodBoxWidth = (contentWidth - 3) / 2;
  
  // Efectivo
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(marginLeft, currentY, methodBoxWidth, 18, 2, 2, "F");
  doc.setTextColor(...successColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("[E] EFECTIVO", marginLeft + 4, currentY + 7);
  doc.setFontSize(10);
  doc.text(`Bs ${data.resumen.ventas_efectivo.toFixed(2)}`, marginLeft + 4, currentY + 14);
  
  // QR
  doc.setFillColor(227, 242, 253);
  doc.roundedRect(marginLeft + methodBoxWidth + 3, currentY, methodBoxWidth, 18, 2, 2, "F");
  doc.setTextColor(...infoColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("[Q] PAGO QR", marginLeft + methodBoxWidth + 7, currentY + 7);
  doc.setFontSize(10);
  doc.text(`Bs ${data.resumen.ventas_qr.toFixed(2)}`, marginLeft + methodBoxWidth + 7, currentY + 14);

  // ========== PRODUCTOS MAS VENDIDOS ==========
  if (data.itemsMasVendidos && data.itemsMasVendidos.length > 0) {
    currentY += 26;
    currentY = checkNewPage(doc, currentY, 70);
    
    doc.setFillColor(...purpleColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTOS / PLATOS MAS VENDIDOS", marginLeft + 2, currentY + 2);
    
    currentY += 8;
    
    const productosData = data.itemsMasVendidos.map((item, idx) => [
      `${idx + 1}`,
      item.tipo === 'plato' ? 'Plato' : 'Producto',
      item.nombre,
      item.cantidad.toString(),
      `Bs ${item.total.toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Tipo", "Nombre", "Cant.", "Total"]],
      body: productosData,
      theme: "striped",
      headStyles: { fillColor: purpleColor, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 25 },
        2: { cellWidth: 65 },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "right", cellWidth: 35 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc.lastAutoTable?.finalY ?? 0) + 8;
  }

  // ========== GÉNEROS Y PRODUCTOS VENDIDOS ==========
  if (data.items && data.items.length > 0) {
    currentY = checkNewPage(doc, currentY, 60);
    doc.setFillColor(...primaryColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("GÉNEROS Y PRODUCTOS VENDIDOS", marginLeft + 2, currentY + 2);
    currentY += 8;

    const itemsData = data.items
      .sort((a, b) => b.cantidad - a.cantidad)
      .map(item => [
        item.nombre,
        item.tipo === 'producto' ? 'PRODUCTO' : 'PLATO',
        item.cantidad,
        `Bs ${parseFloat((item.precio_unitario || (item.total / item.cantidad)).toString()).toFixed(2)}`,
        `Bs ${parseFloat(item.total.toString()).toFixed(2)}`
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Descripción del Ítem", "Categoría", "Cant.", "P. Unit", "Subtotal"]],
      body: itemsData,
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc.lastAutoTable?.finalY ?? 0) + 12;
  }

  // ========== DETALLE DE VENTAS ==========
  currentY = checkNewPage(doc, currentY, 80);
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DE VENTAS", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  if (data.ventasDetalladas && data.ventasDetalladas.length > 0) {
    const detailedVentasData = data.ventasDetalladas.map(v => {
      const pagoEfectivo = v.pagos
        .filter(p => p.metodo_pago === 'efectivo')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);
      const pagoQR = v.pagos
        .filter(p => p.metodo_pago === 'qr')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);

      return [
        `#${v.nro_reg}`,
        formatTime(v.hora),
        v.usuario_nombre || '-',
        v.mesa || v.cliente || '-',
        `Bs ${parseFloat(v.monto_total).toFixed(2)}`,
        `Bs ${pagoEfectivo.toFixed(2)}`,
        `Bs ${pagoQR.toFixed(2)}`,
        v.estado === 'cerrado' ? 'OK' : 'PEND'
      ];
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Hora", "Cajero", "Ref/Mesa", "Total", "Efec.", "QR", "Est."]],
      body: detailedVentasData,
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 6, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 6 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 15 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { halign: "right", fontStyle: "bold", cellWidth: 22 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", cellWidth: 22 },
        7: { halign: "center", cellWidth: 12 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc.lastAutoTable?.finalY ?? 0) + 8;
  }

  // ========== DETALLE DE VENTAS DETALLADO (EFECTIVO vs QR) ==========
  if (data.ventasDetalladas && data.ventasDetalladas.length > 0) {
    const ventasEfectivo = data.ventasDetalladas.filter(v => 
      v.pagos.some(p => p.metodo_pago === 'efectivo' && parseFloat(p.monto.toString()) > 0)
    );
    const ventasQR = data.ventasDetalladas.filter(v => 
      v.pagos.some(p => p.metodo_pago === 'qr' && parseFloat(p.monto.toString()) > 0)
    );

    // Tabla Efectivo
    if (ventasEfectivo.length > 0) {
      currentY = checkNewPage(doc, currentY, 40);
      doc.setFillColor(...successColor);
      doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("VENTAS EN EFECTIVO", marginLeft + 2, currentY + 2);
      currentY += 8;

      const efectivoData = ventasEfectivo.map(v => {
        const montoEfe = v.pagos
          .filter(p => p.metodo_pago === 'efectivo')
          .reduce((sum, p) => sum + parseFloat(p.monto.toString()), 0);
        const isEliminado = !!v.borrado_en;
        return [
          isEliminado ? 'ELIMINADO' : v.nro_reg,
          v.cliente || 'Publico',
          v.mesa || 'Salón',
          v.usuario_nombre || 'Personal',
          `Bs ${montoEfe.toFixed(2)}`,
          safeFormatDateTime(v.hora, "HH:mm")
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["Ticket", "Cliente", "Ubicación", "Cajero", "Monto", "Hora"]],
        body: efectivoData,
        theme: "grid",
        headStyles: { fillColor: successColor, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'center' },
        },
        margin: { left: marginLeft, right: marginRight - marginLeft },
      });
      currentY = (doc.lastAutoTable?.finalY ?? 0) + 10;
    }

    // Tabla QR
    if (ventasQR.length > 0) {
      currentY = checkNewPage(doc, currentY, 40);
      doc.setFillColor(...infoColor);
      doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("VENTAS POR QR", marginLeft + 2, currentY + 2);
      currentY += 8;

      const qrData = ventasQR.map(v => {
        const montoQR = v.pagos
          .filter(p => p.metodo_pago === 'qr')
          .reduce((sum, p) => sum + parseFloat(p.monto.toString()), 0);
        const isEliminado = !!v.borrado_en;
        return [
          isEliminado ? 'ELIMINADO' : v.nro_reg,
          v.cliente || 'Publico',
          v.mesa || 'Salón',
          v.usuario_nombre || 'Personal',
          `Bs ${montoQR.toFixed(2)}`,
          safeFormatDateTime(v.hora, "HH:mm")
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["Ticket", "Cliente", "Ubicación", "Cajero", "Monto", "Hora"]],
        body: qrData,
        theme: "grid",
        headStyles: { fillColor: infoColor, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'center' },
        },
        margin: { left: marginLeft, right: marginRight - marginLeft },
      });
      currentY = (doc.lastAutoTable?.finalY ?? 0) + 10;
    }
  } else if (data.ventas.length > 0) {
    const ventasData = data.ventas.map(s => [
      s.nro_reg,
      safeFormatDateTime(s.hora, "HH:mm"),
      s.mesa || 'Salón',
      s.cliente || 'Publico',
      `Bs ${parseFloat(s.monto_total).toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["Ticket", "Hora", "Ubicación", "Cliente", "Total"]],
      body: ventasData,
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        4: { cellWidth: 25, halign: 'right' },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc.lastAutoTable?.finalY ?? 0) + 8;
  }

  // ========== ITEMS ELIMINADOS (AUDITORIA) ==========
  if (data.itemsEliminados && data.itemsEliminados.length > 0) {
    currentY = checkNewPage(doc, currentY, 60);
    
    doc.setFillColor(...secondaryColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ITEMS ELIMINADOS (AUDITORIA)", marginLeft + 2, currentY + 2);
    
    currentY += 8;
    
    const eliminadosData = data.itemsEliminados.map(item => [
      item.transaccion_nro,
      item.producto_nombre || item.plato_nombre || 'N/A',
      item.cantidad,
      `Bs ${parseFloat(item.precio_unitario.toString()).toFixed(2)}`,
      `Bs ${parseFloat(item.subtotal.toString()).toFixed(2)}`,
      safeFormatDateTime(item.borrado_en, "HH:mm")
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["Ticket", "Producto / Detalle", "Cant.", "P. Unit", "Total", "Hora"]],
      body: eliminadosData,
      theme: "grid",
      headStyles: { fillColor: secondaryColor, fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc.lastAutoTable?.finalY ?? 0) + 12;
  }

  // ========== GASTOS ==========
  if (data.gastos.length > 0) {
    currentY = checkNewPage(doc, currentY, 80);
    
    doc.setFillColor(...dangerColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("GASTOS REGISTRADOS", marginLeft + 2, currentY + 2);
    
    currentY += 8;
    
    const gastosData = data.gastos.map(g => [
      g.id.toString(),
      g.descripcion,
      g.metodo_pago.toUpperCase(),
      `Bs ${g.monto.toFixed(2)}`,
      safeFormatDateTime(g.creado_en, "dd/MM HH:mm"),
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Descripcion", "Metodo", "Monto", "Fecha/Hora"]],
      body: gastosData,
      theme: "striped",
      headStyles: { fillColor: dangerColor, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 75 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "center", cellWidth: 30 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc.lastAutoTable?.finalY ?? 0) + 8;
  }

  // ========== CIERRE ==========
  currentY = checkNewPage(doc, currentY, 90);
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CIERRE DE CAJA", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  doc.setFillColor(...lightGray);
  doc.roundedRect(marginLeft, currentY, contentWidth, 35, 2, 2, "F");
  
  const cierreY = currentY + 8;
  const cierreLeft = marginLeft + 5;
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  
  // Row 1
  doc.setFont("helvetica", "bold");
  doc.text("Caja Inicial:", cierreLeft, cierreY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...successColor);
  doc.text(`Bs ${data.resumen.monto_inicial.toFixed(2)}`, cierreLeft + 35, cierreY);
  
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Total Ventas:", cierreLeft + 70, cierreY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...successColor);
  doc.text(`Bs ${data.resumen.total_del_dia.toFixed(2)}`, cierreLeft + 105, cierreY);
  
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Total Gastos:", cierreLeft + 135, cierreY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dangerColor);
  doc.text(`Bs ${data.resumen.total_gastos.toFixed(2)}`, cierreLeft + 165, cierreY);
  
  // Row 2
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Efectivo Esperado:", cierreLeft, cierreY + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...successColor);
  doc.setFontSize(12);
  doc.text(`Bs ${data.resumen.efectivo_esperado.toFixed(2)}`, cierreLeft + 45, cierreY + 12);
  
  if (data.caja.monto_contado !== undefined) {
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Efectivo Contado:", cierreLeft + 100, cierreY + 12);
    doc.setTextColor(...successColor);
    doc.text(`Bs ${(data.caja.monto_contado || 0).toFixed(2)}`, cierreLeft + 145, cierreY + 12);
  }
  
  // Row 3 - Diferencia
  if (data.caja.monto_contado !== undefined) {
    const diferencia = data.caja.diferencia || 0;
    const estadoDif = data.caja.estado_diferencia || 'exacto';
    
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Diferencia:", cierreLeft, cierreY + 22);
    
    doc.setTextColor(...(estadoDif === 'exacto' ? successColor : (estadoDif === 'sobrante' ? successColor : dangerColor)));
    doc.text(`${diferencia >= 0 ? '+' : ''}Bs ${diferencia.toFixed(2)}`, cierreLeft + 25, cierreY + 22);
    
    doc.setFont("helvetica", "normal");
    doc.text(`(${estadoDif.toUpperCase()})`, cierreLeft + 60, cierreY + 22);
  }
  
  currentY += 40;
  
  if (data.caja.cierre_obs) {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Obs:", marginLeft, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(data.caja.cierre_obs, marginLeft + 10, currentY);
    currentY += 6;
  }

  // ========== FIRMAS ==========
  currentY = checkNewPage(doc, currentY, 40);
  currentY += 20;

  const signWidth = 60;
  const signLeft = marginLeft + 20;
  const signRight = pageWidth - marginLeft - 20 - signWidth;

  doc.setDrawColor(150, 150, 150);
  doc.line(signLeft, currentY, signLeft + signWidth, currentY);
  doc.line(signRight, currentY, signRight + signWidth, currentY);

  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Firma de Cajero(a)", signLeft + signWidth / 2, currentY + 5, { align: "center" });
  doc.text("Firma de Supervisor(a)", signRight + signWidth / 2, currentY + 5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(data.caja.usuario_nombre || "________________", signLeft + signWidth / 2, currentY + 10, { align: "center" });

  // ========== FOOTER ==========
  addPageFooter(doc, pageWidth, doc.getNumberOfPages());
}

export function generateCajaReportPDF(data: ReporteCajaData): void {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  buildPDF(doc, data);
  const filename = `Reporte_Caja_${data.caja.id}_${data.caja.fecha}.pdf`;
  doc.save(filename);
}

export function generateCajaReportPDFDataUrl(data: ReporteCajaData): string {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  buildPDF(doc, data);
  return doc.output('datauristring');
}

export function generateGeneralReportPDF(
  cajas: ReporteCajaData[],
  fechaDesde?: string,
  fechaHasta?: string
): void {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const primaryColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const secondaryColor: [number, number, number] = [51, 65, 85]; // Slate 600

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE CONSOLIDADO DE VENTAS", 15, 18);
  
  doc.setFontSize(10);
  doc.text("RESTAURANTE V2", pageWidth - 15, 18, { align: "right" });
  
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 40, pageWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  if (fechaDesde || fechaHasta) {
    doc.text(`PERIODO: ${fechaDesde || "INICIO"} AL ${fechaHasta || "FIN"}`, 15, 45.5);
  } else {
    doc.text(`REPORTE GENERAL HISTORICO`, 15, 45.5);
  }
  doc.text(`EMISIÓN: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, pageWidth - 15, 45.5, { align: "right" });

  // Summary totals
  let currentY = fechaDesde || fechaHasta ? 65 : 60;
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN GENERAL", 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);

  currentY += 10;

  const totalVentas = cajas.reduce((sum, c) => sum + c.resumen.total_del_dia, 0);
  const totalGastos = cajas.reduce((sum, c) => sum + c.resumen.total_gastos, 0);
  const totalInicial = cajas.reduce((sum, c) => sum + c.resumen.monto_inicial, 0);
  const totalVentasEfectivo = cajas.reduce((sum, c) => sum + c.resumen.ventas_efectivo, 0);
  const totalVentasQR = cajas.reduce((sum, c) => sum + c.resumen.ventas_qr, 0);
  const totalVentasCount = cajas.reduce((sum, c) => {
    const count = c.resumen.ventas_count || (c.ventasDetalladas?.length) || (c.ventas?.length) || 0;
    return sum + count;
  }, 0);
  
  const allDeletedItems = cajas.flatMap(c => c.itemsEliminados || []);
  const totalDeletedItems = allDeletedItems.length;

  const summaryData = [
    ["Cajas Consolidadas", cajas.length.toString()],
    ["Ventas Totales", totalVentasCount.toString()],
    ["Ítems Eliminados", totalDeletedItems.toString()],
    ["Ventas en Efectivo", `Bs ${totalVentasEfectivo.toFixed(2)}`],
    ["Ventas por QR", `Bs ${totalVentasQR.toFixed(2)}`],
    ["Monto Inicial Total", `Bs ${totalInicial.toFixed(2)}`],
    ["Gastos Totales", `Bs ${totalGastos.toFixed(2)}`],
    ["BALANCE NETO", `Bs ${totalVentas.toFixed(2)}`],
  ];

  // Aggregated items summary
  const allItems = cajas.flatMap(c => c.items || []);
  const consolidatedItemsMap: Record<string, any> = {};
  
  allItems.forEach(item => {
    const key = `${item.nombre}-${item.tipo}`;
    if (!consolidatedItemsMap[key]) {
      consolidatedItemsMap[key] = { ...item, 
        cantidad: Number(item.cantidad), 
        total: Number(item.total) 
      };
    } else {
      consolidatedItemsMap[key].cantidad += Number(item.cantidad);
      consolidatedItemsMap[key].total += Number(item.total);
    }
  });
  
  const consolidatedItems = Object.values(consolidatedItemsMap).sort((a, b) => b.cantidad - a.cantidad);

  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: primaryColor, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { halign: "right", cellWidth: 45 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 115,
  });

  currentY = (doc.lastAutoTable?.finalY ?? 0) + 12;

  // ========== CONSOLIDADO DE PRODUCTOS ==========
  if (consolidatedItems.length > 0) {
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VENTAS CONSOLIDADAS POR PRODUCTO", 14, currentY);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    currentY += 8;

    const itemsData = consolidatedItems.map(item => [
      item.nombre,
      item.tipo === 'producto' ? 'PRODUCTO' : 'PLATO',
      item.cantidad,
      `Bs ${parseFloat((item.total / item.cantidad).toString()).toFixed(2)}`,
      `Bs ${parseFloat(item.total.toString()).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Descripción", "Categoría", "Cant.", "P. Unit", "Subtotal"]],
      body: itemsData,
      theme: "striped",
      headStyles: { fillColor: [71, 85, 105], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 75 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc.lastAutoTable?.finalY ?? 0) + 15;
  }

  // Each caja summary loop (keeping it for individual detail)
  cajas.forEach((caja) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(...primaryColor);
    doc.rect(14, currentY, pageWidth - 28, 10, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`TICKET DE CAJA: ${caja.caja.fecha} - ${caja.caja.cerrada ? 'CERRADA' : 'ABIERTA'}`, 17, currentY + 7);
    
    currentY += 14;

    const miniData = [
      ["Monto Inicial", `Bs ${caja.resumen.monto_inicial.toFixed(2)}`],
      ["Ventas Netas", `Bs ${caja.resumen.total_del_dia.toFixed(2)}`],
      ["Recaudado Efe.", `Bs ${caja.resumen.ventas_efectivo.toFixed(2)}`],
      ["Recaudado QR", `Bs ${caja.resumen.ventas_qr.toFixed(2)}`],
      ["Egresos/Gastos", `Bs ${caja.resumen.total_gastos.toFixed(2)}`],
      [`Operaciones:`, `${caja.resumen.ventas_count || caja.ventas.length} transacciones`],
    ];

    autoTable(doc, {
      startY: currentY,
      body: miniData,
      theme: "grid",
      headStyles: { fillColor: [240, 240, 240], textColor: secondaryColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold" },
        1: { halign: "right", cellWidth: 45 },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 85,
    });

    currentY = (doc.lastAutoTable?.finalY ?? 0) + 8;
  });

  // ========== AGGREGATED DELETED ITEMS ==========
  if (allDeletedItems.length > 0) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(...secondaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("AUDITORÍA CONSOLIDADA: ÍTEMS ELIMINADOS", 14, currentY);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    currentY += 8;

    const eliminadosData = allDeletedItems.map((item: any) => [
      item.transaccion_nro,
      item.producto_nombre || item.plato_nombre || 'N/A',
      item.cantidad,
      `Bs ${parseFloat(item.precio_unitario.toString()).toFixed(2)}`,
      `Bs ${parseFloat(item.subtotal.toString()).toFixed(2)}`,
      safeFormatDateTime(item.borrado_en, "dd/MM HH:mm")
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Ticket", "Producto / Detalle", "Cant.", "P. Unit", "Total", "Fecha/Hora"]],
      body: eliminadosData,
      theme: "grid",
      headStyles: { fillColor: secondaryColor, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 35, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  addPageFooter(doc, pageWidth, doc.getNumberOfPages());

  const filename = `Reporte_Consolidado_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(filename);
}
