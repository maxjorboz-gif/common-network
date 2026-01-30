// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const URL_PRODUCTO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";
const URL_ATRIBUTO = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const { productoId } = await req.json();
        if (!productoId) return Response.json({ error: 'ID requerido' }, { status: 400 });

        // 1. Limpieza de Atributos (URL Directa)
        // Buscamos los atributos vinculados al producto para borrarlos uno por uno
        try {
            const queryAttrUrl = `${URL_ATRIBUTO}?id_producto=${productoId}`;
            const resAttrs = await fetch(queryAttrUrl, {
                headers: { 'api_key': API_KEY }
            });

            if (resAttrs.ok) {
                const atributos = await resAttrs.json();
                if (Array.isArray(atributos)) {
                    for (const attr of atributos) {
                        await fetch(`${URL_ATRIBUTO}/${attr.id || attr._id}`, {
                            method: 'DELETE',
                            headers: { 'api_key': API_KEY }
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Error eliminando atributos relacionados:", e);
        }

        // 2. Eliminar Producto (URL Directa)
        const deleteResponse = await fetch(`${URL_PRODUCTO}/${productoId}`, {
            method: 'DELETE',
            headers: { 'api_key': API_KEY }
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error(`Error eliminando producto: ${errorText}`);
        }

        return Response.json({ success: true, mensaje: 'Producto eliminado' });

    } catch (error) {
        console.error('Error eliminarProducto:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});