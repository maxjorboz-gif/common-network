// @ts-check
import { generateEventId } from './utilsCrypto.ts';

// @ts-check
import { generateEventId } from './utilsCrypto.ts';
import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { ordenId } = await req.json();
        if (!ordenId) throw new Error("Falta ID de orden");

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. OBTENER ORDEN (SDK)
        let orden;
        try {
            orden = await adminClient.entities.Orden.get(ordenId);
        } catch (e) {
            throw new Error("Orden no encontrada");
        }

        // 2. STOCK UPDATE (SDK)
        if (orden.items) {
            // Processing sequentially to avoid race conditions on same product or just simplicity
            for (const item of orden.items) {
                try {
                    // Get Product, then Update
                    // Note: SDK usually doesn't atomic decrement, so we read then write.
                    const productos = await adminClient.entities.Producto.filter({ id: item.id_producto });
                    // Fallback search if ID mismatch direct get
                    let p = productos.length > 0 ? productos[0] : null;

                    if (!p) {
                        try { p = await adminClient.entities.Producto.get(item.id_producto); } catch (err) { }
                    }

                    if (p) {
                        await adminClient.entities.Producto.update(p.id || p._id, {
                            stock_actual: Math.max(0, (p.stock_actual || 0) - (item.cantidad || 0)),
                            total_vendidos: (p.total_vendidos || 0) + (item.cantidad || 0)
                        });
                    }
                } catch (e) { console.error("Error stock:", e); }
            }
        }

        // 3. REGISTRAR EVENTO META (SDK Create)
        const purchaseEventId = generateEventId('Purchase', orden.id || orden._id);
        const userData = {
            em: orden.hashes_generados?.emH ? [orden.hashes_generados.emH] : [],
            ph: orden.hashes_generados?.phH ? [orden.hashes_generados.phH] : [],
            fbp: orden.fbp,
            fbc: orden.fbc
        };
        const customData = {
            currency: 'ARS',
            value: Number(orden.total || 0),
            content_ids: orden.items?.map(i => i.id_producto) || []
        };

        try {
            await adminClient.entities.EventoMeta.create({
                event_id: purchaseEventId,
                event_name: 'Purchase',
                id_comercio: orden.id_comercio || orden.commerce_code,
                user_data: userData,
                custom_data: customData,
                action_source: 'website',
                event_time: Math.floor(Date.now() / 1000)
            });
        } catch (e) { console.error("Error creating Meta Event:", e); }


        // 4. UPDATE COMERCIO STATS (SDK)
        const commerceKey = orden.commerce_code || orden.id_comercio;
        if (commerceKey) {
            try {
                // Assuming commerce_code is unique filter
                const comercios = await adminClient.entities.Comercio.filter({ commerce_code: commerceKey });
                const comercio = comercios.length > 0 ? comercios[0] : null;

                if (comercio) {
                    await adminClient.entities.Comercio.update(comercio.id || comercio._id, {
                        total_ventas: (comercio.total_ventas || 0) + Number(orden.total || 0),
                        total_ordenes: (comercio.total_ordenes || 0) + 1
                    });
                }
            } catch (e) { console.error("Error updating Commerce Stats:", e); }
        }

        // 5. FINALIZAR ORDEN (SDK Update)
        const ordenFinal = await adminClient.entities.Orden.update(ordenId, {
            estado: 'PAGADA',
            fecha_pago_confirmado: new Date().toISOString(),
            event_id_meta: purchaseEventId,
            updated_at: new Date().toISOString()
        });

        return Response.json({ success: true, orden: ordenFinal });

    } catch (error: unknown) {
        console.error('Error confirmarPago:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return Response.json({ error: errorMessage }, { status: 500 });
    }
});
