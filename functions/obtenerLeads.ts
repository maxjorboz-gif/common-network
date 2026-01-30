// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_LEAD = `https://app.base44.com/api/apps/${APP_ID}/entities/Lead`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        // Determinar parámetro de filtro
        let filterParam = idBusqueda.length > 20 ? `id_comercio=${idBusqueda}` : `commerce_code=${idBusqueda}`;

        // Obtener Leads (URL Directa)
        const response = await fetch(`${URL_LEAD}?${filterParam}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) {
            throw new Error(`Error obteniendo leads: ${await response.text()}`);
        }

        const leads = await response.json();

        return Response.json({
            success: true,
            leads: Array.isArray(leads) ? leads : []
        });

    } catch (error) {
        console.error('Error obtenerLeads:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
