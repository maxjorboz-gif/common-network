const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const ENTITY_CONFIG = "ConfiguracionGlobal";
const URL_CONFIG = `https://app.base44.com/api/apps/${APP_ID}/entities/${ENTITY_CONFIG}`;

// Clave única para identificar el registro de configuración
const SINGLETON_KEY = "finance_config_v1";

Deno.serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response("OK", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
        });
    }

    try {
        const body = await req.json();
        const { action, ...data } = body;
        const headers = { "Content-Type": "application/json", "api_key": API_KEY };

        // ACCION: OBTENER
        if (action === 'obtener') {
            // Buscamos por nuestra clave única
            const resp = await fetch(`${URL_CONFIG}?clave_unica=${SINGLETON_KEY}`, { headers });
            const resultados = await resp.json();

            let config = null;
            if (Array.isArray(resultados) && resultados.length > 0) {
                config = resultados[0];
            }

            // Si no existe, devolvemos objeto vacío pero success true
            return Response.json({
                success: true,
                config: config || { cbu: "", alias: "", banco: "", titular: "" }
            }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // ACCION: GUARDAR
        if (action === 'guardar') {
            const { config } = data;

            // 1. Buscar si existe
            const resp = await fetch(`${URL_CONFIG}?clave_unica=${SINGLETON_KEY}`, { headers });
            const resultados = await resp.json();

            if (Array.isArray(resultados) && resultados.length > 0) {
                // UPDATE
                const id = resultados[0]._id || resultados[0].id;
                await fetch(`${URL_CONFIG}/${id}`, {
                    method: 'PUT', // Usamos PUT para reemplazar o PATCH
                    headers,
                    body: JSON.stringify({ ...config, clave_unica: SINGLETON_KEY })
                });
            } else {
                // CREATE
                await fetch(URL_CONFIG, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ ...config, clave_unica: SINGLETON_KEY })
                });
            }

            return Response.json({ success: true }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ error: "Accion invalida" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });

    } catch (e) {
        return Response.json({ error: e.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
});
