import { useCocinaWebSocket } from "../hooks/use-cocina-websocket";
import { CocinaPedidosList } from "../components/cocina-pedidos-list";
import { CocinaHeader } from "../components/cocina-header";

export default function CocinaPage() {
    const { pedidos, isConnected, lastUpdate, loading, fetchPedidos } = useCocinaWebSocket();

    return (
        <div className="space-y-6 flex flex-col h-full">
            <CocinaHeader
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                loading={loading}
                onRefresh={fetchPedidos}
            />
            <div className="flex-1 overflow-auto">
                <CocinaPedidosList pedidos={pedidos} isLoading={loading} />
            </div>
        </div>
    );
}
