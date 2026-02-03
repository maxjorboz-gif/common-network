// @ts-nocheck
import { crypto } from "jsr:@std/crypto";
import { createClientFromRequest } from "npm:@base44/sdk";

// Debe coincidir con loginComercio.ts
const JWT_SECRET_COMERCIO = "CLAVE_SECRETA_COMERCIOS_2026_BLINDADA";

async function verifyTokenSignature(tokenRaw) {
    try {
        const decoded = atob(tokenRaw);
        const [idComercio, userId, timestamp, signature] = decoded.split(':');

        if (!idComercio || !userId || !timestamp || !signature) return null;

        // Recrear firma
        const payloadStr = `${idComercio}:${userId}:${timestamp}`;
        const firmaData = new TextEncoder().encode(payloadStr + JWT_SECRET_COMERCIO);
        const firmaBuffer = await crypto.subtle.digest("SHA-256", firmaData);
        const firmaArray = Array.from(new Uint8Array(firmaBuffer));
        const expectedSignature = firmaArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (signature !== expectedSignature) return null;

        // Opcional: Check Expiración (ej. 24hs)
        // if (Date.now() - parseInt(timestamp) > 86400000) return null;

        return idComercio;
    } catch (e) {
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response("OK", { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 1. Obtener Token (Header OR Body)
        let token = "";
        const authHeader = req.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else {
            const body = await req.clone().json().catch(() => ({}));
            if (body.token) token = body.token;
        }

        if (!token) {
            return Response.json({ error: "Token no proporcionado" }, { status: 401 });
        }

        // 2. Verificar Firma Criptográfica
        const idComercioValidado = await verifyTokenSignature(token);

        if (!idComercioValidado) {
            return Response.json({ error: "Token inválido o manipulado" }, { status: 403 });
        }

        const base44 = createClientFromRequest(req);
        const adminClient = base44.asServiceRole;

        // 3. Buscar Datos Reales en DB (SDK)
        // MAPPING: id_comercio (app) -> commerce_code (db field)
        const comercios = await adminClient.entities.Comercio.filter({
            commerce_code: idComercioValidado
        });

        if (comercios.length === 0) {
            return Response.json({ error: "Comercio no encontrado" }, { status: 404 });
        }

        const comercio = comercios[0];

        // 4. Limpieza de Seguridad (Nunca devolver passwords)
        const { password, password_hash, ...safeComercioData } = comercio;

        // INJECTION: Ensure id_comercio exists for frontend compatibility
        if (!safeComercioData.id_comercio) {
            safeComercioData.id_comercio = safeComercioData.commerce_code;
        }

        return Response.json({
            success: true,
            comercio: safeComercioData
        });

    } catch (error) {
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});
