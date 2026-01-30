// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_PRODUCTO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";
const URL_ORDEN = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Orden";
const URL_EVENTO_META = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/EventoMeta";
const URL_CLIENTE = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Cliente";

// --- UTILIDADES (Hasheo y Normalización) ---
import { sha256Hash } from './utilsCrypto.ts';
import { normalizeArgentinaPhone } from './utilsValidation.ts';

// --- FUNCIÓN DE REGISTRO DE EVENTO ---
async function registrarEventoMeta(eventName, userData, customData, eventId, commerceCode) {
    try {
        await fetch(URL_EVENTO_META, {
            method: 'POST',
            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
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
    } catch (e) { console.error(`Error Meta CAPI:`, e.message); }
}

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const {
            action, items, resumen_economico, cliente,
            commerce_code: idRecibido, id_comercio: legacyId,
            fbp, fbc, userAgent, metodo_pago
        } = body;

        const id_comercio_final = idRecibido || legacyId;
        if (!id_comercio_final) return Response.json({ error: 'Falta commerce_code' }, { status: 400 });

        // 1. NORMALIZACIÓN
        const phoneNorm = normalizeArgentinaPhone(cliente?.telefono_whatsapp);
        const emailNorm = cliente?.email?.toLowerCase().trim();
        const [emH, phH, fnH] = await Promise.all([
            sha256Hash(emailNorm),
            sha256Hash(phoneNorm),
            sha256Hash(cliente?.nombre_completo?.split(' ')[0])
        ]);

        const eventId = `evt_${Date.now()}`;

        // === 2. GARANTÍA DE CLIENTE (UPSERT) ===
        // Buscamos si ya existe en la entidad Cliente
        let clienteFinalId = null;
        try {
            const resBusqueda = await fetch(`${URL_CLIENTE}?whatsapp=${phoneNorm}`, {
                headers: { 'api_key': API_KEY }
            });
            const clientesExistentes = await resBusqueda.json();

            if (Array.isArray(clientesExistentes) && clientesExistentes.length > 0) {
                clienteFinalId = clientesExistentes[0].id || clientesExistentes[0]._id;
                // Actualizamos datos básicos
                await fetch(`${URL_CLIENTE}/${clienteFinalId}`, {
                    method: 'PATCH',
                    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre_completo: cliente.nombre_completo,
                        email: emailNorm,
                        updated_at: new Date().toISOString()
                    })
                });
            } else {
                // Si no existe, lo creamos ahora mismo
                const resNuevo = await fetch(URL_CLIENTE, {
                    method: 'POST',
                    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre_completo: cliente.nombre_completo,
                        email: emailNorm,
                        whatsapp: phoneNorm,
                        email_hash: emH,
                        whatsapp_hash: phH,
                        commerce_code: id_comercio_final,
                        total_compras: 0,
                        created_at: new Date().toISOString()
                    })
                });
                const nuevoCliente = await resNuevo.json();
                clienteFinalId = nuevoCliente.id || nuevoCliente._id;
            }
        } catch (e) {
            console.error("Error gestionando entidad Cliente:", e);
        }

        // 3. TRACKING
        const userData = {
            em: emH ? [emH] : [], ph: phH ? [phH] : [], fn: fnH ? [fnH] : [],
            fbp, fbc, client_user_agent: userAgent
        };
        const customData = {
            value: Number(resumen_economico?.total_final || 0),
            currency: 'ARS',
            content_ids: items?.map((i) => i.id || i.id_producto)
        };

        if (action !== 'finalizar') {
            await registrarEventoMeta('AddToCart', userData, customData, eventId, id_comercio_final);
            return Response.json({ success: true, message: "Tracking enviado" });
        }

        // 4. CIERRE DE ORDEN
        await registrarEventoMeta('InitiateCheckout', userData, customData, eventId, id_comercio_final);

        const responseProductos = await fetch(`${URL_PRODUCTO}?commerce_code=${id_comercio_final}`, {
            headers: { 'api_key': API_KEY }
        });
        const productosComercio = await responseProductos.json();

        let subtotalCalculado = 0;
        for (const item of items) {
            const pDb = productosComercio.find((p) => (p.id || p._id) === (item.id || item.id_producto));
            if (pDb) subtotalCalculado += Number(pDb.precio_estandar) * Number(item.cantidad);
        }

        const tieneDescuentoTransf = metodo_pago === 'transferencia';
        const totalValidado = tieneDescuentoTransf ? subtotalCalculado * 0.9 : subtotalCalculado;

        // 5. REGISTRO DE ORDEN (Vinculada al ID del cliente que acabamos de asegurar)
        const ordenPayload = {
            ...body,
            id_cliente: clienteFinalId, // Link directo a la entidad Cliente
            commerce_code: id_comercio_final,
            cliente: {
                ...cliente,
                id: clienteFinalId,
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
            event_id_meta: eventId,
            created_at: new Date().toISOString()
        };

        const createResponse = await fetch(URL_ORDEN, {
            method: 'POST',
            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(ordenPayload)
        });

        if (!createResponse.ok) throw new Error("Error creando orden");

        const ordenFinal = await createResponse.json();
        return Response.json({ success: true, orden: ordenFinal, message: "Orden y Cliente registrados." });

    } catch (error) {
        console.error('Error finalizarCompra:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
