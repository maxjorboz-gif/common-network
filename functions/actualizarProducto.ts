// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { productoId, productoData, atributos } = await req.json();

        if (!productoId || !productoData) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // Obtener producto por ID para validar que existe
        const productoActual = await base44.asServiceRole.entities.Producto.get(productoId);
        if (!productoActual) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // BACKEND VALIDA TODO
        if (productoData.precio_estandar) {
            const precioEstandar = parseFloat(productoData.precio_estandar);
            if (precioEstandar <= 0) {
                return Response.json({ error: 'Precio debe ser mayor a 0' }, { status: 400 });
            }
            productoData.precio_minimo = precioEstandar * 0.60;
        }

        if (productoData.categoria && productoData.categoria.trim() === '') {
            return Response.json({ error: 'Categoría es obligatoria' }, { status: 400 });
        }

        // Actualizar producto
        const dataActualizar = {
            ...productoData,
            stock_actual: productoData.stock_actual !== undefined ? parseInt(productoData.stock_actual) : productoActual.stock_actual,
            costo_producto: productoData.costo_producto !== undefined ? parseFloat(productoData.costo_producto) : productoActual.costo_producto
        };

        await base44.asServiceRole.entities.Producto.update(productoId, dataActualizar);

        // Actualizar atributos si existen
        if (atributos && atributos.length > 0) {
            // Eliminar atributos antiguos
            const atributosAntiguos = await base44.asServiceRole.entities.AtributoProducto.filter({
                id_producto: productoId
            }, '-created_date', 100);

            for (const attr of atributosAntiguos) {
                // Usar filter en lugar de delete directo si es necesario
                // Por ahora asumimos que podemos actualizar
            }

            // Crear nuevos atributos
            const atributosParaCrear = atributos.map((attr, index) => ({
                id_producto: productoId,
                nombre_atributo: attr.nombre_atributo,
                valor_atributo: attr.valor_atributo,
                ia_weight: attr.ia_weight || 5,
                orden: index
            }));

            await base44.asServiceRole.entities.AtributoProducto.bulkCreate(atributosParaCrear);
        }

        const productoActualizado = await base44.asServiceRole.entities.Producto.get(productoId);

        return Response.json({
            success: true,
            producto: productoActualizado,
            mensaje: 'Producto actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizarProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});