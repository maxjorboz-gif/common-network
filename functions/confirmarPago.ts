// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';
import { generateEventId } from './utilsCrypto.ts';
// --- UTILIDAD SIMPLE ---


async function sendCAPI(eventName, userData, customData, eventId) {
    const META_DATASET_ID = Deno.env.get('META_DATASET_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

    // Si no hay credenciales, saltamos silenciosamente (evita crash en dev)
    if (!META_DATASET_ID || !META_ACCESS_TOKEN) return { skipped: true };

    const url = `https://graph.facebook.com/v18.0/${META_DATASET_ID}/events?access_token=${META_ACCESS_TOKEN}`;
    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: 'website',
            user_data: userData,
            custom_data: customData
        }]
    };

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await resp.json();
    } catch (e) {
        console.error("Meta CAPI Error:", e);
        return { error: e.message };
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { ordenId, accion } = await req.json();

        if (!ordenId) throw new Error("Falta ID de Orden");

        // 1. OBTENER ORDEN (Usamos ServiceRole para poder ver/editar todo)
        // Buscamos la orden para ver sus datos y hashes guardados previamente
        const ordenes = await base44.asServiceRole.entities.Orden.filter({ id: ordenId }, '-created_date', 1);
        const orden = ordenes[0];

        if (!orden) throw new Error("Orden no encontrada");

        // Evitar procesar dos veces
        if (orden.estado === 'PAGADA' || orden.estado === 'ENTREGADO') {
            return Response.json({ success: true, message: "La orden ya estaba pagada." });
        }

        // 2. ACTUALIZAR STOCK
        // Esto es crítico hacerlo antes de confirmar para evitar sobreventas si se disparara concurrente
        for (const item of orden.items) {
            const productos = await base44.asServiceRole.entities.Producto.filter({ id: item.id_producto }, '-created_date', 1);
            const producto = productos[0];
            if (producto) {
                const nuevoStock = Math.max(0, (producto.stock || 0) - item.cantidad);
                const nuevosVendidos = (producto.vendidos || 0) + item.cantidad;

                await base44.asServiceRole.entities.Producto.update(producto.id, {
                    stock: nuevoStock,
                    vendidos: nuevosVendidos
                });
            }
        }

        // 3. PREPARAR DATOS PARA META (Purchase)
        // Usamos los hashes que finalizarCompra ya generó. ¡Eficiencia Total!
        const hashes = orden.hashes_generados || {};
        const userData = {
            em: hashes.emH ? [hashes.emH] : [],
            ph: hashes.phH ? [hashes.phH] : [],
            fn: hashes.fnH ? [hashes.fnH] : [],
            // Recuperamos cookies guardadas en la orden
            fbp: orden.fbp,
            fbc: orden.fbc,
            client_user_agent: orden.userAgent
        };

        const customData = {
            value: Number(orden.resumen_economico?.total_final || 0),
            currency: 'ARS',
            content_ids: orden.items.map((i) => i.id_producto),
            content_type: 'product',
            num_items: orden.items.length
        };

        const purchaseEventId = generateEventId('Purchase', orden.id);

        // 4. DISPARAR EVENTO A META
        await sendCAPI('Purchase', userData, customData, purchaseEventId);

        // 5. ACTUALIZAR ESTADO DE LA ORDEN Y ESTADISTICAS DE COMERCIO
        if (!orden.id_comercio) console.warn("ALERTA: Orden confirmada sin id_comercio vinculado.");

        // Actualizamos estadísticas del comercio (Si existe ID)
        if (orden.id_comercio) {
            const comercios = await base44.asServiceRole.entities.Comercio.filter({ id: orden.id_comercio }, '-created_date', 1);
            if (comercios.length > 0) {
                const comercio = comercios[0];
                await base44.asServiceRole.entities.Comercio.update(comercio.id, {
                    total_ventas: (comercio.total_ventas || 0) + Number(orden.resumen_economico?.total_final || 0),
                    cantidad_ventas: (comercio.cantidad_ventas || 0) + 1
                });
            }
        }

        const ordenActualizada = await base44.asServiceRole.entities.Orden.update(orden.id, {
            estado: 'PAGADA',
            fecha_pago: new Date().toISOString(),
            meta_event_id_purchase: purchaseEventId // Guardamos referencia para deduplicación futura
        });

        return Response.json({
            success: true,
            message: "Pago confirmado, stock descontado y conversión enviada a Meta.",
            orden: ordenActualizada
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
