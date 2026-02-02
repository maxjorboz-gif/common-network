// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

// --- CONFIGURACIÓN ---
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

// Clave Secreta (Debe coincidir con loginSuperAdmin.ts)
const JWT_SECRET = "CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR_2026_CAMBIAME";

// --- HELPER DE SEGURIDAD ---
async function verifyAdminToken(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

        const token = authHeader.split(" ")[1];
        const decoded = atob(token);
        const [payload, signature] = decoded.split(':'); // payload=id:timestamp

        // Recrear firma
        const encoder = new TextEncoder();
        const data = encoder.encode(payload + JWT_SECRET);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        return signature === expectedSignature;
    } catch (e) {
        return false;
    }
}

Deno.serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response("OK", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });
    }

    try {
        // 1. BLINDAJE TOTAL: Esta función es SOLO para Admins
        const isAdmin = await verifyAdminToken(req);
        if (!isAdmin) {
            return Response.json({ error: "Acceso Prohibido. Credenciales inválidas." }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const body = await req.json();
        const { action, ...data } = body;

        // 2. LISTAR COMERCIOS (Panel Maestro)
        if (action === 'list') {
            const response = await fetch(URL_COMERCIO, { headers: { 'api_key': API_KEY } });
            const listado = await response.json();

            // Saneamiento de datos (No devolvemos passwords ni datos sensibles irrelevantes)
            const cleanList = Array.isArray(listado) ? listado.map(c => ({
                id: c.id || c._id,
                id_registro: c.id || c._id, // Backward comp
                nombre_comercio: c.nombre_comercio || c.nombre,
                email_admin: c.email_negocio || c.email,
                commerce_code: c.commerce_code,
                numero_operacion: c.numero_operacion,
                estado_registro: c.estado_registro,
                activo: c.activo,
                saldo_publicidad: c.saldo_publicidad || 0,
                // Lógica de "Pendiente": Si no está activo y se registró recientemente
                aprobacion_pendiente: !c.activo && c.estado_registro === 'completado'
            })) : [];

            return Response.json({ success: true, solicitudes: cleanList }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 3. APROBAR / ACTIVAR (Alta manual)
        if (action === 'approve') {
            const { id_registro } = data;
            const updateUrl = `${URL_COMERCIO}/${id_registro}`;

            await fetch(updateUrl, {
                method: 'PATCH',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activo: true,
                    estado_registro: 'activo',
                    fecha_aprobacion: new Date().toISOString()
                })
            });

            return Response.json({ success: true, new_id: id_registro }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 4. TOGGLE BLOQUEO (Kill Switch)
        if (action === 'toggle_active') {
            const { id, active } = data; // active viene como boolean deseado

            await fetch(`${URL_COMERCIO}/${id}`, {
                method: 'PATCH',
                headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activo: active,
                    estado_registro: active ? 'activo' : 'suspendido'
                })
            });

            return Response.json({ success: true, status: active ? 'activated' : 'deactivated' }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 5. ELIMINAR (Danger Zone)
        if (action === 'delete') {
            const { id } = data;
            await fetch(`${URL_COMERCIO}/${id}`, {
                method: 'DELETE',
                headers: { 'api_key': API_KEY }
            });
            return Response.json({ success: true }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ error: "Acción no válida" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
