// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // AUTH SIMPLE
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') return Response.json({ error: 'Acceso denegado' }, { status: 403 });

        const { productoId } = await req.json();
        if (!productoId) return Response.json({ error: 'ID requerido' }, { status: 400 });

        // ACCIÓN DIRECTA: Borrar sin preguntar
        // Intentamos borrar atributos primero (limpieza)
        try {
            const attrs = await base44.asServiceRole.entities.AtributoProducto.filter({ id_producto: productoId });
            for (const a of attrs) await base44.asServiceRole.entities.AtributoProducto.delete(a.id);
        } catch (e) { }

        // Borrar producto
        await base44.asServiceRole.entities.Producto.delete(productoId);

        return Response.json({ success: true, mensaje: 'Producto eliminado' });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});