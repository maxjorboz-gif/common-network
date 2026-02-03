// @ts-nocheck
import { crypto } from "jsr:@std/crypto";
import { createClientFromRequest } from "npm:@base44/sdk";

// SECRETO COMERCIOS (Diferente al de Admin, aislacion de roles)
const JWT_SECRET_COMERCIO = "CLAVE_SECRETA_COMERCIOS_2026_BLINDADA";
const PASSWORD_SALT = "v4_SUPER_SECRET_SALT_2026_PROTECT_BASE44_SYSTEM_#99282";

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

        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: "Email y contraseña requeridos" }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 1. Buscar Comercio (SDK)
        const comercios = await adminClient.entities.Comercio.filter({
            email_negocio: email
        });

        if (!Array.isArray(comercios) || comercios.length === 0) {
            await new Promise(r => setTimeout(r, 500)); // Anti-timing
            return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        const comercio = comercios[0];

        // 2. Verificar Estado
        if (comercio.estado_registro === 'suspendido' || comercio.estado_registro === 'banned') {
            return Response.json({ error: "Cuenta suspendida. Contacte soporte." }, { status: 403 });
        }

        // 3. Lógica Híbrida de Autenticación & Migración
        let isValid = false;
        let needsMigration = false;

        if (comercio.password_hash) {
            // A. Verificación Profesional (Hash)
            const inputHash = await hashPassword(password);
            isValid = (inputHash === comercio.password_hash);
        } else if (comercio.password) {
            // B. Legacy Fallback (Texto Plano)
            if (password === comercio.password) {
                isValid = true;
                needsMigration = true;
            }
        }

        if (!isValid) {
            await new Promise(r => setTimeout(r, 500));
            return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // 4. AUTO-MIGRACIÓN (Si aplica)
        if (needsMigration) {
            try {
                const newSecureHash = await hashPassword(password);
                const comercioId = comercio.id || comercio._id;

                // Actualizamos DB via SDK (fire-and-forget)
                adminClient.entities.Comercio.update(comercioId, {
                    password_hash: newSecureHash,
                    password: null, // Wipe legacy
                    migracion_seguridad: new Date().toISOString()
                }).catch(err => console.error("Error en auto-migracion:", err));

                console.log(`[SECURITY] Usuario ${comercioId} migrado a SHA-256.`);
            } catch (e) {
                console.error("Fallo intento de migracion:", e);
            }
        }

        // 5. Generar Token Firmado (JWT-ish propietary logic remains same)
        const payloadStr = `${comercio.commerce_code}:${comercio.user_id}:${Date.now()}`;
        const firmaData = new TextEncoder().encode(payloadStr + JWT_SECRET_COMERCIO);
        const firmaBuffer = await crypto.subtle.digest("SHA-256", firmaData);
        const firmaArray = Array.from(new Uint8Array(firmaBuffer));
        const firmaHex = firmaArray.map(b => b.toString(16).padStart(2, "0")).join("");

        const token = btoa(`${payloadStr}:${firmaHex}`);

        // 6. Respuesta Exitosa
        return Response.json({
            success: true,
            token: token,
            commerce: {
                nombre: comercio.nombre || comercio.nombre_comercio,
                code: comercio.commerce_code,
                logo: comercio.logo_url
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
