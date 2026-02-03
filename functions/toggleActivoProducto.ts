// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId, activo } = await req.json().catch(() => ({}));

        if (!productoId || activo === undefined) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Actualizar estado (SDK Update)
        await adminClient.entities.Producto.update(productoId, {
            activo: Boolean(activo),
            updated_at: new Date().toISOString()
        });

        // 2. Obtener actualizado (SDK Get)
        // SDK update returns empty/partial usually.
        const productoActualizado = await adminClient.entities.Producto.get(productoId);

        return Response.json({
            success: true,
            producto: productoActualizado,
            mensaje: `Producto ${activo ? 'activado' : 'desactivado'}`
        });

    } catch (error) {
        console.error('Error toggleActivoProducto:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});