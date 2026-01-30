// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { commerce_code, id_comercio: legacyId } = await req.json();
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });

        // 1. OBTENCION DE DATOS
        const filter = {};
        if (idBusqueda.length > 20) {
            filter.id_comercio = idBusqueda;
        } else {
            filter.commerce_code = idBusqueda;
        }

        const ordenes = await base44.asServiceRole.entities.Orden.filter(filter, '-created_date', 500);

        const gastos = await base44.asServiceRole.entities.GastoPublicitario.filter(filter, '-fecha', 100);

        const productos = await base44.asServiceRole.entities.Producto.filter(filter, '-created_date', 500);

        // 2. CALCULOS
        const totalVentas = ordenes
            .filter(o => o.estado === 'PAGADA' || o.estado === 'ENTREGADA')
            .reduce((sum, o) => sum + (Number(o.resumen_economico?.total_final) || 0), 0);

        const totalGastoAds = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);

        return Response.json({
            success: true,
            estadisticas: {
                totalVentas: Math.round(totalVentas),
                totalOrdenes: ordenes.length,
                totalGastoAds: Math.round(totalGastoAds),
                roas: totalGastoAds > 0 ? (totalVentas / totalGastoAds).toFixed(2) : 0,
                productosStockBajo: productos.filter(p => (Number(p.stock) || 0) <= 5).length
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
