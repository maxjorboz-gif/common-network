// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId, fecha_inicio, fecha_fin } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) {
            return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. OBTENCION DE DATOS INTEGRAL (Dashboard para el Comercio) - SDK Parallel
        const [ordenesAll, gastosAll, productos, sorteosActivos, leadsSorteo] = await Promise.all([
            adminClient.entities.Orden.filter({ commerce_code: idBusqueda }).catch(() => []),
            adminClient.entities.GastoPublicitario.filter({ commerce_code: idBusqueda }).catch(() => []),
            adminClient.entities.Producto.filter({ commerce_code: idBusqueda }).catch(() => []),
            adminClient.entities.Sorteo.filter({ commerce_code: idBusqueda, activo: true }).catch(() => []), // Assuming exact match supported
            adminClient.entities.Lead.filter({ commerce_code: idBusqueda, origen: 'sorteo' }).catch(() => [])
        ]);

        // FILTRADO POR FECHA GLOBAL
        const start = fecha_inicio ? new Date(fecha_inicio) : null;
        const end = fecha_fin ? new Date(fecha_fin) : null;
        if (end) end.setHours(23, 59, 59, 999); // Final del día

        const filterDate = (item, dateField) => {
            if (!start && !end) return true;
            const d = new Date(item[dateField] || item.created_at);
            if (start && d < start) return false;
            if (end && d > end) return false;
            return true;
        };

        const ordenes = Array.isArray(ordenesAll) ? ordenesAll.filter(o => filterDate(o, 'fecha_creacion')) : [];
        const gastos = Array.isArray(gastosAll) ? gastosAll.filter(g => filterDate(g, 'fecha')) : [];

        // 2. CALCULOS DE VENTAS Y ADS
        const totalVentas = ordenes
            .filter(o => o.estado === 'PAGADA' || o.estado === 'ENTREGADA')
            .reduce((sum, o) => sum + (Number(o.resumen_economico?.total_final) || 0), 0);

        const totalGastoAds = gastos
            // Filtramos solicitudes pendientes, rechazadas o ARCHIVADAS (Reset)
            .filter(g => (!g.status || g.status === 'approved') && !g.archived)
            .reduce((sum, g) => sum + (Number(g.monto) || 0), 0);

        // 3. LOGICA DE SORTEO (Marketing Motivacional)
        const sorteoActivo = Array.isArray(sorteosActivos) && sorteosActivos.length > 0 ? sorteosActivos[0] : null;
        const totalParticipantes = Array.isArray(leadsSorteo) ? leadsSorteo.length : 0;

        // Mensaje tentador para el administrador
        let marketingMessage = "¡Lanza un sorteo para atraer clientes hoy!";
        if (sorteoActivo) {
            marketingMessage = `¡Tu sorteo está funcionando! Tienes ${totalParticipantes} clientes potenciales nuevos esperando ganar la ${sorteoActivo.titulo || 'premio'}.`;
        }

        // 4. Top Productos Calculation (Simplified)
        // Group orders items
        const productStats = {};
        for (const o of ordenes) {
            if (o.items && Array.isArray(o.items) && (o.estado === 'PAGADA' || o.estado === 'ENTREGADA')) {
                for (const item of o.items) {
                    const key = item.titulo || item.product_id;
                    if (!productStats[key]) productStats[key] = { titulo: key, cantidad: 0, revenue: 0 };
                    productStats[key].cantidad += (item.cantidad || 1);
                    productStats[key].revenue += (Number(item.precio_unitario) * (Number(item.cantidad) || 1));
                }
            }
        }
        const topProductos = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);


        return Response.json({
            success: true,
            estadisticas: {
                totalVentas: Math.round(totalVentas),
                totalOrdenes: Array.isArray(ordenes) ? ordenes.length : 0,
                totalGastoAds: Math.round(totalGastoAds),
                roas: totalGastoAds > 0 ? (totalVentas / totalGastoAds).toFixed(2) : 0,
                productosStockBajo: (Array.isArray(productos) ? productos : []).filter(p => (Number(p.stock_actual) || 0) <= 5).length,
                topProductos
            },
            marketing: {
                sorteoActivo: !!sorteoActivo,
                participantesSorteo: totalParticipantes,
                mensaje: marketingMessage
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticas:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
