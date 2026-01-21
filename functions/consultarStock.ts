import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ====================================
// UTILIDADES INFALIBLES (Memorias de Ley)
// ====================================
async function sha256Hash(message) {
    if (!message) return null;
    const normalized = message.toLowerCase().trim();
    const msgBuffer = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // REPARACIÓN: Permitimos consulta sin auth estricta para que la web no tire error al cargar
        const user = await base44.auth.me().catch(() => null);

        const body = await req.json().catch(() => ({}));
        // El frontend puede enviar 'id_producto' o 'productoId'
        const productoId = body.id_producto || body.productoId;

        if (!productoId) {
            return Response.json({ error: 'Falta ID de producto' }, { status: 400 });
        }

        // 1. OBTENER PRODUCTO (asServiceRole para evitar bloqueos de permisos)
        const producto = await base44.asServiceRole.entities.Producto.get(productoId).catch(() => null);

        if (!producto) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // 2. LÓGICA DE STOCK (Normalización de datos)
        const stockActual = Number(producto.stock_actual) || 0;
        const stockMinimo = Number(producto.stock_minimo_alerta) || 5;
        const hayStock = stockActual > 0;
        const esEscaso = hayStock && stockActual <= stockMinimo;

        // 3. RESPUESTA MULTI-FORMATO (Para que el frontend encuentre lo que busca)
        return Response.json({
            success: true,
            validado: true,
            // Enviamos varios formatos de nombre para asegurar compatibilidad
            stock_actual: stockActual,
            stock_disponible: stockActual,
            disponible: hayStock,
            estado_stock: {
                disponible: hayStock,
                stock_bajo: esEscaso,
                sin_stock: !hayStock
            },
            producto: {
                id: producto.id,
                titulo: producto.titulo,
                stock_actual: stockActual
            },
            mensaje_urgencia: !hayStock ? 'Sin stock' : (esEscaso ? `¡Últimas ${stockActual} unidades!` : 'Stock disponible'),
            puede_comprar: hayStock && producto.activo
        });

    } catch (error) {
        console.error('Error en consultarStock:', error.message);
        return Response.json({ 
            success: false, 
            error: 'Error de conexión con el inventario' 
        }, { status: 200 }); // Retornamos 200 con success: false para que el frontend no se "rompa"
    }
});