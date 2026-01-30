
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response('OK');

        const body = await req.json();
        const { commerce_code: idRecibido, id_comercio: legacyId } = body;
        const commerceCode = idRecibido || legacyId;

        if (!commerceCode) {
            return Response.json({ error: 'Falta ID de comercio (commerce_code)' }, { status: 400 });
        }

        // 1. GET PRODUCTOS (Filter by commerce_code)
        const prodResponse = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/Producto?commerce_code=${encodeURIComponent(commerceCode)}`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        if (!prodResponse.ok) {
            throw new Error('Error fetching productos from Base44');
        }

        const productos = await prodResponse.json();

        // 2. GET ATRIBUTOS (Get All & Filter in memory)
        const attrResponse = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/AtributoProducto`, {
            headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
        });

        let atributos = [];
        if (attrResponse.ok) {
            const todosAtributos = await attrResponse.json();
            const misProductoIds = new Set(productos.map(p => p.id || p._id));
            atributos = todosAtributos.filter(a => misProductoIds.has(a.id_producto));
        }

        // Normalize Stock
        const productosNorm = productos.map((p) => ({
            ...p,
            stock_actual: Number(p.stock !== undefined ? p.stock : (p.stock_actual !== undefined ? p.stock_actual : 0))
        }));

        return Response.json({
            success: true,
            productos: productosNorm,
            atributos: atributos
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
