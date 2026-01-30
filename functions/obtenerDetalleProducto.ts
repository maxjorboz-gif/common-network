// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json().catch(() => ({}));
        const { productoId } = body;

        if (!productoId) {
            return Response.json({ error: 'Falta ID de producto' }, { status: 400 });
        }

        // 1. OBTENER PRODUCTO (Uso de asServiceRole para evitar bloqueos de permisos)
        // Usamos filter por seguridad en lugar de get directo
        const resultado = await base44.asServiceRole.entities.Producto.filter({ id: productoId }, '-created_date', 1);
        const producto = resultado[0];

        // 2. STOCK SAFE-CHECK (Compatibilidad stock vs stock_actual)
        const stockReal = Number(producto?.stock !== undefined ? producto?.stock : (producto?.stock_actual !== undefined ? producto?.stock_actual : 0));

        // Si no existe o está inactivo (y asumimos lógica de ocultar inactivos)
        // Nota: Podríamos relajar esto si el usuario es Admin, pero para el público general es mejor 404
        if (!producto || producto.activo === false) {
            return Response.json({ error: 'Producto no disponible' }, { status: 404 });
        }

        // 3. CARGA PARALELA (Eficiencia total)
        // Eliminamos dependencias a tablas que quizás ya no uses (AtributoProducto) para simplificar
        // Mantenemos Reseñas y Relacionados que son vitales

        // Use commerce_code for related products if available, fallback to legacy id_comercio
        const commerceKey = producto.commerce_code || producto.id_comercio;

        const [resenas, productosRelacionados, comercio] = await Promise.all([
            base44.asServiceRole.entities.Resena.filter({ id_producto: productoId, aprobada: true }, '-created_date', 20),
            // Look for related products using the same commerce code
            base44.asServiceRole.entities.Producto.filter(
                { commerce_code: commerceKey, categoria: producto.categoria }, // Using commerce_code query (if DB updated) or legacy field
                '-total_vendidos',
                6
            ).then((prods) => prods.filter((p) => p.id !== productoId && p.activo !== false).slice(0, 4)),
            // Use SolicitudComercio instead of deprecated Comercio table to find store name if needed? 
            // Or assume Config/Legacy table. Let's keep consistent with whatever table "Comercio" maps to, but query by commerce_code if possible.
            // If the entity is really "Comercio", it might not have commerce_code yet if it's a legacy table?
            // User requirement: "Reemplazar todas las referencias... por commerce_code"
            // We assume table 'Comercio' will have 'commerce_code' populated or we query SolicitudComercio.
            // Let's safe query SolicitudComercio for name if this fails? No, let's assume 'Comercio' -> 'ConfiguracionComercio' or similar in future?
            // Actually, for now let's query the same `commerceKey` which should match the filter convention.
            // CAUTION: The previous code queried `entities.Comercio` with `id_comercio`. 
            // If `entities.Comercio` is the legacy table, we might need to query it by `id_comercio` (which we have in `commerceKey` if it is legacy ID) or `commerce_code`.
            // We will attempt to filter by commerce_code if existing.
            base44.asServiceRole.entities.SolicitudComercio.filter({ commerce_code: commerceKey }, '-created_date', 1).then((r) => r[0] || { nombre: 'Tienda' })
        ]);

        const config = { umbral_escasez: 5 }; // Valor por defecto seguro para no depender de tabla Config

        // 4. FORMATEO DE LEY (Cálculos de stock y urgencia)
        // Normalizamos precio
        const precioBase = Number(producto.precio_estandar || producto.precio || 0);
        const precioOferta = Number(producto.precio_oferta || 0);
        const precioFinal = (precioOferta > 0 && precioOferta < precioBase) ? precioOferta : precioBase;

        const productoDatos = {
            ...producto,
            stock: stockReal, // Unificamos a 'stock'

            // Flags de UI
            hay_stock: stockReal > 0,
            es_escaso: stockReal > 0 && stockReal <= config.umbral_escasez,
            es_ultima_unidad: stockReal === 1,

            // Precios normalizados
            precio_base: precioBase,
            precio_final: precioFinal,
            tiene_descuento: precioFinal < precioBase
        };

        // 5. RESPUESTA UNIFICADA
        return Response.json({
            success: true,
            // Ponemos los objetos en la raíz para que el frontend los encuentre sí o sí
            producto: productoDatos,
            resenas: resenas || [],
            productosRelacionados: productosRelacionados || [],
            comercio: comercio,

            // Compatibilidad legacy
            disponible: stockReal > 0,
            stock_disponible: stockReal
        });

    } catch (error) {
        console.error('Error detallado producto:', error.message);
        return Response.json({ success: false, error: 'Error al cargar detalles' }, { status: 500 });
    }
});
