// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

import { withAuth } from './_core/withAuth.ts';


Deno.serve(async (req) => {
    return await withAuth(req, async (ctx) => {
        const base44 = createClientFromRequest(req);

        // El middleware valida auth, pero para crear productos validamos 'admin' de comercio (o super admin)
        // en este caso 'merchant' es suficiente si tiene un tenantId

        if (!ctx.user || !ctx.tenant) {
            return Response.json({ error: "Contexto inválido: Usuario no tiene comercio asignado." }, { status: 403 });
        }

        const { productoData, atributos } = await req.json();

        // Validamos campos requeridos básicos
        if (!productoData || !productoData.titulo || !productoData.precio_estandar) {
            return Response.json({ error: 'Parámetros incompletos: Titulo y Precio son obligatorios' }, { status: 400 });
        }

        const precioEstandar = parseFloat(productoData.precio_estandar || 0);

        if (!productoData.categoria || productoData.categoria.trim() === '') {
            return Response.json({ error: 'Categoría es obligatoria' }, { status: 400 });
        }

        // BLINDAJE: ID COMERCIO DINÁMICO (tomado del Token/Contexto)
        const commerceCode = ctx.tenant.commerceCode;

        // Crear producto
        const nuevoProducto = await base44.asServiceRole.entities.Producto.create({
            ...productoData,
            commerce_code: commerceCode,
            precio_estandar: precioEstandar,
            precio_minimo: parseFloat(productoData.precio_minimo || 0),
            stock_actual: parseInt(productoData.stock_actual || 0),
            costo_producto: parseFloat(productoData.costo_producto || 0),
            activo: true,
            total_vendidos: 0,
            promedio_estrellas: 0,
            total_resenas: 0,
            vistas_totales: 0
        });

        // Crear atributos si existen
        if (atributos && atributos.length > 0) {
            const atributosParaCrear = atributos.map((attr, index) => ({
                id_producto: nuevoProducto.id,
                nombre_atributo: attr.nombre_atributo,
                valor_atributo: attr.valor_atributo,
                ia_weight: attr.ia_weight || 5,
                orden: index
            }));
            await base44.asServiceRole.entities.AtributoProducto.bulkCreate(atributosParaCrear);
        }

        return Response.json({
            success: true,
            producto: nuevoProducto,
            mensaje: 'Producto creado exitosamente'
        });
    });
});

