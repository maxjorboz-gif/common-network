// @ts-check
// Gestiona la configuración global del Super Admin (CBU, Alias, Precio del Lead, etc.)
// Usa una entidad "ConfiguracionGlobal" con un ID único conocido o singleton logic.

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";

const ENTITY_CONFIG = "ConfiguracionGlobal";
const URL_CONFIG = `https://app.base44.com/api/apps/${APP_ID}/entities/${ENTITY_CONFIG}`;

// ID Singleton para la configuración (siempre usaremos el mismo registro)
// Si no existe, lo crearemos la primera vez.
const SINGLETON_CONFIG_ID_KEY = "GLOBAL_FINANCE_CONFIG";

const headers = {
    "Content-Type": "application/json",
    "api_key": API_KEY
};

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");
        const body = await req.json();
        const { action, ...data } = body;

        // 1. Obtener Configuración Actual (Pública para leer CBU, Privada para editar)
        if (action === 'obtener') {
            // Buscamos por key única
            const resp = await fetch(`${URL_CONFIG}?clave_unica=${SINGLETON_CONFIG_ID_KEY}`, { headers });
            const resultados = await resp.json();

            let config = Array.isArray(resultados) ? resultados[0] : null;

            if (!config) {
                // Si no existe, devolvemos default vacía
                return Response.json({
                    success: true,
                    config: {
                        cbu: "",
                        alias: "",
                        banco: "",
                        titular: ""
                    }
                });
            }

            return Response.json({ success: true, config });
        }

        // 2. Guardar Configuración (Solo Admin)
        if (action === 'guardar') {
            const { admin_secret, config } = data;

            // if (admin_secret !== "abriteporfavor") {
            //     return Response.json({ error: "Acceso denegado" }, { status: 403 });
            // }

            // Buscamos si ya existe para saber si crear o actualizar
            const resp = await fetch(`${URL_CONFIG}?clave_unica=${SINGLETON_CONFIG_ID_KEY}`, { headers });
            const resultados = await resp.json();
            const existe = Array.isArray(resultados) && resultados.length > 0;

            if (existe) {
                // Actualizar (PATCH)
                const id = resultados[0].id || resultados[0]._id;
                await fetch(`${URL_CONFIG}/${id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(config)
                });
            } else {
                // Crear (POST)
                await fetch(URL_CONFIG, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        ...config,
                        clave_unica: SINGLETON_CONFIG_ID_KEY
                    })
                });
            }

            return Response.json({ success: true, message: "Configuración guardada" });
        }

        return Response.json({ error: "Acción desconocida" }, { status: 400 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return Response.json({ error: errorMessage }, { status: 500 });
    }
});
