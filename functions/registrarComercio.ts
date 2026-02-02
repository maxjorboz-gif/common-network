// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;
const PASSWORD_SALT = "v4_SUPER_SECRET_SALT_2026_PROTECT_BASE44_SYSTEM_#99282";

// Función Helper para Hashear (Igual que en SuperAdmin y Login)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    // SALT aplicado
    const data = encoder.encode(password + PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const { action, ...data } = body;

        // 1. Validar Duplicados (Email)
        console.log(`Verificando existencia de: ${data.email}`);
        const checkResponse = await fetch(`${BASE44_URL}?email_negocio=${encodeURIComponent(data.email)}`, {
            headers: { 'api_key': API_KEY }
        });

        if (checkResponse.ok) {
            const existing = await checkResponse.json();
            if (Array.isArray(existing) && existing.length > 0) {
                return Response.json({ success: false, error: "Este email ya está registrado. Por favor inicia sesión." }, { status: 400 });
            }
        }

        // 2. Seguridad: Hashear Password
        const securePasswordHash = await hashPassword(data.password);

        // 3. Generar Identificadores
        const commerceCode = [...crypto.getRandomValues(new Uint32Array(1))].map(v => v.toString(36).substring(2, 12).toUpperCase())[0];
        const newUserId = crypto.randomUUID();

        // 4. Payload Profesional
        const entityPayload = {
            nombre: data.nombre_comercio || data.nombre,
            nombre_usuario: data.full_name,
            email_negocio: data.email,
            // BLINDAJE: Guardamos hash, nunca texto plano
            password_hash: securePasswordHash,
            // Mantenemos campo legacy 'password' vacío o con placeholder para no romper esquemas viejos si los hubiera, 
            // pero lo ideal es no enviarlo. Lo omitimos por seguridad.
            whatsapp_negocio: data.whatsapp,

            commerce_code: commerceCode,
            user_id: newUserId,

            estado_registro: "completado",
            activo: true,
            plan: "bronce",
            saldo_publicidad: 0,
            configuracion_avanzada: {},
            created_at: new Date().toISOString()
        };

        // 5. Persistencia
        const response = await fetch(BASE44_URL, {
            method: 'POST',
            headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(entityPayload)
        });

        const result = await response.json();

        if (result.error || (result.code && result.message)) {
            throw new Error(result.message || result.error || "Error al crear comercio en Base44");
        }

        // 6. Respuesta Limpia
        return Response.json({
            success: true,
            id_solicitud: result.id || result._id,
            commerce_code: commerceCode
        });

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
