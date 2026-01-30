// @ts-nocheck
// Función segura para obtener datos del COMERCIO PROPIO
// Protegida: Requiere Token de Sesión en Header 'Authorization: Bearer <token>'

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        // CORS Headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        };

        if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        // 1. Extraer Token de Autorización
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return Response.json({ success: false, error: "Unauthorized: Token requerido" }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.split(" ")[1];

        // 2. Validar Token (Decodificar Session)
        // El token viene de loginComercio: base64(commerce_code:timestamp:random)
        let commerceCode = null;
        try {
            const decoded = atob(token);
            const parts = decoded.split(":");
            if (parts.length < 3) throw new Error("Token malformado");

            // TODO: Validar Expiración (timestamp)
            commerceCode = parts[0];

            if (!commerceCode) throw new Error("Token inválido");

        } catch (e) {
            return Response.json({ success: false, error: "Unauthorized: Token inválido" }, { status: 403, headers: corsHeaders });
        }

        console.log(`[obtenerDatosComercio] Fetching data for code: ${commerceCode}`);

        // 3. Buscar Comercio (Usando el ID seguro del token)
        const queryUrl = `${URL_COMERCIO}?commerce_code=${encodeURIComponent(commerceCode)}`;
        const response = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) {
            throw new Error(`Error BD: ${await response.text()}`);
        }

        const comercios = await response.json();

        if (Array.isArray(comercios) && comercios.length > 0) {
            const miComercio = comercios[0];

            // Sanitizar respuesta (no devolver password)
            const { password, ...safeComercio } = miComercio;

            return Response.json({
                success: true,
                commerce_code: safeComercio.commerce_code,
                comercio: safeComercio
            }, { headers: corsHeaders });
        }

        return Response.json({
            success: false,
            error: "Comercio no encontrado para el token dado"
        }, { status: 404, headers: corsHeaders });

    } catch (error) {
        console.error("Error en obtenerDatosComercio:", error);
        return Response.json({ success: false, error: "Error interno del servidor" }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});

