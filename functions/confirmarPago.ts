// @ts-nocheck
import { generateEventId } from './utilsCrypto.ts';

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_ORDEN = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden";
const URL_COMERCIO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Comercio";
const URL_EVENTO_META = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/EventoMeta";
const URL_PRODUCTO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { ordenId } = await req.json();
        if (!ordenId) throw new Error("Falta ID de orden");

        // 1. OBTENER ORDEN (URL Directa)
        const responseOrden = await fetch(`${URL_ORDEN}/${ordenId}`, {
            headers: { 'api_key': API_KEY }
        });
        if (!responseOrden.ok) throw new Error("Orden no encontrada");
        const orden = await responseOrden.json();

        // 2. STOCK UPDATE (URL Directa)
        if (orden.items) {
            for (const item of orden.items) {
                try {
                    const resProd = await fetch(`${URL_PRODUCTO}/${item.id_producto}`, {
                        headers: { 'api_key': API_KEY }
                    });
                    if (resProd.ok) {
                        const p = await resProd.json();
                        await fetch(`${URL_PRODUCTO}/${p.id || p._id}`, {
                            method: 'PATCH',
                            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                stock_actual: Math.max(0, (p.stock_actual || 0) - (item.cantidad || 0)),
                                total_vendidos: (p.total_vendidos || 0) + (item.cantidad || 0)
                            })
                        });
                    }
                } catch (e) { console.error("Error stock:", e); }
            }
        }

        // 3. REGISTRAR EVENTO META (URL Directa)
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

        await fetch(URL_EVENTO_META, {
            method: 'POST',
            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_id: purchaseEventId,
                event_name: 'Purchase',
                id_comercio: orden.id_comercio || orden.commerce_code,
                user_data: userData,
                custom_data: customData,
                action_source: 'website',
                event_time: Math.floor(Date.now() / 1000)
            })
        });

        // 4. UPDATE COMERCIO STATS (URL Directa)
        const commerceKey = orden.commerce_code || orden.id_comercio;
        if (commerceKey) {
            const resBusqueda = await fetch(`${URL_COMERCIO}?commerce_code=${commerceKey}`, {
                headers: { 'api_key': API_KEY }
            });
            const comercios = await resBusqueda.json();
            const comercio = Array.isArray(comercios) ? comercios[0] : null;

            if (comercio) {
                await fetch(`${URL_COMERCIO}/${comercio.id || comercio._id}`, {
                    method: 'PATCH',
                    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        total_ventas: (comercio.total_ventas || 0) + Number(orden.total || 0),
                        total_ordenes: (comercio.total_ordenes || 0) + 1
                    })
                });
            }
        }

        // 5. FINALIZAR ORDEN (URL Directa)
        const updateOrdenRes = await fetch(`${URL_ORDEN}/${ordenId}`, {
            method: 'PATCH',
            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado: 'PAGADA',
                fecha_pago_confirmado: new Date().toISOString(),
                event_id_meta: purchaseEventId,
                updated_at: new Date().toISOString()
            })
        });

        const ordenFinal = await updateOrdenRes.json();

        return Response.json({ success: true, orden: ordenFinal });

    } catch (error) {
        console.error('Error confirmarPago:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
