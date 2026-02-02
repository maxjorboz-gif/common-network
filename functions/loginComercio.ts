// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

// SECRETO COMERCIOS (Diferente al de Admin, aislacion de roles)
const JWT_SECRET_COMERCIO = "CLAVE_SECRETA_COMERCIOS_2026_BLINDADA";

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
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

        // 1. Buscar Comercio
        const response = await fetch(`${BASE44_URL}?email_negocio=${encodeURIComponent(email)}`, {
            headers: { 'api_key': API_KEY }
        });
        const comercios = await response.json();

        if (!Array.isArray(comercios) || comercios.length === 0) {
            await new Promise(r => setTimeout(r, 500)); // Anti-timing
            return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        const comercio = comercios[0];

        // 2. Verificar Estado
        if (comercio.estado_registro === 'suspendido' || comercio.estado_registro === 'banned') {
            return Response.json({ error: "Cuenta suspendida. Contacte soporte." }, { status: 403 });
        }

        // 3. Verificar Contraseña (Soporte Híbrido mientras migramos)
        let isValid = false;

        if (comercio.password_hash) {
            // A. Verificación Profesional (Hash)
            const inputHash = await hashPassword(password);
            isValid = (inputHash === comercio.password_hash);
        } else if (comercio.password) {
            // B. Legacy Fallback (Texto Plano - Para usuarios viejos)
            // TODO: En el futuro, hacer migración automática aquí (hash on login)
            isValid = (password === comercio.password);
        }

        if (!isValid) {
            await new Promise(r => setTimeout(r, 500));
            return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // 4. Generar Token Firmado (JWT-ish)
        // Payload: commerce_code : user_id : timestamp
        const payloadStr = `${comercio.commerce_code}:${comercio.user_id}:${Date.now()}`;

        // Firma
        const firmaData = new TextEncoder().encode(payloadStr + JWT_SECRET_COMERCIO);
        const firmaBuffer = await crypto.subtle.digest("SHA-256", firmaData);
        const firmaArray = Array.from(new Uint8Array(firmaBuffer));
        const firmaHex = firmaArray.map(b => b.toString(16).padStart(2, "0")).join("");

        const token = btoa(`${payloadStr}:${firmaHex}`);

        // 5. Respuesta Exitosa
        return Response.json({
            success: true,
            token: token,
            // Devolvemos datos minimos necesarios para UI inmediata
            commerce: {
                nombre: comercio.nombre || comercio.nombre_comercio,
                code: comercio.commerce_code,
                logo: comercio.logo_url
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
