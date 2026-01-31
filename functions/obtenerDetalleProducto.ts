// @ts-check

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

Deno.serve(async (req: Request) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const url = new URL(req.url);
        const productoId = url.searchParams.get('id');

        if (!productoId) return Response.json({ error: 'Falta ID de producto' }, { status: 400 });

        const response = await fetch(`${URL_PRODUCTO}/${productoId}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!response.ok) return Response.json({ error: 'Producto no encontrado' }, { status: 404 });

        const producto = await response.json();

        return Response.json({
            success: true,
            producto
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return Response.json({ error: errorMessage }, { status: 500 });
    }
});
