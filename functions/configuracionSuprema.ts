// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

// --- CONFIGURACIÓN ESTRUCTURAL ---
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

// Usamos una entidad única para configuraciones globales del sistema
const URL_CONFIG_GLOBAL = `https://app.base44.com/api/apps/${APP_ID}/entities/ConfiguracionGlobal`;

// Clave Secreta para validar SuperAdmin (Escritura)
const JWT_SECRET = "CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR_2026_CAMBIAME";

// --- HELPER SEGURIDAD ---
async function verifyAdminToken(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

        const token = authHeader.split(" ")[1];
        const decoded = atob(token);
        const [payload, signature] = decoded.split(':');

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
        const body = await req.json();
        const { action, config } = body;

        // 1. OBTENER CONFIGURACIÓN (Lectura Pública/Comercio)
        // No requiere token de SuperAdmin, porque los comercios necesitan ver el CBU para pagar.
        if (action === 'obtener') {
            const resp = await fetch(`${URL_CONFIG_GLOBAL}?key=datos_bancarios`, {
                headers: { 'api_key': API_KEY }
            });
            const data = await resp.json();

            let configBancaria = {
                cbu: "", alias: "", banco: "", titular: ""
            };

            if (Array.isArray(data) && data.length > 0) {
                configBancaria = data[0].valor || configBancaria;
            } else {
                // Si no existe, devolvemos vacío limpio, NO hardcodeo.
                // El frontend deberá manejar que no hay datos cargados.
            }

            return Response.json({ success: true, config: configBancaria }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 2. GUARDAR CONFIGURACIÓN (Escritura Protegida)
        // Solo el SuperAdmin puede cambiar el CBU destino.
        if (action === 'guardar') {
            // A. Verificar Token
            const isAdmin = await verifyAdminToken(req);
            if (!isAdmin) {
                return Response.json({ error: "Acceso Denegado. Solo SuperAdmin." }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
            }

            // B. Buscar si ya existe el registro
            const checkResp = await fetch(`${URL_CONFIG_GLOBAL}?key=datos_bancarios`, {
                headers: { 'api_key': API_KEY }
            });
            const existing = await checkResp.json();

            const payload = {
                key: "datos_bancarios",
                valor: config, // Guardamos el objeto entero {cbu, alias, ...}
                updated_at: new Date().toISOString(),
                updated_by: "SuperAdmin"
            };

            if (Array.isArray(existing) && existing.length > 0) {
                // UPDATE (PATCH)
                const id = existing[0].id || existing[0]._id;
                await fetch(`${URL_CONFIG_GLOBAL}/${id}`, {
                    method: 'PATCH',
                    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // CREATE (POST)
                await fetch(URL_CONFIG_GLOBAL, {
                    method: 'POST',
                    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            return Response.json({ success: true, mensaje: "Datos bancarios actualizados." }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ error: "Acción desconocida" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
