// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_PRODUCTO = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId, activo } = await req.json().catch(() => ({}));

        if (!productoId || activo === undefined) {
            return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
        }

        // 1. Actualizar estado (PATCH)
        const responseUpdate = await fetch(`${URL_PRODUCTO}/${productoId}`, {
            method: 'PATCH',
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activo: Boolean(activo),
                updated_at: new Date().toISOString()
            })
        });

        if (!responseUpdate.ok) {
            const errorText = await responseUpdate.text();
            throw new Error(`Error actualizando producto: ${errorText}`);
        }

        const productoActualizado = await responseUpdate.json();

        return Response.json({
            success: true,
            producto: productoActualizado,
            mensaje: `Producto ${activo ? 'activado' : 'desactivado'}`
        });

    } catch (error) {
        console.error('Error toggleActivoProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});