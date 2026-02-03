// @ts-nocheck
import { crypto } from "jsr:@std/crypto";
import { createClientFromRequest } from "npm:@base44/sdk";

const PASSWORD_SALT = "v4_SUPER_SECRET_SALT_2026_PROTECT_BASE44_SYSTEM_#99282";

// Función Helper para Hashear
async function hashPassword(password) {
    const encoder = new TextEncoder();
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

        const base44 = createClientFromRequest(req);
        // Usamos ServiceRole para escritura/lectura privilegiada sin usuario logueado
        const adminClient = base44.asServiceRole;

        // 1. Validar Duplicados (Email) via SDK
        console.log(`Verificando existencia de: ${data.email}`);
        const existing = await adminClient.entities.Comercio.filter({
            email_negocio: data.email
        });

        if (Array.isArray(existing) && existing.length > 0) {
            return Response.json({ success: false, error: "Este email ya está registrado. Por favor inicia sesión." }, { status: 400 });
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
            password_hash: securePasswordHash,
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

        // 5. Persistencia via SDK
        const result = await adminClient.entities.Comercio.create(entityPayload);

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
