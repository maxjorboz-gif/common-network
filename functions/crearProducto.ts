// @ts-nocheck
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const { productoData, atributos, commerce_code, id_comercio } = body;

        // Validamos campos requeridos básicos
        if (!productoData || !productoData.titulo || !productoData.precio_estandar) {
            return Response.json({ error: 'Parámetros incompletos: Titulo y Precio son obligatorios' }, { status: 400 });
        }

        const commerceCodeFinal = commerce_code || productoData.commerce_code;
        const idComercioFinal = id_comercio || productoData.id_comercio;

        if (!commerceCodeFinal) {
            return Response.json({ error: 'Falta commerce_code' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // ENTITY PAYLOAD
        const entityPayload = {
            id_comercio: idComercioFinal,
            commerce_code: commerceCodeFinal,
            titulo: productoData.titulo,
            descripcion: productoData.descripcion,
            descripcion_tecnica: productoData.descripcion_tecnica,
            sku_taller_interno: productoData.sku_taller_interno || `SKU-${Date.now()}`,
            precio_estandar: parseFloat(productoData.precio_estandar || 0),
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
            vistas_totales: 0,
            created_at: new Date().toISOString()
        };

        // 1. CREAR PRODUCTO (SDK)
        const nuevoProducto = await adminClient.entities.Producto.create(entityPayload);

        // 2. CREAR ATRIBUTOS (SDK)
        if (atributos && Array.isArray(atributos)) {
            for (let i = 0; i < atributos.length; i++) {
                const attr = atributos[i];
                await adminClient.entities.AtributoProducto.create({
                    id_producto: nuevoProducto.id || nuevoProducto._id,
                    nombre_atributo: attr.nombre_atributo,
                    valor_atributo: attr.valor_atributo,
                    ia_weight: attr.ia_weight || 5,
                    orden: i,
                    created_at: new Date().toISOString()
                });
            }
        }

        return Response.json({
            success: true,
            producto: nuevoProducto,
            mensaje: 'Producto creado exitosamente'
        });

    } catch (error) {
        console.error('Error crearProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
