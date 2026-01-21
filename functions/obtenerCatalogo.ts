// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // No bloqueamos por auth aquí para que cualquier visitante vea las parrillas
        const body = await req.json().catch(() => ({}));
        const { id_comercio: idRecibido } = body;

        if (!idRecibido) {
            return Response.json({ error: 'Falta ID de comercio (id_comercio)' }, { status: 400 });
        }

        // === TRADUCTOR MARCA BLANCA ===
        // Usamos el ID recibido directamente como id_comercio (Soberano)
        const id_comercio = idRecibido;
        // ==============================

        // 1. OBTENER PRODUCTOS (Usamos asServiceRole para que sea público y rápido)
        // Traemos todos los activos (o que no tengan flag de inactivo explícito/false)
        const productos = await base44.asServiceRole.entities.Producto.filter({
            id_comercio: id_comercio
        }, '-created_date', 1000);

        // 2. FORMATEAR PARA EL FRONTEND (Garantiza que la Product Card lea el stock)
        const productosProcesados = productos
            .filter((p) => p.activo !== false) // Filtro en memoria seguro activable
            .map((p) => {
                // NORMALIZACIÓN CRÍTICA DE STOCK
                // Revisamos ambos campos posibles para asegurar que NO damos falsos negativos
                const stockReal = Number(p.stock !== undefined ? p.stock : (p.stock_actual !== undefined ? p.stock_actual : 0));

                const umbral = Number(p.stock_minimo_alerta) || 5;

                return {
                    ...p,
                    stock: stockReal, // Unificamos nombre del campo para el frontend

                    // Flags de Ley para que el frontend no tenga que calcular nada
                    disponible: stockReal > 0,
                    es_escaso: stockReal > 0 && stockReal <= umbral,
                    mensaje_stock: stockReal > 0 ? (stockReal <= umbral ? `¡Solo quedan ${stockReal}!` : 'En stock') : 'Sin stock'
                };
            });

        // 3. RESPUESTA LIMPIA
        return Response.json({
            success: true,
            productos: productosProcesados
        });

    } catch (error) {
        console.error('Error obteniendo catálogo:', error.message);
        return Response.json({ error: 'No se pudo cargar el catálogo' }, { status: 500 });
    }
});
