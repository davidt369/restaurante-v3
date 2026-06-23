import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";

interface TransaccionesStatsTabsProps {
    counts: {
        todos: number;
        pendiente: number;
        abierto: number;
        cerrado: number;
        cocina: number;
    };
}

export function TransaccionesStatsTabs({ counts }: TransaccionesStatsTabsProps) {
    return (
        <TabsList variant="line" className="w-full justify-start border-b overflow-x-auto scrollbar-hide whitespace-nowrap">
            <TabsTrigger id="tour-ventas-tab-pendiente" value="pendiente">
                Pendientes ({counts.pendiente})
            </TabsTrigger>
            <TabsTrigger id="tour-ventas-tab-cocina" value="cocina">
                <ChefHat className="h-4 w-4 mr-2" />
                Cocina ({counts.cocina})
            </TabsTrigger>
            <TabsTrigger id="tour-ventas-tab-abierto" value="abierto">
                Abiertos ({counts.abierto})
            </TabsTrigger>
            <TabsTrigger id="tour-ventas-tab-cerrado" value="cerrado">
                Cerrados ({counts.cerrado})
            </TabsTrigger>
            <TabsTrigger id="tour-ventas-tab-todos" value="todos">
                Todos ({counts.todos})
            </TabsTrigger>
        </TabsList>
    );
}
