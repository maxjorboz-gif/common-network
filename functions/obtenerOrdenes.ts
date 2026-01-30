// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_ORDEN = `https://app.base44.com/api/apps/${APP_ID}/entities/Orden`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { commerce_code, id_comercio: legacyId } = await req.json().catch(() => ({}));
        const idBusqueda = commerce_code || legacyId;

        if (!idBusqueda) return Response.json({ error: 'Falta ID Comercio' }, { status: 400 });

        // Determinar parámetro de filtro
        let filterParam = idBusqueda.length > 20 ? `id_comercio=${idBusqueda}` : `commerce_code=${idBusqueda}`;

        // Obtener Ordenes (URL Directa)
        const response = await fetch(`${URL_ORDEN}?${filterParam}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) {
            throw new Error(`Error obteniendo órdenes: ${await response.text()}`);
        }

        const ordenes = await response.json();

        return Response.json({
            success: true,
            ordenes: Array.isArray(ordenes) ? ordenes : []
        });

    } catch (error) {
        console.error('Error obtenerOrdenes:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
