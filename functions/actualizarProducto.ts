// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId, productoData, atributos } = await req.json();

        if (!productoId || !productoData) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Obtener producto por ID (SDK)
        let productoActual;
        try {
            productoActual = await adminClient.entities.Producto.get(productoId);
        } catch (e) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        if (productoData.precio_estandar) {
            productoData.precio_estandar = parseFloat(productoData.precio_estandar);
        }

        // 2. Actualizar producto (SDK update)
        await adminClient.entities.Producto.update(productoId, {
            ...productoData,
            stock_actual: productoData.stock_actual !== undefined ? parseInt(productoData.stock_actual) : productoActual.stock_actual,
            costo_producto: productoData.costo_producto !== undefined ? parseFloat(productoData.costo_producto) : productoActual.costo_producto,
            updated_at: new Date().toISOString()
        });

        // 3. Gestionar atributos (SDK)
        if (atributos && Array.isArray(atributos)) {
            // Delete old attributes
            try {
                const atributosAntiguos = await adminClient.entities.AtributoProducto.filter({
                    id_producto: productoId
                });

                // Delete in parallel
                await Promise.all(atributosAntiguos.map(attr =>
                    adminClient.entities.AtributoProducto.delete(attr.id || attr._id)
                ));
            } catch (e) {
                console.warn("Error borrando atributos antiguos:", e);
            }

            // Create new attributes
            for (let i = 0; i < atributos.length; i++) {
                await adminClient.entities.AtributoProducto.create({
                    id_producto: productoId,
                    nombre_atributo: atributos[i].nombre_atributo,
                    valor_atributo: atributos[i].valor_atributo,
                    ia_weight: atributos[i].ia_weight || 5,
                    orden: i,
                    created_at: new Date().toISOString()
                });
            }
        }

        return Response.json({ success: true, mensaje: 'Producto actualizado exitosamente' });

    } catch (error) {
        console.error('Error actualizarProducto:', error);
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
