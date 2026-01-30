// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const URL_CLIENTE = `https://app.base44.com/api/apps/${APP_ID}/entities/Cliente`;
const URL_LEAD = `https://app.base44.com/api/apps/${APP_ID}/entities/Lead`;
const URL_SORTEO = `https://app.base44.com/api/apps/${APP_ID}/entities/Sorteo`;

// --- UTILIDADES ---
import { sha256Hash } from './utilsCrypto.ts';
import { normalizeArgentinaPhone } from './utilsValidation.ts';

/**
 * PARTICIPAR EN SORTEO
 * 1. Registra/Actualiza al Cliente (Unified ID)
 * 2. Crea el Lead de participación
 * 3. Incrementa el contador del sorteo
 */
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const {
            nombre_completo,
            email,
            whatsapp,
            commerce_code,
            sorteo_id,
            fbp, fbc, userAgent
        } = body;

        if (!nombre_completo || !whatsapp || !commerce_code || !sorteo_id) {
            return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // 1. NORMALIZACIÓN DE DATOS
        const phoneNorm = normalizeArgentinaPhone(whatsapp);
        const emailNorm = email?.toLowerCase().trim() || "";
        const emailH = await sha256Hash(emailNorm);
        const phoneH = await sha256Hash(phoneNorm);

        // 2. GESTIÓN DE CLIENTE (Upsert manual)
        // Buscamos si el cliente ya existe por su teléfono normalizado
        const resBusqueda = await fetch(`${URL_CLIENTE}?whatsapp=${phoneNorm}`, {
            headers: { 'api_key': API_KEY }
        });
        const clientesExistentes = await resBusqueda.json();
        let clienteId;

        if (Array.isArray(clientesExistentes) && clientesExistentes.length > 0) {
            clienteId = clientesExistentes[0].id || clientesExistentes[0]._id;
            // Actualizamos datos si es necesario
            await fetch(`${URL_CLIENTE}/${clienteId}`, {
                method: 'PATCH',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_completo,
                    email: emailNorm,
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            // Creamos nuevo cliente
            const resNuevo = await fetch(URL_CLIENTE, {
                method: 'POST',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_completo,
                    email: emailNorm,
                    whatsapp: phoneNorm,
                    email_hash: emailH,
                    whatsapp_hash: phoneH,
                    commerce_code,
                    total_compras: 0,
                    created_at: new Date().toISOString()
                })
            });
            const nuevoCliente = await resNuevo.json();
            clienteId = nuevoCliente.id || nuevoCliente._id;
        }

        // 3. CREACIÓN DEL LEAD (Participación)
        const leadPayload = {
            id_cliente: clienteId,
            commerce_code,
            nombre_completo,
            email: emailNorm,
            telefono_whatsapp: phoneNorm,
            origen: 'sorteo',
            id_sorteo: sorteo_id,
            estado: 'inscrito',
            fecha_contacto: new Date().toISOString(),
            fbp, fbc, user_agent: userAgent,
            created_at: new Date().toISOString()
        };

        const resLead = await fetch(URL_LEAD, {
            method: 'POST',
            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(leadPayload)
        });

        if (!resLead.ok) throw new Error("Error registrando participación (Lead)");

        // 4. INCREMENTAR CONTADOR EN EL SORTEO
        try {
            const resSorteo = await fetch(`${URL_SORTEO}/${sorteo_id}`, {
                headers: { 'api_key': API_KEY }
            });
            if (resSorteo.ok) {
                const sorteo = await resSorteo.json();
                await fetch(`${URL_SORTEO}/${sorteo_id}`, {
                    method: 'PATCH',
                    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        total_participantes: (sorteo.total_participantes || 0) + 1,
                        updated_at: new Date().toISOString()
                    })
                });
            }
        } catch (e) {
            console.error("Error incrementando contador de sorteo:", e);
        }

        return Response.json({
            success: true,
            message: "¡Ya estás participando en el sorteo!",
            clienteId
        });

    } catch (error) {
        console.error("Error en participarSorteo:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
