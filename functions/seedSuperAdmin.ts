// @ts-nocheck
import { crypto } from "jsr:@std/crypto";

// CONFIGURACIÓN
const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_SUPERADMIN = `https://app.base44.com/api/apps/${APP_ID}/entities/SuperAdmin`;

// CREDENCIALES INICIALES (CAMBIAR DESPUÉS SÍ O SÍ)
// CREDENCIALES INICIALES (CAMBIAR DESPUÉS SÍ O SÍ)
const INITIAL_EMAIL = "admin@plataforma.com";
const INITIAL_PASSWORD = "admin12345CAMBIAME";
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
    try {
        // Solo permitir ejecución local o protegida si fuera necesario
        // Para este seed, asumimos ejecución manual una vez.

        // 1. Verificar si ya existe un SuperAdmin
        const check = await fetch(`${URL_SUPERADMIN}?email=${INITIAL_EMAIL}`, {
            headers: { 'api_key': API_KEY }
        });
        const existing = await check.json();

        if (Array.isArray(existing) && existing.length > 0) {
            return Response.json({ message: "El SuperAdmin ya existe. No se hizo nada." });
        }

        // 2. Hashear Password
        // Nota: En producción real usamos Salt + PBKDF2. Aquí SHA-256 simple para no complicar dependencias, 
        // pero es infinitamente mejor que texto plano.
        const passwordHash = await hashPassword(INITIAL_PASSWORD);

        // 3. Crear Entidad
        const payload = {
            email: INITIAL_EMAIL,
            password_hash: passwordHash,
            nombre: "Super Admin Fundador",
            rol: "god_mode",
            created_at: new Date().toISOString()
        };

        const createResp = await fetch(URL_SUPERADMIN, {
            method: 'POST',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await createResp.json();

        return Response.json({
            success: true,
            message: "SuperAdmin Creado con Éxito",
            admin_id: result.id || result._id
        });

    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
});
