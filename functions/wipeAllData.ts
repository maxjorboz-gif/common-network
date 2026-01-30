
// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        // DANGER: NO AUTH? (Por seguridad debería tener, pero replico lo que hay con Fetch)
        const entities = ['Producto', 'Comercio', 'Orden', 'Carrito', 'Cupon', 'ConfiguracionComercio', 'Lead', 'GastoPublicitario'];

        for (const entity of entities) {
            const listRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/${entity}`, {
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });

            if (listRes.ok) {
                const items = await listRes.json();
                for (const item of items) {
                    await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/${entity}/${item._id || item.id}`, {
                        method: 'DELETE',
                        headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
                    });
                }
            }
        }

        return Response.json({ success: true, message: "Wipe complete" });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
