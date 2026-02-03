// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId } = await req.json();
        if (!productoId) return Response.json({ error: 'ID requerido' }, { status: 400 });

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Limpieza de Atributos (SDK Direct)
        // Buscamos los atributos vinculados al producto para borrarlos
        try {
            const atributos = await adminClient.entities.AtributoProducto.filter({
                id_producto: productoId
            });

            // Delete in parallel or loop
            await Promise.all(atributos.map(attr =>
                adminClient.entities.AtributoProducto.delete(attr.id || attr._id)
            ));

        } catch (e) {
            console.error("Error eliminando atributos relacionados:", e);
        }

        // 2. Eliminar Producto (SDK)
        await adminClient.entities.Producto.delete(productoId);

        return Response.json({ success: true, mensaje: 'Producto eliminado' });

    } catch (error) {
        console.error('Error eliminarProducto:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});