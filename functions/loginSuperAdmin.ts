// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_SUPERADMIN = `https://app.base44.com/api/apps/${APP_ID}/entities/SuperAdmin`;

// SECRET KEY para firmar tokens. 
// LO IDEAL ES QUE ESTO ESTÉ EN VAR DE ENTORNO. AQUI HARDCODE POR SIMPLICIDAD DE LA SOLUCIÓN.
const JWT_SECRET = "CLAVE_SECRETA_MUY_DIFICIL_DE_ADIVINAR_2026_CAMBIAME";
const PASSWORD_SALT = "v4_SUPER_SECRET_SALT_2026_PROTECT_BASE44_SYSTEM_#99282";

async function hashPassword(password: string) {
    const encoder = new TextEncoder();
    // SALT aplicado
    const data = encoder.encode(password + PASSWORD_SALT);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response("OK", { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: "Datos incompletos" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 1. Buscar Admin
        const userResp = await fetch(`${URL_SUPERADMIN}?email=${email}`, {
            headers: { 'api_key': API_KEY }
        });
        const users = await userResp.json();

        if (!Array.isArray(users) || users.length === 0) {
            // Retardamos para evitar Timing Attacks
            await new Promise(r => setTimeout(r, 500));
            return Response.json({ error: "Credenciales inválidas" }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const admin = users[0];

        // 2. Verificar Hash
        const inputHash = await hashPassword(password);

        if (inputHash !== admin.password_hash) {
            await new Promise(r => setTimeout(r, 500));
            return Response.json({ error: "Credenciales inválidas" }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 3. Generar "Token" (Simple Session Token firmado caseramente para no importar librerias JWT pesadas)
        // Formato: base64(admin_id : timestamp : firma_hmac)

        const payloadStr = `${admin.id || admin._id}:${Date.now()}`;
        const signature = await hashPassword(payloadStr + JWT_SECRET); // Usamos el mismo hasher como firma simple
        const token = btoa(`${payloadStr}:${signature}`);

        return Response.json({
            success: true,
            token: token,
            admin: {
                nombre: admin.nombre,
                email: admin.email
            }
        }, { headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (e) {
        return Response.json({ error: e.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
