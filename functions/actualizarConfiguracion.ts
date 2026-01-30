// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/ConfiguracionComercio`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId, configData } = await req.json();
        const id_comercio_final = commerce_code || legacyId;

        if (!id_comercio_final) {
            return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });
        }

        // 1. Buscar si ya existe la configuración para este comercio
        const queryUrl = `${BASE_URL}?commerce_code=${id_comercio_final}`;
        const responseBusqueda = await fetch(queryUrl, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseBusqueda.ok) {
            const errorText = await responseBusqueda.text();
            throw new Error(`Error buscando configuración: ${errorText}`);
        }

        const configs = await responseBusqueda.json();

        if (Array.isArray(configs) && configs.length > 0) {
            // 2. ACTUALIZAR (PATCH)
            const configId = configs[0].id || configs[0]._id;
            const updateResponse = await fetch(`${BASE_URL}/${configId}`, {
                method: 'PATCH',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...configData,
                    updated_at: new Date().toISOString()
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Error actualizando configuración: ${errorText}`);
            }
        } else {
            // 3. CREAR (POST)
            const createResponse = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    commerce_code: id_comercio_final,
                    id_comercio: id_comercio_final, // Soporte legado
                    ...configData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                throw new Error(`Error creando configuración: ${errorText}`);
            }
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error("Error en actualizarConfiguracion:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
