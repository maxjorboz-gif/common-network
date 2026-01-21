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
        const [resenas, productosRelacionados, comercio] = await Promise.all([
            base44.asServiceRole.entities.Resena.filter({ id_producto: productoId, aprobada: true }, '-created_date', 20),
            base44.asServiceRole.entities.Producto.filter(
                { id_comercio: producto.id_comercio, categoria: producto.categoria }, // Quitamos activo:true del filtro para simplificar query a mongo, filtramos en memoria
                '-total_vendidos',
                6
            ).then((prods) => prods.filter((p) => p.id !== productoId && p.activo !== false).slice(0, 4)),
            base44.asServiceRole.entities.Comercio.filter({ id_comercio: producto.id_comercio }, '-created_date', 1).then((r) => r[0] || { nombre: 'Tienda' })
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
