// @ts-nocheck
// Lógica de Login Propio contra Entity Comercio
// Recibe: { email, password }
// Devuelve: { success, session, commerce }

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE44_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                }
            });
        }

        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ success: false, error: "Email y contraseña requeridos" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        console.log(`[Login] Intentando autenticación para: ${email}`);

        // 1. Buscar comercio por email en la DB (Única Fuente de Verdad)
        const queryUrl = `${BASE44_URL}?email_negocio=${encodeURIComponent(email)}`;
        const response = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) {
            console.error(`[Login] Error API Base44: ${response.status}`);
            throw new Error(`Error de conexión con base de datos`);
        }

        const results = await response.json();

        // 2. Verificar existencia
        if (!Array.isArray(results) || results.length === 0) {
            console.warn(`[Login] Usuario no encontrado: ${email}`);
            return Response.json({ success: false, error: "Credenciales inválidas" }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const comercio = results[0];

        // 3. Verificar contraseña 
        // TODO: En el futuro, usar hash (bcrypt). Por ahora es comparación directa por legacy.
        if (!comercio.password || comercio.password !== password) {
            console.warn(`[Login] Password incorrecto para: ${email}`);
            return Response.json({ success: false, error: "Credenciales inválidas" }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 4. Verificar estado del comercio (Activo vs Suspendido)
        if (comercio.estado_registro === 'suspendido' || comercio.estado_registro === 'banned') {
            return Response.json({ success: false, error: "Cuenta suspendida. Contacte soporte." }, { status: 403, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 5. Generar Sesión Estructurada
        // Creamos un token simple (en producción debería ser firmado/JWT).
        // Usamos commerce_code como identificador principal.
        const sessionToken = btoa(`${comercio.commerce_code}:${Date.now()}:${Math.random()}`);
        const sessionExpiration = new Date();
        sessionExpiration.setHours(sessionExpiration.getHours() + 24); // 24 horas

        const session = {
            token: sessionToken,
            commerce_code: comercio.commerce_code,
            role: 'admin_comercio',
            expires_at: sessionExpiration.toISOString(),
            status: comercio.estado_registro || 'active'
        };

        // Devolvemos la "Verdad" completa para el AuthContext
        return Response.json({
            success: true,
            session: session,
            commerce: {
                id: comercio.id,
                nombre: comercio.nombre_comercio || comercio.nombre_tienda || comercio.nombre,
                email: comercio.email_negocio,
                logo: comercio.logo_url,
                commerce_code: comercio.commerce_code
            }
        }, {
            headers: { "Access-Control-Allow-Origin": "*" }
        });

    } catch (error) {
        console.error("[Login] Exception:", error);
        return Response.json({ success: false, error: "Error interno del servidor" }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});

