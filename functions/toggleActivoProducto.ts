// @ts-nocheck
// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { productoId, activo } = await req.json();

        if (!productoId || activo === undefined) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // Obtener producto por ID
        const producto = await base44.asServiceRole.entities.Producto.get(productoId);
        if (!producto) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // Actualizar estado
        await base44.asServiceRole.entities.Producto.update(productoId, {
            activo: Boolean(activo)
        });

        const productoActualizado = await base44.asServiceRole.entities.Producto.get(productoId);

        return Response.json({
            success: true,
            producto: productoActualizado,
            mensaje: `Producto ${activo ? 'activado' : 'desactivado'}`
        });

    } catch (error) {
        console.error('Error toggleActivoProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});