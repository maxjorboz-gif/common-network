// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

// Debe coincidir con loginComercio.ts
const JWT_SECRET_COMERCIO = "CLAVE_SECRETA_COMERCIOS_2026_BLINDADA";

async function verifyTokenSignature(tokenRaw) {
    try {
        const decoded = atob(tokenRaw);
        const [commerceCode, userId, timestamp, signature] = decoded.split(':');

        if (!commerceCode || !userId || !timestamp || !signature) return null;

        // Recrear firma
        const payloadStr = `${commerceCode}:${userId}:${timestamp}`;
        const firmaData = new TextEncoder().encode(payloadStr + JWT_SECRET_COMERCIO);
        const firmaBuffer = await crypto.subtle.digest("SHA-256", firmaData);
        const firmaArray = Array.from(new Uint8Array(firmaBuffer));
        const expectedSignature = firmaArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (signature !== expectedSignature) return null;

        // Opcional: Check Expiración (ej. 24hs)
        // if (Date.now() - parseInt(timestamp) > 86400000) return null;

        return commerceCode;
    } catch (e) {
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response("OK", { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 1. Obtener Token del Header Authorization
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return Response.json({ error: "Token no proporcionado" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // 2. Verificar Firma Criptográfica
        const commerceCodeValidado = await verifyTokenSignature(token);

        if (!commerceCodeValidado) {
            return Response.json({ error: "Token inválido o manipulado" }, { status: 403 });
        }

        // 3. Buscar Datos Reales en DB (Usando el código validado)
        const response = await fetch(`${BASE44_URL}?commerce_code=${commerceCodeValidado}`, {
            headers: { 'api_key': API_KEY }
        });
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            return Response.json({ error: "Comercio no encontrado" }, { status: 404 });
        }

        const comercio = data[0];

        // 4. Limpieza de Seguridad (Nunca devolver passwords)
        const { password, password_hash, ...safeComercioData } = comercio;

        return Response.json({
            success: true,
            data: safeComercioData
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
