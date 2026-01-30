// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        const entities = ['Producto', 'Comercio', 'Orden', 'Carrito', 'Cupon', 'ConfiguracionComercio', 'Lead', 'GastoPublicitario', 'AtributoProducto', 'EventoMeta'];

        for (const entity of entities) {
            const listRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/${entity}`, {
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });

            if (listRes.ok) {
                const items = await listRes.json();
                const deletePromises = items.map(item =>
                    fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/${entity}/${item._id || item.id}`, {
                        method: 'DELETE',
                        headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
                    })
                );
                await Promise.all(deletePromises);
            }
        }

        return Response.json({ success: true, message: "Force Wipe complete" });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
