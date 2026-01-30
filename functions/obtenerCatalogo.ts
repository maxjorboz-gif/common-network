// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const url = new URL(req.url);
        const commerceCode = url.searchParams.get('commerce_code');

        if (!commerceCode) return Response.json({ error: 'Falta commerce_code' }, { status: 400 });

        const filterParam = commerceCode.length > 20 ? `id_comercio=${commerceCode}` : `commerce_code=${commerceCode}`;

        const response = await fetch(`${URL_PRODUCTO}?${filterParam}&activo=true`, {
            headers: { 'api_key': API_KEY }
        });

        const productos = await response.json();

        return Response.json({
            success: true,
            productos: Array.isArray(productos) ? productos : []
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
