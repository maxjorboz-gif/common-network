
// @ts-nocheck
import { withAuth } from './_core/withAuth.ts';

Deno.serve(async (req) => {
    return await withAuth(req, async (ctx) => {

        if (!ctx.user || !ctx.tenant) {
            return Response.json({ error: "Contexto inválido: Usuario no tiene comercio asignado." }, { status: 403 });
        }

        const { productoData, atributos } = await req.json();

        // Validaciones
        if (!productoData || !productoData.titulo || !productoData.precio_estandar) {
            return Response.json({ error: 'Parámetros incompletos: Titulo y Precio son obligatorios' }, { status: 400 });
        }

        const precioEstandar = parseFloat(productoData.precio_estandar || 0);
        if (!productoData.categoria || productoData.categoria.trim() === '') {
            return Response.json({ error: 'Categoría es obligatoria' }, { status: 400 });
        }

        const commerceCode = ctx.tenant.commerceCode;

        // Payload
        const entityPayload = {
            id_comercio: ctx.tenant.id,
            commerce_code: commerceCode,
            titulo: productoData.titulo,
            descripcion: productoData.descripcion,
            descripcion_tecnica: productoData.descripcion_tecnica,
            sku_taller_interno: productoData.sku_taller_interno || `SKU-${Date.now()}`,

            precio_estandar: precioEstandar,
            precio_meta_referencia: parseFloat(productoData.precio_meta_referencia || 0),
            costo_producto: parseFloat(productoData.costo_producto || 0),
            moneda: productoData.moneda || 'ARS',

            categoria: productoData.categoria,
            subcategoria: productoData.subcategoria,
            meta_product_category: productoData.meta_product_category || productoData.categoria,

            fotos: productoData.fotos || [],
            videos: productoData.videos || [],
            imagen_principal: productoData.imagen_principal,

            stock_actual: parseInt(productoData.stock_actual || 0),
            stock_minimo_alerta: parseInt(productoData.stock_minimo_alerta || 5),
            activo: productoData.activo !== false,
            destacado: productoData.destacado || false,

            total_vendidos: 0,
            promedio_estrellas: 0,
            total_resenas: 0,
            vistas_totales: 0
        };

        // 1. CREATE PRODUCTO (Pattern)
        const prodResponse = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto`, {
            method: 'POST',
            headers: {
                'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entityPayload)
        });

        if (!prodResponse.ok) {
            const errorText = await prodResponse.text();
            throw new Error(`Error creando producto en Base44: ${errorText}`);
        }

        const nuevoProducto = await prodResponse.json();

        // 2. CREATE ATRIBUTOS
        if (atributos && atributos.length > 0) {
            const promises = atributos.map(async (attr, index) => {
                const attrPayload = {
                    id_producto: nuevoProducto.id || nuevoProducto._id,
                    nombre_atributo: attr.nombre_atributo,
                    valor_atributo: attr.valor_atributo,
                    ia_weight: attr.ia_weight || 5,
                    orden: index
                };

                await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto`, {
                    method: 'POST',
                    headers: {
                        'api_key': 'fb3a067ef3c44d8489059567b4206a91',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(attrPayload)
                });
            });
            await Promise.all(promises);
        }

        return Response.json({
            success: true,
            producto: nuevoProducto,
            mensaje: 'Producto creado exitosamente'
        });
    });
});
