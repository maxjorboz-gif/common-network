// @ts-nocheck
import { createClientFromRequest } from 'https://esm.sh/@base44/sdk@0.8.6';

// --- UTILIDADES (Hasheo y Normalización) ---
import { sha256Hash } from './utilsCrypto.ts';
import { normalizeArgentinaPhone } from './utilsValidation.ts';


// --- FUNCIÓN DE ENVÍO A META (Solo para AddToCart) ---
async function sendCAPI(eventName, userData, customData, eventId) {
    const META_DATASET_ID = Deno.env.get('META_DATASET_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

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
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) { console.error("Error Meta CAPI:", e.message); }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // RECUPERACIÓN DE DATOS
        const body = await req.json();
        const {
            action, // 'track' o 'finalizar'
            items,
            resumen_economico,
            cliente,
            logistica,
            metodo_pago,
            comprobante_transferencia,
            facturacion,
            id_comercio: idRecibido,
            fbp, fbc, userAgent
        } = body;

        // === RESOLUCIÓN DE IDENTIDAD ===
        if (!idRecibido) {
            return Response.json({ error: 'Falta id_comercio en el payload' }, { status: 400 });
        }
        const id_comercio_final = idRecibido;
        // ==============================

        // 1. SIEMPRE NORMALIZAMOS Y HASHEAMOS PARA MARKETING/ORDEN
        const phoneNorm = normalizeArgentinaPhone(cliente?.telefono_whatsapp);
        const emailNorm = cliente?.email?.toLowerCase().trim();

        const [emH, phH, fnH] = await Promise.all([
            sha256Hash(emailNorm),
            sha256Hash(phoneNorm),
            sha256Hash(cliente?.nombre_completo?.split(' ')[0])
        ]);

        const eventId = `evt_${Date.now()}`;
        const esFinalizar = action === 'finalizar';

        // 2. DISPARO A META SOLO SI ES "ADD TO CART" (Llenado de datos)
        if (!esFinalizar) {
            const userData = {
                em: emH ? [emH] : [], ph: phH ? [phH] : [], fn: fnH ? [fnH] : [],
                fbp, fbc, client_user_agent: userAgent
            };
            const customData = {
                value: Number(resumen_economico?.total_final || 0),
                currency: 'ARS',
                content_ids: items?.map((i) => i.id || i.id_producto)
            };

            await sendCAPI('AddToCart', userData, customData, eventId);
            return Response.json({ success: true, message: "Tracking AddToCart enviado" });
        }

        // 3. LÓGICA DE CIERRE DE ORDEN (Action: 'finalizar')
        // 3. LÓGICA DE CIERRE DE ORDEN (Action: 'finalizar')
        // Buscamos productos SOLO DE ESTE COMERCIO para seguridad (Avoid Mixed Carts)
        const productosComercio = await base44.asServiceRole.entities.Producto.filter({
            id_comercio: id_comercio_final
        }, '-created_date', 1000);

        let subtotalCalculado = 0;

        for (const item of items) {
            // Validate that the item belongs to THIS commerce
            const pDb = productosComercio.find((p) => p.id === (item.id || item.id_producto));

            if (pDb) {
                subtotalCalculado += Number(pDb.precio_estandar) * Number(item.cantidad);
            } else {
                console.warn(`Producto ${item.id} no pertenece al comercio ${id_comercio_final}. Ignorado.`);
            }
        }

        // Aplicamos descuento de transferencia si aplica (ej. 10%)
        const tieneDescuentoTransf = metodo_pago === 'transferencia';
        const totalValidado = tieneDescuentoTransf ? subtotalCalculado * 0.9 : subtotalCalculado;

        // 4. CREACIÓN DE LA ORDEN CON TODO HASHEADO Y ID TRADUCIDO
        const orden = await base44.asServiceRole.entities.Orden.create({
            ...body,
            id_comercio: id_comercio_final, // <--- SOBERANO (000001)

            cliente: {
                ...cliente,
                telefono_whatsapp: phoneNorm,
                email: emailNorm,
                email_hash: emH,
                whatsapp_hash: phH
            },
            resumen_economico: {
                ...resumen_economico,
                subtotal: subtotalCalculado,
                total_final: totalValidado
            },

            // Estado inicial dependiendo del método
            estado: metodo_pago === 'mercadopago' ? 'PAGO_PENDIENTE' : 'PAGO_PENDIENTE',

            hashes_generados: { emH, phH, fnH }
        });

        return Response.json({ success: true, orden, message: "Orden registrada." });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
