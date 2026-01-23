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
        const { id_comercio: idRecibido } = body;

        if (!idRecibido) {
            return Response.json({ error: 'Falta ID de comercio (id_comercio)' }, { status: 400 });
        }

        // === RESOLUCIÓN DE IDENTIDAD ===
        const id_base44_interno = idRecibido;
        // ==============================
        // ==========================================

        const productos = await base44.asServiceRole.entities.Producto.filter({
            id_comercio: id_base44_interno
        }, '-created_date', 100);

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
