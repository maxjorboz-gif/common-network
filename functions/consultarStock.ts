// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const BASE_URL = "https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto";

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json().catch(() => ({}));
        const { productoId } = body;

        if (!productoId) return Response.json({ error: 'Falta ID' }, { status: 400 });

        // 1. Obtención Directa usando URL completa
        const response = await fetch(`${BASE_URL}/${productoId}`, {
            headers: {
                'api_key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return Response.json({ error: 'No encontrado' }, { status: 404 });
        }

        const producto = await response.json();

        // 2. Dato Crudo (Single Source of Truth)
        const stock = Number(producto.stock_actual) || 0;

        return Response.json({
            success: true,
            stock: stock,
            disponible: stock > 0,
            titulo: producto.titulo
        });

    } catch (error) {
        console.error('Error consultarStock:', error);
        return Response.json({ error: 'Error stock' }, { status: 500 });
    }
});