// @ts-nocheck
Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response("OK");

        // PROTOCOLO BORRADO TOTAL
        const entities = ['Orden', 'Lead', 'Producto', 'Comercio', 'ConfiguracionComercio', 'Cupon', 'Carrito', 'AtributoProducto'];
        let stats = {};

        for (const entity of entities) {
            const listRes = await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/${entity}`, {
                headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
            });

            if (listRes.ok) {
                const items = await listRes.json();
                let count = 0;
                for (const item of items) {
                    await fetch(`https://app.base44.com/api/apps/6967728aba18db08a32d56fd/entities/${entity}/${item._id || item.id}`, {
                        method: 'DELETE',
                        headers: { 'api_key': 'fb3a067ef3c44d8489059567b4206a91' }
                    });
                    count++;
                }
                stats[entity] = count;
            }
        }

        return Response.json({ success: true, message: "Base de datos reiniciada", stats });

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});
