
// @ts-nocheck

const APP_ID = "6967728aba18db08a32d56fd";
const API_KEY = "fb3a067ef3c44d8489059567b4206a91";
const ENTITY_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/Producto`;

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const body = await req.json();
        const { commerce_code, category_name } = body;

        if (!commerce_code || !category_name) {
            return Response.json({ error: 'Faltan datos requeridos (commerce_code, category_name)' }, { status: 400 });
        }

        // 1. Obtener productos del comercio y categoría
        // Nota: Base44 filtering via URL query params for specific fields depends on setup.
        // Assuming we can search? "Producto?commerce_code=X&categoria=Y" would be ideal.
        // If not, we fetch by commerce_code and filter in memory.

        const searchUrl = `${ENTITY_URL}?commerce_code=${encodeURIComponent(commerce_code)}`;
        const response = await fetch(searchUrl, { headers: { 'api_key': API_KEY } });

        if (!response.ok) return Response.json({ error: 'Error buscando productos' }, { status: 500 });

        const allProducts = await response.json();
        const productsToUpdate = allProducts.filter(p => p.categoria === category_name);

        if (productsToUpdate.length === 0) {
            return Response.json({ success: true, message: 'No se encontraron productos en esta categoría', updated: 0 });
        }

        // 2. Actualizar productos (Des-categorizar)
        let updatedCount = 0;
        const errors = [];

        // Concurrency limit could be good but for now sequential or simple Promise.all
        // Using Promise.all for speed
        const updatePromises = productsToUpdate.map(async (prod) => {
            const prodId = prod.id || prod._id;
            const res = await fetch(`${ENTITY_URL}/${prodId}`, {
                method: 'PATCH',
                headers: {
                    'api_key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ categoria: '' }) // Set to empty string
            });

            if (res.ok) updatedCount++;
            else {
                const txt = await res.text();
                errors.push(`Error updating ${prodId}: ${txt}`);
            }
        });

        await Promise.all(updatePromises);

        return Response.json({
            success: true,
            updated: updatedCount,
            total_found: productsToUpdate.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error eliminarCategoria:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
