// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId } = await req.json();

        if (!productoId) {
            return Response.json({ error: 'Falta ID de producto' }, { status: 400 });
        }

        // 1. Obtener producto (URL Directa)
        const responseGet = await fetch(`${URL_PRODUCTO}/${productoId}`, {
            headers: { 'api_key': API_KEY }
        });

        if (!responseGet.ok) {
            return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        const producto = await responseGet.json();

        // 2. Incrementar vistas (PATCH)
        const responseUpdate = await fetch(`${URL_PRODUCTO}/${productoId}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vistas_totales: (producto.vistas_totales || 0) + 1,
                updated_at: new Date().toISOString()
            })
        });

        if (!responseUpdate.ok) {
            const errorText = await responseUpdate.text();
            throw new Error(`Error actualizando vistas: ${errorText}`);
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error incrementando vistas:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});