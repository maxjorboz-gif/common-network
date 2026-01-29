// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';
import { generateEventId } from './utilsCrypto.ts';

// META CAPI WRAPPER (Fail Safe)
async function sendCAPI(eventName, userData, customData, eventId) {
    const DATASET = Deno.env.get('META_DATASET_ID');
    const TOKEN = Deno.env.get('META_ACCESS_TOKEN');
    if (!DATASET || !TOKEN) return;

    try {
        await fetch(`https://graph.facebook.com/v18.0/${DATASET}/events?access_token=${TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: eventId,
                    action_source: 'website',
                    user_data: userData,
                    custom_data: customData
                }]
            })
        });
    } catch (e) { }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { ordenId } = await req.json();

        if (!ordenId) throw new Error("Falta ID");

        // 1. Obtener Orden
        const orden = await base44.asServiceRole.entities.Orden.get(ordenId).catch(() => null);
        if (!orden) throw new Error("No existe");

        // 2. STOCK UPDATE (Simple decrement)
        // Ignoramos si ya se bajó, simplemente ejecutamos.
        // Si quieren validación de "ya pagada", la quitamos para permitir reintentos manuales.
        if (orden.items) {
            for (const item of orden.items) {
                try {
                    const p = await base44.asServiceRole.entities.Producto.get(item.id_producto);
                    if (p) {
                        await base44.asServiceRole.entities.Producto.update(p.id, {
                            stock: Math.max(0, (p.stock || 0) - item.cantidad),
                            vendidos: (p.vendidos || 0) + item.cantidad
                        });
                    }
                } catch (e) { }
            }
        }

        // 3. META EVENT
        const hashes = orden.hashes_generados || {};
        const purchaseEventId = generateEventId('Purchase', orden.id);

        await sendCAPI('Purchase', {
            em: hashes.emH ? [hashes.emH] : [],
            ph: hashes.phH ? [hashes.phH] : [],
            formatted_name: hashes.fnH ? [hashes.fnH] : [],
            fbp: orden.fbp,
            fbc: orden.fbc
        }, {
            currency: 'ARS',
            value: Number(orden.resumen_economico?.total_final || 0),
            content_ids: orden.items?.map(i => i.id_producto) || []
        }, purchaseEventId);

        // 4. Update Commerce Stats
        const commerceKey = orden.commerce_code || orden.id_comercio;
        if (commerceKey) {
            // Updated to filter by commerce_code. Assuming Table has this field now.
            let comercio = await base44.asServiceRole.entities.Comercio.filter({ commerce_code: commerceKey }).then(r => r[0]);

            // Fallback for legacy compatibility if filtering by commerce_code returns nothing
            if (!comercio) {
                comercio = await base44.asServiceRole.entities.Comercio.filter({ id_comercio: commerceKey }).then(r => r[0]);
            }

            if (comercio) {
                await base44.asServiceRole.entities.Comercio.update(comercio.id, {
                    total_ventas: (comercio.total_ventas || 0) + Number(orden.resumen_economico?.total_final || 0),
                    cantidad_ventas: (comercio.cantidad_ventas || 0) + 1
                });
            }
        }

        // 5. Finalize Order
        const ordenActualizada = await base44.asServiceRole.entities.Orden.update(orden.id, {
            estado: 'PAGADA',
            fecha_pago: new Date().toISOString(),
            meta_event_id_purchase: purchaseEventId
        });

        return Response.json({ success: true, orden: ordenActualizada });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
