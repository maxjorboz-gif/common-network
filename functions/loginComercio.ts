// @ts-nocheck
// Lógica de Login Propio contra Entity Comercio
// Recibe: { email, password }
// Devuelve: { success, commerce_code, ... } si las credenciales coinciden

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ success: false, error: "Email y contraseña requeridos" }, { status: 400 });
        }

        console.log(`Intentando login para: ${email}`);

        // 1. Buscar comercio por email
        const queryUrl = `${BASE44_URL}?email_negocio=${encodeURIComponent(email)}`;
        const response = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error API Base44: ${errorText}`);
        }

        const results = await response.json();

        // 2. Verificar existencia
        if (!Array.isArray(results) || results.length === 0) {
            return Response.json({ success: false, error: "Usuario no encontrado" }, { status: 401 });
        }

        // 3. Verificar contraseña (comparación directa ya que guardamos texto plano por ahora)
        // Podría haber múltiples resultados si la DB no es unique, tomamos el primero
        const comercio = results[0];

        if (comercio.password !== password) {
            return Response.json({ success: false, error: "Contraseña incorrecta" }, { status: 401 });
        }

        // 4. Éxito
        return Response.json({
            success: true,
            commerce_code: comercio.commerce_code,
            nombre_comercio: comercio.nombre,
            nombre_usuario: comercio.nombre_usuario,
            estado: comercio.estado_registro,
        });

    } catch (error) {
        console.error("Login Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
