// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_COMERCIO = `https://app.base44.com/api/apps/${APP_ID}/entities/Comercio`;
const URL_EVENTO_META = `https://app.base44.com/api/apps/${APP_ID}/entities/EventoMeta`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { commerce_code } = body;

        if (!commerce_code) {
            return Response.json({ error: 'Falta commerce_code' }, { status: 400 });
        }

        // 1. OBTENER CONFIGURACIÓN DEL COMERCIO (URL Directa)
        const responseBusqueda = await fetch(`${URL_COMERCIO}?commerce_code=${commerce_code}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseBusqueda.ok) {
            throw new Error(`Error buscando comercio: ${await responseBusqueda.text()}`);
        }

        const comercios = await responseBusqueda.json();
        const comercio = Array.isArray(comercios) ? comercios[0] : null;

        if (!comercio) {
            return Response.json({ error: 'Comercio no encontrado' }, { status: 404 });
        }

        // 2. RETORNO DE CONFIGURACIÓN DE MARKETING (Incluyendo referencia a EventoMeta)
        return Response.json({
            success: true,
            config: {
                pixelId: comercio.meta_pixel_id || null,
                datasetId: comercio.meta_dataset_id || null,
                testCode: comercio.meta_test_event_code || null,
                hasAccessToken: !!comercio.meta_access_token,
                entities: {
                    eventoMetaUrl: URL_EVENTO_META
                }
            },
            status: 'ready_for_ads'
        });

    } catch (error) {
        console.error('❌ Error en getMetaConfig:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});