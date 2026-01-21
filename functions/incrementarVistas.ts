import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { productoId } = await req.json();

        if (!productoId) {
            return Response.json({ error: 'Falta ID de producto' }, { status: 400 });
        }

        // Obtener producto
        const productos = await base44.entities.Producto.filter({ id: productoId }, '-created_date', 1);
        const producto = productos[0];

        if (!producto) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // Incrementar vistas
        await base44.entities.Producto.update(productoId, {
            vistas_totales: (producto.vistas_totales || 0) + 1
        });

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error incrementando vistas:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});