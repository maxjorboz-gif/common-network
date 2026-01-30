// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { user_id, commerce_code } = body;

        // Si no hay identificación, devolvemos null para no romper front
        if (!user_id && !commerce_code) {
            return Response.json({ success: true, comercio: null, commerce_code: null });
        }

        let queryUrl = "";
        if (commerce_code) {
            queryUrl = `${URL_COMERCIO}?commerce_code=${commerce_code}`;
        } else if (user_id) {
            queryUrl = `${URL_COMERCIO}?user_id=${user_id}`;
        }

        // 1. Buscar Comercio (URL Directa)
        const response = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) {
            throw new Error(`Error recuperando comercio: ${await response.text()}`);
        }

        const comercios = await response.json();

        if (Array.isArray(comercios) && comercios.length > 0) {
            const miComercio = comercios[0];
            return Response.json({
                success: true,
                commerce_code: miComercio.commerce_code,
                comercio: miComercio
            });
        }

        return Response.json({
            success: true,
            commerce_code: null,
            comercio: null
        });

    } catch (error) {
        console.error("Error en obtenerDatosComercio:", error);
        return Response.json({ success: true, comercio: null });
    }
});
