import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Plus,
    Minus,
    Trash2,
    ShoppingBag,
    Utensils,
    Sparkles,
    Search,
    Check,
    ChevronsUpDown,

    PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ItemRow } from "../types/transaccion.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type { Producto } from "@/modules/productos/types/producto.types";
import { useState, type KeyboardEvent, type RefObject } from "react";

interface TransactionItemsTableProps {
    rows: ItemRow[];
    platos: Plato[];
    productos: Producto[];
    selectItem: (rowId: string, itemId: string) => void;
    updateRow: (id: string, updates: Partial<ItemRow>) => void;
    incrementCantidad: (id: string) => void;
    decrementCantidad: (id: string) => void;
    addNewRow: () => void;
    removeRow: (id: string) => void;
    addExtraToRow: (rowId: string, precio: number, descripcion: string) => void;
    removeExtraFromRow: (rowId: string, extraId: string) => void;
    handleKeyDown: (e: KeyboardEvent, rowId: string, rowIndex: number, cell: "cantidad" | "notas") => void;
    cantidadInputRefs: RefObject<{ [key: string]: HTMLInputElement | null }>;
    notasInputRefs: RefObject<{ [key: string]: HTMLInputElement | null }>;
    ubicacion: string[];
}

export function TransactionItemsTable({
    rows,
    platos,
    productos,
    selectItem,
    updateRow,
    incrementCantidad,
    decrementCantidad,
    addNewRow,
    removeRow,
    addExtraToRow,
    removeExtraFromRow,
    handleKeyDown,
    cantidadInputRefs,
    notasInputRefs,
    ubicacion,
}: TransactionItemsTableProps) {
    const [localExtraForms, setLocalExtraForms] = useState<{ [key: string]: { descripcion: string, precio: string } }>({});

    const updateLocalExtra = (rowId: string, updates: { descripcion?: string, precio?: string }) => {
        setLocalExtraForms(prev => ({
            ...prev,
            [rowId]: {
                descripcion: prev[rowId]?.descripcion ?? "",
                precio: prev[rowId]?.precio ?? "",
                ...updates
            }
        }));
    };

    const handleAddExtra = (rowId: string) => {
        const form = localExtraForms[rowId];
        if (!form) return;

        const price = parseFloat(form.precio);
        if (price > 0) {
            addExtraToRow(rowId, price, form.descripcion);
            updateLocalExtra(rowId, { descripcion: "", precio: "" });
        }
    };
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Items del Pedido</h3>
                        <p className="text-xs text-muted-foreground">Administra los platos y productos de esta venta</p>
                    </div>
                </div>
                <Button
                    onClick={addNewRow}
                    variant="default"
                    size="sm"
                    className="shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4 mr-2" /> Agregar Item
                </Button>
            </div>

            {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground animate-in fade-in zoom-in duration-300">
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <PackageOpen className="h-10 w-10 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No hay items en el pedido</p>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={addNewRow}
                        className="mt-1"
                    >
                        Haz clic aquí para empezar
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop View - Table */}
                    <div className="hidden md:block border rounded-xl overflow-hidden shadow-sm bg-card transition-all">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                                    <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                                    <TableHead className="w-[140px] font-bold">Ubicación</TableHead>
                                    <TableHead className="min-w-[250px] font-bold">Item (Producto o Plato)</TableHead>
                                    <TableHead className="w-[130px] text-center font-bold">Cantidad</TableHead>
                                    <TableHead className="w-[240px] font-bold">Extra Rápido</TableHead>
                                    <TableHead className="min-w-[150px] font-bold">Observaciones</TableHead>
                                    <TableHead className="w-[70px] text-right font-bold pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={row.id} className="group hover:bg-muted/20 transition-colors border-b last:border-0 align-middle">
                                        <TableCell className="text-center py-2">
                                            <span className="font-mono text-xs text-muted-foreground font-medium">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                        </TableCell>

                                        {/* Item Selection with Searchable Combobox */}
                                        <TableCell>
                                            <MesaSelector
                                                value={row.mesa}
                                                onChange={(val: string) => updateRow(row.id, { mesa: val })}
                                                ubicacion={ubicacion}
                                                rowId={row.id}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col gap-1.5 py-1">
                                                <ItemSelector
                                                    value={row.item_id}
                                                    itemNombre={row.item_nombre}
                                                    onSelect={(value) => selectItem(row.id, value)}
                                                    onNameChange={(name: string) => updateRow(row.id, { item_nombre: name })}
                                                    platos={platos}
                                                    productos={productos}
                                                />

                                                {/* Inline Extras Display */}
                                                {row.extras.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5 animate-in slide-in-from-left-2 duration-200">
                                                        {row.extras.map((extra) => (
                                                            <Badge
                                                                key={extra.id}
                                                                variant="secondary"
                                                                className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-700 border-amber-200 group/badge animate-in fade-in"
                                                            >
                                                                <Sparkles className="h-2.5 w-2.5 mr-1" />
                                                                <span>{extra.descripcion}</span>
                                                                <span className="mx-1">•</span>
                                                                <span>Bs {extra.precio.toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => removeExtraFromRow(row.id, extra.id)}
                                                                    className="ml-1.5 hover:text-destructive transition-colors"
                                                                >
                                                                    <Trash2 className="h-2.5 w-2.5" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Cantidad */}
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center bg-muted/30 rounded-lg p-1 border">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-md hover:bg-background shadow-none transition-all active:scale-90"
                                                        onClick={() => decrementCantidad(row.id)}
                                                        disabled={row.cantidad <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <Input
                                                        ref={(el) => {
                                                            if (cantidadInputRefs.current) {
                                                                cantidadInputRefs.current[row.id] = el;
                                                            }
                                                        }}
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={row.cantidad}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                            updateRow(row.id, {
                                                                cantidad: parseInt(e.target.value) || 1,
                                                            })
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleKeyDown(e, row.id, index, "cantidad")
                                                        }
                                                        className="text-center h-7 w-12 border-0 bg-transparent focus-visible:ring-0 font-bold p-0"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-md hover:bg-background shadow-none transition-all active:scale-90"
                                                        onClick={() => incrementCantidad(row.id)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Inline Extra Inputs - NOW IN THE CORRECT CELL */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 focus-within:opacity-100 transition-opacity">

                                                <div className="flex items-center gap-1 w-full max-w-[160px]">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">Bs</span>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={localExtraForms[row.id]?.precio || ""}
                                                            onChange={(e) => updateLocalExtra(row.id, { precio: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleAddExtra(row.id);
                                                                }
                                                            }}
                                                            className="h-9 pl-7 pr-1 text-[11px] font-bold rounded-xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all w-full"
                                                            disabled={!row.item_id}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-9 w-9 shrink-0 rounded-xl hover:bg-amber-100 hover:text-amber-600 border border-dashed border-amber-200 disabled:opacity-30 transition-all active:scale-95"
                                                        onClick={() => handleAddExtra(row.id)}
                                                        disabled={!row.item_id || !localExtraForms[row.id]?.precio}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Notas */}
                                        <TableCell>
                                            <div className="relative group/input">
                                                <Input
                                                    ref={(el) => {
                                                        if (notasInputRefs.current) {
                                                            notasInputRefs.current[row.id] = el;
                                                        }
                                                    }}
                                                    value={row.notas}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        updateRow(row.id, { notas: e.target.value })
                                                    }
                                                    placeholder="Sin observaciones..."
                                                    className="h-9 bg-muted/10 border-muted-foreground/20 focus:bg-background transition-colors text-sm"
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(e, row.id, index, "notas")
                                                    }
                                                />
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRow(row.id)}
                                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View - Cards */}
                    <div className="md:hidden space-y-4">
                        {rows.map((row, index) => (
                            <div key={row.id} className="p-4 border shadow-sm rounded-2xl bg-card space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

                                <div className="flex items-center justify-between pl-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {index + 1}
                                        </div>
                                        {row.item_nombre && (
                                            <Badge variant="outline" className="text-[10px] py-0 border-primary/20 text-primary">
                                                {row.tipo === "plato" ? "PLATO" : "PRODUCTO"}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRow(row.id)}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4 pl-1">
                                    <div className="space-y-1.5 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                        <label className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">Ubicación del Item</label>
                                        <MesaSelector
                                            value={row.mesa}
                                            onChange={(val: string) => updateRow(row.id, { mesa: val })}
                                            ubicacion={ubicacion}
                                            rowId={row.id}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Seleccionar Item</label>
                                        <ItemSelector
                                            value={row.item_id}
                                            itemNombre={row.item_nombre}
                                            onSelect={(value) => selectItem(row.id, value)}
                                            onNameChange={(name: string) => updateRow(row.id, { item_nombre: name })}
                                            platos={platos}
                                            productos={productos}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Cantidad</label>
                                            <div className="flex items-center justify-between bg-muted/30 rounded-xl p-1 border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg bg-background shadow-sm hover:shadow active:scale-90"
                                                    onClick={() => decrementCantidad(row.id)}
                                                    disabled={row.cantidad <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="font-bold text-lg">{row.cantidad}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg bg-background shadow-sm hover:shadow active:scale-90"
                                                    onClick={() => incrementCantidad(row.id)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                            <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest pl-1">Agregar Extra (Opcional)</label>
                                            <div className="flex items-center gap-2">

                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={localExtraForms[row.id]?.precio || ""}
                                                        onChange={(e) => updateLocalExtra(row.id, { precio: e.target.value })}
                                                        className="h-10 text-xs font-bold rounded-xl flex-1 bg-background"
                                                        disabled={!row.item_id}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        className="h-10 w-10 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                                                        onClick={() => handleAddExtra(row.id)}
                                                        disabled={!row.item_id || !localExtraForms[row.id]?.precio}
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Notas / Observaciones</label>
                                        <Input
                                            value={row.notas}
                                            onChange={(e) => updateRow(row.id, { notas: e.target.value })}
                                            placeholder="Ej. Sin cebolla, término medio..."
                                            className="h-11 rounded-xl bg-muted/10"
                                        />
                                    </div>

                                    {/* Mobile Extras Display */}
                                    {row.extras.length > 0 && (
                                        <div className="flex flex-wrap gap-2 py-1">
                                            {row.extras.map((extra) => (
                                                <Badge
                                                    key={extra.id}
                                                    variant="secondary"
                                                    className="bg-amber-50 text-amber-700 border-amber-200/50 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                                                >
                                                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                                                    {extra.descripcion}: Bs {extra.precio.toFixed(2)}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Mesa Selector for each row
 */
function MesaSelector({
    value,
    onChange,
    ubicacion,
    rowId
}: {
    value: string;
    onChange: (val: string) => void;
    ubicacion: string[];
    rowId: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <Input
                placeholder="Mesa/Ubic..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pr-10 h-9 text-xs font-medium bg-background/50 focus:bg-background transition-all rounded-xl border-muted-foreground/10"
                id={`mesa-input-${rowId}`}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent text-muted-foreground"
                    >
                        <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[180px] p-0 shadow-2xl border-primary/10 rounded-2xl overflow-hidden" align="end">
                    <Command>
                        <CommandList className="max-h-[250px] overflow-y-auto">
                            <CommandGroup>
                                {ubicacion.map((ubic) => (
                                    <CommandItem
                                        key={ubic}
                                        value={ubic}
                                        onSelect={(currentValue) => {
                                            const originalValue = ubicacion.find((u) => u.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                                            const newValue = originalValue === "Para llevar" ? originalValue : `${originalValue} `;
                                            onChange(newValue);
                                            setOpen(false);
                                            setTimeout(() => {
                                                document.getElementById(`mesa-input-${rowId}`)?.focus();
                                            }, 50);
                                        }}
                                        className="py-2.5 px-3 cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Check className={cn(
                                                "h-3.5 w-3.5 text-primary",
                                                value?.startsWith(ubic) ? "opacity-100" : "opacity-0"
                                            )} />
                                            <span className="text-sm font-medium">{ubic}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

/**
 * Searchable Item Selector (Combobox)
 */
function ItemSelector({
    value,
    itemNombre,
    onSelect,
    onNameChange,
    platos,
    productos,
    className
}: {
    value: string;
    itemNombre: string;
    onSelect: (val: string) => void;
    onNameChange: (name: string) => void;
    platos: Plato[];
    productos: Producto[];
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    const selectedPlato = platos.find(p => p.id === value);
    const selectedProducto = productos.find(p => p.id === value);

    const price = selectedPlato
        ? Number(selectedPlato.precio).toFixed(2)
        : selectedProducto
            ? Number(selectedProducto.precio).toFixed(2)
            : null;

    return (
        <div className="relative group/selector w-full">
            <Input
                placeholder="Item o descripción..."
                value={itemNombre}
                onChange={(e) => onNameChange(e.target.value)}
                className={cn(
                    "h-9 pr-14 text-sm font-medium bg-background/50 focus:bg-background transition-all rounded-xl border-muted-foreground/10",
                    !value && "text-muted-foreground italic font-normal",
                    className
                )}
            />
            <div className="absolute right-0 top-0 h-full flex items-center pr-1 gap-0.5">
                {price && (
                    <span className="text-[9px] font-bold text-success/70 pointer-events-none px-1.5 py-0.5 rounded-lg border border-success/20 bg-success/5 mr-1">
                        Bs {price}
                    </span>
                )}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted/50 text-muted-foreground"
                        >
                            <Search className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[320px] shadow-2xl border-primary/10 rounded-2xl overflow-hidden" align="start">
                        <Command>
                            <div className="flex items-center border-b px-3 bg-muted/20">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <CommandInput placeholder="Buscar plato o producto..." className="h-10 border-none focus:ring-0 bg-transparent" />
                            </div>
                            <CommandList className="max-h-[300px] overflow-y-auto">
                                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No se encontraron resultados.</CommandEmpty>

                                {platos.length > 0 && (
                                    <CommandGroup heading="Platos">
                                        {platos.map((plato) => (
                                            <CommandItem
                                                key={plato.id}
                                                value={plato.nombre}
                                                onSelect={() => {
                                                    onSelect(plato.id);
                                                    setOpen(false);
                                                }}
                                                className="flex items-center justify-between cursor-pointer py-2.5 px-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Utensils className="h-4 w-4 text-orange-500" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm leading-none mb-1">{plato.nombre}</span>
                                                        <span className="text-[10px] text-muted-foreground">Bs {Number(plato.precio).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {value === plato.id && <Check className="h-4 w-4 text-primary" />}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                {productos.length > 0 && (
                                    <CommandGroup heading="Productos">
                                        {productos.map((producto) => (
                                            <CommandItem
                                                key={producto.id}
                                                value={producto.nombre}
                                                onSelect={() => {
                                                    onSelect(producto.id);
                                                    setOpen(false);
                                                }}
                                                className="flex items-center justify-between cursor-pointer py-2.5 px-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm leading-none mb-1">{producto.nombre}</span>
                                                        <span className="text-[10px] text-muted-foreground">Bs {Number(producto.precio).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {value === producto.id && <Check className="h-4 w-4 text-primary" />}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

