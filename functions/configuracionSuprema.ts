// @ts-nocheck
import { crypto } from "jsr:@std/crypto";
import { createClientFromRequest } from "npm:@base44/sdk";

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

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. OBTENER CONFIGURACIÓN (Lectura Pública/Comercio)
        if (action === 'obtener') {
            const configs = await adminClient.entities.ConfiguracionGlobal.filter({
                key: "datos_bancarios"
            });

            let configBancaria = {
                cbu: "", alias: "", banco: "", titular: ""
            };

            if (Array.isArray(configs) && configs.length > 0) {
                configBancaria = configs[0].valor || configBancaria;
            }

            return Response.json({ success: true, config: configBancaria }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 2. GUARDAR CONFIGURACIÓN (Escritura Protegida)
        if (action === 'guardar') {
            // A. Verificar Token
            const isAdmin = await verifyAdminToken(req);
            if (!isAdmin) {
                return Response.json({ error: "Acceso Denegado. Solo SuperAdmin." }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
            }

            // B. Buscar si ya existe el registro
            const existing = await adminClient.entities.ConfiguracionGlobal.filter({
                key: "datos_bancarios"
            });

            const payload = {
                key: "datos_bancarios",
                valor: config,
                updated_at: new Date().toISOString(),
                updated_by: "SuperAdmin"
            };

            if (Array.isArray(existing) && existing.length > 0) {
                // UPDATE
                const id = existing[0].id || existing[0]._id;
                await adminClient.entities.ConfiguracionGlobal.update(id, payload);
            } else {
                // CREATE
                await adminClient.entities.ConfiguracionGlobal.create(payload);
            }

            return Response.json({ success: true, mensaje: "Datos bancarios actualizados." }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ error: "Acción desconocida" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (error) {
        return Response.json({ error: error.message || String(error) }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
