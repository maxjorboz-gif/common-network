// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { productoId } = await req.json();

        if (!productoId) {
            return Response.json({ error: 'ID de producto requerido' }, { status: 400 });
        }

        // Obtener producto por ID
        const producto = await base44.asServiceRole.entities.Producto.get(productoId);
        if (!producto) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // BACKEND VALIDA: no permitir eliminar si hay órdenes asociadas
        const ordenesConProducto = await base44.asServiceRole.entities.Orden.filter({
            'items.id_producto': productoId
        }, '-created_date', 1);

        if (ordenesConProducto.length > 0) {
            return Response.json({
                error: 'No se puede eliminar: existen órdenes con este producto',
                codigo: 'PRODUCTO_CON_ORDENES'
            }, { status: 400 });
        }

        // Eliminar atributos del producto
        const atributos = await base44.asServiceRole.entities.AtributoProducto.filter({
            id_producto: productoId
        }, '-created_date', 100);

        // Aquí iría la lógica de eliminación de atributos
        // await base44.asServiceRole.entities.AtributoProducto.delete() - si existe

        // Eliminar producto
        await base44.asServiceRole.entities.Producto.delete(productoId);

        return Response.json({
            success: true,
            mensaje: 'Producto eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminarProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});