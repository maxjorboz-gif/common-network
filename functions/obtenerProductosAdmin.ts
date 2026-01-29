// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }



        const body = await req.json();
        const { commerce_code: idRecibido, id_comercio: legacyId } = body;
        const commerceCode = idRecibido || legacyId;

        if (!commerceCode) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        // === RESOLUCIÓN DE IDENTIDAD ===
        const id_base44_interno = commerceCode;
        // ==============================

        // HEURÍSTICA DE COMPATIBILIDAD
        const isLegacyId = id_base44_interno.length > 20;

        const filter = {};
        if (isLegacyId) {
            filter.id_comercio = id_base44_interno;
        } else {
            filter.commerce_code = id_base44_interno;
        }

        const productos = await base44.asServiceRole.entities.Producto.filter(filter, '-created_date', 100);

        // Normalizar stock para el admin
        const productosNorm = productos.map((p) => ({
            ...p,
            stock_actual: Number(p.stock !== undefined ? p.stock : (p.stock_actual !== undefined ? p.stock_actual : 0))
        }));

        return Response.json({
            success: true,
            productos: productosNorm
        });

    } catch (error) {
        console.error('Error productos admin:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
