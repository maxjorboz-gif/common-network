// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json().catch(() => ({}));
        const { productoId } = body;

        if (!productoId) return Response.json({ error: 'Falta ID' }, { status: 400 });

        // 1. Obtención Directa
        const producto = await base44.asServiceRole.entities.Producto.get(productoId).catch(() => null);

        if (!producto) return Response.json({ error: 'No encontrado' }, { status: 404 });

        // 2. Dato Crudo (Single Source of Truth)
        const stock = Number(producto.stock_actual) || 0;

        return Response.json({
            success: true,
            stock: stock,
            disponible: stock > 0,
            titulo: producto.titulo
        });

    } catch (error) {
        return Response.json({ error: 'Error stock' }, { status: 500 });
    }
});