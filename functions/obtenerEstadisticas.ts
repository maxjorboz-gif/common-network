// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { id_comercio } = await req.json();

        if (!id_comercio) return Response.json({ error: 'Falta ID Soberano' }, { status: 400 });

        // 1. OBTENCION DE DATOS POR ID SOBERANO (000001...)
        const ordenes = await base44.asServiceRole.entities.Orden.filter({
            id_comercio: id_comercio
        }, '-created_date', 500);

        const gastos = await base44.asServiceRole.entities.GastoPublicitario.filter({
            id_comercio: id_comercio
        }, '-fecha', 100);

        const productos = await base44.asServiceRole.entities.Producto.filter({
            id_comercio: id_comercio
        }, '-created_date', 500);

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
