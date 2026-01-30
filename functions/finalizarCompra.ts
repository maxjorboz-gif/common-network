// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_PRODUCTO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";
const URL_ORDEN = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden";
const URL_EVENTO_META = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/EventoMeta";

// --- UTILIDADES (Hasheo y Normalización) ---
import { sha256Hash } from './utilsCrypto.ts';
import { normalizeArgentinaPhone } from './utilsValidation.ts';

// --- FUNCIÓN DE REGISTRO DE EVENTO ---
async function registrarEventoMeta(eventName, userData, customData, eventId, commerceCode) {
    try {
        await fetch(URL_EVENTO_META, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_id: eventId,
                event_name: eventName,
                id_comercio: commerceCode,
                user_data: userData,
                custom_data: customData,
                action_source: 'website',
                event_time: Math.floor(Date.now() / 1000)
            })
        });
    } catch (e) {
        console.error(`Error registrando evento ${eventName} en EventoMeta:`, e.message);
    }
}

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

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
            commerce_code: idRecibido,
            id_comercio: legacyId,
            fbp, fbc, userAgent
        } = body;

        const id_comercio_final = idRecibido || legacyId;
        if (!id_comercio_final) {
            return Response.json({ error: 'Falta commerce_code' }, { status: 400 });
        }

        // 1. NORMALIZACIÓN Y HASHEO
        const phoneNorm = normalizeArgentinaPhone(cliente?.telefono_whatsapp);
        const emailNorm = cliente?.email?.toLowerCase().trim();

        const [emH, phH, fnH] = await Promise.all([
            sha256Hash(emailNorm),
            sha256Hash(phoneNorm),
            sha256Hash(cliente?.nombre_completo?.split(' ')[0])
        ]);

        const eventId = `evt_${Date.now()}`;
        const esFinalizar = action === 'finalizar';

        // 2. TRACKING (AddToCart / InitiateCheckout)
        const userData = {
            em: emH ? [emH] : [], ph: phH ? [phH] : [], fn: fnH ? [fnH] : [],
            fbp, fbc, client_user_agent: userAgent
        };
        const customData = {
            value: Number(resumen_economico?.total_final || 0),
            currency: 'ARS',
            content_ids: items?.map((i) => i.id || i.id_producto)
        };

        if (!esFinalizar) {
            // Caso: Llenado de datos (AddToCart)
            await registrarEventoMeta('AddToCart', userData, customData, eventId, id_comercio_final);
            return Response.json({ success: true, message: "Evento AddToCart registrado." });
        }

        // Caso: Finalizar Compra (Iniciamos proceso de orden e InitiateCheckout)
        await registrarEventoMeta('InitiateCheckout', userData, customData, eventId, id_comercio_final);

        // 3. LÓGICA DE CIERRE DE ORDEN
        const responseProductos = await fetch(`${URL_PRODUCTO}?commerce_code=${id_comercio_final}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseProductos.ok) throw new Error("Error obteniendo catálogo");
        const productosComercio = await responseProductos.json();

        let subtotalCalculado = 0;
        for (const item of items) {
            const pDb = productosComercio.find((p) => (p.id || p._id) === (item.id || item.id_producto));
            if (pDb) {
                subtotalCalculado += Number(pDb.precio_estandar) * Number(item.cantidad);
            }
        }

        const tieneDescuentoTransf = metodo_pago === 'transferencia';
        const totalValidado = tieneDescuentoTransf ? subtotalCalculado * 0.9 : subtotalCalculado;

        // 4. CREACIÓN DE LA ORDEN (URL Directa POST)
        const ordenPayload = {
            ...body,
            commerce_code: id_comercio_final,
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
            estado: 'PAGO_PENDIENTE',
            hashes_generados: { emH, phH, fnH },
            event_id_meta: eventId,
            created_at: new Date().toISOString()
        };

        const createResponse = await fetch(URL_ORDEN, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ordenPayload)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Error creando orden: ${errorText}`);
        }

        const ordenFinal = await createResponse.json();

        return Response.json({ success: true, orden: ordenFinal, message: "Orden registrada y evento de tracking enviado." });

    } catch (error) {
        console.error('Error finalizarCompra:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
